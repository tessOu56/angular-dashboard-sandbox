import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { TableComponent } from '../../../shared/ui/table/table.component';
import { HasPermDirective } from '../../../shared/directives';
import { ApprovalFilters, ApprovalsStore } from '../../../store/approvals.store';
import { Permission } from '../../../../shared/sdk';

@Component({
  selector: 'app-approvals-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TableComponent, HasPermDirective],
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Approvals</h1>
          <p class="page-lede">Filter mock requests. Dual-control applies to budget or purchase amounts of $10,000 or more.</p>
        </div>
        <div class="page-actions">
          <a *hasPerm="[Permission.CREATE_APPROVAL]" class="btn btn-primary" routerLink="/approvals/new">
            New request
          </a>
        </div>
      </header>

      <div class="toolbar">
        <div class="filter-field">
          <label for="approval-status">Status</label>
          <select id="approval-status" [(ngModel)]="selectedStatus" (change)="applyFilters()">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in_review">In review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div class="filter-field">
          <label for="approval-priority">Priority</label>
          <select id="approval-priority" [(ngModel)]="selectedPriority" (change)="applyFilters()">
            <option value="">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div class="filter-field">
          <label for="approval-type">Type</label>
          <select id="approval-type" [(ngModel)]="selectedType" (change)="applyFilters()">
            <option value="">All</option>
            <option value="expense">Expense</option>
            <option value="purchase">Purchase</option>
            <option value="travel">Travel</option>
            <option value="leave">Leave</option>
            <option value="budget">Budget</option>
          </select>
        </div>
        <button type="button" class="btn" (click)="clearFilters()">Clear</button>
        <button type="button" class="btn" (click)="store.refresh()">Refresh</button>
      </div>

      <div class="stat-grid">
        <div class="stat-card">
          <h3>Pending</h3>
          <div class="stat-value">{{ store.pendingApprovals().length }}</div>
        </div>
        <div class="stat-card">
          <h3>High priority</h3>
          <div class="stat-value">{{ store.highPriorityApprovals().length }}</div>
        </div>
        <div class="stat-card">
          <h3>Approved</h3>
          <div class="stat-value">{{ store.approvedApprovals().length }}</div>
        </div>
        <div class="stat-card">
          <h3>Rejected</h3>
          <div class="stat-value">{{ store.rejectedApprovals().length }}</div>
        </div>
      </div>

      <p *ngIf="store.error()" class="error-state" role="alert">{{ store.error() }}</p>

      <div class="surface">
        <app-table
          [data]="store.filteredApprovals()"
          [columns]="columns"
          [loading]="store.loading()"
          [clickable]="true"
          emptyMessage="No approvals match these filters"
          (rowClick)="onRowClick($event)"
        ></app-table>
      </div>
    </div>
  `,
})
export class ApprovalsListComponent implements OnInit {
  private router = inject(Router);
  store = inject(ApprovalsStore);
  Permission = Permission;

  selectedStatus = '';
  selectedPriority = '';
  selectedType = '';

  columns = [
    { key: 'title', header: 'Title', sortable: true },
    { key: 'requestType', header: 'Type', sortable: true },
    { key: 'priority', header: 'Priority', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'requesterName', header: 'Requester', sortable: true },
    { key: 'department', header: 'Department', sortable: true },
    { key: 'amount', header: 'Amount', sortable: true },
    { key: 'createdAt', header: 'Created', sortable: true },
  ];

  ngOnInit(): void {
    this.store.fetchApprovals();
  }

  applyFilters(): void {
    const filters: ApprovalFilters = {};

    if (this.selectedStatus) {
      filters.status = [this.selectedStatus];
    }
    if (this.selectedPriority) {
      filters.priority = [this.selectedPriority];
    }
    if (this.selectedType) {
      filters.requestType = [this.selectedType];
    }

    this.store.setFilters(filters);
    this.store.fetchApprovals();
  }

  clearFilters(): void {
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.selectedType = '';
    this.store.clearFilters();
    this.store.fetchApprovals();
  }

  onRowClick(row: { id?: string }): void {
    if (typeof row?.id === 'string' && row.id.length > 0) {
      void this.router.navigate(['/approvals', row.id]);
    }
  }
}
