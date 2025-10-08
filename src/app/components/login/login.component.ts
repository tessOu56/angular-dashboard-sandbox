import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

interface LoginForm {
  username: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Angular Sandbox Login</h2>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              type="text"
              formControlName="username"
              placeholder="Enter username"
              [class.error]="
                loginForm.get('username')?.invalid && loginForm.get('username')?.touched
              "
            />
            <div
              *ngIf="loginForm.get('username')?.invalid && loginForm.get('username')?.touched"
              class="error-message"
            >
              Username is required
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Enter password"
              [class.error]="
                loginForm.get('password')?.invalid && loginForm.get('password')?.touched
              "
            />
            <div
              *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              class="error-message"
            >
              Password is required
            </div>
          </div>

          <div *ngIf="errorMessage()" class="error-message">
            {{ errorMessage() }}
          </div>

          <button type="submit" [disabled]="loginForm.invalid || loading()" class="login-button">
            {{ loading() ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <div class="demo-credentials">
          <h4>Demo Credentials:</h4>
          <p>Username: admin</p>
          <p>Password: admin</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
      }

      .login-card {
        background: white;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 400px;
      }

      h2 {
        text-align: center;
        margin-bottom: 2rem;
        color: #333;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #555;
      }

      input {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e1e5e9;
        border-radius: 5px;
        font-size: 1rem;
        transition: border-color 0.3s;
      }

      input:focus {
        outline: none;
        border-color: #667eea;
      }

      input.error {
        border-color: #e74c3c;
      }

      .error-message {
        color: #e74c3c;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      .login-button {
        width: 100%;
        padding: 0.75rem;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s;
      }

      .login-button:hover:not(:disabled) {
        background: #5a6fd8;
      }

      .login-button:disabled {
        background: #ccc;
        cursor: not-allowed;
      }

      .demo-credentials {
        margin-top: 2rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 5px;
        text-align: center;
      }

      .demo-credentials h4 {
        margin: 0 0 0.5rem 0;
        color: #666;
      }

      .demo-credentials p {
        margin: 0.25rem 0;
        color: #666;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class LoginComponent {
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

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading.set(true);
      this.errorMessage.set('');

      const { username, password } = this.loginForm.value;

      this.authService.login({ username: username!, password: password! }).subscribe({
        next: (response) => {
          this.loading.set(false);
          if (response) {
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage.set('Invalid username or password');
          }
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('Login failed. Please try again.');
        },
      });
    }
  }
}
