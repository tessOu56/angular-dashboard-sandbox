import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-dashboard">
      <h2>Settings Dashboard</h2>
      <p>Component under development</p>
    </div>
  `,
})
export class SettingsDashboardComponent {}
