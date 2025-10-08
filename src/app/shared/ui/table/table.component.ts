import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableColumn, PaginationParams, PaginatedResponse } from '../../../../shared/sdk';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-container">
      <!-- Table Header -->
      <div class="table-header" *ngIf="showHeader()">
        <div class="table-title">
          <h3>{{ _title() }}</h3>
          <span class="table-subtitle" *ngIf="_subtitle()">{{ _subtitle() }}</span>
        </div>
        <div class="table-actions">
          <ng-content select="[slot=actions]"></ng-content>
        </div>
      </div>

      <!-- Table Content -->
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th *ngIf="_selectable()" class="select-column">
                <input
                  type="checkbox"
                  [checked]="allSelected()"
                  [indeterminate]="someSelected()"
                  (change)="toggleSelectAll()"
                />
              </th>
              <th
                *ngFor="let column of _columns()"
                [class]="getColumnClasses(column)"
                (click)="onSort(column)"
              >
                <div class="column-header">
                  <span>{{ column.header }}</span>
                  <div class="sort-indicators" *ngIf="column.sortable">
                    <span class="sort-asc" [class.active]="isSortActive(column, 'asc')">↑</span>
                    <span class="sort-desc" [class.active]="isSortActive(column, 'desc')">↓</span>
                  </div>
                </div>
              </th>
              <th *ngIf="hasActions()" class="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let item of _data(); trackBy: trackByFn"
              [class.selected]="isSelected(item)"
              [class.clickable]="_clickable()"
              (click)="onRowClick(item)"
            >
              <td *ngIf="_selectable()" class="select-column">
                <input
                  type="checkbox"
                  [checked]="isSelected(item)"
                  (change)="toggleSelect(item)"
                  (click)="$event.stopPropagation()"
                />
              </td>
              <td *ngFor="let column of _columns()" [class]="getColumnClasses(column)">
                <ng-container [ngSwitch]="column.key">
                  <span
                    *ngSwitchCase="'status'"
                    [class]="getStatusClass(getItemValue(item, column.key))"
                  >
                    {{ getItemValue(item, column.key) }}
                  </span>
                  <span
                    *ngSwitchCase="'priority'"
                    [class]="getPriorityClass(getItemValue(item, column.key))"
                  >
                    {{ getItemValue(item, column.key) }}
                  </span>
                  <span *ngSwitchCase="'createdAt'">
                    {{ getItemValue(item, column.key) | date : 'short' }}
                  </span>
                  <span *ngSwitchCase="'updatedAt'">
                    {{ getItemValue(item, column.key) | date : 'short' }}
                  </span>
                  <span *ngSwitchDefault>{{ getItemValue(item, column.key) }}</span>
                </ng-container>
              </td>
              <td *ngIf="hasActions()" class="actions-column">
                <ng-content select="[slot=row-actions]" [item]="item"></ng-content>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="_data().length === 0">
        <div class="empty-icon">📋</div>
        <h4>No data available</h4>
        <p>{{ _emptyMessage() }}</p>
      </div>

      <!-- Pagination -->
      <div class="table-pagination" *ngIf="_pagination()">
        <div class="pagination-info">
          <span>
            Showing {{ getStartIndex() }} to {{ getEndIndex() }} of {{ totalItems() }} entries
          </span>
        </div>
        <div class="pagination-controls">
          <button
            class="btn btn-outline btn-sm"
            [disabled]="currentPage() <= 1"
            (click)="goToPage(currentPage() - 1)"
          >
            Previous
          </button>
          <div class="page-numbers">
            <button
              *ngFor="let page of getPageNumbers()"
              class="btn btn-sm"
              [class.btn-primary]="page === currentPage()"
              [class.btn-outline]="page !== currentPage()"
              (click)="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>
          <button
            class="btn btn-outline btn-sm"
            [disabled]="currentPage() >= totalPages()"
            (click)="goToPage(currentPage() + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .table-container {
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .table-title h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #111827;
      }

      .table-subtitle {
        font-size: 0.875rem;
        color: #6b7280;
      }

      .table-actions {
        display: flex;
        gap: 0.5rem;
      }

      .table-wrapper {
        overflow-x: auto;
      }

      .table {
        width: 100%;
        border-collapse: collapse;
      }

      .table th,
      .table td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid #e5e7eb;
      }

      .table th {
        background: #f9fafb;
        font-weight: 600;
        color: #374151;
        cursor: pointer;
        user-select: none;
      }

      .table th:hover {
        background: #f3f4f6;
      }

      .table tbody tr:hover {
        background: #f9fafb;
      }

      .table tbody tr.selected {
        background: #eff6ff;
      }

      .table tbody tr.clickable {
        cursor: pointer;
      }

      .column-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }

      .sort-indicators {
        display: flex;
        flex-direction: column;
        font-size: 0.75rem;
        color: #9ca3af;
      }

      .sort-indicators .active {
        color: #3b82f6;
      }

      .select-column {
        width: 3rem;
        text-align: center;
      }

      .actions-column {
        width: 8rem;
        text-align: center;
      }

      .empty-state {
        text-align: center;
        padding: 3rem 1.5rem;
        color: #6b7280;
      }

      .empty-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }

      .empty-state h4 {
        margin: 0 0 0.5rem 0;
        color: #374151;
      }

      .empty-state p {
        margin: 0;
      }

      .table-pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        border-top: 1px solid #e5e7eb;
      }

      .pagination-info {
        color: #6b7280;
        font-size: 0.875rem;
      }

      .pagination-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .page-numbers {
        display: flex;
        gap: 0.25rem;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.25rem 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        background: white;
        color: #374151;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
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

      .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
      }

      /* Status and Priority Classes */
      .status-pending {
        color: #f59e0b;
      }
      .status-approved {
        color: #10b981;
      }
      .status-rejected {
        color: #ef4444;
      }
      .status-draft {
        color: #6b7280;
      }

      .priority-low {
        color: #10b981;
      }
      .priority-medium {
        color: #f59e0b;
      }
      .priority-high {
        color: #ef4444;
      }
      .priority-urgent {
        color: #dc2626;
        font-weight: 600;
      }
    `,
  ],
})
export class TableComponent<T = any> {
  // Internal signals (protected for template access)
  protected _data = signal<T[]>([]);
  protected _columns = signal<TableColumn[]>([]);
  protected _title = signal('');
  protected _subtitle = signal('');
  protected _selectable = signal(false);
  protected _clickable = signal(false);
  protected _loading = signal(false);
  protected _emptyMessage = signal('No data to display');
  protected _pagination = signal<PaginatedResponse<T> | null>(null);
  protected _selectedItems = signal<string[]>([]);

  // Input setters
  @Input() set data(value: T[]) {
    this._data.set(value);
  }
  @Input() set columns(value: TableColumn[]) {
    this._columns.set(value);
  }
  @Input() set title(value: string) {
    this._title.set(value);
  }
  @Input() set subtitle(value: string) {
    this._subtitle.set(value);
  }
  @Input() set selectable(value: boolean) {
    this._selectable.set(value);
  }
  @Input() set clickable(value: boolean) {
    this._clickable.set(value);
  }
  @Input() set loading(value: boolean) {
    this._loading.set(value);
  }
  @Input() set emptyMessage(value: string) {
    this._emptyMessage.set(value);
  }
  @Input() set pagination(value: PaginatedResponse<T> | null) {
    this._pagination.set(value);
  }
  @Input() set selectedItems(value: string[]) {
    this._selectedItems.set(value);
  }

  @Input() trackByFn = (index: number, item: T) => (item as any).id || index;

  @Output() rowClick = new EventEmitter<T>();

  getItemValue(item: T, key: any): any {
    return (item as any)[key];
  }
  @Output() selectionChange = new EventEmitter<string[]>();
  @Output() sortChange = new EventEmitter<{ column: string; direction: 'asc' | 'desc' }>();
  @Output() pageChange = new EventEmitter<number>();

  currentPage = signal(1);
  pageSize = signal(20);
  totalItems = signal(0);
  currentSort = signal<{ column: string; direction: 'asc' | 'desc' } | null>(null);

  showHeader = computed(() => this._title() || this._subtitle());
  hasActions = computed(() => true); // This would be determined by content projection

  allSelected = computed(() => {
    const data = this._data();
    return data.length > 0 && data.every((item: T) => this.isSelected(item));
  });

  someSelected = computed(() => {
    const data = this._data();
    return data.some((item: T) => this.isSelected(item)) && !this.allSelected();
  });

  totalPages = computed(() => {
    return Math.ceil(this.totalItems() / this.pageSize());
  });

  getStartIndex(): number {
    return (this.currentPage() - 1) * this.pageSize() + 1;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis
        pages.push(total);
      }
    }

    return pages;
  }

  getColumnClasses(column: TableColumn): string {
    const classes = ['table-cell'];
    if (column.align) {
      classes.push(`text-${column.align}`);
    }
    return classes.join(' ');
  }

  isSortActive(column: TableColumn, direction: 'asc' | 'desc'): boolean {
    const sort = this.currentSort();
    return sort?.column === column.key && sort?.direction === direction;
  }

  onSort(column: TableColumn): void {
    if (!column.sortable) return;

    const currentSort = this.currentSort();
    let direction: 'asc' | 'desc' = 'asc';

    if (currentSort?.column === column.key) {
      direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    }

    this.currentSort.set({ column: String(column.key), direction });
    this.sortChange.emit({ column: String(column.key), direction });
  }

  onRowClick(item: T): void {
    if (this._clickable()) {
      this.rowClick.emit(item);
    }
  }

  getStatusClass(status: any): string {
    if (typeof status !== 'string') return '';
    const statusLower = status.toLowerCase();

    if (
      statusLower.includes('approved') ||
      statusLower.includes('published') ||
      statusLower.includes('active')
    ) {
      return 'status-success';
    }
    if (
      statusLower.includes('pending') ||
      statusLower.includes('in_review') ||
      statusLower.includes('draft')
    ) {
      return 'status-warning';
    }
    if (
      statusLower.includes('rejected') ||
      statusLower.includes('cancelled') ||
      statusLower.includes('expired')
    ) {
      return 'status-danger';
    }
    return 'status-default';
  }

  getPriorityClass(priority: any): string {
    if (typeof priority !== 'string') return '';
    const priorityLower = priority.toLowerCase();

    if (priorityLower.includes('critical') || priorityLower.includes('urgent')) {
      return 'priority-critical';
    }
    if (priorityLower.includes('high')) {
      return 'priority-high';
    }
    if (priorityLower.includes('medium')) {
      return 'priority-medium';
    }
    if (priorityLower.includes('low')) {
      return 'priority-low';
    }
    return 'priority-default';
  }

  isSelected(item: T): boolean {
    const id = (item as any).id;
    return this._selectedItems().includes(id);
  }

  toggleSelect(item: T): void {
    const id = (item as any).id;
    const selected = this._selectedItems();

    if (selected.includes(id)) {
      this._selectedItems.set(selected.filter((item: string) => item !== id));
    } else {
      this._selectedItems.set([...selected, id]);
    }

    this.selectionChange.emit(this._selectedItems());
  }

  toggleSelectAll(): void {
    const data = this._data();
    const selected = this._selectedItems();

    if (this.allSelected()) {
      this._selectedItems.set([]);
    } else {
      const allIds = data.map((item: any) => (item as any).id);
      this._selectedItems.set(allIds);
    }

    this.selectionChange.emit(this._selectedItems());
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.pageChange.emit(page);
    }
  }
}
