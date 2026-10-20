import { Component, inject, signal } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

interface LoginForm {
  username: FormControl<string>;
  password: FormControl<string>;
}

interface DemoAccount {
  username: string;
  password: string;
  role: string;
  note: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <main id="main-content" class="auth-screen" tabindex="-1">
      <div class="auth-card">
        <p class="page-kicker">Ops sandbox</p>
        <h1>Sign in</h1>
        <p class="lede">
          Mock accounts only. Credentials never leave this browser and there is no live API.
        </p>
    
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              formControlName="username"
              autocomplete="username"
              [attr.aria-invalid]="showError('username')"
              [attr.aria-describedby]="showError('username') ? 'username-error' : null"
              [class.error]="showError('username')"
              />
            @if (showError('username')) {
              <div id="username-error" class="error-message">
                Username is required
              </div>
            }
          </div>
    
          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              formControlName="password"
              autocomplete="current-password"
              [attr.aria-invalid]="showError('password')"
              [attr.aria-describedby]="showError('password') ? 'password-error' : null"
              [class.error]="showError('password')"
              />
            @if (showError('password')) {
              <div id="password-error" class="error-message">
                Password is required
              </div>
            }
          </div>
    
          @if (errorMessage()) {
            <div id="login-error" class="error-message" role="alert">
              {{ errorMessage() }}
            </div>
          }
    
          <button
            type="submit"
            class="btn btn-primary login-submit"
            [disabled]="loginForm.invalid || loading()"
            [attr.aria-busy]="loading()"
            >
            {{ loading() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>
    
        <section class="demo-accounts" aria-labelledby="demo-heading">
          <h2 id="demo-heading">Demo accounts (in-browser only)</h2>
          <ul>
            @for (account of demoAccounts; track account) {
              <li>
                <button type="button" (click)="fillDemo(account)">
                  <span class="demo-id">{{ account.username }}</span>
                  <span class="demo-meta">{{ account.role }} · {{ account.note }}</span>
                </button>
              </li>
            }
          </ul>
        </section>
      </div>
    </main>
    `,
  styles: [
    `
      .login-submit {
        width: 100%;
        min-height: 2.5rem;
        margin-top: var(--space-2);
      }

      .demo-accounts {
        margin-top: var(--space-8);
        padding-top: var(--space-5);
        border-top: 1px solid var(--color-border);
      }

      .demo-accounts h2 {
        font-size: var(--text-sm);
        margin-bottom: var(--space-3);
        color: var(--color-ink-muted);
      }

      .demo-accounts ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: var(--space-2);
      }

      .demo-accounts button {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.1rem;
        padding: 0.55rem 0.7rem;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        background: var(--color-bg);
        color: inherit;
        cursor: pointer;
        text-align: left;
      }

      .demo-accounts button:hover {
        background: var(--color-accent-soft);
        border-color: var(--color-accent);
      }

      .demo-id {
        font-weight: 600;
        font-family: var(--font-mono);
        font-size: var(--text-sm);
      }

      .demo-meta {
        color: var(--color-ink-muted);
        font-size: var(--text-xs);
      }
    `,
  ],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly demoAccounts: DemoAccount[] = [
    { username: 'admin', password: 'admin', role: 'Admin', note: 'all screens' },
    { username: 'manager', password: 'manager', role: 'Manager', note: 'approvals and flags' },
    { username: 'employee', password: 'employee', role: 'Operator', note: 'approvals and events' },
  ];

  loginForm = new FormGroup<LoginForm>({
    username: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    password: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
  });

  loading = signal(false);
  errorMessage = signal('');

  showError(controlName: keyof LoginForm): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control?.invalid && control.touched);
  }

  fillDemo(account: DemoAccount): void {
    this.loginForm.setValue({ username: account.username, password: account.password });
    this.errorMessage.set('');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { username, password } = this.loginForm.getRawValue();

    this.authService.login({ username, password }).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response) {
          this.router.navigate(['/slice']);
        } else {
          this.errorMessage.set('Invalid username or password');
        }
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Invalid username or password');
      },
    });
  }
}
