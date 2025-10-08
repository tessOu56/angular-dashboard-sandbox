// @alloylab/types - 由 OpenAPI 產生的型別定義
// 這個檔案模擬從 OpenAPI 產生的型別，實際專案中會由 OpenAPI Generator 產生

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    requestId: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Types
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
  permissions: string[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department: string;
  isActive: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  avatar?: string;
  timezone?: string;
  language?: string;
  createdBy?: string;
  updatedBy?: string;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  APPROVER = 'approver',
  OPERATOR = 'operator',
  VIEWER = 'viewer',
}

export enum Permission {
  // Dashboard
  VIEW_DASHBOARD = 'view_dashboard',

  // User Management
  MANAGE_USERS = 'manage_users',
  VIEW_USERS = 'view_users',

  // Approval System
  CREATE_APPROVAL = 'create_approval',
  VIEW_APPROVALS = 'view_approvals',
  APPROVE_REQUESTS = 'approve_requests',
  DUAL_CONTROL_APPROVAL = 'dual_control_approval',

  // Feature Flags
  MANAGE_FLAGS = 'manage_flags',
  VIEW_FLAGS = 'view_flags',
  PUBLISH_FLAGS = 'publish_flags',

  // Events
  VIEW_EVENTS = 'view_events',
  MANAGE_EVENTS = 'manage_events',

  // Settings
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_SETTINGS = 'view_settings',

  // Audit
  VIEW_AUDIT_TRAIL = 'view_audit_trail',
  EXPORT_AUDIT_LOGS = 'export_audit_logs',
}

// Approval Types
export interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  requestType: RequestType;
  requesterId: string;
  requesterName: string;
  department: string;
  amount?: number;
  priority: Priority;
  dueDate?: string;
  status: ApprovalStatus;
  approvals: ApprovalStep[];
  attachments?: Attachment[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export enum RequestType {
  EXPENSE = 'expense',
  PURCHASE = 'purchase',
  TRAVEL = 'travel',
  LEAVE = 'leave',
  BUDGET = 'budget',
  OTHER = 'other',
}

export enum ApprovalStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

export interface ApprovalStep {
  id: string;
  approverId: string;
  approverName: string;
  level: number;
  status: ApprovalStatus;
  comment?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
}

// Feature Flag Types
export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description?: string;
  type: FlagType;
  status: FlagStatus;
  defaultValue: any;
  variants?: FlagVariant[];
  targeting?: TargetingRule[];
  isEnabled: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  version: number;
}

export enum FlagType {
  BOOLEAN = 'boolean',
  STRING = 'string',
  NUMBER = 'number',
  JSON = 'json',
}

export enum FlagStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface FlagVariant {
  name: string;
  value: any;
  description?: string;
  weight?: number;
}

export interface TargetingRule {
  id: string;
  name: string;
  conditions: TargetingCondition[];
  variant: string;
  weight: number;
  isActive: boolean;
}

export interface TargetingCondition {
  attribute: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'starts_with'
    | 'ends_with'
    | 'greater_than'
    | 'less_than'
    | 'in'
    | 'not_in';
  value: any;
}

// Event Types
export interface Event {
  id: string;
  type: EventType;
  timestamp: string;
  userId?: string;
  username?: string;
  details: Record<string, any>;
  severity: EventSeverity;
  source: string;
  tags?: string[];
}

export enum EventType {
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',

  APPROVAL_CREATED = 'approval_created',
  APPROVAL_UPDATED = 'approval_updated',
  APPROVAL_APPROVED = 'approval_approved',
  APPROVAL_REJECTED = 'approval_rejected',

  FLAG_CREATED = 'flag_created',
  FLAG_UPDATED = 'flag_updated',
  FLAG_PUBLISHED = 'flag_published',
  FLAG_ARCHIVED = 'flag_archived',

  SYSTEM_ALERT = 'system_alert',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export enum EventSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Audit Types
export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  action: AuditAction;
  resourceType: AuditResource;
  resourceId: string;
  changes?: Record<string, { oldValue: any; newValue: any }>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  APPROVE = 'approve',
  REJECT = 'reject',
  PUBLISH = 'publish',
  ARCHIVE = 'archive',
  EXPORT = 'export',
  IMPORT = 'import',
}

export enum AuditResource {
  USER = 'user',
  APPROVAL_REQUEST = 'approval_request',
  FEATURE_FLAG = 'feature_flag',
  SETTING = 'setting',
  WEBHOOK = 'webhook',
  AUDIT_LOG = 'audit_log',
}

// Settings Types
export interface Setting {
  id: string;
  key: string;
  value: any;
  type: SettingType;
  description?: string;
  category: string;
  isEditable: boolean;
  validation?: SettingValidation;
  createdAt: string;
  updatedAt: string;
}

export enum SettingType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
  ARRAY = 'array',
}

export interface SettingValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: any[];
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: EventType[];
  isActive: boolean;
  secret?: string;
  retryCount: number;
  timeout: number;
  headers?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
  expiresAt?: string;
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  APPROVAL = 'approval',
  SYSTEM = 'system',
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  options?: FormFieldOption[];
  validation?: FormValidation;
  conditional?: FormConditional;
  defaultValue?: any;
}

export enum FormFieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PASSWORD = 'password',
  NUMBER = 'number',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  TEXTAREA = 'textarea',
  DATE = 'date',
  DATETIME = 'datetime',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  FILE = 'file',
  JSON = 'json',
}

export interface FormFieldOption {
  value: any;
  label: string;
  disabled?: boolean;
}

export interface FormValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  custom?: string;
}

export interface FormConditional {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  action: 'show' | 'hide' | 'enable' | 'disable';
}

// Common Types
export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface BreadcrumbItem {
  label: string;
  url?: string;
  active?: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  url?: string;
  children?: MenuItem[];
  permissions?: string[];
  badge?: string | number;
}

export interface TableColumn<T = any> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  template?: any; // TemplateRef or string
  formatter?: (value: any, row: T) => string;
}

export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  column: string;
  operator:
    | 'equals'
    | 'contains'
    | 'starts_with'
    | 'ends_with'
    | 'greater_than'
    | 'less_than'
    | 'in'
    | 'not_in';
  value: any;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Session Types
export interface SessionInfo {
  user: User;
  permissions: string[];
  roles: string[];
  expiresAt: string;
  isExpired: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  permissions: string[];
  loading: boolean;
  error: string | null;
}
