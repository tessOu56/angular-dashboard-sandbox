import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'outline'
  | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="buttonClasses()"
      [disabled]="disabled() || loading()"
      (click)="onClick()"
      [type]="type"
    >
      <span *ngIf="loading()" class="spinner"></span>
      <ng-content></ng-content>
    </button>
  `,
  styles: [
    `
      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        border: none;
        border-radius: 0.375rem;
        font-weight: 500;
        transition: all 0.2s ease;
        cursor: pointer;
        text-decoration: none;
        white-space: nowrap;
      }

      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .spinner {
        width: 1rem;
        height: 1rem;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* Variants */
      .btn-primary {
        background: #3b82f6;
        color: white;
      }

      .btn-primary:hover:not(:disabled) {
        background: #2563eb;
      }

      .btn-secondary {
        background: #6b7280;
        color: white;
      }

      .btn-secondary:hover:not(:disabled) {
        background: #4b5563;
      }

      .btn-success {
        background: #10b981;
        color: white;
      }

      .btn-success:hover:not(:disabled) {
        background: #059669;
      }

      .btn-danger {
        background: #ef4444;
        color: white;
      }

      .btn-danger:hover:not(:disabled) {
        background: #dc2626;
      }

      .btn-warning {
        background: #f59e0b;
        color: white;
      }

      .btn-warning:hover:not(:disabled) {
        background: #d97706;
      }

      .btn-info {
        background: #06b6d4;
        color: white;
      }

      .btn-info:hover:not(:disabled) {
        background: #0891b2;
      }

      .btn-outline {
        background: transparent;
        border: 1px solid #d1d5db;
        color: #374151;
      }

      .btn-outline:hover:not(:disabled) {
        background: #f9fafb;
      }

      .btn-ghost {
        background: transparent;
        color: #6b7280;
      }

      .btn-ghost:hover:not(:disabled) {
        background: #f3f4f6;
      }

      /* Sizes */
      .btn-sm {
        padding: 0.25rem 0.75rem;
        font-size: 0.875rem;
      }

      .btn-md {
        padding: 0.5rem 1rem;
        font-size: 1rem;
      }

      .btn-lg {
        padding: 0.75rem 1.5rem;
        font-size: 1.125rem;
      }
    `,
  ],
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = signal(false);
  @Input() loading = signal(false);
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() fullWidth = false;

  @Output() clicked = new EventEmitter<void>();

  buttonClasses = signal('');

  ngOnInit() {
    this.updateClasses();
  }

  ngOnChanges() {
    this.updateClasses();
  }

  private updateClasses() {
    const classes = [
      'btn',
      `btn-${this.variant}`,
      `btn-${this.size}`,
      this.fullWidth ? 'w-full' : '',
    ]
      .filter(Boolean)
      .join(' ');

    this.buttonClasses.set(classes);
  }

  onClick() {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit();
    }
  }
}
