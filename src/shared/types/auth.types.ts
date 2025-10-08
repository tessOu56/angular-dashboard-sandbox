import { BaseEntity } from './common.types';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  APPROVER = 'approver',
  OPERATOR = 'operator',
  VIEWER = 'viewer',
}

export enum Permission {
  // 系統管理
  SYSTEM_ADMIN = 'system:admin',
  USER_MANAGEMENT = 'user:management',
  ROLE_MANAGEMENT = 'role:management',

  // 旗標管理
  FLAG_READ = 'flag:read',
  FLAG_CREATE = 'flag:create',
  FLAG_UPDATE = 'flag:update',
  FLAG_DELETE = 'flag:delete',
  FLAG_PUBLISH = 'flag:publish',

  // 審批管理
  APPROVAL_READ = 'approval:read',
  APPROVAL_CREATE = 'approval:create',
  APPROVAL_APPROVE = 'approval:approve',
  APPROVAL_REJECT = 'approval:reject',

  // 事件監控
  EVENT_READ = 'event:read',
  EVENT_MONITOR = 'event:monitor',
  EVENT_CONTROL = 'event:control',

  // 設定管理
  SETTINGS_READ = 'settings:read',
  SETTINGS_UPDATE = 'settings:update',

  // 稽核查詢
  AUDIT_READ = 'audit:read',
  AUDIT_EXPORT = 'audit:export',
}

export interface User extends BaseEntity {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department: string;
  isActive: boolean;
  lastLoginAt?: Date;
  permissions: Permission[];
  avatar?: string;
  phone?: string;
  timezone: string;
  language: string;
}

export interface Role extends BaseEntity {
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  userCount: number;
}

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface SessionInfo {
  user: User;
  permissions: Permission[];
  roles: string[];
  expiresAt: Date;
  isExpired: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  permissions: Permission[];
  loading: boolean;
  error: string | null;
}
