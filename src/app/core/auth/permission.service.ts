import { Injectable, signal, computed } from '@angular/core';
import { Permission } from '../../../shared/sdk';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private _permissions = signal<Set<string>>(new Set());
  private _lastUpdated = signal<Date | null>(null);
  private _cacheExpiry = 15 * 60 * 1000; // 15 minutes

  // Computed signals
  public readonly permissions = this._permissions.asReadonly();
  public readonly lastUpdated = this._lastUpdated.asReadonly();
  public readonly isExpired = computed(() => {
    const lastUpdate = this._lastUpdated();
    if (!lastUpdate) return true;
    return Date.now() - lastUpdate.getTime() > this._cacheExpiry;
  });

  /**
   * 設定使用者權限
   * @param permissions 權限陣列
   */
  setPermissions(permissions: string[]): void {
    this._permissions.set(new Set(permissions));
    this._lastUpdated.set(new Date());
  }

  /**
   * 檢查是否擁有特定權限
   * @param permission 權限名稱
   * @returns 是否擁有權限
   */
  hasPermission(permission: string): boolean {
    return this._permissions().has(permission) || this._permissions().has('*');
  }

  /**
   * 檢查是否擁有任一權限
   * @param permissions 權限陣列
   * @returns 是否擁有任一權限
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((permission) => this.hasPermission(permission));
  }

  /**
   * 檢查是否擁有所有權限
   * @param permissions 權限陣列
   * @returns 是否擁有所有權限
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every((permission) => this.hasPermission(permission));
  }

  /**
   * 檢查是否擁有角色
   * @param role 角色名稱
   * @returns 是否擁有角色
   */
  hasRole(role: string): boolean {
    return this.hasPermission(`role:${role}`);
  }

  /**
   * 檢查是否擁有任一角色
   * @param roles 角色陣列
   * @returns 是否擁有任一角色
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  /**
   * 清除權限快取
   */
  clearPermissions(): void {
    this._permissions.set(new Set());
    this._lastUpdated.set(null);
  }

  /**
   * 取得所有權限列表
   * @returns 權限陣列
   */
  getAllPermissions(): string[] {
    return Array.from(this._permissions());
  }

  /**
   * 檢查權限快取是否過期
   * @returns 是否過期
   */
  isCacheExpired(): boolean {
    return this.isExpired();
  }

  /**
   * 重新整理權限（標記為需要重新載入）
   */
  refreshPermissions(): void {
    this._lastUpdated.set(null);
  }
}
