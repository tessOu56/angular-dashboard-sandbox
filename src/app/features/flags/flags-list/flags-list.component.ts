import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { TableComponent } from '../../../shared/ui/table/table.component';
import { HasPermDirective } from '../../../shared/directives';
import { FlagsStore } from '../../../store/flags.store';
import { Permission } from '../../../../shared/sdk';

@Component({
  selector: 'app-flags-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TableComponent, HasPermDirective],
  template: `
    <div class="flags-container">
      <header class="flags-header">
        <div>
          <h1>功能旗標管理</h1>
          <p class="subtitle">管理所有功能旗標與發佈流程</p>
        </div>
        <button
          *hasPerm="[Permission.MANAGE_FLAGS]"
          class="btn btn-primary"
          routerLink="/flags/new"
        >
          + 新增旗標
        </button>
      </header>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-group">
          <label>狀態</label>
          <select [(ngModel)]="selectedStatus" (change)="applyFilters()" class="filter-select">
            <option value="">全部</option>
            <option value="draft">草稿</option>
            <option value="pending_approval">待審批</option>
            <option value="approved">已批准</option>
            <option value="published">已發佈</option>
            <option value="archived">已封存</option>
          </select>
        </div>

        <div class="filter-group">
          <label>類型</label>
          <select [(ngModel)]="selectedType" (change)="applyFilters()" class="filter-select">
            <option value="">全部</option>
            <option value="boolean">布林值</option>
            <option value="string">字串</option>
            <option value="number">數值</option>
            <option value="json">JSON</option>
          </select>
        </div>

        <div class="filter-group">
          <label>啟用狀態</label>
          <select [(ngModel)]="selectedEnabled" (change)="applyFilters()" class="filter-select">
            <option value="">全部</option>
            <option value="true">已啟用</option>
            <option value="false">已停用</option>
          </select>
        </div>

        <button class="btn btn-outline" (click)="clearFilters()">清除篩選</button>
        <button class="btn btn-outline" (click)="store.refresh()">重新整理</button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card published">
          <div class="stat-icon">🚀</div>
          <div class="stat-content">
            <h3>已發佈</h3>
            <div class="stat-value">{{ store.publishedFlags().length }}</div>
          </div>
        </div>
        <div class="stat-card enabled">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>已啟用</h3>
            <div class="stat-value">{{ store.enabledFlags().length }}</div>
          </div>
        </div>
        <div class="stat-card draft">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <h3>草稿</h3>
            <div class="stat-value">{{ store.draftFlags().length }}</div>
          </div>
        </div>
        <div class="stat-card pending">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <h3>待審批</h3>
            <div class="stat-value">{{ store.pendingFlags().length }}</div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="table-section">
        <app-table
          [data]="store.filteredFlags()"
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
      .flags-container {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .flags-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .flags-header h1 {
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

      .stat-card.published {
        border-left-color: #10b981;
      }

      .stat-card.enabled {
        border-left-color: #3b82f6;
      }

      .stat-card.draft {
        border-left-color: #f59e0b;
      }

      .stat-card.pending {
        border-left-color: #ef4444;
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
export class FlagsListComponent implements OnInit {
  store = inject(FlagsStore);
  Permission = Permission;

  selectedStatus = '';
  selectedType = '';
  selectedEnabled = '';

  columns = [
    { key: 'name', header: '名稱', sortable: true },
    { key: 'key', header: '鍵值', sortable: true },
    { key: 'type', header: '類型', sortable: true },
    { key: 'status', header: '狀態', sortable: true },
    { key: 'isEnabled', header: '啟用', sortable: true },
    { key: 'createdBy', header: '建立者', sortable: true },
    { key: 'createdAt', header: '建立時間', sortable: true },
  ];

  ngOnInit(): void {
    this.store.fetchFlags();
  }

  applyFilters(): void {
    const filters: any = {};

    if (this.selectedStatus) {
      filters.status = [this.selectedStatus];
    }

    if (this.selectedType) {
      filters.type = [this.selectedType];
    }

    if (this.selectedEnabled) {
      filters.isEnabled = this.selectedEnabled === 'true';
    }

    this.store.setFilters(filters);
    this.store.fetchFlags();
  }

  clearFilters(): void {
    this.selectedStatus = '';
    this.selectedType = '';
    this.selectedEnabled = '';
    this.store.clearFilters();
    this.store.fetchFlags();
  }

  onRowClick(row: any): void {
    window.location.href = `/flags/${row.id}`;
  }
}
