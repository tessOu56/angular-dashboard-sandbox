import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { TableComponent } from '../../../shared/ui/table/table.component';
import { HasPermDirective } from '../../../shared/directives';
import { ApprovalsStore } from '../../../store/approvals.store';
import { Permission, ApprovalStatus } from '../../../../shared/sdk';

@Component({
  selector: 'app-approvals-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TableComponent, HasPermDirective],
  template: `
    <div class="approvals-container">
      <header class="approvals-header">
        <div>
          <h1>審批中心</h1>
          <p class="subtitle">管理所有審批請求與工作流程</p>
        </div>
        <button
          *hasPerm="[Permission.CREATE_APPROVAL]"
          class="btn btn-primary"
          routerLink="/approvals/new"
        >
          + 新增審批請求
        </button>
      </header>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-group">
          <label>狀態</label>
          <select [(ngModel)]="selectedStatus" (change)="applyFilters()" class="filter-select">
            <option value="">全部</option>
            <option value="pending">待審批</option>
            <option value="in_review">審核中</option>
            <option value="approved">已批准</option>
            <option value="rejected">已拒絕</option>
            <option value="draft">草稿</option>
          </select>
        </div>

        <div class="filter-group">
          <label>優先級</label>
          <select [(ngModel)]="selectedPriority" (change)="applyFilters()" class="filter-select">
            <option value="">全部</option>
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
            <option value="urgent">緊急</option>
            <option value="critical">關鍵</option>
          </select>
        </div>

        <div class="filter-group">
          <label>類型</label>
          <select [(ngModel)]="selectedType" (change)="applyFilters()" class="filter-select">
            <option value="">全部</option>
            <option value="expense">費用</option>
            <option value="purchase">採購</option>
            <option value="travel">差旅</option>
            <option value="leave">請假</option>
            <option value="budget">預算</option>
          </select>
        </div>

        <button class="btn btn-outline" (click)="clearFilters()">清除篩選</button>
        <button class="btn btn-outline" (click)="store.refresh()">重新整理</button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card pending">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <h3>待審批</h3>
            <div class="stat-value">{{ store.pendingApprovals().length }}</div>
          </div>
        </div>
        <div class="stat-card high-priority">
          <div class="stat-icon">🔥</div>
          <div class="stat-content">
            <h3>高優先級</h3>
            <div class="stat-value">{{ store.highPriorityApprovals().length }}</div>
          </div>
        </div>
        <div class="stat-card approved">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>已批准</h3>
            <div class="stat-value">{{ store.approvedApprovals().length }}</div>
          </div>
        </div>
        <div class="stat-card rejected">
          <div class="stat-icon">❌</div>
          <div class="stat-content">
            <h3>已拒絕</h3>
            <div class="stat-value">{{ store.rejectedApprovals().length }}</div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="table-section">
        <app-table
          [data]="store.filteredApprovals()"
          [columns]="columns"
          [loading]="store.loading()"
          [selectable]="true"
          (rowClick)="onRowClick($event)"
        ></app-table>
      </div>
    </div>
  `,
  styles: [
    `
      .approvals-container {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .approvals-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .approvals-header h1 {
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

      .filter-select {
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
        border-left: 4px solid #e5e7eb;
      }

      .stat-card.pending {
        border-left-color: #f59e0b;
      }

      .stat-card.high-priority {
        border-left-color: #ef4444;
      }

      .stat-card.approved {
        border-left-color: #10b981;
      }

      .stat-card.rejected {
        border-left-color: #6b7280;
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

      .btn:hover {
        background: #f9fafb;
      }

      .btn-primary {
        background: #3b82f6;
        color: white;
        border-color: #3b82f6;
      }

      .btn-primary:hover {
        background: #2563eb;
      }

      .btn-outline {
        background: transparent;
      }
    `,
  ],
})
export class ApprovalsListComponent implements OnInit {
  store = inject(ApprovalsStore);
  private router = inject(Router);
  Permission = Permission;

  selectedStatus = '';
  selectedPriority = '';
  selectedType = '';

  columns = [
    { key: 'title', header: '標題', sortable: true },
    { key: 'requestType', header: '類型', sortable: true },
    { key: 'priority', header: '優先級', sortable: true },
    { key: 'status', header: '狀態', sortable: true },
    { key: 'requesterName', header: '申請人', sortable: true },
    { key: 'department', header: '部門', sortable: true },
    { key: 'amount', header: '金額', sortable: true },
    { key: 'createdAt', header: '建立時間', sortable: true },
  ];

  ngOnInit(): void {
    this.store.fetchApprovals();
  }

  applyFilters(): void {
    const filters: any = {};

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
