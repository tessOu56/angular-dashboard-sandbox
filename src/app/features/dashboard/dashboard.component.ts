import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TableComponent } from '../../shared/ui/table/table.component';
import { HasPermDirective } from '../../shared/directives';
import { ApprovalsStore } from '../../store/approvals.store';
import { FlagsStore } from '../../store/flags.store';
import { EventsStore } from '../../store/events.store';
import { EventsSseService } from '../../core/events/events-sse.service';
import { PermissionService } from '../../core/auth/permission.service';
import { Permission } from '../../../shared/sdk';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TableComponent, HasPermDirective],
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-lede">
            Wider mock snapshot than the overview: approvals, flags, and the event stream in one place.
          </p>
        </div>
        <div class="page-actions">
          <button
            *hasPerm="[Permission.VIEW_EVENTS]"
            type="button"
            class="btn"
            (click)="toggleEventStream()"
          >
            {{ eventsSse.isConnected() ? 'Stop stream' : 'Start stream' }}
          </button>
        </div>
      </header>

      <div class="stat-grid">
        <div class="stat-card">
          <h3>Pending approvals</h3>
          <div class="stat-value">{{ approvalsStore.pendingApprovals().length }}</div>
        </div>
        <div class="stat-card">
          <h3>Active flags</h3>
          <div class="stat-value">{{ flagsStore.enabledFlags().length }}</div>
        </div>
        <div class="stat-card">
          <h3>Recent events</h3>
          <div class="stat-value">{{ eventsStore.recentEvents().length }}</div>
        </div>
        <div class="stat-card">
          <h3>Critical events</h3>
          <div class="stat-value">{{ eventsSse.criticalEvents().length }}</div>
        </div>
      </div>

      <section class="surface dash-section" *hasPerm="[Permission.VIEW_APPROVALS]">
        <div class="panel-head">
          <h2>Recent approvals</h2>
          <button type="button" class="btn btn-sm" (click)="approvalsStore.refresh()">Refresh</button>
        </div>
        <app-table
          [data]="approvalsStore.approvals()"
          [columns]="approvalColumns"
          [loading]="approvalsStore.loading()"
          emptyMessage="No approvals in the mock set"
        ></app-table>
      </section>

      <section class="surface dash-section" *hasPerm="[Permission.VIEW_FLAGS]">
        <div class="panel-head">
          <h2>Feature flags</h2>
          <button type="button" class="btn btn-sm" (click)="flagsStore.refresh()">Refresh</button>
        </div>
        <app-table
          [data]="flagsStore.flags()"
          [columns]="flagColumns"
          [loading]="flagsStore.loading()"
          emptyMessage="No flags in the mock set"
        ></app-table>
      </section>

      <section class="surface dash-section" *hasPerm="[Permission.VIEW_EVENTS]">
        <div class="panel-head">
          <h2>Real-time events</h2>
          <span class="chip" [class.is-ok]="eventsSse.isConnected()" [class.is-bad]="!eventsSse.isConnected()">
            {{ eventsSse.isConnected() ? 'Connected' : 'Disconnected' }}
          </span>
        </div>
        <app-table
          [data]="eventsSse.recentEvents()"
          [columns]="eventColumns"
          [loading]="eventsStore.loading()"
          emptyMessage="No events yet"
        ></app-table>
      </section>
    </div>
  `,
  styles: [
    `
      .dash-section {
        margin-bottom: var(--space-4);
      }

      .dash-section .panel-head {
        padding-bottom: var(--space-3);
      }
    `,
  ],
})
export class DashboardComponent implements OnInit, OnDestroy {
  approvalsStore = inject(ApprovalsStore);
  flagsStore = inject(FlagsStore);
  eventsStore = inject(EventsStore);
  eventsSse = inject(EventsSseService);
  permissionService = inject(PermissionService);

  Permission = Permission;

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
    void this.loadData();
  }

  ngOnDestroy(): void {
    this.eventsSse.stop();
  }

  private async loadData(): Promise<void> {
    await Promise.all([
      this.approvalsStore.fetchApprovals(),
      this.flagsStore.fetchFlags(),
      this.eventsStore.fetchEvents(),
    ]);

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
}
