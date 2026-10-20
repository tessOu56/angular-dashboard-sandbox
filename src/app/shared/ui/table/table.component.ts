import { Component, Input, signal, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableColumn, PaginatedResponse } from '../../../../shared/sdk';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="table-container">
      @if (showHeader()) {
        <div class="table-header">
          <div class="table-title">
            <h3>{{ _title() }}</h3>
            @if (_subtitle()) {
              <span class="table-subtitle">{{ _subtitle() }}</span>
            }
          </div>
        </div>
      }
    
      @if (_loading()) {
        <div class="loading-state" role="status">Loading…</div>
      }
    
      @if (!_loading() && _data().length > 0) {
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                @if (_selectable()) {
                  <th class="select-column">
                    <input
                      type="checkbox"
                      [checked]="allSelected()"
                      [indeterminate]="someSelected()"
                      (change)="toggleSelectAll()"
                      aria-label="Select all rows"
                      />
                  </th>
                }
                @for (column of _columns(); track column.key) {
                  <th [class]="getColumnClasses(column)">
                    @if (column.sortable) {
                      <button
                        type="button"
                        class="sort-btn"
                        (click)="onSort(column)"
                        >
                        <span>{{ column.header }}</span>
                        <span class="sort-indicators" aria-hidden="true">
                          <span [class.active]="isSortActive(column, 'asc')">↑</span>
                          <span [class.active]="isSortActive(column, 'desc')">↓</span>
                        </span>
                      </button>
                    } @else {
                      <span>{{ column.header }}</span>
                    }
                  </th>
                }
                @if (_showActions()) {
                  <th class="actions-column">Actions</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (item of _data(); track trackByFn()($index, item)) {
                <tr
                  [class.selected]="isSelected(item)"
                  [class.clickable]="_clickable()"
                  [attr.tabindex]="_clickable() ? 0 : null"
                  (click)="onRowClick(item)"
                  (keydown.enter)="onRowActivate($event, item)"
                  (keydown.space)="onRowActivate($event, item)"
                  >
                  @if (_selectable()) {
                    <td class="select-column">
                      <input
                        type="checkbox"
                        [checked]="isSelected(item)"
                        (change)="toggleSelect(item)"
                        (click)="$event.stopPropagation()"
                        [attr.aria-label]="'Select ' + rowLabel(item)"
                        />
                    </td>
                  }
                  @for (column of _columns(); track column.key) {
                    <td [class]="getColumnClasses(column)">
                      @switch (column.key) {
                        @case ('status') {
                          <span
                            class="badge"
                            [class]="getStatusClass(getItemValue(item, column.key))"
                            >
                            {{ formatToken(getItemValue(item, column.key)) }}
                          </span>
                        }
                        @case ('priority') {
                          <span
                            class="badge"
                            [class]="getPriorityClass(getItemValue(item, column.key))"
                            >
                            {{ formatToken(getItemValue(item, column.key)) }}
                          </span>
                        }
                        @case ('severity') {
                          <span
                            class="badge"
                            [class]="getPriorityClass(getItemValue(item, column.key))"
                            >
                            {{ formatToken(getItemValue(item, column.key)) }}
                          </span>
                        }
                        @case ('createdAt') {
                          <span>
                            {{ getItemValue(item, column.key) | date : 'MMM d, y, h:mm a' }}
                          </span>
                        }
                        @case ('updatedAt') {
                          <span>
                            {{ getItemValue(item, column.key) | date : 'MMM d, y, h:mm a' }}
                          </span>
                        }
                        @case ('timestamp') {
                          <span>
                            {{ getItemValue(item, column.key) | date : 'MMM d, y, h:mm a' }}
                          </span>
                        }
                        @case ('amount') {
                          <span>
                            {{ formatAmount(getItemValue(item, column.key)) }}
                          </span>
                        }
                        @case ('isEnabled') {
                          <span>
                            {{ getItemValue(item, column.key) ? 'Yes' : 'No' }}
                          </span>
                        }
                        @default {
                          <span>{{ formatToken(getItemValue(item, column.key)) }}</span>
                        }
                      }
                    </td>
                  }
                  @if (_showActions()) {
                    <td class="actions-column">
                      <ng-content select="[slot=row-actions]"></ng-content>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    
      @if (!_loading() && _data().length === 0) {
        <div class="empty-state">
          <h3>Nothing to show</h3>
          <p>{{ _emptyMessage() }}</p>
        </div>
      }
    
      @if (_pagination()) {
        <div class="table-pagination">
          <div class="pagination-info">
            <span>
              Showing {{ getStartIndex() }} to {{ getEndIndex() }} of {{ totalItems() }} entries
            </span>
          </div>
          <div class="pagination-controls">
            <button
              class="btn btn-sm"
              [disabled]="currentPage() <= 1"
              (click)="goToPage(currentPage() - 1)"
              >
              Previous
            </button>
            <button
              class="btn btn-sm"
              [disabled]="currentPage() >= totalPages()"
              (click)="goToPage(currentPage() + 1)"
              >
              Next
            </button>
          </div>
        </div>
      }
    </div>
    `,
  styles: [
    `
      .table-container {
        background: var(--color-surface);
      }

      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-4);
        border-bottom: 1px solid var(--color-border);
      }

      .table-title h3 {
        margin: 0;
        font-size: var(--text-md);
      }

      .table-subtitle {
        font-size: var(--text-sm);
        color: var(--color-ink-muted);
      }

      .table-wrapper {
        overflow-x: auto;
      }

      .table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--text-sm);
      }

      .table th,
      .table td {
        padding: 0.7rem 0.85rem;
        text-align: left;
        border-bottom: 1px solid var(--color-border);
        vertical-align: middle;
      }

      .table th {
        background: var(--color-bg);
        color: var(--color-ink-muted);
        font-weight: 600;
        white-space: nowrap;
      }

      .table tbody tr.selected {
        background: var(--color-accent-soft);
      }

      .table tbody tr.clickable {
        cursor: pointer;
      }

      .table tbody tr.clickable:hover,
      .table tbody tr.clickable:focus-visible {
        background: var(--color-bg);
      }

      .sort-btn {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        padding: 0;
        border: 0;
        background: none;
        color: inherit;
        font: inherit;
        font-weight: 600;
        cursor: pointer;
      }

      .sort-indicators {
        display: inline-flex;
        flex-direction: column;
        font-size: 0.65rem;
        color: var(--color-border-strong);
        line-height: 1;
      }

      .sort-indicators .active {
        color: var(--color-accent);
      }

      .select-column {
        width: 2.5rem;
      }

      .actions-column {
        width: 6rem;
      }

      .table-pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-4);
        border-top: 1px solid var(--color-border);
      }

      .pagination-info {
        color: var(--color-ink-muted);
        font-size: var(--text-sm);
      }

      .pagination-controls {
        display: flex;
        gap: var(--space-2);
      }
    `,
  ],
})
export class TableComponent<T = any> {
  protected _data = signal<T[]>([]);
  protected _columns = signal<TableColumn[]>([]);
  protected _title = signal('');
  protected _subtitle = signal('');
  protected _selectable = signal(false);
  protected _clickable = signal(false);
  protected _loading = signal(false);
  protected _showActions = signal(false);
  protected _emptyMessage = signal('No rows match the current filters.');
  protected _pagination = signal<PaginatedResponse<T> | null>(null);
  protected _selectedItems = signal<string[]>([]);

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
  @Input() set showActions(value: boolean) {
    this._showActions.set(value);
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

  readonly trackByFn = input((index: number, item: T) => (item as any).id || index);

  readonly rowClick = output<T>();
  readonly selectionChange = output<string[]>();
  readonly sortChange = output<{
    column: string;
    direction: 'asc' | 'desc';
}>();
  readonly pageChange = output<number>();

  currentPage = signal(1);
  pageSize = signal(20);
  totalItems = signal(0);
  currentSort = signal<{ column: string; direction: 'asc' | 'desc' } | null>(null);

  showHeader = computed(() => this._title() || this._subtitle());

  allSelected = computed(() => {
    const data = this._data();
    return data.length > 0 && data.every((item: T) => this.isSelected(item));
  });

  someSelected = computed(() => {
    const data = this._data();
    return data.some((item: T) => this.isSelected(item)) && !this.allSelected();
  });

  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()) || 1);

  getItemValue(item: T, key: any): any {
    return (item as any)[key];
  }

  formatToken(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'string') {
      return value.replace(/_/g, ' ');
    }
    return String(value);
  }

  formatAmount(value: unknown): string {
    const amount = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(amount)) {
      return this.formatToken(value);
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  rowLabel(item: T): string {
    const record = item as any;
    return record.title || record.name || record.id || 'row';
  }

  getStartIndex(): number {
    return (this.currentPage() - 1) * this.pageSize() + 1;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
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

  onRowActivate(event: Event, item: T): void {
    event.preventDefault();
    this.onRowClick(item);
  }

  getStatusClass(status: any): string {
    if (typeof status !== 'string') return 'status-default';
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
    if (typeof priority !== 'string') return 'status-default';
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
    return 'status-default';
  }

  isSelected(item: T): boolean {
    const id = (item as any).id;
    return this._selectedItems().includes(id);
  }

  toggleSelect(item: T): void {
    const id = (item as any).id;
    const selected = this._selectedItems();

    if (selected.includes(id)) {
      this._selectedItems.set(selected.filter((itemId: string) => itemId !== id));
    } else {
      this._selectedItems.set([...selected, id]);
    }

    this.selectionChange.emit(this._selectedItems());
  }

  toggleSelectAll(): void {
    const data = this._data();

    if (this.allSelected()) {
      this._selectedItems.set([]);
    } else {
      this._selectedItems.set(data.map((item: any) => item.id));
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
