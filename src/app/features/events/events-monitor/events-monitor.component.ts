import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { TableComponent } from '../../../shared/ui/table/table.component';
import { EventsSseService } from '../../../core/events/events-sse.service';

@Component({
  selector: 'app-events-monitor',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TableComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Event monitor</h1>
          <p class="page-lede">Mock SSE stream of sandbox events. Start and stop stay on this page.</p>
        </div>
        <div class="page-actions">
          <button
            type="button"
            class="btn"
            [class.btn-success]="!eventsSse.isConnected()"
            [class.btn-danger]="eventsSse.isConnected()"
            (click)="toggleStream()"
            >
            {{ eventsSse.isConnected() ? 'Stop stream' : 'Start stream' }}
          </button>
          <button type="button" class="btn" (click)="eventsSse.clearEvents()">Clear</button>
          <button type="button" class="btn" (click)="exportEvents()">Export CSV</button>
        </div>
      </header>
    
      <div class="banner" [class.is-ok]="eventsSse.isConnected()" [class.is-bad]="!eventsSse.isConnected()">
        <span>{{ eventsSse.isConnected() ? 'Connected to mock stream' : 'Disconnected' }}</span>
        <span>
          {{ eventsSse.eventCount() }} events
          @if (eventsSse.lastEventTime()) {
            · last {{ eventsSse.lastEventTime() | date : 'short' }}
          }
        </span>
      </div>
    
      <div class="toolbar">
        <div class="filter-field">
          <label for="event-type">Type</label>
          <select id="event-type" [(ngModel)]="selectedType" (ngModelChange)="syncFilters()">
            <option value="">All</option>
            <option value="user_login">User login</option>
            <option value="user_logout">User logout</option>
            <option value="approval_created">Approval created</option>
            <option value="approval_updated">Approval updated</option>
            <option value="flag_created">Flag created</option>
            <option value="flag_updated">Flag updated</option>
            <option value="flag_published">Flag published</option>
            <option value="system_alert">System alert</option>
            <option value="error">Error</option>
          </select>
        </div>
        <div class="filter-field">
          <label for="event-severity">Severity</label>
          <select id="event-severity" [(ngModel)]="selectedSeverity" (ngModelChange)="syncFilters()">
            <option value="">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div class="filter-field">
          <label for="event-source">Source</label>
          <select id="event-source" [(ngModel)]="selectedSource" (ngModelChange)="syncFilters()">
            <option value="">All</option>
            @for (source of eventsSse.eventSources(); track source) {
              <option [value]="source">
                {{ source }}
              </option>
            }
          </select>
        </div>
        <div class="filter-field">
          <label for="event-search">Search</label>
          <input
            id="event-search"
            type="search"
            [(ngModel)]="searchQuery"
            (ngModelChange)="syncFilters()"
            placeholder="Type, source, or user"
            />
        </div>
        <button type="button" class="btn" (click)="clearFilters()">Clear</button>
      </div>
    
      <div class="stat-grid">
        <div class="stat-card">
          <h3>Total</h3>
          <div class="stat-value">{{ eventsSse.eventCount() }}</div>
        </div>
        <div class="stat-card">
          <h3>Critical</h3>
          <div class="stat-value">{{ eventsSse.criticalEvents().length }}</div>
        </div>
        <div class="stat-card">
          <h3>High</h3>
          <div class="stat-value">{{ eventsSse.highSeverityEvents().length }}</div>
        </div>
        <div class="stat-card">
          <h3>Types</h3>
          <div class="stat-value">{{ eventsSse.eventTypes().length }}</div>
        </div>
      </div>
    
      <div class="surface">
        <app-table
          [data]="filteredEvents()"
          [columns]="columns"
          [clickable]="true"
          emptyMessage="No events match these filters"
          (rowClick)="onRowClick($event)"
        ></app-table>
      </div>
    </div>
    `,
})
export class EventsMonitorComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  eventsSse = inject(EventsSseService);

  selectedType = '';
  selectedSeverity = '';
  selectedSource = '';
  searchQuery = '';

  private filters = signal({ type: '', severity: '', source: '', query: '' });

  filteredEvents = computed(() => {
    const { type, severity, source, query } = this.filters();
    let events = this.eventsSse.recentEvents();

    if (type) {
      events = events.filter((event) => event.type === type);
    }
    if (severity) {
      events = events.filter((event) => event.severity === severity);
    }
    if (source) {
      events = events.filter((event) => event.source === source);
    }
    if (query) {
      const needle = query.toLowerCase();
      events = events.filter(
        (event) =>
          event.type.toLowerCase().includes(needle) ||
          event.source.toLowerCase().includes(needle) ||
          (event.username && event.username.toLowerCase().includes(needle))
      );
    }

    return events;
  });

  columns = [
    { key: 'timestamp', header: 'Time', sortable: true },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'severity', header: 'Severity', sortable: true },
    { key: 'source', header: 'Source', sortable: true },
    { key: 'username', header: 'User', sortable: true },
  ];

  ngOnInit(): void {
    this.startStream();
    this.syncFilters();
  }

  ngOnDestroy(): void {
    this.eventsSse.stop();
  }

  startStream(): void {
    this.eventsSse.start('mock');
  }

  toggleStream(): void {
    if (this.eventsSse.isConnected()) {
      this.eventsSse.stop();
    } else {
      this.startStream();
    }
  }

  syncFilters(): void {
    this.filters.set({
      type: this.selectedType,
      severity: this.selectedSeverity,
      source: this.selectedSource,
      query: this.searchQuery,
    });
  }

  clearFilters(): void {
    this.selectedType = '';
    this.selectedSeverity = '';
    this.selectedSource = '';
    this.searchQuery = '';
    this.syncFilters();
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

  onRowClick(row: { id?: string }): void {
    if (typeof row?.id === 'string' && row.id.length > 0) {
      void this.router.navigate(['/events', row.id]);
    }
  }
}
