import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { TableComponent } from '../../../shared/ui/table/table.component';
import { HasPermDirective } from '../../../shared/directives';
import { sdk, Permission, AuditLog, AuditAction, AuditResource } from '../../../../shared/sdk';

@Component({
  selector: 'app-audit-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TableComponent, HasPermDirective],
  template: `
    <div class="audit-container">
      <header class="audit-header">
        <div>
          <h1>稽核軌跡</h1>
          <p class="subtitle">查看系統所有操作記錄</p>
        </div>
        <button
          *hasPerm="[Permission.EXPORT_AUDIT_LOGS]"
          class="btn btn-primary"
          (click)="exportLogs()"
          [disabled]="loading()"
        >
          📥 匯出記錄
        </button>
      </header>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-group">
          <label>使用者</label>
          <input
            type="text"
            [(ngModel)]="filters.userId"
            (input)="applyFilters()"
            placeholder="輸入使用者 ID"
            class="filter-input"
          />
        </div>

        <div class="filter-group">
          <label>操作</label>
          <select [(ngModel)]="filters.action" (change)="applyFilters()" class="filter-select">
            <option value="">全部</option>
            <option value="create">建立</option>
            <option value="read">讀取</option>
            <option value="update">更新</option>
            <option value="delete">刪除</option>
            <option value="login">登入</option>
            <option value="logout">登出</option>
            <option value="approve">批准</option>
            <option value="reject">拒絕</option>
            <option value="publish">發佈</option>
            <option value="archive">封存</option>
          </select>
        </div>

        <div class="filter-group">
          <label>資源類型</label>
          <select
            [(ngModel)]="filters.resourceType"
            (change)="applyFilters()"
            class="filter-select"
          >
            <option value="">全部</option>
            <option value="user">使用者</option>
            <option value="approval_request">審批請求</option>
            <option value="feature_flag">功能旗標</option>
            <option value="setting">設定</option>
            <option value="webhook">Webhook</option>
          </select>
        </div>

        <div class="filter-group">
          <label>資源 ID</label>
          <input
            type="text"
            [(ngModel)]="filters.resourceId"
            (input)="applyFilters()"
            placeholder="輸入資源 ID"
            class="filter-input"
          />
        </div>

        <div class="filter-group">
          <label>開始日期</label>
          <input
            type="date"
            [(ngModel)]="startDate"
            (change)="applyFilters()"
            class="filter-input"
          />
        </div>

        <div class="filter-group">
          <label>結束日期</label>
          <input type="date" [(ngModel)]="endDate" (change)="applyFilters()" class="filter-input" />
        </div>

        <button class="btn btn-outline" (click)="clearFilters()">清除篩選</button>
        <button class="btn btn-outline" (click)="refresh()">重新整理</button>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <h3>總記錄數</h3>
            <div class="stat-value">{{ total() }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👤</div>
          <div class="stat-content">
            <h3>活躍使用者</h3>
            <div class="stat-value">{{ uniqueUsers() }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⚡</div>
          <div class="stat-content">
            <h3>今日操作</h3>
            <div class="stat-value">{{ todayActions() }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <h3>操作類型</h3>
            <div class="stat-value">{{ actionTypes() }}</div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="table-section">
        <app-table
          [data]="auditLogs()"
          [columns]="columns"
          [loading]="loading()"
          (rowClick)="onRowClick($event)"
        ></app-table>
      </div>
    </div>
  `,
  styles: [
    `
      .audit-container {
        padding: 2rem;
        max-width: 1600px;
        margin: 0 auto;
      }

      .audit-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .audit-header h1 {
        margin: 0 0 0.5rem 0;
        color: #111827;
      }

      .subtitle {
        margin: 0;
        color: #6b7280;
        font-size: 0.875rem;
      }

      .filters-section {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .filter-group label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #374151;
      }

      .filter-select,
      .filter-input {
        padding: 0.5rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        min-width: 150px;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .stat-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.5rem;
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #3b82f6;
      }

      .stat-icon {
        font-size: 2rem;
      }

      .stat-content h3 {
        margin: 0 0 0.5rem 0;
        font-size: 0.875rem;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: #111827;
      }

      .table-section {
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem 1rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        background: white;
        color: #374151;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
      }

      .btn:hover:not(:disabled) {
        background: #f9fafb;
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .btn-primary {
        background: #3b82f6;
        color: white;
        border-color: #3b82f6;
      }

      .btn-primary:hover:not(:disabled) {
        background: #2563eb;
      }

      .btn-outline {
        background: transparent;
      }
    `,
  ],
})
export class AuditListComponent implements OnInit {
  private router = inject(Router);
  Permission = Permission;

  auditLogs = signal<AuditLog[]>([]);
  loading = signal(false);
  total = signal(0);
  uniqueUsers = signal(0);
  todayActions = signal(0);
  actionTypes = signal(0);

  filters: any = {
    userId: '',
    action: '',
    resourceType: '',
    resourceId: '',
  };

  startDate = '';
  endDate = '';

  columns = [
    { key: 'timestamp', header: '時間', sortable: true },
    { key: 'username', header: '使用者', sortable: true },
    { key: 'action', header: '操作', sortable: true },
    { key: 'resourceType', header: '資源類型', sortable: true },
    { key: 'resourceId', header: '資源 ID', sortable: true },
    { key: 'ipAddress', header: 'IP 地址', sortable: false },
  ];

  async ngOnInit(): Promise<void> {
    await this.fetchAuditLogs();
  }

  async fetchAuditLogs(): Promise<void> {
    this.loading.set(true);

    try {
      const params: any = { ...this.filters };

      if (this.startDate && this.endDate) {
        params.startDate = new Date(this.startDate);
        params.endDate = new Date(this.endDate);
      }

      const response = await sdk.audit.list(params).toPromise();

      if (response) {
        this.auditLogs.set(response.data);
        this.total.set(response.pagination.total);

        // Calculate stats
        this.calculateStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      this.loading.set(false);
    }
  }

  private calculateStats(logs: AuditLog[]): void {
    // Unique users
    const users = new Set(logs.map((log) => log.userId));
    this.uniqueUsers.set(users.size);

    // Today's actions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogs = logs.filter((log) => new Date(log.timestamp) >= today);
    this.todayActions.set(todayLogs.length);

    // Action types
    const actions = new Set(logs.map((log) => log.action));
    this.actionTypes.set(actions.size);
  }

  applyFilters(): void {
    this.fetchAuditLogs();
  }

  clearFilters(): void {
    this.filters = {
      userId: '',
      action: '',
      resourceType: '',
      resourceId: '',
    };
    this.startDate = '';
    this.endDate = '';
    this.fetchAuditLogs();
  }

  refresh(): void {
    this.fetchAuditLogs();
  }

  async exportLogs(): Promise<void> {
    this.loading.set(true);

    try {
      const blob = await sdk.audit.export(this.filters).toPromise();

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit-logs-${new Date().toISOString()}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export audit logs:', error);
    } finally {
      this.loading.set(false);
    }
  }

  onRowClick(row: { id?: string }): void {
    if (typeof row?.id === 'string' && row.id.length > 0) {
      void this.router.navigate(['/audit', row.id]);
    }
  }
}
