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
  selector: '[hasRole]',
  standalone: true,
})
export class HasRoleDirective implements OnInit, OnDestroy {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private permissionService = inject(PermissionService);

  private hasView = false;
  private roles: string[] = [];

  @Input() set hasRole(roles: string | string[]) {
    this.roles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  ngOnInit(): void {
    this.updateView();
  }

  ngOnDestroy(): void {
    // 清理工作
  }

  private updateView(): void {
    if (!this.roles || this.roles.length === 0) {
      this.show();
      return;
    }

    const hasRole = this.permissionService.hasAnyRole(this.roles);

    if (hasRole && !this.hasView) {
      this.show();
    } else if (!hasRole && this.hasView) {
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
