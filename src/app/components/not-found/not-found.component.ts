import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="page">
      <p class="page-kicker">404</p>
      <h1 class="page-title">Page not found</h1>
      <p class="page-lede">
        That URL is not a route in this sandbox. The evaluation path is the overview.
      </p>
      <div class="page-actions">
        <a routerLink="/slice" class="btn btn-primary">Go to overview</a>
        <a routerLink="/login" class="btn">Sign in</a>
      </div>
    </div>
  `,
  styles: [
    `
      .page-actions {
        margin-top: var(--space-6);
      }
    `,
  ],
})
export class NotFoundComponent {}
