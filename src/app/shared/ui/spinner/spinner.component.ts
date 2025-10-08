import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-container" [class]="'size-' + size">
      <div class="spinner" [class]="variant"></div>
      <p *ngIf="message" class="spinner-message">{{ message }}</p>
    </div>
  `,
  styles: [
    `
      .spinner-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
      }

      .spinner {
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .size-sm .spinner {
        width: 20px;
        height: 20px;
        border-width: 2px;
      }

      .size-md .spinner {
        width: 40px;
        height: 40px;
        border-width: 4px;
      }

      .size-lg .spinner {
        width: 60px;
        height: 60px;
        border-width: 6px;
      }

      .spinner.primary {
        border: 4px solid #e0e7ff;
        border-top-color: #3b82f6;
      }

      .spinner.secondary {
        border: 4px solid #f3f4f6;
        border-top-color: #6b7280;
      }

      .spinner.success {
        border: 4px solid #dcfce7;
        border-top-color: #10b981;
      }

      .spinner.danger {
        border: 4px solid #fee2e2;
        border-top-color: #ef4444;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .spinner-message {
        margin: 0;
        color: #6b7280;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class SpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'primary' | 'secondary' | 'success' | 'danger' = 'primary';
  @Input() message?: string;
}
