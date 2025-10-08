import { BaseEntity } from './common.types';

export enum FlagStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export enum FlagType {
  FEATURE = 'feature',
  CONFIG = 'config',
  EXPERIMENT = 'experiment',
  KILL_SWITCH = 'kill_switch',
  PERMISSION = 'permission',
}

export enum FlagEnvironment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export interface FeatureFlag extends BaseEntity {
  key: string;
  name: string;
  description: string;
  type: FlagType;
  status: FlagStatus;
  environments: FlagEnvironment[];
  defaultValue: any;
  variants: FlagVariant[];
  targeting: FlagTargeting;
  rules: FlagRule[];
  dependencies: FlagDependency[];
  tags: string[];
  owner: string;
  team: string;
  documentation: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  businessImpact: string;
  rollbackPlan: string;
  monitoring: FlagMonitoring;
  approvalRequestId?: string;
  publishedAt?: Date;
  archivedAt?: Date;
}

export interface FlagVariant {
  key: string;
  name: string;
  value: any;
  weight: number;
  description?: string;
  isControl: boolean;
}

export interface FlagTargeting {
  enabled: boolean;
  conditions: TargetingCondition[];
  fallbackVariant: string;
  percentage: number;
}

export interface TargetingCondition {
  attribute: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'contains' | 'startsWith' | 'endsWith';
  value: any;
  logic: 'and' | 'or';
}

export interface FlagRule {
  id: string;
  name: string;
  conditions: TargetingCondition[];
  variant: string;
  weight: number;
  isActive: boolean;
  priority: number;
}

export interface FlagDependency {
  flagKey: string;
  condition: 'enabled' | 'disabled' | 'variant';
  variant?: string;
  isRequired: boolean;
}

export interface FlagMonitoring {
  enabled: boolean;
  metrics: string[];
  alerts: FlagAlert[];
  dashboard: string;
}

export interface FlagAlert {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recipients: string[];
  isActive: boolean;
}

export interface FlagComparison {
  id: string;
  name: string;
  flags: string[];
  environments: FlagEnvironment[];
  createdAt: Date;
  createdBy: string;
  results: ComparisonResult[];
}

export interface ComparisonResult {
  flagKey: string;
  environment: FlagEnvironment;
  differences: FlagDifference[];
  summary: string;
}

export interface FlagDifference {
  field: string;
  oldValue: any;
  newValue: any;
  type: 'added' | 'removed' | 'modified';
  impact: 'low' | 'medium' | 'high';
}

export interface FlagUsage {
  flagKey: string;
  environment: FlagEnvironment;
  date: Date;
  evaluations: number;
  uniqueUsers: number;
  variants: Record<string, number>;
  errors: number;
  latency: number;
}

export interface FlagAnalytics {
  flagKey: string;
  period: 'hour' | 'day' | 'week' | 'month';
  data: FlagUsage[];
  trends: {
    evaluations: number;
    uniqueUsers: number;
    errorRate: number;
    avgLatency: number;
  };
}

export interface FlagTemplate {
  id: string;
  name: string;
  type: FlagType;
  description: string;
  defaultVariants: FlagVariant[];
  defaultTargeting: FlagTargeting;
  defaultRules: FlagRule[];
  requiredFields: string[];
  optionalFields: string[];
  validation: Record<string, any>;
}

export interface FlagImport {
  flags: FeatureFlag[];
  environment: FlagEnvironment;
  overwrite: boolean;
  validate: boolean;
  dryRun: boolean;
}

export interface FlagExport {
  flags: string[];
  environment: FlagEnvironment;
  format: 'json' | 'yaml' | 'csv';
  includeHistory: boolean;
  includeAnalytics: boolean;
}

export interface FlagStats {
  total: number;
  byStatus: Record<FlagStatus, number>;
  byType: Record<FlagType, number>;
  byEnvironment: Record<FlagEnvironment, number>;
  recentlyCreated: number;
  recentlyPublished: number;
  pendingApproval: number;
  highRisk: number;
}
