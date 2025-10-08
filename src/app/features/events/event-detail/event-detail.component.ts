import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="event-detail">
      <h2>Event Detail</h2>
      <p>Component under development</p>
    </div>
  `,
})
export class EventDetailComponent {}
