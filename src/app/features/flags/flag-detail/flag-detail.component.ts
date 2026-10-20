import { Component } from '@angular/core';
import { StubPageComponent } from '../../../shared/ui/stub-page/stub-page.component';

@Component({
  selector: 'app-flag-detail',
  standalone: true,
  imports: [StubPageComponent],
  template: `
    <app-stub-page title="Flag detail" parentLink="/flags" parentLabel="Back to flags" />
  `,
})
export class FlagDetailComponent {}
