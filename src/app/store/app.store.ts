import { Injectable, signal, computed } from '@angular/core';
import {
  User,
  Permission,
  ApprovalRequest,
  FeatureFlag,
  Event,
  AuditLog,
} from '../../shared/types';

export interface AppState {
  // UI State
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  loading: boolean;
  notifications: Notification[];

  // Data State
  users: User[];
  approvals: ApprovalRequest[];
  flags: FeatureFlag[];
  events: Event[];
  auditLogs: AuditLog[];

  // Filter State
  currentFilters: Record<string, any>;
  selectedItems: string[];

  // Pagination State
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AppStore {
  // State signals
  private _state = signal<AppState>({
    sidebarCollapsed: false,
    theme: 'light',
    loading: false,
    notifications: [],
    users: [],
    approvals: [],
    flags: [],
    events: [],
    auditLogs: [],
    currentFilters: {},
    selectedItems: [],
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
  });

  // Public readonly state
  public readonly state = this._state.asReadonly();

  // Computed signals
  public readonly sidebarCollapsed = computed(() => this._state().sidebarCollapsed);
  public readonly theme = computed(() => this._state().theme);
  public readonly loading = computed(() => this._state().loading);
  public readonly notifications = computed(() => this._state().notifications);
  public readonly unreadNotifications = computed(() =>
    this._state().notifications.filter((n) => !n.read)
  );
  public readonly selectedItems = computed(() => this._state().selectedItems);
  public readonly hasSelection = computed(() => this._state().selectedItems.length > 0);

  // UI Actions
  toggleSidebar(): void {
    this._state.update((state) => ({
      ...state,
      sidebarCollapsed: !state.sidebarCollapsed,
    }));
  }

  setTheme(theme: 'light' | 'dark'): void {
    this._state.update((state) => ({
      ...state,
      theme,
    }));
    localStorage.setItem('theme', theme);
  }

  setLoading(loading: boolean): void {
    this._state.update((state) => ({
      ...state,
      loading,
    }));
  }

  // Notification Actions
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    this._state.update((state) => ({
      ...state,
      notifications: [newNotification, ...state.notifications],
    }));
  }

  markNotificationAsRead(id: string): void {
    this._state.update((state) => ({
      ...state,
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }

  removeNotification(id: string): void {
    this._state.update((state) => ({
      ...state,
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  }

  clearNotifications(): void {
    this._state.update((state) => ({
      ...state,
      notifications: [],
    }));
  }

  // Data Actions
  setUsers(users: User[]): void {
    this._state.update((state) => ({
      ...state,
      users,
    }));
  }

  addUser(user: User): void {
    this._state.update((state) => ({
      ...state,
      users: [...state.users, user],
    }));
  }

  updateUser(updatedUser: User): void {
    this._state.update((state) => ({
      ...state,
      users: state.users.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
    }));
  }

  removeUser(userId: string): void {
    this._state.update((state) => ({
      ...state,
      users: state.users.filter((user) => user.id !== userId),
    }));
  }

  setApprovals(approvals: ApprovalRequest[]): void {
    this._state.update((state) => ({
      ...state,
      approvals,
    }));
  }

  addApproval(approval: ApprovalRequest): void {
    this._state.update((state) => ({
      ...state,
      approvals: [...state.approvals, approval],
    }));
  }

  updateApproval(updatedApproval: ApprovalRequest): void {
    this._state.update((state) => ({
      ...state,
      approvals: state.approvals.map((approval) =>
        approval.id === updatedApproval.id ? updatedApproval : approval
      ),
    }));
  }

  setFlags(flags: FeatureFlag[]): void {
    this._state.update((state) => ({
      ...state,
      flags,
    }));
  }

  addFlag(flag: FeatureFlag): void {
    this._state.update((state) => ({
      ...state,
      flags: [...state.flags, flag],
    }));
  }

  updateFlag(updatedFlag: FeatureFlag): void {
    this._state.update((state) => ({
      ...state,
      flags: state.flags.map((flag) => (flag.id === updatedFlag.id ? updatedFlag : flag)),
    }));
  }

  setEvents(events: Event[]): void {
    this._state.update((state) => ({
      ...state,
      events,
    }));
  }

  addEvent(event: Event): void {
    this._state.update((state) => ({
      ...state,
      events: [event, ...state.events],
    }));
  }

  setAuditLogs(auditLogs: AuditLog[]): void {
    this._state.update((state) => ({
      ...state,
      auditLogs,
    }));
  }

  // Filter Actions
  setFilter(key: string, value: any): void {
    this._state.update((state) => ({
      ...state,
      currentFilters: {
        ...state.currentFilters,
        [key]: value,
      },
    }));
  }

  clearFilters(): void {
    this._state.update((state) => ({
      ...state,
      currentFilters: {},
    }));
  }

  // Selection Actions
  selectItem(id: string): void {
    this._state.update((state) => ({
      ...state,
      selectedItems: [...state.selectedItems, id],
    }));
  }

  deselectItem(id: string): void {
    this._state.update((state) => ({
      ...state,
      selectedItems: state.selectedItems.filter((item) => item !== id),
    }));
  }

  selectAll(ids: string[]): void {
    this._state.update((state) => ({
      ...state,
      selectedItems: ids,
    }));
  }

  clearSelection(): void {
    this._state.update((state) => ({
      ...state,
      selectedItems: [],
    }));
  }

  // Pagination Actions
  setPage(page: number): void {
    this._state.update((state) => ({
      ...state,
      currentPage: page,
    }));
  }

  setPageSize(size: number): void {
    this._state.update((state) => ({
      ...state,
      pageSize: size,
      currentPage: 1, // Reset to first page
    }));
  }

  setTotalItems(total: number): void {
    this._state.update((state) => ({
      ...state,
      totalItems: total,
    }));
  }

  // Initialize from localStorage
  initialize(): void {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
  }
}
