import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Skip Link Component
 *
 * 無障礙功能：讓鍵盤使用者可以快速跳過導航直接到主內容
 */
@Component({
  selector: 'app-skip-link',
  standalone: true,
  imports: [CommonModule],
  template: ` <a href="#main-content" class="skip-link"> 跳至主要內容 </a> `,
  styles: [
    `
      .skip-link {
        position: absolute;
        top: -40px;
        left: 0;
        background: #3b82f6;
        color: white;
        padding: 0.5rem 1rem;
        text-decoration: none;
        border-radius: 0 0 0.375rem 0;
        z-index: 10000;
        transition: top 0.2s;
      }

      .skip-link:focus {
        top: 0;
        outline: 3px solid #fbbf24;
        outline-offset: 2px;
      }
    `,
  ],
})
export class SkipLinkComponent {}
