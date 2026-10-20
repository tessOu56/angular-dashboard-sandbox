import { Component, Input, Output, EventEmitter, signal } from '@angular/core';

import { trigger, transition, style, animate, state } from '@angular/animations';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [ButtonComponent],
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('200ms ease-in', style({ opacity: 0 }))]),
    ]),
    trigger('contentAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0.9)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'scale(0.9)', opacity: 0 })),
      ]),
    ]),
  ],
  template: `
    @if (isOpen) {
      <div
        class="modal-overlay"
        [@modalAnimation]
        (click)="onOverlayClick()"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="title ? 'modal-title' : null"
        >
        <div
          class="modal-content"
          [class]="'size-' + size"
          [@contentAnimation]
          (click)="$event.stopPropagation()"
          >
          <!-- Header -->
          @if (showHeader) {
            <div class="modal-header">
              <h2 id="modal-title" class="modal-title">{{ title }}</h2>
              @if (dismissible) {
                <button class="modal-close" (click)="close()" aria-label="Close dialog">
                  ✕
                </button>
              }
            </div>
          }
          <!-- Body -->
          <div class="modal-body">
            <ng-content></ng-content>
          </div>
          <!-- Footer -->
          @if (showFooter) {
            <div class="modal-footer">
              <ng-content select="[modal-footer]"></ng-content>
              @if (!hasFooterContent) {
                <div class="default-footer">
                  <app-button variant="outline" (onClick)="close()">Cancel</app-button>
                  <app-button variant="primary" (onClick)="confirm()">Confirm</app-button>
                </div>
              }
            </div>
          }
        </div>
      </div>
    }
    `,
  styles: [
    `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
        backdrop-filter: blur(2px);
      }

      .modal-content {
        background: white;
        border-radius: 0.75rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .modal-content.size-sm {
        width: 100%;
        max-width: 400px;
      }

      .modal-content.size-md {
        width: 100%;
        max-width: 600px;
      }

      .modal-content.size-lg {
        width: 100%;
        max-width: 900px;
      }

      .modal-content.size-xl {
        width: 100%;
        max-width: 1200px;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .modal-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #111827;
      }

      .modal-close {
        background: none;
        border: none;
        color: #6b7280;
        cursor: pointer;
        font-size: 1.5rem;
        line-height: 1;
        padding: 0.25rem;
        transition: color 0.2s;
      }

      .modal-close:hover {
        color: #111827;
      }

      .modal-body {
        padding: 1.5rem;
        overflow-y: auto;
        flex: 1;
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1.5rem;
        border-top: 1px solid #e5e7eb;
        background: #f9fafb;
      }

      .default-footer {
        display: flex;
        gap: 0.75rem;
      }
    `,
  ],
})
export class ModalComponent {
  @Input() title: string = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() showHeader: boolean = true;
  @Input() showFooter: boolean = true;
  @Input() dismissible: boolean = true;
  @Input() closeOnOverlayClick: boolean = true;
  @Input() hasFooterContent: boolean = false;

  @Output() onClose = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<void>();

  isOpen = signal(false);

  open(): void {
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    this.isOpen.set(false);
    document.body.style.overflow = '';
    this.onClose.emit();
  }

  confirm(): void {
    this.onConfirm.emit();
  }

  onOverlayClick(): void {
    if (this.closeOnOverlayClick && this.dismissible) {
      this.close();
    }
  }
}
