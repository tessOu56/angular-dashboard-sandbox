// @alloylab/sdk - 客戶端 SDK
// 這個檔案模擬共用 SDK，實際專案中會由 SDK 產生器產生

import { Observable, of, throwError } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import {
  ApiResponse,
  PaginationParams,
  FilterParams,
  PaginatedResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  User,
  ApprovalRequest,
  FeatureFlag,
  Event,
  AuditLog,
  Setting,
  Webhook,
  Notification,
  SessionInfo,
} from './types';

export class AlloyLabSDK {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null): void {
    this.token = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Auth API
  auth = {
    login: (credentials: LoginRequest): Observable<LoginResponse> => {
      // Mock implementation
      return of({
        user: {
          id: '1',
          username: credentials.username,
          email: `${credentials.username}@example.com`,
          firstName: 'Test',
          lastName: 'User',
          role: 'admin' as any,
          department: 'IT',
          isActive: true,
          permissions: ['*'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
        permissions: ['*'],
      }).pipe(delay(1000));
    },

    logout: (): Observable<void> => {
      return of(undefined).pipe(delay(500));
    },

    refreshToken: (request: RefreshTokenRequest): Observable<LoginResponse> => {
      return of({
        user: {
          id: '1',
          username: 'test',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'admin' as any,
          department: 'IT',
          isActive: true,
          permissions: ['*'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'new-mock-jwt-token',
        refreshToken: 'new-mock-refresh-token',
        expiresIn: 3600,
        permissions: ['*'],
      }).pipe(delay(500));
    },

    getProfile: (): Observable<User> => {
      return of({
        id: '1',
        username: 'test',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin' as any,
        department: 'IT',
        isActive: true,
        permissions: ['*'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).pipe(delay(300));
    },

    updateProfile: (user: Partial<User>): Observable<User> => {
      return of({
        id: '1',
        username: 'test',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin' as any,
        department: 'IT',
        isActive: true,
        permissions: ['*'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...user,
      }).pipe(delay(500));
    },
  };

  // Approvals API
  approvals = {
    list: (
      params?: PaginationParams & FilterParams
    ): Observable<PaginatedResponse<ApprovalRequest>> => {
      const mockData: ApprovalRequest[] = [
        {
          id: '1',
          title: 'Travel Request',
          description: 'Business trip to Tokyo',
          requestType: 'travel' as any,
          requesterId: '1',
          requesterName: 'John Doe',
          department: 'Sales',
          amount: 5000,
          priority: 'high' as any,
          status: 'pending' as any,
          approvals: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Equipment Purchase',
          description: 'New laptop for development',
          requestType: 'purchase' as any,
          requesterId: '2',
          requesterName: 'Jane Smith',
          department: 'Engineering',
          amount: 2000,
          priority: 'medium' as any,
          status: 'approved' as any,
          approvals: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      return of({
        data: mockData,
        pagination: {
          page: 1,
          limit: 10,
          total: mockData.length,
          totalPages: 1,
        },
      }).pipe(delay(800));
    },

    get: (id: string): Observable<ApprovalRequest> => {
      return of({
        id,
        title: 'Travel Request',
        description: 'Business trip to Tokyo',
        requestType: 'travel' as any,
        requesterId: '1',
        requesterName: 'John Doe',
        department: 'Sales',
        amount: 5000,
        priority: 'high' as any,
        status: 'pending' as any,
        approvals: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).pipe(delay(500));
    },

    create: (request: Partial<ApprovalRequest>): Observable<ApprovalRequest> => {
      return of({
        id: '3',
        title: request.title || 'New Request',
        description: request.description || '',
        requestType: request.requestType || ('other' as any),
        requesterId: '1',
        requesterName: 'John Doe',
        department: 'Sales',
        amount: request.amount,
        priority: request.priority || ('medium' as any),
        status: 'draft' as any,
        approvals: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).pipe(delay(1000));
    },

    update: (id: string, request: Partial<ApprovalRequest>): Observable<ApprovalRequest> => {
      return of({
        id,
        title: request.title || 'Updated Request',
        description: request.description || '',
        requestType: request.requestType || ('other' as any),
        requesterId: '1',
        requesterName: 'John Doe',
        department: 'Sales',
        amount: request.amount,
        priority: request.priority || ('medium' as any),
        status: request.status || ('pending' as any),
        approvals: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).pipe(delay(800));
    },

    approve: (id: string, comment?: string): Observable<ApprovalRequest> => {
      return of({
        id,
        title: 'Approved Request',
        description: 'Business trip to Tokyo',
        requestType: 'travel' as any,
        requesterId: '1',
        requesterName: 'John Doe',
        department: 'Sales',
        amount: 5000,
        priority: 'high' as any,
        status: 'approved' as any,
        approvals: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).pipe(delay(1000));
    },

    reject: (id: string, comment?: string): Observable<ApprovalRequest> => {
      return of({
        id,
        title: 'Rejected Request',
        description: 'Business trip to Tokyo',
        requestType: 'travel' as any,
        requesterId: '1',
        requesterName: 'John Doe',
        department: 'Sales',
        amount: 5000,
        priority: 'high' as any,
        status: 'rejected' as any,
        approvals: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).pipe(delay(1000));
    },
  };

  // Feature Flags API
  flags = {
    list: (
      params?: PaginationParams & FilterParams
    ): Observable<PaginatedResponse<FeatureFlag>> => {
      const mockData: FeatureFlag[] = [
        {
          id: '1',
          name: 'New Dashboard',
          key: 'new-dashboard',
          description: 'Enable new dashboard design',
          type: 'boolean' as any,
          status: 'published' as any,
          defaultValue: false,
          isEnabled: true,
          createdBy: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
        },
        {
          id: '2',
          name: 'Beta Features',
          key: 'beta-features',
          description: 'Enable beta features for testing',
          type: 'boolean' as any,
          status: 'draft' as any,
          defaultValue: false,
          isEnabled: false,
          createdBy: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
        },
      ];

      return of({
        data: mockData,
        pagination: {
          page: 1,
          limit: 10,
          total: mockData.length,
          totalPages: 1,
        },
      }).pipe(delay(600));
    },

    get: (id: string): Observable<FeatureFlag> => {
      return of({
        id,
        name: 'New Dashboard',
        key: 'new-dashboard',
        description: 'Enable new dashboard design',
        type: 'boolean' as any,
        status: 'published' as any,
        defaultValue: false,
        isEnabled: true,
        createdBy: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      }).pipe(delay(400));
    },

    create: (flag: Partial<FeatureFlag>): Observable<FeatureFlag> => {
      return of({
        id: '3',
        name: flag.name || 'New Flag',
        key: flag.key || 'new-flag',
        description: flag.description,
        type: flag.type || ('boolean' as any),
        status: 'draft' as any,
        defaultValue: flag.defaultValue || false,
        isEnabled: false,
        createdBy: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      }).pipe(delay(800));
    },

    update: (id: string, flag: Partial<FeatureFlag>): Observable<FeatureFlag> => {
      return of({
        id,
        name: flag.name || 'Updated Flag',
        key: flag.key || 'updated-flag',
        description: flag.description,
        type: flag.type || ('boolean' as any),
        status: flag.status || ('draft' as any),
        defaultValue: flag.defaultValue || false,
        isEnabled: flag.isEnabled || false,
        createdBy: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      }).pipe(delay(600));
    },

    publish: (id: string): Observable<FeatureFlag> => {
      return of({
        id,
        name: 'Published Flag',
        key: 'published-flag',
        description: 'Published feature flag',
        type: 'boolean' as any,
        status: 'published' as any,
        defaultValue: false,
        isEnabled: true,
        createdBy: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        version: 1,
      }).pipe(delay(1000));
    },

    archive: (id: string): Observable<FeatureFlag> => {
      return of({
        id,
        name: 'Archived Flag',
        key: 'archived-flag',
        description: 'Archived feature flag',
        type: 'boolean' as any,
        status: 'archived' as any,
        defaultValue: false,
        isEnabled: false,
        createdBy: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      }).pipe(delay(800));
    },
  };

  // Events API
  events = {
    list: (params?: PaginationParams & FilterParams): Observable<PaginatedResponse<Event>> => {
      const mockData: Event[] = [
        {
          id: '1',
          type: 'user_login' as any,
          timestamp: new Date().toISOString(),
          userId: '1',
          username: 'john.doe',
          details: { ip: '192.168.1.1' },
          severity: 'low' as any,
          source: 'auth-service',
        },
        {
          id: '2',
          type: 'approval_created' as any,
          timestamp: new Date().toISOString(),
          userId: '2',
          username: 'jane.smith',
          details: { requestId: '123', amount: 5000 },
          severity: 'medium' as any,
          source: 'approval-service',
        },
      ];

      return of({
        data: mockData,
        pagination: {
          page: 1,
          limit: 10,
          total: mockData.length,
          totalPages: 1,
        },
      }).pipe(delay(500));
    },

    get: (id: string): Observable<Event> => {
      return of({
        id,
        type: 'user_login' as any,
        timestamp: new Date().toISOString(),
        userId: '1',
        username: 'john.doe',
        details: { ip: '192.168.1.1' },
        severity: 'low' as any,
        source: 'auth-service',
      }).pipe(delay(300));
    },
  };

  // Audit API
  audit = {
    list: (params?: PaginationParams & FilterParams): Observable<PaginatedResponse<AuditLog>> => {
      const mockData: AuditLog[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          userId: '1',
          username: 'john.doe',
          action: 'create' as any,
          resourceType: 'approval_request' as any,
          resourceId: '123',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
        },
        {
          id: '2',
          timestamp: new Date().toISOString(),
          userId: '2',
          username: 'jane.smith',
          action: 'approve' as any,
          resourceType: 'approval_request' as any,
          resourceId: '123',
          ipAddress: '192.168.1.2',
          userAgent: 'Mozilla/5.0...',
        },
      ];

      return of({
        data: mockData,
        pagination: {
          page: 1,
          limit: 10,
          total: mockData.length,
          totalPages: 1,
        },
      }).pipe(delay(600));
    },

    get: (id: string): Observable<AuditLog> => {
      return of({
        id,
        timestamp: new Date().toISOString(),
        userId: '1',
        username: 'john.doe',
        action: 'create' as any,
        resourceType: 'approval_request' as any,
        resourceId: '123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
      }).pipe(delay(400));
    },

    export: (params?: FilterParams): Observable<Blob> => {
      const csvContent = 'timestamp,userId,username,action,resourceType,resourceId\n';
      const blob = new Blob([csvContent], { type: 'text/csv' });
      return of(blob).pipe(delay(2000));
    },
  };

  // Settings API
  settings = {
    list: (): Observable<Setting[]> => {
      const mockData: Setting[] = [
        {
          id: '1',
          key: 'app.name',
          value: 'AlloyLab Platform',
          type: 'string' as any,
          description: 'Application name',
          category: 'general',
          isEditable: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          key: 'app.version',
          value: '1.0.0',
          type: 'string' as any,
          description: 'Application version',
          category: 'general',
          isEditable: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      return of(mockData).pipe(delay(400));
    },

    get: (key: string): Observable<Setting> => {
      return of({
        id: '1',
        key,
        value: 'Test Value',
        type: 'string' as any,
        description: 'Test setting',
        category: 'general',
        isEditable: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).pipe(delay(300));
    },

    update: (key: string, value: any): Observable<Setting> => {
      return of({
        id: '1',
        key,
        value,
        type: 'string' as any,
        description: 'Updated setting',
        category: 'general',
        isEditable: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).pipe(delay(500));
    },
  };

  // Webhooks API
  webhooks = {
    list: (): Observable<Webhook[]> => {
      const mockData: Webhook[] = [
        {
          id: '1',
          name: 'Approval Notifications',
          url: 'https://hooks.slack.com/services/...',
          events: ['approval_created', 'approval_approved'] as any,
          isActive: true,
          retryCount: 3,
          timeout: 5000,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      return of(mockData).pipe(delay(400));
    },

    create: (webhook: Partial<Webhook>): Observable<Webhook> => {
      return of({
        id: '2',
        name: webhook.name || 'New Webhook',
        url: webhook.url || 'https://example.com/webhook',
        events: webhook.events || [],
        isActive: webhook.isActive || true,
        retryCount: webhook.retryCount || 3,
        timeout: webhook.timeout || 5000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).pipe(delay(800));
    },

    update: (id: string, webhook: Partial<Webhook>): Observable<Webhook> => {
      return of({
        id,
        name: webhook.name || 'Updated Webhook',
        url: webhook.url || 'https://example.com/webhook',
        events: webhook.events || [],
        isActive: webhook.isActive || true,
        retryCount: webhook.retryCount || 3,
        timeout: webhook.timeout || 5000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).pipe(delay(600));
    },

    delete: (id: string): Observable<void> => {
      return of(undefined).pipe(delay(500));
    },
  };

  // Notifications API
  notifications = {
    list: (params?: PaginationParams): Observable<PaginatedResponse<Notification>> => {
      const mockData: Notification[] = [
        {
          id: '1',
          type: 'approval' as any,
          title: 'New Approval Request',
          message: 'You have a new approval request to review',
          userId: '1',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'system' as any,
          title: 'System Maintenance',
          message: 'Scheduled maintenance will occur tonight',
          userId: '1',
          isRead: true,
          createdAt: new Date().toISOString(),
        },
      ];

      return of({
        data: mockData,
        pagination: {
          page: 1,
          limit: 10,
          total: mockData.length,
          totalPages: 1,
        },
      }).pipe(delay(400));
    },

    markAsRead: (id: string): Observable<void> => {
      return of(undefined).pipe(delay(300));
    },

    markAllAsRead: (): Observable<void> => {
      return of(undefined).pipe(delay(500));
    },

    delete: (id: string): Observable<void> => {
      return of(undefined).pipe(delay(300));
    },
  };
}

// 建立全域 SDK 實例
export const sdk = new AlloyLabSDK();
