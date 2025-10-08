import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VirtualScrollComponent } from '../virtual-scroll/virtual-scroll.component';
import { TableColumn } from '../../../../shared/sdk';

/**
 * Advanced Data Grid Component
 *
 * 支援虛擬卷動、多選、排序、篩選
 * 優化大型資料集的渲染效能
 */
@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [CommonModule, FormsModule, VirtualScrollComponent],
  template: `
    <div class="data-grid">
      <!-- Header -->
      <div class="grid-header">
        <div class="grid-row header-row">
          <div *ngIf="selectable" class="grid-cell header-cell checkbox-cell">
            <input
              type="checkbox"
              [checked]="allSelected()"
              [indeterminate]="someSelected()"
              (change)="toggleSelectAll()"
              aria-label="全選"
            />
          </div>
          <div
            *ngFor="let column of columns"
            class="grid-cell header-cell"
            [class.sortable]="column.sortable"
            [style.width]="column.width"
            [style.text-align]="column.align || 'left'"
            (click)="column.sortable && sort(column.key)"
          >
            <div class="header-content">
              <span>{{ column.header }}</span>
              <span *ngIf="column.sortable" class="sort-indicator">
                <span *ngIf="sortColumn() === column.key">
                  {{ sortDirection() === 'asc' ? '▲' : '▼' }}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Body with Virtual Scroll -->
      <div class="grid-body" [style.height.px]="height">
        <app-virtual-scroll
          [items]="sortedData()"
          [itemHeight]="rowHeight"
          [bufferSize]="bufferSize"
          [itemTemplate]="rowTemplate"
          (scrollEnd)="onScrollEnd()"
        >
        </app-virtual-scroll>

        <ng-template #rowTemplate let-item let-index="index">
          <div class="grid-row" [class.selected]="isSelected(item)" (click)="onRowClick(item)">
            <div *ngIf="selectable" class="grid-cell checkbox-cell">
              <input
                type="checkbox"
                [checked]="isSelected(item)"
                (change)="toggleSelection(item); $event.stopPropagation()"
                [attr.aria-label]="'選擇第 ' + (index + 1) + ' 列'"
              />
            </div>
            <div
              *ngFor="let column of columns"
              class="grid-cell"
              [style.width]="column.width"
              [style.text-align]="column.align || 'left'"
            >
              <ng-container *ngIf="column.template; else defaultCell">
                <ng-container
                  *ngTemplateOutlet="column.template; context: { $implicit: item, column: column }"
                ></ng-container>
              </ng-container>
              <ng-template #defaultCell>
                <span>{{ getCellValue(item, column) }}</span>
              </ng-template>
            </div>
          </div>
        </ng-template>
      </div>

      <!-- Empty State -->
      <div *ngIf="data.length === 0 && !loading" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>無資料</h3>
        <p>{{ emptyMessage }}</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>載入中...</p>
      </div>
    </div>
  `,
  styles: [
    `
      .data-grid {
        display: flex;
        flex-direction: column;
        background: white;
        border-radius: 0.5rem;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .grid-header {
        border-bottom: 2px solid #e5e7eb;
        background: #f9fafb;
      }

      .grid-row {
        display: flex;
        border-bottom: 1px solid #e5e7eb;
      }

      .grid-row:last-child {
        border-bottom: none;
      }

      .grid-row:hover {
        background: #f9fafb;
      }

      .grid-row.selected {
        background: #eff6ff;
      }

      .header-row {
        font-weight: 600;
      }

      .header-row:hover {
        background: #f9fafb;
      }

      .grid-cell {
        padding: 0.75rem 1rem;
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;
      }

      .header-cell {
        cursor: default;
        user-select: none;
      }

      .header-cell.sortable {
        cursor: pointer;
      }

      .header-cell.sortable:hover {
        background: #f3f4f6;
      }

      .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        gap: 0.5rem;
      }

      .sort-indicator {
        color: #3b82f6;
        font-size: 0.75rem;
      }

      .checkbox-cell {
        flex: 0 0 3rem;
        justify-content: center;
      }

      .grid-body {
        position: relative;
        overflow-y: auto;
      }

      .empty-state,
      .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        color: #6b7280;
      }

      .empty-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }

      .empty-state h3 {
        margin: 0 0 0.5rem 0;
        color: #374151;
      }

      .empty-state p {
        margin: 0;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e5e7eb;
        border-top-color: #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .loading-state p {
        margin-top: 1rem;
      }
    `,
  ],
})
export class DataGridComponent<T = any> {
  @Input() set data(value: T[]) {
    this._data.set(value);
  }
  get data() {
    return this._data();
  }

  @Input() set columns(value: TableColumn<T>[]) {
    this._columns.set(value);
  }
  get columns() {
    return this._columns();
  }

  @Input() set loading(value: boolean) {
    this._loading.set(value);
  }
  get loading() {
    return this._loading();
  }

  @Input() height: number = 600; // Grid height
  @Input() rowHeight: number = 50; // Row height for virtual scroll
  @Input() bufferSize: number = 5; // Buffer size for virtual scroll
  @Input() selectable: boolean = false;
  @Input() emptyMessage: string = '目前沒有資料';

  @Output() rowClick = new EventEmitter<T>();
  @Output() selectionChange = new EventEmitter<T[]>();
  @Output() sortChange = new EventEmitter<{ column: string; direction: 'asc' | 'desc' }>();
  @Output() scrollEnd = new EventEmitter<void>();

  private _data = signal<T[]>([]);
  private _columns = signal<TableColumn<T>[]>([]);
  private _loading = signal<boolean>(false);
  private _selectedItems = signal<Set<any>>(new Set());
  protected sortColumn = signal<string | number | symbol>('');
  protected sortDirection = signal<'asc' | 'desc'>('asc');

  // Computed signals
  public readonly sortedData = computed(() => {
    const data = this._data();
    const column = this.sortColumn();
    const direction = this.sortDirection();

    if (!column) return data;

    return [...data].sort((a, b) => {
      const aVal = (a as any)[column];
      const bVal = (b as any)[column];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  });

  public readonly allSelected = computed(() => {
    const data = this._data();
    const selected = this._selectedItems();
    return data.length > 0 && data.every((item) => this.isSelected(item));
  });

  public readonly someSelected = computed(() => {
    const data = this._data();
    const selected = this._selectedItems();
    return data.some((item) => this.isSelected(item)) && !this.allSelected();
  });

  // Methods
  sort(column: string | number | symbol): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }

    this.sortChange.emit({
      column: String(column),
      direction: this.sortDirection(),
    });
  }

  isSelected(item: T): boolean {
    return this._selectedItems().has(this.getItemId(item));
  }

  toggleSelection(item: T): void {
    const id = this.getItemId(item);
    const selected = new Set(this._selectedItems());

    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }

    this._selectedItems.set(selected);
    this.emitSelectionChange();
  }

  toggleSelectAll(): void {
    const data = this._data();

    if (this.allSelected()) {
      this._selectedItems.set(new Set());
    } else {
      const allIds = new Set(data.map((item) => this.getItemId(item)));
      this._selectedItems.set(allIds);
    }

    this.emitSelectionChange();
  }

  onRowClick(item: T): void {
    this.rowClick.emit(item);
  }

  onScrollEnd(): void {
    this.scrollEnd.emit();
  }

  getCellValue(item: T, column: TableColumn<T>): any {
    if (column.formatter) {
      return column.formatter((item as any)[column.key], item);
    }
    return (item as any)[column.key];
  }

  private getItemId(item: T): any {
    return (item as any).id ?? item;
  }

  private emitSelectionChange(): void {
    const selected = this._data().filter((item) => this.isSelected(item));
    this.selectionChange.emit(selected);
  }
}
