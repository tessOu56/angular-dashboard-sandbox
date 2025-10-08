import { TestBed } from '@angular/core/testing';
import { PermissionService } from './permission.service';
import { Permission } from '../../../shared/sdk';

describe('PermissionService', () => {
  let service: PermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PermissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setPermissions', () => {
    it('should set permissions correctly', () => {
      const permissions = [Permission.VIEW_DASHBOARD, Permission.VIEW_APPROVALS];
      service.setPermissions(permissions);

      expect(service.hasPermission(Permission.VIEW_DASHBOARD)).toBe(true);
      expect(service.hasPermission(Permission.VIEW_APPROVALS)).toBe(true);
      expect(service.hasPermission(Permission.MANAGE_FLAGS)).toBe(false);
    });

    it('should update lastUpdated timestamp', () => {
      const before = new Date();
      service.setPermissions([Permission.VIEW_DASHBOARD]);
      const lastUpdated = service.lastUpdated();

      expect(lastUpdated).toBeTruthy();
      expect(lastUpdated!.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('hasPermission', () => {
    beforeEach(() => {
      service.setPermissions([Permission.VIEW_DASHBOARD, Permission.VIEW_APPROVALS]);
    });

    it('should return true for existing permission', () => {
      expect(service.hasPermission(Permission.VIEW_DASHBOARD)).toBe(true);
    });

    it('should return false for non-existing permission', () => {
      expect(service.hasPermission(Permission.MANAGE_FLAGS)).toBe(false);
    });

    it('should return true when wildcard permission exists', () => {
      service.setPermissions(['*']);
      expect(service.hasPermission(Permission.MANAGE_FLAGS)).toBe(true);
      expect(service.hasPermission(Permission.VIEW_AUDIT_TRAIL)).toBe(true);
    });
  });

  describe('hasAnyPermission', () => {
    beforeEach(() => {
      service.setPermissions([Permission.VIEW_DASHBOARD, Permission.VIEW_APPROVALS]);
    });

    it('should return true if user has at least one permission', () => {
      const result = service.hasAnyPermission([Permission.VIEW_DASHBOARD, Permission.MANAGE_FLAGS]);
      expect(result).toBe(true);
    });

    it('should return false if user has none of the permissions', () => {
      const result = service.hasAnyPermission([Permission.MANAGE_FLAGS, Permission.MANAGE_USERS]);
      expect(result).toBe(false);
    });

    it('should return false for empty permission array', () => {
      const result = service.hasAnyPermission([]);
      expect(result).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    beforeEach(() => {
      service.setPermissions([Permission.VIEW_DASHBOARD, Permission.VIEW_APPROVALS]);
    });

    it('should return true if user has all permissions', () => {
      const result = service.hasAllPermissions([
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_APPROVALS,
      ]);
      expect(result).toBe(true);
    });

    it('should return false if user is missing any permission', () => {
      const result = service.hasAllPermissions([
        Permission.VIEW_DASHBOARD,
        Permission.MANAGE_FLAGS,
      ]);
      expect(result).toBe(false);
    });

    it('should return true for empty permission array', () => {
      const result = service.hasAllPermissions([]);
      expect(result).toBe(true);
    });
  });

  describe('hasRole', () => {
    it('should return true for role:admin permission', () => {
      service.setPermissions(['role:admin']);
      expect(service.hasRole('admin')).toBe(true);
    });

    it('should return false for non-existing role', () => {
      service.setPermissions(['role:admin']);
      expect(service.hasRole('manager')).toBe(false);
    });
  });

  describe('clearPermissions', () => {
    it('should clear all permissions', () => {
      service.setPermissions([Permission.VIEW_DASHBOARD]);
      service.clearPermissions();

      expect(service.hasPermission(Permission.VIEW_DASHBOARD)).toBe(false);
      expect(service.getAllPermissions()).toEqual([]);
      expect(service.lastUpdated()).toBeNull();
    });
  });

  describe('isCacheExpired', () => {
    it('should return true when permissions have never been set', () => {
      expect(service.isCacheExpired()).toBe(true);
    });

    it('should return false immediately after setting permissions', () => {
      service.setPermissions([Permission.VIEW_DASHBOARD]);
      expect(service.isCacheExpired()).toBe(false);
    });

    // Note: Testing actual expiry would require mocking Date.now()
    // which is beyond the scope of this basic test
  });

  describe('getAllPermissions', () => {
    it('should return all permissions as array', () => {
      const permissions = [Permission.VIEW_DASHBOARD, Permission.VIEW_APPROVALS];
      service.setPermissions(permissions);

      const result = service.getAllPermissions();
      expect(result).toHaveLength(2);
      expect(result).toContain(Permission.VIEW_DASHBOARD);
      expect(result).toContain(Permission.VIEW_APPROVALS);
    });

    it('should return empty array when no permissions set', () => {
      expect(service.getAllPermissions()).toEqual([]);
    });
  });
});
