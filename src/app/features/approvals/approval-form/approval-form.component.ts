import { Component } from '@angular/core';
import { StubPageComponent } from '../../../shared/ui/stub-page/stub-page.component';

@Component({
  selector: 'app-approval-form',
  standalone: true,
  imports: [StubPageComponent],
  template: `
    <app-stub-page
      title="New approval"
      parentLink="/approvals"
      parentLabel="Back to approvals"
    />
  `,
})
export class ApprovalFormComponent {}
