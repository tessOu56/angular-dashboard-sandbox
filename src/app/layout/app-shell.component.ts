import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';
import { HasPermDirective } from '../shared/directives';
import { Permission } from '../../shared/sdk';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, HasPermDirective],
  template: `
    <div class="shell">
      <header class="shell-bar">
        <a routerLink="/slice" class="brand">
          <span class="brand-mark" aria-hidden="true"></span>
          <span class="brand-copy">
            <span class="brand-name">Ops sandbox</span>
            <span class="brand-meta">Angular 20 · mock data</span>
          </span>
        </a>

        <button
          type="button"
          class="nav-toggle btn"
          (click)="menuOpen.set(!menuOpen())"
          [attr.aria-expanded]="menuOpen()"
          aria-controls="app-nav"
        >
          {{ menuOpen() ? 'Close' : 'Menu' }}
        </button>

        <div class="shell-drawer" [class.is-open]="menuOpen()">
          <nav id="app-nav" class="shell-nav" aria-label="Primary">
            <a routerLink="/slice" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: true }">
              Overview
            </a>
            <a *hasPerm="[Permission.VIEW_APPROVALS]" routerLink="/approvals" routerLinkActive="is-active">
              Approvals
            </a>
            <a *hasPerm="[Permission.VIEW_AUDIT_TRAIL]" routerLink="/audit" routerLinkActive="is-active">
              Audit
            </a>
            <a *hasPerm="[Permission.VIEW_EVENTS]" routerLink="/events" routerLinkActive="is-active">
              Events
            </a>
            <a *hasPerm="[Permission.VIEW_DASHBOARD]" routerLink="/dashboard" routerLinkActive="is-active">
              Dashboard
            </a>
            <a *hasPerm="[Permission.VIEW_FLAGS]" routerLink="/flags" routerLinkActive="is-active">Flags</a>
            <a *hasPerm="[Permission.VIEW_SETTINGS]" routerLink="/settings" routerLinkActive="is-active">
              Settings
            </a>
          </nav>

          <div class="shell-user">
            <span class="chip" data-testid="app-user">{{ userLabel() }}</span>
            <button type="button" class="btn" (click)="logout()">Log out</button>
          </div>
        </div>
      </header>

      <main id="main-content" class="shell-main" tabindex="-1">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
      .shell {
        min-height: 100vh;
      }

      .shell-bar {
        position: sticky;
        top: 0;
        z-index: 20;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--space-3);
        min-height: var(--header-height);
        padding: var(--space-2) var(--space-4);
        background: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
      }

      .brand {
        display: inline-flex;
        align-items: center;
        gap: var(--space-3);
        color: inherit;
        text-decoration: none;
      }

      .brand-mark {
        width: 0.7rem;
        height: 1.4rem;
        background: var(--color-accent);
        border-radius: 1px;
      }

      .brand-copy {
        display: flex;
        flex-direction: column;
        line-height: 1.15;
      }

      .brand-name {
        font-weight: 600;
        letter-spacing: -0.02em;
      }

      .brand-meta {
        color: var(--color-ink-subtle);
        font-size: var(--text-xs);
      }

      .shell-drawer {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-3);
      }

      .shell-nav {
        display: flex;
        flex-wrap: wrap;
        gap: 0.15rem;
      }

      .shell-nav a {
        padding: 0.35rem 0.65rem;
        border-radius: var(--radius-sm);
        color: var(--color-ink-muted);
        text-decoration: none;
        font-size: var(--text-sm);
        font-weight: 500;
      }

      .shell-nav a:hover,
      .shell-nav a.is-active {
        background: var(--color-accent-soft);
        color: var(--color-accent);
      }

      .shell-user {
        display: flex;
        align-items: center;
        gap: var(--space-2);
      }

      .nav-toggle {
        display: none;
        margin-left: auto;
      }

      .shell-main {
        outline: none;
      }

      @media (max-width: 860px) {
        .nav-toggle {
          display: inline-flex;
        }

        .shell-drawer {
          display: none;
          flex-direction: column;
          align-items: stretch;
          width: 100%;
          padding-bottom: var(--space-3);
        }

        .shell-drawer.is-open {
          display: flex;
        }

        .shell-nav {
          flex-direction: column;
        }

        .shell-user {
          justify-content: space-between;
          padding-top: var(--space-2);
          border-top: 1px solid var(--color-border);
        }
      }
    `,
  ],
})
export class AppShellComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly Permission = Permission;
  readonly menuOpen = signal(false);

  readonly userLabel = computed(() => {
    const user = this.auth.user();
    return user ? `${user.username} · ${user.role}` : 'signed out';
  });

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.menuOpen.set(false);
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
