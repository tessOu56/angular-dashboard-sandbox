// 通用類型定義
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterParams {
  search?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface FormField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'select'
    | 'textarea'
    | 'date'
    | 'checkbox'
    | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  validation?: ValidationRule;
  disabled?: boolean;
  readonly?: boolean;
}

export interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
  userId?: string;
}

export interface EventSourceMessage {
  event: string;
  data: string;
  id?: string;
  retry?: number;
}
