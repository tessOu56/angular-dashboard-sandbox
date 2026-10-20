import { Component } from '@angular/core';
import { StubPageComponent } from '../../../shared/ui/stub-page/stub-page.component';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [StubPageComponent],
  template: `
    <app-stub-page title="Permissions" parentLink="/settings" parentLabel="Back to settings" />
  `,
})
export class PermissionsComponent {}
