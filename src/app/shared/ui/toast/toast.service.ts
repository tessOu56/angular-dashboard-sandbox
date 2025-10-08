import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  public readonly toasts = this._toasts.asReadonly();

  private idCounter = 0;

  show(toast: Omit<Toast, 'id'>): string {
    const id = `toast-${++this.idCounter}`;
    const newToast: Toast = {
      id,
      ...toast,
      duration: toast.duration ?? 5000,
      dismissible: toast.dismissible ?? true,
    };

    this._toasts.update((toasts) => [...toasts, newToast]);

    // Auto dismiss
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => this.dismiss(id), newToast.duration);
    }

    return id;
  }

  success(title: string, message?: string, duration?: number): string {
    return this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message?: string, duration?: number): string {
    return this.show({ type: 'error', title, message, duration });
  }

  warning(title: string, message?: string, duration?: number): string {
    return this.show({ type: 'warning', title, message, duration });
  }

  info(title: string, message?: string, duration?: number): string {
    return this.show({ type: 'info', title, message, duration });
  }

  dismiss(id: string): void {
    this._toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  dismissAll(): void {
    this._toasts.set([]);
  }
}
