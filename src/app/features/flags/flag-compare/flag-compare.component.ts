import { Component } from '@angular/core';
import { StubPageComponent } from '../../../shared/ui/stub-page/stub-page.component';

@Component({
  selector: 'app-flag-compare',
  standalone: true,
  imports: [StubPageComponent],
  template: `
    <app-stub-page title="Flag compare" parentLink="/flags" parentLabel="Back to flags" />
  `,
})
export class FlagCompareComponent {}
