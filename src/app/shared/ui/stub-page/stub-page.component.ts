import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-stub-page',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="page stub">
      <p class="page-kicker">Sandbox stub</p>
      <h1 class="page-title">{{ title() }}</h1>
      <p class="page-lede">
        This route is labelled in the sandbox but the screen is not built yet. Lists and the
        overview use mock data; this form or detail view does not.
      </p>
      <div class="page-actions">
        <a class="btn btn-primary" [routerLink]="parentLink()">{{ parentLabel() }}</a>
        <a class="btn" routerLink="/slice">Back to overview</a>
      </div>
    </div>
  `,
  styles: [
    `
      .stub {
        max-width: 36rem;
      }

      .page-actions {
        margin-top: var(--space-6);
      }
    `,
  ],
})
export class StubPageComponent {
  readonly title = input.required<string>();
  readonly parentLink = input('/');
  readonly parentLabel = input('Back');
}
