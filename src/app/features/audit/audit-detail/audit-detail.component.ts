import { Component } from '@angular/core';
import { StubPageComponent } from '../../../shared/ui/stub-page/stub-page.component';

@Component({
  selector: 'app-audit-detail',
  standalone: true,
  imports: [StubPageComponent],
  template: `
    <app-stub-page title="Audit detail" parentLink="/audit" parentLabel="Back to audit trail" />
  `,
})
export class AuditDetailComponent {}
