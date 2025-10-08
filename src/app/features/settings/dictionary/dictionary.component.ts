import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dictionary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dictionary">
      <h2>Dictionary</h2>
      <p>Component under development</p>
    </div>
  `,
})
export class DictionaryComponent {}
