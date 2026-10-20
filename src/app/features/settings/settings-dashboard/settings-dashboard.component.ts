import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-settings-dashboard',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <p class="page-kicker">Sandbox stub</p>
          <h1 class="page-title">Settings</h1>
          <p class="page-lede">
            These routes are labelled in the sandbox. The screens are not built yet.
          </p>
        </div>
      </header>
      <nav class="stub-links" aria-label="Settings sections">
        <a routerLink="/settings/dictionary">Dictionary</a>
        <a routerLink="/settings/webhooks">Webhooks</a>
        <a routerLink="/settings/permissions">Permissions</a>
      </nav>
    </div>
  `,
  styles: [
    `
      .stub-links {
        display: grid;
        gap: var(--space-3);
        max-width: 24rem;
      }

      .stub-links a {
        padding: var(--space-4);
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        text-decoration: none;
        font-weight: 500;
      }

      .stub-links a:hover {
        background: var(--color-accent-soft);
      }
    `,
  ],
})
export class SettingsDashboardComponent {}
