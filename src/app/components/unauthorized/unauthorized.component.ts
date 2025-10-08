import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <div class="error-icon">🚫</div>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <p>Please contact your administrator if you believe this is an error.</p>

        <div class="action-buttons">
          <a routerLink="/dashboard" class="btn btn-primary">Go to Dashboard</a>
          <button (click)="goBack()" class="btn btn-secondary">Go Back</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .unauthorized-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
      }

      .unauthorized-content {
        background: white;
        padding: 3rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        text-align: center;
        max-width: 500px;
        width: 100%;
      }

      .error-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }

      h1 {
        margin: 0 0 1rem 0;
        color: #333;
        font-size: 2rem;
      }

      p {
        margin: 0 0 1rem 0;
        color: #666;
        line-height: 1.5;
      }

      .action-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
      }

      .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 5px;
        text-decoration: none;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s;
      }

      .btn-primary {
        background: #667eea;
        color: white;
      }

      .btn-primary:hover {
        background: #5a6fd8;
      }

      .btn-secondary {
        background: #6c757d;
        color: white;
      }

      .btn-secondary:hover {
        background: #5a6268;
      }

      @media (max-width: 768px) {
        .action-buttons {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class UnauthorizedComponent {
  goBack(): void {
    window.history.back();
  }
}
