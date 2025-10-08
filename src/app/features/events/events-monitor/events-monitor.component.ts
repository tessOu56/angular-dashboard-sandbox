import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { TableComponent } from '../../../shared/ui/table/table.component';
import { EventsSseService } from '../../../core/events/events-sse.service';
import { EventsStore } from '../../../store/events.store';
import { Permission, EventType, EventSeverity } from '../../../../shared/sdk';

@Component({
  selector: 'app-events-monitor',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TableComponent],
  template: `
    <div class="events-container">
      <header class="events-header">
        <div>
          <h1>即時事件監控</h1>
          <p class="subtitle">實時追蹤系統所有事件</p>
        </div>
        <div class="header-actions">
          <button
            class="btn"
            [class.btn-success]="!eventsSse.isConnected()"
            [class.btn-danger]="eventsSse.isConnected()"
            (click)="toggleStream()"
          >
            {{ eventsSse.isConnected() ? '⏸ 停止串流' : '▶ 啟動串流' }}
          </button>
          <button class="btn btn-outline" (click)="eventsSse.clearEvents()">🗑 清除事件</button>
          <button class="btn btn-outline" (click)="exportEvents()">📥 匯出 CSV</button>
        </div>
      </header>

      <!-- Connection Status -->
      <div class="status-bar" [class.connected]="eventsSse.isConnected()">
        <div class="status-indicator">
          <span class="status-dot"></span>
          <span class="status-text">
            {{ eventsSse.isConnected() ? '已連線' : '未連線' }}
          </span>
        </div>
        <div class="status-info">
          <span>事件總數: {{ eventsSse.eventCount() }}</span>
          <span *ngIf="eventsSse.lastEventTime()">
            最後更新: {{ eventsSse.lastEventTime() | date : 'short' }}
          </span>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-group">
          <label>事件類型</label>
          <select [(ngModel)]="selectedType" (change)="applyFilters()" class="filter-select">
            <option value="">全部</option>
            <option value="user_login">使用者登入</option>
            <option value="user_logout">使用者登出</option>
            <option value="approval_created">審批建立</option>
            <option value="approval_updated">審批更新</option>
            <option value="flag_created">旗標建立</option>
            <option value="flag_updated">旗標更新</option>
            <option value="flag_published">旗標發佈</option>
            <option value="system_alert">系統警告</option>
            <option value="error">錯誤</option>
          </select>
        </div>

        <div class="filter-group">
          <label>嚴重程度</label>
          <select [(ngModel)]="selectedSeverity" (change)="applyFilters()" class="filter-select">
            <option value="">全部</option>
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
            <option value="critical">關鍵</option>
          </select>
        </div>

        <div class="filter-group">
          <label>來源</label>
          <select [(ngModel)]="selectedSource" (change)="applyFilters()" class="filter-select">
            <option value="">全部</option>
            <option *ngFor="let source of eventsSse.eventSources()" [value]="source">
              {{ source }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>搜尋</label>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="applyFilters()"
            placeholder="搜尋事件..."
            class="filter-input"
          />
        </div>

        <button class="btn btn-outline" (click)="clearFilters()">清除篩選</button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <h3>總事件數</h3>
            <div class="stat-value">{{ eventsSse.eventCount() }}</div>
          </div>
        </div>
        <div class="stat-card critical">
          <div class="stat-icon">🚨</div>
          <div class="stat-content">
            <h3>關鍵事件</h3>
            <div class="stat-value">{{ eventsSse.criticalEvents().length }}</div>
          </div>
        </div>
        <div class="stat-card high">
          <div class="stat-icon">⚠️</div>
          <div class="stat-content">
            <h3>高嚴重度</h3>
            <div class="stat-value">{{ eventsSse.highSeverityEvents().length }}</div>
          </div>
        </div>
        <div class="stat-card types">
          <div class="stat-icon">🏷️</div>
          <div class="stat-content">
            <h3>事件類型</h3>
            <div class="stat-value">{{ eventsSse.eventTypes().length }}</div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="table-section">
        <app-table
          [data]="filteredEvents()"
          [columns]="columns"
          [loading]="false"
          (rowClick)="onRowClick($event)"
        ></app-table>
      </div>
    </div>
  `,
  styles: [
    `
      .events-container {
        padding: 2rem;
        max-width: 1600px;
        margin: 0 auto;
      }

      .events-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .events-header h1 {
        margin: 0 0 0.5rem 0;
        color: #111827;
      }

      .subtitle {
        margin: 0;
        color: #6b7280;
        font-size: 0.875rem;
      }

      .header-actions {
        display: flex;
        gap: 0.5rem;
      }

      .status-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 0.5rem;
        margin-bottom: 2rem;
        transition: all 0.3s ease;
      }

      .status-bar.connected {
        background: #f0fdf4;
        border-color: #bbf7d0;
      }

      .status-indicator {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .status-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #dc2626;
        animation: pulse 2s infinite;
      }

      .status-bar.connected .status-dot {
        background: #16a34a;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      .status-text {
        font-weight: 600;
        color: #dc2626;
      }

      .status-bar.connected .status-text {
        color: #16a34a;
      }

      .status-info {
        display: flex;
        gap: 2rem;
        font-size: 0.875rem;
        color: #6b7280;
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
        border-left: 4px solid #e5e7eb;
      }

      .stat-card.critical {
        border-left-color: #dc2626;
      }

      .stat-card.high {
        border-left-color: #f59e0b;
      }

      .stat-card.total {
        border-left-color: #3b82f6;
      }

      .stat-card.types {
        border-left-color: #8b5cf6;
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

      .btn-success {
        background: #10b981;
        color: white;
        border-color: #10b981;
      }

      .btn-success:hover {
        background: #059669;
      }

      .btn-danger {
        background: #ef4444;
        color: white;
        border-color: #ef4444;
      }

      .btn-danger:hover {
        background: #dc2626;
      }

      .btn-outline {
        background: transparent;
      }
    `,
  ],
})
export class EventsMonitorComponent implements OnInit, OnDestroy {
  eventsSse = inject(EventsSseService);
  eventsStore = inject(EventsStore);
  Permission = Permission;

  selectedType = '';
  selectedSeverity = '';
  selectedSource = '';
  searchQuery = '';

  filteredEvents = signal<any[]>([]);

  columns = [
    { key: 'timestamp', header: '時間', sortable: true },
    { key: 'type', header: '類型', sortable: true },
    { key: 'severity', header: '嚴重度', sortable: true },
    { key: 'source', header: '來源', sortable: true },
    { key: 'username', header: '使用者', sortable: true },
  ];

  ngOnInit(): void {
    // 初始化事件流
    this.startStream();
    this.updateFilteredEvents();
  }

  ngOnDestroy(): void {
    this.eventsSse.stop();
  }

  startStream(): void {
    this.eventsSse.start('http://localhost:3000/api/events/stream', {
      withCredentials: true,
    });
  }

  toggleStream(): void {
    if (this.eventsSse.isConnected()) {
      this.eventsSse.stop();
    } else {
      this.startStream();
    }
  }

  applyFilters(): void {
    this.updateFilteredEvents();
  }

  clearFilters(): void {
    this.selectedType = '';
    this.selectedSeverity = '';
    this.selectedSource = '';
    this.searchQuery = '';
    this.updateFilteredEvents();
  }

  private updateFilteredEvents(): void {
    let events = this.eventsSse.recentEvents();

    // Type filter
    if (this.selectedType) {
      events = events.filter((event) => event.type === this.selectedType);
    }

    // Severity filter
    if (this.selectedSeverity) {
      events = events.filter((event) => event.severity === this.selectedSeverity);
    }

    // Source filter
    if (this.selectedSource) {
      events = events.filter((event) => event.source === this.selectedSource);
    }

    // Search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      events = events.filter(
        (event) =>
          event.type.toLowerCase().includes(query) ||
          event.source.toLowerCase().includes(query) ||
          (event.username && event.username.toLowerCase().includes(query))
      );
    }

    this.filteredEvents.set(events);
  }

  exportEvents(): void {
    const csv = this.eventsSse.exportEventsAsCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `events-${new Date().toISOString()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  onRowClick(row: any): void {
    window.location.href = `/events/${row.id}`;
  }
}
