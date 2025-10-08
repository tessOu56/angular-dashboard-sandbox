import { BaseEntity } from './common.types';

export enum EventType {
  // 系統事件
  SYSTEM_STARTUP = 'system:startup',
  SYSTEM_SHUTDOWN = 'system:shutdown',
  SYSTEM_ERROR = 'system:error',
  SYSTEM_WARNING = 'system:warning',

  // 使用者事件
  USER_LOGIN = 'user:login',
  USER_LOGOUT = 'user:logout',
  USER_CREATED = 'user:created',
  USER_UPDATED = 'user:updated',
  USER_DELETED = 'user:deleted',

  // 旗標事件
  FLAG_CREATED = 'flag:created',
  FLAG_UPDATED = 'flag:updated',
  FLAG_PUBLISHED = 'flag:published',
  FLAG_ARCHIVED = 'flag:archived',
  FLAG_DELETED = 'flag:deleted',
  FLAG_EVALUATED = 'flag:evaluated',

  // 審批事件
  APPROVAL_CREATED = 'approval:created',
  APPROVAL_APPROVED = 'approval:approved',
  APPROVAL_REJECTED = 'approval:rejected',
  APPROVAL_EXPIRED = 'approval:expired',

  // 設定事件
  SETTINGS_UPDATED = 'settings:updated',
  CONFIG_CHANGED = 'config:changed',

  // 稽核事件
  AUDIT_LOG = 'audit:log',
  AUDIT_EXPORT = 'audit:export',

  // 安全事件
  SECURITY_VIOLATION = 'security:violation',
  PERMISSION_DENIED = 'permission:denied',
  SUSPICIOUS_ACTIVITY = 'security:suspicious',

  // 效能事件
  PERFORMANCE_ALERT = 'performance:alert',
  RESOURCE_USAGE = 'resource:usage',
  API_RESPONSE_TIME = 'api:response_time',
}

export enum EventSeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export enum EventSource {
  SYSTEM = 'system',
  USER = 'user',
  API = 'api',
  SCHEDULER = 'scheduler',
  EXTERNAL = 'external',
}

export interface Event extends BaseEntity {
  type: EventType;
  severity: EventSeverity;
  source: EventSource;
  title: string;
  message: string;
  data: Record<string, any>;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  environment: string;
  service: string;
  version: string;
  tags: string[];
  correlationId?: string;
  parentEventId?: string;
  duration?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processedAt?: Date;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolution?: string;
}

export interface EventFilter {
  types?: EventType[];
  severities?: EventSeverity[];
  sources?: EventSource[];
  userId?: string;
  environment?: string;
  service?: string;
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  status?: string[];
  search?: string;
}

export interface EventStats {
  total: number;
  byType: Record<EventType, number>;
  bySeverity: Record<EventSeverity, number>;
  bySource: Record<EventSource, number>;
  byStatus: Record<string, number>;
  recent: number;
  critical: number;
  unacknowledged: number;
  avgProcessingTime: number;
}

export interface EventAlert {
  id: string;
  name: string;
  description: string;
  conditions: EventAlertCondition[];
  severity: EventSeverity;
  isActive: boolean;
  recipients: string[];
  channels: AlertChannel[];
  cooldown: number;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface EventAlertCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'contains' | 'regex';
  value: any;
  logic: 'and' | 'or';
}

export interface AlertChannel {
  type: 'email' | 'sms' | 'slack' | 'webhook';
  config: Record<string, any>;
  enabled: boolean;
}

export interface EventStream {
  id: string;
  name: string;
  description: string;
  filters: EventFilter;
  isActive: boolean;
  subscribers: EventSubscriber[];
  createdAt: Date;
  createdBy: string;
}

export interface EventSubscriber {
  id: string;
  userId: string;
  subscribedAt: Date;
  lastEventId?: string;
  isActive: boolean;
}

export interface EventBatch {
  events: Event[];
  batchId: string;
  timestamp: Date;
  source: string;
  count: number;
}

export interface EventProcessor {
  id: string;
  name: string;
  description: string;
  eventTypes: EventType[];
  processor: (event: Event) => Promise<void>;
  isActive: boolean;
  concurrency: number;
  retryCount: number;
  timeout: number;
  lastProcessed?: Date;
  processedCount: number;
  errorCount: number;
}

export interface EventMetrics {
  timestamp: Date;
  eventType: EventType;
  count: number;
  avgProcessingTime: number;
  errorRate: number;
  throughput: number;
}

export interface EventDashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  filters: EventFilter;
  refreshInterval: number;
  isPublic: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'alert';
  title: string;
  config: Record<string, any>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  filters?: EventFilter;
}

export interface EventExport {
  events: Event[];
  format: 'json' | 'csv' | 'xlsx';
  filters: EventFilter;
  dateRange: {
    from: Date;
    to: Date;
  };
  exportedAt: Date;
  exportedBy: string;
}
