import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { PermissionService } from '../../core/auth/permission.service';

@Directive({
  selector: '[hasPerm]',
  standalone: true,
})
export class HasPermDirective implements OnInit, OnDestroy {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private permissionService = inject(PermissionService);

  private hasView = false;
  private permissions: string[] = [];

  @Input() set hasPerm(permissions: string | string[]) {
    this.permissions = Array.isArray(permissions) ? permissions : [permissions];
    this.updateView();
  }

  ngOnInit(): void {
    this.updateView();
  }

  ngOnDestroy(): void {
    // 清理工作
  }

  private updateView(): void {
    if (!this.permissions || this.permissions.length === 0) {
      this.show();
      return;
    }

    const hasPermission = this.permissionService.hasAnyPermission(this.permissions);

    if (hasPermission && !this.hasView) {
      this.show();
    } else if (!hasPermission && this.hasView) {
      this.hide();
    }
  }

  private show(): void {
    this.viewContainer.createEmbeddedView(this.templateRef);
    this.hasView = true;
  }

  private hide(): void {
    this.viewContainer.clear();
    this.hasView = false;
  }
}
