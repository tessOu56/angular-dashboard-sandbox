import { BaseEntity } from './common.types';

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
  CONFIGURE = 'configure',
  EXECUTE = 'execute',
}

export enum AuditResource {
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  FLAG = 'flag',
  APPROVAL = 'approval',
  SETTINGS = 'settings',
  SYSTEM = 'system',
  AUDIT = 'audit',
  EVENT = 'event',
}

export enum AuditResult {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PARTIAL = 'partial',
}

export interface AuditLog extends BaseEntity {
  action: AuditAction;
  resource: AuditResource;
  resourceId: string;
  resourceName: string;
  result: AuditResult;
  userId: string;
  userName: string;
  userRole: string;
  userDepartment: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  requestId: string;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  oldValues: Record<string, any>;
  newValues: Record<string, any>;
  changes: AuditChange[];
  metadata: Record<string, any>;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  isSensitive: boolean;
  tags: string[];
  environment: string;
  service: string;
  version: string;
}

export interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
  type: 'added' | 'removed' | 'modified';
  impact: 'low' | 'medium' | 'high';
}

export interface AuditFilter {
  actions?: AuditAction[];
  resources?: AuditResource[];
  results?: AuditResult[];
  userId?: string;
  userRole?: string;
  userDepartment?: string;
  resourceId?: string;
  resourceName?: string;
  ipAddress?: string;
  dateFrom?: Date;
  dateTo?: Date;
  riskLevel?: string[];
  isSensitive?: boolean;
  tags?: string[];
  environment?: string;
  service?: string;
  search?: string;
}

export interface AuditStats {
  total: number;
  byAction: Record<AuditAction, number>;
  byResource: Record<AuditResource, number>;
  byResult: Record<AuditResult, number>;
  byRiskLevel: Record<string, number>;
  byUser: Record<string, number>;
  byDepartment: Record<string, number>;
  byDate: Record<string, number>;
  recent: number;
  highRisk: number;
  failures: number;
  avgResponseTime: number;
}

export interface AuditReport {
  id: string;
  name: string;
  description: string;
  type: 'summary' | 'detailed' | 'compliance' | 'security';
  filters: AuditFilter;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  schedule?: AuditSchedule;
  recipients: string[];
  isActive: boolean;
  lastGenerated?: Date;
  nextGeneration?: Date;
  generatedBy: string;
  createdAt: Date;
}

export interface AuditSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  hour: number;
  minute: number;
  timezone: string;
}

export interface AuditAlert {
  id: string;
  name: string;
  description: string;
  conditions: AuditAlertCondition[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  recipients: string[];
  channels: string[];
  cooldown: number;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface AuditAlertCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'contains' | 'regex';
  value: any;
  logic: 'and' | 'or';
  timeWindow?: number; // minutes
  threshold?: number;
}

export interface AuditPolicy {
  id: string;
  name: string;
  description: string;
  resource: AuditResource;
  actions: AuditAction[];
  conditions: AuditPolicyCondition[];
  retention: number; // days
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface AuditPolicyCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'contains';
  value: any;
  logic: 'and' | 'or';
}

export interface AuditCompliance {
  id: string;
  name: string;
  description: string;
  standard: 'SOX' | 'GDPR' | 'HIPAA' | 'PCI-DSS' | 'ISO27001' | 'CUSTOM';
  requirements: ComplianceRequirement[];
  isActive: boolean;
  lastAssessment?: Date;
  nextAssessment?: Date;
  score: number;
  status: 'compliant' | 'non-compliant' | 'partial' | 'unknown';
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRequired: boolean;
  evidence: ComplianceEvidence[];
  status: 'compliant' | 'non-compliant' | 'partial' | 'not-assessed';
  lastAssessed?: Date;
  assessedBy?: string;
  notes?: string;
}

export interface ComplianceEvidence {
  id: string;
  type: 'audit_log' | 'document' | 'screenshot' | 'test_result';
  description: string;
  url?: string;
  uploadedAt: Date;
  uploadedBy: string;
  isValid: boolean;
  expiresAt?: Date;
}

export interface AuditDashboard {
  id: string;
  name: string;
  description: string;
  widgets: AuditWidget[];
  filters: AuditFilter;
  refreshInterval: number;
  isPublic: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface AuditWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'alert' | 'timeline';
  title: string;
  config: Record<string, any>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  filters?: AuditFilter;
}

export interface AuditExport {
  logs: AuditLog[];
  format: 'json' | 'csv' | 'xlsx' | 'pdf';
  filters: AuditFilter;
  dateRange: {
    from: Date;
    to: Date;
  };
  exportedAt: Date;
  exportedBy: string;
  fileSize: number;
  recordCount: number;
}
