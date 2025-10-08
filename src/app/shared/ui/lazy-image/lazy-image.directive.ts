import { Directive, ElementRef, Input, OnInit, OnDestroy, inject } from '@angular/core';

/**
 * Lazy Image Directive
 *
 * 優化圖片載入效能
 * 使用 Intersection Observer 實現延遲載入
 */
@Directive({
  selector: 'img[appLazyImage]',
  standalone: true,
})
export class LazyImageDirective implements OnInit, OnDestroy {
  @Input() appLazyImage: string = '';
  @Input() placeholder: string =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E';

  private el = inject(ElementRef);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    this.setupObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupObserver(): void {
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.01,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.loadImage();
          if (this.observer) {
            this.observer.unobserve(this.el.nativeElement);
          }
        }
      });
    }, options);

    // Set placeholder
    this.el.nativeElement.src = this.placeholder;
    this.el.nativeElement.classList.add('lazy-loading');

    // Start observing
    this.observer.observe(this.el.nativeElement);
  }

  private loadImage(): void {
    const img = this.el.nativeElement as HTMLImageElement;

    img.onload = () => {
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-loaded');
    };

    img.onerror = () => {
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-error');
    };

    img.src = this.appLazyImage;
  }
}
