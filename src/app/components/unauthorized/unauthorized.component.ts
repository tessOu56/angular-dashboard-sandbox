import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterModule],
  template: `
    <main id="main-content" class="auth-screen" tabindex="-1">
      <div class="auth-card">
        <p class="page-kicker">403</p>
        <h1>You cannot open this screen</h1>
        <p class="lede">
          This mock role does not include the permission for that route. Sign in as admin to see
          every labelled screen, or return to the overview.
        </p>
        <div class="page-actions">
          <a routerLink="/slice" class="btn btn-primary">Go to overview</a>
          <a routerLink="/login" class="btn">Switch account</a>
        </div>
      </div>
    </main>
  `,
})
export class UnauthorizedComponent {}
