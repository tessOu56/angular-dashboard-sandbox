import { Component } from '@angular/core';
import { StubPageComponent } from '../../../shared/ui/stub-page/stub-page.component';

@Component({
  selector: 'app-approval-detail',
  standalone: true,
  imports: [StubPageComponent],
  template: `
    <app-stub-page
      title="Approval detail"
      parentLink="/approvals"
      parentLabel="Back to approvals"
    />
  `,
})
export class ApprovalDetailComponent {}
