import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TableComponent } from '../../shared/ui/table/table.component';
import { HasPermDirective } from '../../shared/directives';
import { AuthService } from '../../core/auth/auth.service';
import { EventsSseService } from '../../core/events/events-sse.service';
import { MockBackendService } from '../../core/mock/mock-backend.service';
import { ApprovalsStore } from '../../store/approvals.store';
import { Permission } from '../../../shared/sdk';
import { SliceChartsComponent } from './slice-charts.component';
import { severityBars, throughputSeries, typeBars } from './chart-stats';

@Component({
  selector: 'app-completeness-slice',
  standalone: true,
  imports: [CommonModule, RouterModule, TableComponent, HasPermDirective, SliceChartsComponent],
  templateUrl: './completeness-slice.component.html',
  styleUrl: './completeness-slice.component.css',
})
export class CompletenessSliceComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private mockBackend = inject(MockBackendService);

  auth = inject(AuthService);
  eventsSse = inject(EventsSseService);
  approvalsStore = inject(ApprovalsStore);

  Permission = Permission;

  readonly userLabel = computed(() => {
    const user = this.auth.user();
    if (!user) {
      return 'signed out';
    }
    return `${user.username} · ${user.role}`;
  });

  readonly openApprovals = computed(() =>
    this.approvalsStore
      .approvals()
      .filter((approval) => approval.status === 'pending' || approval.status === 'in_review')
  );

  readonly auditRows = computed(() =>
    this.mockBackend.getAuditLogs().map((log) => ({
      id: log.id,
      username: log.username,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      timestamp: log.timestamp,
    }))
  );

  readonly sseRows = computed(() =>
    this.eventsSse.recentEvents().slice(0, 8).map((event) => ({
      id: event.id,
      type: event.type,
      severity: event.severity,
      source: event.source,
      username: event.username || 'system',
      timestamp: event.timestamp,
    }))
  );

  readonly severityChart = computed(() => severityBars(this.eventsSse.events()));
  readonly typeChart = computed(() => typeBars(this.eventsSse.events()));
  readonly throughputChart = computed(() =>
    throughputSeries(this.eventsSse.events().map((event) => event.timestamp))
  );

  approvalColumns = [
    { key: 'title', header: 'Title', sortable: true },
    { key: 'requestType', header: 'Type', sortable: true },
    { key: 'priority', header: 'Priority', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'amount', header: 'Amount', sortable: true },
  ];

  auditColumns = [
    { key: 'timestamp', header: 'Time', sortable: true },
    { key: 'username', header: 'User', sortable: true },
    { key: 'action', header: 'Action', sortable: true },
    { key: 'resourceType', header: 'Resource', sortable: true },
  ];

  eventColumns = [
    { key: 'timestamp', header: 'Time', sortable: true },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'severity', header: 'Severity', sortable: true },
    { key: 'source', header: 'Source', sortable: true },
  ];

  ngOnInit(): void {
    void this.approvalsStore.fetchApprovals();
    this.eventsSse.start('mock');
  }

  ngOnDestroy(): void {
    this.eventsSse.stop();
  }

  logout(): void {
    this.auth.logout();
  }

  openApproval(row: { id?: string }): void {
    if (row?.id) {
      void this.router.navigate(['/approvals', row.id]);
    }
  }
}
