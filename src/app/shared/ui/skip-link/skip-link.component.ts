import { Component } from '@angular/core';

@Component({
  selector: 'app-skip-link',
  standalone: true,
  template: ` <a href="#main-content" class="skip-link">Skip to main content</a> `,
  styles: [
    `
      .skip-link {
        position: absolute;
        top: -2.75rem;
        left: var(--space-3);
        z-index: 10000;
        padding: 0.45rem 0.75rem;
        background: var(--color-accent);
        color: var(--color-accent-fg);
        text-decoration: none;
        border-radius: 0 0 var(--radius-sm) var(--radius-sm);
        transition: top var(--duration-fast) var(--ease);
      }

      .skip-link:focus {
        top: 0;
      }
    `,
  ],
})
export class SkipLinkComponent {}
