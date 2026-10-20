import { Component, OnInit, inject } from '@angular/core';

import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { TableComponent } from '../../../shared/ui/table/table.component';
import { HasPermDirective } from '../../../shared/directives';
import { FlagFilters, FlagsStore } from '../../../store/flags.store';
import { Permission } from '../../../../shared/sdk';

@Component({
  selector: 'app-flags-list',
  standalone: true,
  imports: [RouterModule, FormsModule, TableComponent, HasPermDirective],
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Feature flags</h1>
          <p class="page-lede">Mock flag inventory. Create and detail routes are labelled stubs.</p>
        </div>
        <div class="page-actions">
          <a *hasPerm="[Permission.MANAGE_FLAGS]" class="btn btn-primary" routerLink="/flags/new">
            New flag
          </a>
        </div>
      </header>

      <div class="toolbar">
        <div class="filter-field">
          <label for="flag-status">Status</label>
          <select id="flag-status" [(ngModel)]="selectedStatus" (change)="applyFilters()">
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending approval</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div class="filter-field">
          <label for="flag-type">Type</label>
          <select id="flag-type" [(ngModel)]="selectedType" (change)="applyFilters()">
            <option value="">All</option>
            <option value="boolean">Boolean</option>
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="json">JSON</option>
          </select>
        </div>
        <div class="filter-field">
          <label for="flag-enabled">Enabled</label>
          <select id="flag-enabled" [(ngModel)]="selectedEnabled" (change)="applyFilters()">
            <option value="">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <button type="button" class="btn" (click)="clearFilters()">Clear</button>
        <button type="button" class="btn" (click)="store.refresh()">Refresh</button>
      </div>

      <div class="stat-grid">
        <div class="stat-card">
          <h3>Published</h3>
          <div class="stat-value">{{ store.publishedFlags().length }}</div>
        </div>
        <div class="stat-card">
          <h3>Enabled</h3>
          <div class="stat-value">{{ store.enabledFlags().length }}</div>
        </div>
        <div class="stat-card">
          <h3>Draft</h3>
          <div class="stat-value">{{ store.draftFlags().length }}</div>
        </div>
        <div class="stat-card">
          <h3>Pending</h3>
          <div class="stat-value">{{ store.pendingFlags().length }}</div>
        </div>
      </div>

      <div class="surface">
        <app-table
          [data]="store.filteredFlags()"
          [columns]="columns"
          [loading]="store.loading()"
          [clickable]="true"
          emptyMessage="No flags match these filters"
          (rowClick)="onRowClick($event)"
        ></app-table>
      </div>
    </div>
  `,
})
export class FlagsListComponent implements OnInit {
  private router = inject(Router);
  store = inject(FlagsStore);
  Permission = Permission;

  selectedStatus = '';
  selectedType = '';
  selectedEnabled = '';

  columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'key', header: 'Key', sortable: true },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'isEnabled', header: 'Enabled', sortable: true },
    { key: 'createdBy', header: 'Created by', sortable: true },
    { key: 'createdAt', header: 'Created', sortable: true },
  ];

  ngOnInit(): void {
    this.store.fetchFlags();
  }

  applyFilters(): void {
    const filters: FlagFilters = {};

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

  onRowClick(row: { id?: string }): void {
    if (typeof row?.id === 'string' && row.id.length > 0) {
      void this.router.navigate(['/flags', row.id]);
    }
  }
}
