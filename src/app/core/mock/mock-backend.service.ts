import { Injectable } from '@angular/core';
import {
  ApprovalRequest,
  FeatureFlag,
  Event,
  AuditLog,
  User,
  UserRole,
  Permission,
  ApprovalStatus,
  RequestType,
  Priority,
  FlagStatus,
  FlagType,
  EventType,
  EventSeverity,
  AuditAction,
  AuditResource,
} from '../../../shared/sdk';

/**
 * Mock Backend Service
 *
 * 提供假資料用於開發與測試
 * 模擬真實後端 API 的行為
 */
@Injectable({ providedIn: 'root' })
export class MockBackendService {
  private approvals: ApprovalRequest[] = [];
  private flags: FeatureFlag[] = [];
  private events: Event[] = [];
  private auditLogs: AuditLog[] = [];
  private users: User[] = [];

  constructor() {
    this.initializeMockData();
  }

  /**
   * 初始化 Mock 資料
   */
  private initializeMockData(): void {
    this.initializeUsers();
    this.initializeApprovals();
    this.initializeFlags();
    this.initializeEvents();
    this.initializeAuditLogs();
  }

  /**
   * 初始化使用者資料
   */
  private initializeUsers(): void {
    this.users = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        department: 'IT',
        isActive: true,
        permissions: Object.values(Permission),
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString(),
      },
      {
        id: '2',
        username: 'manager',
        email: 'manager@example.com',
        firstName: 'Manager',
        lastName: 'User',
        role: UserRole.MANAGER,
        department: 'Operations',
        isActive: true,
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.CREATE_APPROVAL,
          Permission.VIEW_APPROVALS,
          Permission.APPROVE_REQUESTS,
          Permission.VIEW_FLAGS,
          Permission.VIEW_EVENTS,
          Permission.DUAL_CONTROL_APPROVAL,
        ],
        createdAt: new Date('2024-01-02').toISOString(),
        updatedAt: new Date('2024-01-02').toISOString(),
      },
      {
        id: '3',
        username: 'employee',
        email: 'employee@example.com',
        firstName: 'Employee',
        lastName: 'User',
        role: UserRole.OPERATOR,
        department: 'Sales',
        isActive: true,
        permissions: [
          Permission.VIEW_DASHBOARD,
          Permission.CREATE_APPROVAL,
          Permission.VIEW_APPROVALS,
          Permission.VIEW_EVENTS,
        ],
        createdAt: new Date('2024-01-03').toISOString(),
        updatedAt: new Date('2024-01-03').toISOString(),
      },
    ];
  }

  /**
   * 初始化審批資料
   */
  private initializeApprovals(): void {
    this.approvals = [
      {
        id: '1',
        title: '購買開發伺服器',
        description: '需要購買新的開發伺服器以提升團隊效率',
        requestType: RequestType.PURCHASE,
        requesterId: '3',
        requesterName: 'Employee User',
        department: 'Sales',
        amount: 15000,
        priority: Priority.HIGH,
        status: ApprovalStatus.PENDING,
        approvals: [],
        createdAt: new Date('2024-12-01').toISOString(),
        updatedAt: new Date('2024-12-01').toISOString(),
      },
      {
        id: '2',
        title: '年度預算調整',
        description: '調整 Q4 營銷預算分配',
        requestType: RequestType.BUDGET,
        requesterId: '2',
        requesterName: 'Manager User',
        department: 'Operations',
        amount: 50000,
        priority: Priority.URGENT,
        status: ApprovalStatus.IN_REVIEW,
        approvals: [
          {
            id: '1',
            approverId: '1',
            approverName: 'Admin User',
            level: 1,
            status: ApprovalStatus.APPROVED,
            comment: '預算合理，批准',
            approvedAt: new Date('2024-12-02').toISOString(),
            createdAt: new Date('2024-12-02').toISOString(),
          },
        ],
        createdAt: new Date('2024-12-01').toISOString(),
        updatedAt: new Date('2024-12-02').toISOString(),
      },
      {
        id: '3',
        title: '員工培訓計畫',
        description: '舉辦 Angular 進階培訓課程',
        requestType: RequestType.EXPENSE,
        requesterId: '3',
        requesterName: 'Employee User',
        department: 'Sales',
        amount: 5000,
        priority: Priority.MEDIUM,
        status: ApprovalStatus.APPROVED,
        approvals: [
          {
            id: '2',
            approverId: '2',
            approverName: 'Manager User',
            level: 1,
            status: ApprovalStatus.APPROVED,
            comment: '培訓計畫完善，批准',
            approvedAt: new Date('2024-11-30').toISOString(),
            createdAt: new Date('2024-11-30').toISOString(),
          },
        ],
        createdAt: new Date('2024-11-28').toISOString(),
        updatedAt: new Date('2024-11-30').toISOString(),
      },
      {
        id: '4',
        title: '出差申請 - 客戶拜訪',
        description: '前往台北拜訪重要客戶',
        requestType: RequestType.TRAVEL,
        requesterId: '3',
        requesterName: 'Employee User',
        department: 'Sales',
        amount: 3000,
        priority: Priority.MEDIUM,
        dueDate: new Date('2024-12-15').toISOString(),
        status: ApprovalStatus.DRAFT,
        approvals: [],
        createdAt: new Date('2024-12-03').toISOString(),
        updatedAt: new Date('2024-12-03').toISOString(),
      },
    ];
  }

  /**
   * 初始化旗標資料
   */
  private initializeFlags(): void {
    this.flags = [
      {
        id: '1',
        name: '新版儀表板',
        key: 'new-dashboard',
        description: '啟用新版儀表板設計',
        type: FlagType.BOOLEAN,
        status: FlagStatus.PUBLISHED,
        defaultValue: false,
        isEnabled: true,
        createdBy: '1',
        createdAt: new Date('2024-11-01').toISOString(),
        updatedAt: new Date('2024-11-15').toISOString(),
        publishedAt: new Date('2024-11-15').toISOString(),
        version: 1,
      },
      {
        id: '2',
        name: 'Beta 功能',
        key: 'beta-features',
        description: '啟用 Beta 測試功能',
        type: FlagType.BOOLEAN,
        status: FlagStatus.DRAFT,
        defaultValue: false,
        isEnabled: false,
        createdBy: '1',
        createdAt: new Date('2024-12-01').toISOString(),
        updatedAt: new Date('2024-12-01').toISOString(),
        version: 1,
      },
      {
        id: '3',
        name: '最大上傳大小',
        key: 'max-upload-size',
        description: '設定檔案上傳大小限制（MB）',
        type: FlagType.NUMBER,
        status: FlagStatus.PUBLISHED,
        defaultValue: 10,
        isEnabled: true,
        createdBy: '1',
        createdAt: new Date('2024-10-15').toISOString(),
        updatedAt: new Date('2024-10-20').toISOString(),
        publishedAt: new Date('2024-10-20').toISOString(),
        version: 2,
      },
      {
        id: '4',
        name: '維護模式訊息',
        key: 'maintenance-message',
        description: '系統維護時顯示的訊息',
        type: FlagType.STRING,
        status: FlagStatus.PENDING_APPROVAL,
        defaultValue: '系統維護中，請稍後再試',
        isEnabled: false,
        createdBy: '2',
        createdAt: new Date('2024-12-02').toISOString(),
        updatedAt: new Date('2024-12-02').toISOString(),
        version: 1,
      },
    ];
  }

  /**
   * 初始化事件資料
   */
  private initializeEvents(): void {
    const now = new Date();
    this.events = [
      {
        id: '1',
        type: EventType.USER_LOGIN,
        timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
        userId: '1',
        username: 'admin',
        details: { ip: '192.168.1.100', userAgent: 'Mozilla/5.0' },
        severity: EventSeverity.LOW,
        source: 'auth-service',
      },
      {
        id: '2',
        type: EventType.APPROVAL_CREATED,
        timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
        userId: '3',
        username: 'employee',
        details: { approvalId: '1', title: '購買開發伺服器' },
        severity: EventSeverity.MEDIUM,
        source: 'approval-service',
      },
      {
        id: '3',
        type: EventType.FLAG_PUBLISHED,
        timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
        userId: '1',
        username: 'admin',
        details: { flagId: '1', flagName: '新版儀表板' },
        severity: EventSeverity.HIGH,
        source: 'flag-service',
      },
      {
        id: '4',
        type: EventType.SYSTEM_ALERT,
        timestamp: new Date(now.getTime() - 60 * 60000).toISOString(),
        details: { message: '資料庫連線池即將達到上限', threshold: '80%' },
        severity: EventSeverity.CRITICAL,
        source: 'monitoring-service',
      },
    ];
  }

  /**
   * 初始化稽核記錄
   */
  private initializeAuditLogs(): void {
    const now = new Date();
    this.auditLogs = [
      {
        id: '1',
        timestamp: new Date(now.getTime() - 10 * 60000).toISOString(),
        userId: '1',
        username: 'admin',
        action: AuditAction.CREATE,
        resourceType: AuditResource.FEATURE_FLAG,
        resourceId: '2',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
      },
      {
        id: '2',
        timestamp: new Date(now.getTime() - 20 * 60000).toISOString(),
        userId: '2',
        username: 'manager',
        action: AuditAction.APPROVE,
        resourceType: AuditResource.APPROVAL_REQUEST,
        resourceId: '3',
        changes: {
          status: { oldValue: 'pending', newValue: 'approved' },
        },
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0',
      },
      {
        id: '3',
        timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
        userId: '1',
        username: 'admin',
        action: AuditAction.PUBLISH,
        resourceType: AuditResource.FEATURE_FLAG,
        resourceId: '1',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
      },
    ];
  }

  /**
   * 取得所有審批
   */
  getApprovals(): ApprovalRequest[] {
    return [...this.approvals];
  }

  /**
   * 取得所有旗標
   */
  getFlags(): FeatureFlag[] {
    return [...this.flags];
  }

  /**
   * 取得所有事件
   */
  getEvents(): Event[] {
    return [...this.events];
  }

  /**
   * 取得所有稽核記錄
   */
  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  /**
   * 取得所有使用者
   */
  getUsers(): User[] {
    return [...this.users];
  }

  /**
   * 產生新事件（用於測試即時串流）
   */
  generateRandomEvent(): Event {
    const types = Object.values(EventType);
    const severities = Object.values(EventSeverity);
    const sources = ['auth-service', 'approval-service', 'flag-service', 'monitoring-service'];

    return {
      id: `event-${Date.now()}-${Math.random()}`,
      type: types[Math.floor(Math.random() * types.length)],
      timestamp: new Date().toISOString(),
      userId: this.users[Math.floor(Math.random() * this.users.length)].id,
      username: this.users[Math.floor(Math.random() * this.users.length)].username,
      details: { random: Math.random(), test: true },
      severity: severities[Math.floor(Math.random() * severities.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
    };
  }

  /**
   * 模擬 SSE 事件串流
   */
  simulateEventStream(callback: (event: Event) => void, intervalMs: number = 3000): () => void {
    const interval = setInterval(() => {
      const event = this.generateRandomEvent();
      this.events.unshift(event);
      callback(event);
    }, intervalMs);

    return () => clearInterval(interval);
  }
}
