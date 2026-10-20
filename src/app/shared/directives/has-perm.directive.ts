import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { PermissionService } from '../../core/auth/permission.service';

@Directive({
  selector: '[hasPerm]',
  standalone: true,
})
export class HasPermDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly permissionService = inject(PermissionService);

  readonly hasPerm = input<string | string[]>([]);

  private hasView = false;

  constructor() {
    effect(() => {
      const raw = this.hasPerm();
      const permissions = Array.isArray(raw) ? raw : [raw];
      this.updateView(permissions);
    });
  }

  private updateView(permissions: string[]): void {
    if (!permissions.length) {
      this.show();
      return;
    }

    const hasPermission = this.permissionService.hasAnyPermission(permissions);

    if (hasPermission && !this.hasView) {
      this.show();
    } else if (!hasPermission && this.hasView) {
      this.hide();
    }
  }

  private show(): void {
    if (this.hasView) {
      return;
    }
    this.viewContainer.createEmbeddedView(this.templateRef);
    this.hasView = true;
  }

  private hide(): void {
    this.viewContainer.clear();
    this.hasView = false;
  }
}
