import {
  Component,
  computed,
  effect,
  ElementRef,
  input,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

/**
 * Virtual Scroll Component
 *
 * 優化大列表渲染效能
 * 只渲染可見區域的項目
 */
@Component({
  selector: 'app-virtual-scroll',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <div class="virtual-scroll-container" #container (scroll)="onScroll($event)">
      <div class="virtual-scroll-spacer" [style.height.px]="totalHeight()"></div>
      <div class="virtual-scroll-content" [style.transform]="contentTransform()">
        @for (item of visibleItems(); track item.__index) {
          <div class="virtual-scroll-item" [style.height.px]="itemHeight()">
            @if (itemTemplate(); as template) {
              <ng-container
                [ngTemplateOutlet]="template"
                [ngTemplateOutletContext]="{ $implicit: item, index: item.__index }"
              ></ng-container>
            } @else {
              {{ item }}
            }
          </div>
        }
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
  readonly container = viewChild.required<ElementRef<HTMLDivElement>>('container');

  readonly items = input<T[]>([]);
  readonly itemHeight = input<number>(50);
  readonly bufferSize = input<number>(5);
  readonly itemTemplate = input<TemplateRef<unknown> | null>(null);

  readonly scrollEnd = output<void>();
  readonly itemsChange = output<T[]>();

  private scrollTop = signal(0);
  private containerHeight = signal(0);

  public readonly totalHeight = computed(() => this.items().length * this.itemHeight());

  public readonly visibleStartIndex = computed(() => {
    const index = Math.floor(this.scrollTop() / this.itemHeight()) - this.bufferSize();
    return Math.max(0, index);
  });

  public readonly visibleEndIndex = computed(() => {
    const itemsPerView = Math.ceil(this.containerHeight() / this.itemHeight());
    const index =
      Math.floor(this.scrollTop() / this.itemHeight()) + itemsPerView + this.bufferSize();
    return Math.min(this.items().length, index);
  });

  public readonly visibleItems = computed(() => {
    const start = this.visibleStartIndex();
    const end = this.visibleEndIndex();
    const items = this.items().slice(start, end);

    return items.map((item, index) => ({
      ...item,
      __index: start + index,
    }));
  });

  public readonly contentTransform = computed(() => {
    const offset = this.visibleStartIndex() * this.itemHeight();
    return `translateY(${offset}px)`;
  });

  constructor() {
    effect(() => {
      if (this.container()) {
        this.updateContainerHeight();
      }
    });
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLDivElement;
    this.scrollTop.set(target.scrollTop);

    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;
    const scrollTop = target.scrollTop;

    if (scrollHeight - scrollTop - clientHeight < 100) {
      this.scrollEnd.emit();
    }
  }

  private updateContainerHeight(): void {
    const container = this.container();
    if (container?.nativeElement) {
      this.containerHeight.set(container.nativeElement.clientHeight);
    }
  }

  scrollToIndex(index: number): void {
    const container = this.container();
    if (container?.nativeElement) {
      const offset = index * this.itemHeight();
      container.nativeElement.scrollTop = offset;
    }
  }

  scrollToTop(): void {
    this.scrollToIndex(0);
  }

  scrollToBottom(): void {
    const lastIndex = this.items().length - 1;
    this.scrollToIndex(lastIndex);
  }
}
