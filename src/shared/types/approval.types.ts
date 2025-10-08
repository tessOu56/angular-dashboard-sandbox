import { BaseEntity } from './common.types';

export enum ApprovalType {
  FLAG_PUBLISH = 'flag_publish',
  FLAG_DELETE = 'flag_delete',
  USER_ROLE_CHANGE = 'user_role_change',
  SYSTEM_SETTINGS = 'system_settings',
  BULK_OPERATION = 'bulk_operation',
  HIGH_RISK_OPERATION = 'high_risk_operation',
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

export enum ApprovalPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

export enum ApprovalLevel {
  SINGLE = 'single',
  DUAL = 'dual',
  MULTI = 'multi',
  ESCALATION = 'escalation',
}

export interface ApprovalRequest extends BaseEntity {
  title: string;
  description: string;
  type: ApprovalType;
  priority: ApprovalPriority;
  level: ApprovalLevel;
  status: ApprovalStatus;
  requesterId: string;
  requesterName: string;
  department: string;
  dueDate?: Date;
  attachments: ApprovalAttachment[];
  metadata: Record<string, any>;
  approvals: Approval[];
  comments: ApprovalComment[];
  isHighRisk: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  businessImpact: string;
  rollbackPlan?: string;
}

export interface Approval extends BaseEntity {
  requestId: string;
  approverId: string;
  approverName: string;
  level: number;
  status: ApprovalStatus;
  comment?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  delegatedTo?: string;
  delegatedAt?: Date;
  isDelegated: boolean;
  escalationReason?: string;
  escalationAt?: Date;
}

export interface ApprovalComment extends BaseEntity {
  requestId: string;
  userId: string;
  userName: string;
  comment: string;
  isInternal: boolean;
  attachments: string[];
  mentions: string[];
}

export interface ApprovalAttachment extends BaseEntity {
  requestId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedBy: string;
  isRequired: boolean;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  type: ApprovalType;
  levels: ApprovalWorkflowLevel[];
  isActive: boolean;
  conditions: ApprovalCondition[];
  autoApproval: boolean;
  escalationRules: EscalationRule[];
}

export interface ApprovalWorkflowLevel {
  level: number;
  approvers: string[];
  minApprovals: number;
  maxApprovals: number;
  timeoutHours: number;
  escalationTo?: number;
  conditions: ApprovalCondition[];
}

export interface ApprovalCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'contains';
  value: any;
  logic: 'and' | 'or';
}

export interface EscalationRule {
  trigger: 'timeout' | 'rejection' | 'manual';
  action: 'escalate' | 'auto_approve' | 'notify';
  targetLevel?: number;
  notifyUsers: string[];
  message: string;
}

export interface ApprovalTemplate {
  id: string;
  name: string;
  type: ApprovalType;
  description: string;
  fields: ApprovalField[];
  workflow: ApprovalWorkflow;
  isDefault: boolean;
}

export interface ApprovalField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'boolean' | 'file';
  required: boolean;
  options?: string[];
  validation?: any;
  defaultValue?: any;
}

export interface ApprovalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  expired: number;
  myRequests: number;
  myApprovals: number;
  overdue: number;
  avgProcessingTime: number;
}

export interface ApprovalFilter {
  status?: ApprovalStatus[];
  type?: ApprovalType[];
  priority?: ApprovalPriority[];
  requesterId?: string;
  approverId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  isHighRisk?: boolean;
  isOverdue?: boolean;
}
