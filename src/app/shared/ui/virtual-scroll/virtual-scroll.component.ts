import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  effect,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Virtual Scroll Component
 *
 * 優化大列表渲染效能
 * 只渲染可見區域的項目
 */
@Component({
  selector: 'app-virtual-scroll',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="virtual-scroll-container" #container (scroll)="onScroll($event)">
      <div class="virtual-scroll-spacer" [style.height.px]="totalHeight()"></div>
      <div class="virtual-scroll-content" [style.transform]="contentTransform()">
        <div
          *ngFor="let item of visibleItems(); trackBy: trackByFn"
          class="virtual-scroll-item"
          [style.height.px]="itemHeight"
        >
          <ng-container *ngIf="itemTemplate">
            <ng-container
              *ngTemplateOutlet="itemTemplate; context: { $implicit: item, index: item.__index }"
            ></ng-container>
          </ng-container>
          <ng-container *ngIf="!itemTemplate">
            {{ item }}
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .virtual-scroll-container {
        position: relative;
        overflow-y: auto;
        height: 100%;
        width: 100%;
      }

      .virtual-scroll-spacer {
        position: absolute;
        top: 0;
        left: 0;
        width: 1px;
        pointer-events: none;
      }

      .virtual-scroll-content {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        will-change: transform;
      }

      .virtual-scroll-item {
        overflow: hidden;
      }
    `,
  ],
})
export class VirtualScrollComponent<T> {
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;

  @Input() set items(value: T[]) {
    this._items.set(value);
  }

  @Input() itemHeight: number = 50;
  @Input() bufferSize: number = 5; // 前後緩衝項目數
  @Input() itemTemplate: any;

  @Output() scrollEnd = new EventEmitter<void>();
  @Output() itemsChange = new EventEmitter<T[]>();

  private _items = signal<T[]>([]);
  private scrollTop = signal(0);
  private containerHeight = signal(0);

  // Computed values
  public readonly totalHeight = computed(() => this._items().length * this.itemHeight);

  public readonly visibleStartIndex = computed(() => {
    const index = Math.floor(this.scrollTop() / this.itemHeight) - this.bufferSize;
    return Math.max(0, index);
  });

  public readonly visibleEndIndex = computed(() => {
    const itemsPerView = Math.ceil(this.containerHeight() / this.itemHeight);
    const index = Math.floor(this.scrollTop() / this.itemHeight) + itemsPerView + this.bufferSize;
    return Math.min(this._items().length, index);
  });

  public readonly visibleItems = computed(() => {
    const start = this.visibleStartIndex();
    const end = this.visibleEndIndex();
    const items = this._items().slice(start, end);

    // Add index for tracking
    return items.map((item, index) => ({
      ...item,
      __index: start + index,
    }));
  });

  public readonly contentTransform = computed(() => {
    const offset = this.visibleStartIndex() * this.itemHeight;
    return `translateY(${offset}px)`;
  });

  constructor() {
    // Update container height when component initializes
    effect(() => {
      if (this.container) {
        this.updateContainerHeight();
      }
    });
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLDivElement;
    this.scrollTop.set(target.scrollTop);

    // Check if scrolled to bottom
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;
    const scrollTop = target.scrollTop;

    if (scrollHeight - scrollTop - clientHeight < 100) {
      this.scrollEnd.emit();
    }
  }

  private updateContainerHeight(): void {
    if (this.container?.nativeElement) {
      this.containerHeight.set(this.container.nativeElement.clientHeight);
    }
  }

  trackByFn(index: number, item: any): any {
    return item.__index ?? index;
  }

  /**
   * Scroll to specific index
   */
  scrollToIndex(index: number): void {
    if (this.container?.nativeElement) {
      const offset = index * this.itemHeight;
      this.container.nativeElement.scrollTop = offset;
    }
  }

  /**
   * Scroll to top
   */
  scrollToTop(): void {
    this.scrollToIndex(0);
  }

  /**
   * Scroll to bottom
   */
  scrollToBottom(): void {
    const lastIndex = this._items().length - 1;
    this.scrollToIndex(lastIndex);
  }
}
