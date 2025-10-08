import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TableComponent } from '../../shared/ui/table/table.component';
import { HasPermDirective, HasRoleDirective } from '../../shared/directives';
import { ApprovalsStore } from '../../store/approvals.store';
import { FlagsStore } from '../../store/flags.store';
import { EventsStore } from '../../store/events.store';
import { EventsSseService } from '../../core/events/events-sse.service';
import { PermissionService } from '../../core/auth/permission.service';
import { sdk, Permission, UserRole } from '../../../shared/sdk';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TableComponent,
    HasPermDirective,
    HasRoleDirective,
  ],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>AlloyLab Platform Dashboard</h1>
        <div class="header-actions">
          <button
            *hasPerm="[Permission.VIEW_EVENTS]"
            class="btn btn-outline"
            (click)="toggleEventStream()"
          >
            {{ eventsSse.isConnected() ? 'Stop' : 'Start' }} Event Stream
          </button>
          <button
            *hasRole="[UserRole.ADMIN, UserRole.MANAGER]"
            class="btn btn-primary"
            routerLink="/settings"
          >
            Settings
          </button>
        </div>
      </header>

      <div class="dashboard-content">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Pending Approvals</h3>
            <div class="stat-value">{{ approvalsStore.pendingApprovals().length }}</div>
          </div>
          <div class="stat-card">
            <h3>Active Flags</h3>
            <div class="stat-value">{{ flagsStore.enabledFlags().length }}</div>
          </div>
          <div class="stat-card">
            <h3>Recent Events</h3>
            <div class="stat-value">{{ eventsStore.recentEvents().length }}</div>
          </div>
          <div class="stat-card">
            <h3>Critical Events</h3>
            <div class="stat-value">{{ eventsSse.criticalEvents().length }}</div>
          </div>
        </div>

        <!-- Recent Approvals -->
        <div class="section" *hasPerm="[Permission.VIEW_APPROVALS]">
          <div class="section-header">
            <h2>Recent Approvals</h2>
            <button class="btn btn-outline" (click)="approvalsStore.refresh()">Refresh</button>
          </div>

          <app-table
            [data]="approvalsStore.approvals()"
            [columns]="approvalColumns"
            [loading]="approvalsStore.loading()"
            [selectable]="true"
            (selectionChange)="onApprovalSelectionChange($event)"
          ></app-table>
        </div>

        <!-- Feature Flags -->
        <div class="section" *hasPerm="[Permission.VIEW_FLAGS]">
          <div class="section-header">
            <h2>Feature Flags</h2>
            <button class="btn btn-outline" (click)="flagsStore.refresh()">Refresh</button>
          </div>

          <app-table
            [data]="flagsStore.flags()"
            [columns]="flagColumns"
            [loading]="flagsStore.loading()"
            [selectable]="true"
            (selectionChange)="onFlagSelectionChange($event)"
          ></app-table>
        </div>

        <!-- Real-time Events -->
        <div class="section" *hasPerm="[Permission.VIEW_EVENTS]">
          <div class="section-header">
            <h2>Real-time Events</h2>
            <div class="event-controls">
              <span class="connection-status" [class.connected]="eventsSse.isConnected()">
                {{ eventsSse.isConnected() ? 'Connected' : 'Disconnected' }}
              </span>
              <button class="btn btn-sm" (click)="eventsSse.clearEvents()">Clear</button>
            </div>
          </div>

          <app-table
            [data]="eventsSse.recentEvents()"
            [columns]="eventColumns"
            [loading]="eventsStore.loading()"
          ></app-table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .dashboard-header h1 {
        margin: 0;
        color: #111827;
      }

      .header-actions {
        display: flex;
        gap: 1rem;
      }

      .dashboard-content {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .stat-card {
        background: white;
        padding: 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
      }

      .stat-card h3 {
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

      .section {
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .section-header h2 {
        margin: 0;
        font-size: 1.125rem;
        color: #111827;
      }

      .event-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .connection-status {
        padding: 0.25rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 500;
        background: #fef2f2;
        color: #dc2626;
      }

      .connection-status.connected {
        background: #f0fdf4;
        color: #16a34a;
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
        border-color: #d1d5db;
      }

      .btn-outline:hover:not(:disabled) {
        background: #f9fafb;
      }

      .btn-sm {
        padding: 0.25rem 0.75rem;
        font-size: 0.75rem;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Services
  approvalsStore = inject(ApprovalsStore);
  flagsStore = inject(FlagsStore);
  eventsStore = inject(EventsStore);
  eventsSse = inject(EventsSseService);
  permissionService = inject(PermissionService);

  // Constants
  Permission = Permission;
  UserRole = UserRole;

  // Table columns
  approvalColumns = [
    { key: 'title', header: 'Title', sortable: true },
    { key: 'requestType', header: 'Type', sortable: true },
    { key: 'priority', header: 'Priority', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'requesterName', header: 'Requester', sortable: true },
    { key: 'createdAt', header: 'Created', sortable: true },
  ];

  flagColumns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'key', header: 'Key', sortable: true },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'isEnabled', header: 'Enabled', sortable: true },
    { key: 'createdAt', header: 'Created', sortable: true },
  ];

  eventColumns = [
    { key: 'timestamp', header: 'Time', sortable: true },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'severity', header: 'Severity', sortable: true },
    { key: 'source', header: 'Source', sortable: true },
    { key: 'username', header: 'User', sortable: true },
  ];

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.eventsSse.stop();
  }

  private async loadData(): Promise<void> {
    // Load initial data
    await Promise.all([
      this.approvalsStore.fetchApprovals(),
      this.flagsStore.fetchFlags(),
      this.eventsStore.fetchEvents(),
    ]);

    // Start event stream if user has permission
    if (this.permissionService.hasPermission(Permission.VIEW_EVENTS)) {
      this.eventsSse.start('http://localhost:3000/api/events/stream');
    }
  }

  toggleEventStream(): void {
    if (this.eventsSse.isConnected()) {
      this.eventsSse.stop();
    } else {
      this.eventsSse.start('http://localhost:3000/api/events/stream');
    }
  }

  onApprovalSelectionChange(selectedIds: string[]): void {
    console.log('Selected approvals:', selectedIds);
  }

  onFlagSelectionChange(selectedIds: string[]): void {
    console.log('Selected flags:', selectedIds);
  }
}
