import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { PermissionService } from '../../core/auth/permission.service';

@Directive({
  selector: '[hasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly permissionService = inject(PermissionService);

  readonly hasRole = input<string | string[]>([]);

  private hasView = false;

  constructor() {
    effect(() => {
      const raw = this.hasRole();
      const roles = Array.isArray(raw) ? raw : [raw];
      this.updateView(roles);
    });
  }

  private updateView(roles: string[]): void {
    if (!roles.length) {
      this.show();
      return;
    }

    const hasRole = this.permissionService.hasAnyRole(roles);

    if (hasRole && !this.hasView) {
      this.show();
    } else if (!hasRole && this.hasView) {
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
