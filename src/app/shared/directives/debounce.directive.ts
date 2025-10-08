import { Directive, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

/**
 * Debounce Directive
 *
 * 優化輸入事件效能
 * 延遲觸發事件直到使用者停止輸入
 */
@Directive({
  selector: '[appDebounce]',
  standalone: true,
  host: {
    '(input)': 'onInput($event)',
    '(keyup)': 'onInput($event)',
  },
})
export class DebounceDirective implements OnDestroy {
  @Input() debounceTime: number = 300;
  @Output() debounced = new EventEmitter<Event>();

  private inputSubject = new Subject<Event>();
  private subscription: Subscription;

  constructor() {
    this.subscription = this.inputSubject
      .pipe(debounceTime(this.debounceTime))
      .subscribe((event) => this.debounced.emit(event));
  }

  onInput(event: Event): void {
    event.stopPropagation();
    this.inputSubject.next(event);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
