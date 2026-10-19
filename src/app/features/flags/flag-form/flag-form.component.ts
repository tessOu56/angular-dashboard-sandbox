import { Component } from '@angular/core';
import { StubPageComponent } from '../../../shared/ui/stub-page/stub-page.component';

@Component({
  selector: 'app-flag-form',
  standalone: true,
  imports: [StubPageComponent],
  template: `
    <app-stub-page title="New flag" parentLink="/flags" parentLabel="Back to flags" />
  `,
})
export class FlagFormComponent {}
