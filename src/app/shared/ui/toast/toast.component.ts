import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from './toast.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 })),
      ]),
    ]),
  ],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toastService.toasts()"
        class="toast"
        [class]="'toast-' + toast.type"
        [@toastAnimation]
      >
        <div class="toast-icon">{{ getIcon(toast.type) }}</div>
        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div *ngIf="toast.message" class="toast-message">{{ toast.message }}</div>
        </div>
        <button
          *ngIf="toast.dismissible"
          class="toast-dismiss"
          (click)="toastService.dismiss(toast.id)"
          aria-label="關閉"
        >
          ✕
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        max-width: 400px;
        pointer-events: none;
      }

      .toast {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem 1.25rem;
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #3b82f6;
        pointer-events: auto;
        min-width: 300px;
      }

      .toast-success {
        border-left-color: #10b981;
      }

      .toast-error {
        border-left-color: #ef4444;
      }

      .toast-warning {
        border-left-color: #f59e0b;
      }

      .toast-info {
        border-left-color: #3b82f6;
      }

      .toast-icon {
        font-size: 1.5rem;
        line-height: 1;
      }

      .toast-content {
        flex: 1;
      }

      .toast-title {
        font-weight: 600;
        color: #111827;
        margin-bottom: 0.25rem;
      }

      .toast-message {
        font-size: 0.875rem;
        color: #6b7280;
      }

      .toast-dismiss {
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        font-size: 1.25rem;
        line-height: 1;
        padding: 0;
        transition: color 0.2s;
      }

      .toast-dismiss:hover {
        color: #374151;
      }
    `,
  ],
})
export class ToastComponent {
  toastService = inject(ToastService);

  getIcon(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  }
}
