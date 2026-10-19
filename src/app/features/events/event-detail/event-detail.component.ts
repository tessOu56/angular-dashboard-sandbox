import { Component } from '@angular/core';
import { StubPageComponent } from '../../../shared/ui/stub-page/stub-page.component';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [StubPageComponent],
  template: `
    <app-stub-page title="Event detail" parentLink="/events" parentLabel="Back to events" />
  `,
})
export class EventDetailComponent {}
