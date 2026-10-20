import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { TableComponent } from '../../../shared/ui/table/table.component';
import { HasPermDirective } from '../../../shared/directives';
import { sdk, Permission, AuditLog } from '../../../../shared/sdk';

@Component({
  selector: 'app-audit-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TableComponent, HasPermDirective],
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Audit trail</h1>
          <p class="page-lede">Mock operation history for the accounts in this sandbox.</p>
        </div>
        <div class="page-actions">
          <button
            *hasPerm="[Permission.EXPORT_AUDIT_LOGS]"
            type="button"
            class="btn btn-primary"
            (click)="exportLogs()"
            [disabled]="loading()"
          >
            Export CSV
          </button>
        </div>
      </header>

      <div class="toolbar">
        <div class="filter-field">
          <label for="audit-user">User</label>
          <input
            id="audit-user"
            type="text"
            [(ngModel)]="filters.userId"
            (input)="applyFilters()"
            placeholder="User id"
          />
        </div>
        <div class="filter-field">
          <label for="audit-action">Action</label>
          <select id="audit-action" [(ngModel)]="filters.action" (change)="applyFilters()">
            <option value="">All</option>
            <option value="create">Create</option>
            <option value="read">Read</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="approve">Approve</option>
            <option value="reject">Reject</option>
            <option value="publish">Publish</option>
            <option value="archive">Archive</option>
          </select>
        </div>
        <div class="filter-field">
          <label for="audit-resource">Resource</label>
          <select id="audit-resource" [(ngModel)]="filters.resourceType" (change)="applyFilters()">
            <option value="">All</option>
            <option value="user">User</option>
            <option value="approval_request">Approval</option>
            <option value="feature_flag">Flag</option>
            <option value="setting">Setting</option>
            <option value="webhook">Webhook</option>
          </select>
        </div>
        <div class="filter-field">
          <label for="audit-start">Start</label>
          <input id="audit-start" type="date" [(ngModel)]="startDate" (change)="applyFilters()" />
        </div>
        <div class="filter-field">
          <label for="audit-end">End</label>
          <input id="audit-end" type="date" [(ngModel)]="endDate" (change)="applyFilters()" />
        </div>
        <button type="button" class="btn" (click)="clearFilters()">Clear</button>
        <button type="button" class="btn" (click)="refresh()">Refresh</button>
      </div>

      <div class="stat-grid">
        <div class="stat-card">
          <h3>Rows</h3>
          <div class="stat-value">{{ total() }}</div>
        </div>
        <div class="stat-card">
          <h3>Users</h3>
          <div class="stat-value">{{ uniqueUsers() }}</div>
        </div>
        <div class="stat-card">
          <h3>Today</h3>
          <div class="stat-value">{{ todayActions() }}</div>
        </div>
        <div class="stat-card">
          <h3>Action types</h3>
          <div class="stat-value">{{ actionTypes() }}</div>
        </div>
      </div>

      <p *ngIf="error()" class="error-state" role="alert">{{ error() }}</p>

      <div class="surface">
        <app-table
          [data]="auditLogs()"
          [columns]="columns"
          [loading]="loading()"
          [clickable]="true"
          emptyMessage="No audit rows match these filters"
          (rowClick)="onRowClick($event)"
        ></app-table>
      </div>
    </div>
  `,
})
export class AuditListComponent implements OnInit {
  private router = inject(Router);
  Permission = Permission;

  auditLogs = signal<AuditLog[]>([]);
  loading = signal(false);
  error = signal('');
  total = signal(0);
  uniqueUsers = signal(0);
  todayActions = signal(0);
  actionTypes = signal(0);

  filters: { userId: string; action: string; resourceType: string; resourceId: string } = {
    userId: '',
    action: '',
    resourceType: '',
    resourceId: '',
  };

  startDate = '';
  endDate = '';

  columns = [
    { key: 'timestamp', header: 'Time', sortable: true },
    { key: 'username', header: 'User', sortable: true },
    { key: 'action', header: 'Action', sortable: true },
    { key: 'resourceType', header: 'Resource', sortable: true },
    { key: 'resourceId', header: 'Resource id', sortable: true },
    { key: 'ipAddress', header: 'IP', sortable: false },
  ];

  async ngOnInit(): Promise<void> {
    await this.fetchAuditLogs();
  }

  async fetchAuditLogs(): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      const params: Record<string, unknown> = { ...this.filters };

      if (this.startDate && this.endDate) {
        params['startDate'] = new Date(this.startDate);
        params['endDate'] = new Date(this.endDate);
      }

      const response = await sdk.audit.list(params).toPromise();

      if (response) {
        this.auditLogs.set(response.data);
        this.total.set(response.pagination.total);
        this.calculateStats(response.data);
      }
    } catch {
      this.error.set('Could not load the mock audit trail.');
    } finally {
      this.loading.set(false);
    }
  }

  private calculateStats(logs: AuditLog[]): void {
    const users = new Set(logs.map((log) => log.userId));
    this.uniqueUsers.set(users.size);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.todayActions.set(logs.filter((log) => new Date(log.timestamp) >= today).length);
    this.actionTypes.set(new Set(logs.map((log) => log.action)).size);
  }

  applyFilters(): void {
    void this.fetchAuditLogs();
  }

  clearFilters(): void {
    this.filters = { userId: '', action: '', resourceType: '', resourceId: '' };
    this.startDate = '';
    this.endDate = '';
    void this.fetchAuditLogs();
  }

  refresh(): void {
    void this.fetchAuditLogs();
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
    } catch {
      this.error.set('Could not export the mock audit trail.');
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
