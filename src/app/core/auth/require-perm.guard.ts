import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { PermissionService } from './permission.service';
import { AuthService } from './auth.service';

export const RequirePermGuard: CanMatchFn = (route, segments) => {
  const permissionService = inject(PermissionService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // 檢查是否已登入
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // 從路由資料中取得需要的權限
  const requiredPermissions = route.data?.['requirePerm'] as string[] | undefined;

  // 如果沒有設定權限要求，允許訪問
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  // 檢查是否擁有任一所需權限
  const hasPermission = permissionService.hasAnyPermission(requiredPermissions);

  if (!hasPermission) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};
