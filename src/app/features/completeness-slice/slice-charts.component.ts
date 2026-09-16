import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { BarDatum, maxValue } from './chart-stats';

@Component({
  selector: 'app-slice-charts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="charts" data-testid="slice-charts">
      <section class="chart-card" aria-labelledby="severity-chart-title">
        <h3 id="severity-chart-title">SSE severity</h3>
        <svg
          class="bar-chart"
          viewBox="0 0 320 140"
          role="img"
          aria-label="Event severity counts"
        >
          <ng-container *ngFor="let bar of severityBars(); let i = index">
            <rect
              [attr.x]="i * 80 + 18"
              [attr.y]="barTop(bar.value, severityMax())"
              width="44"
              [attr.height]="barHeight(bar.value, severityMax())"
              [attr.fill]="bar.color"
              rx="4"
            ></rect>
            <text [attr.x]="i * 80 + 40" y="132" text-anchor="middle" class="tick">
              {{ bar.label }}
            </text>
            <text
              [attr.x]="i * 80 + 40"
              [attr.y]="barTop(bar.value, severityMax()) - 6"
              text-anchor="middle"
              class="value"
            >
              {{ bar.value }}
            </text>
          </ng-container>
        </svg>
      </section>

      <section class="chart-card" aria-labelledby="type-chart-title">
        <h3 id="type-chart-title">SSE event types</h3>
        <ul class="type-list">
          <li *ngFor="let bar of typeBars()">
            <span class="type-label">{{ bar.label }}</span>
            <span class="type-track">
              <span
                class="type-fill"
                [style.width.%]="typeWidth(bar.value)"
                [style.background]="bar.color"
              ></span>
            </span>
            <span class="type-value">{{ bar.value }}</span>
          </li>
        </ul>
        <p *ngIf="typeBars().length === 0" class="empty">No SSE events yet.</p>
      </section>

      <section class="chart-card" aria-labelledby="throughput-chart-title">
        <h3 id="throughput-chart-title">SSE throughput</h3>
        <svg
          class="sparkline"
          viewBox="0 0 320 80"
          role="img"
          aria-label="Event throughput sparkline"
        >
          <polyline [attr.points]="sparklinePoints()" fill="none" stroke="#2563eb" stroke-width="2" />
        </svg>
      </section>
    </div>
  `,
  styles: [
    `
      .charts {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1rem;
      }
      .chart-card {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        padding: 1rem;
      }
      h3 {
        margin: 0 0 0.75rem;
        font-size: 0.95rem;
      }
      .bar-chart,
      .sparkline {
        width: 100%;
        height: auto;
      }
      .tick,
      .value {
        font-size: 10px;
        fill: #4b5563;
      }
      .type-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .type-list li {
        display: grid;
        grid-template-columns: 7.5rem 1fr 2rem;
        gap: 0.5rem;
        align-items: center;
        margin-bottom: 0.4rem;
        font-size: 0.8rem;
      }
      .type-track {
        background: #f3f4f6;
        height: 0.5rem;
        border-radius: 999px;
        overflow: hidden;
      }
      .type-fill {
        display: block;
        height: 100%;
      }
      .empty {
        color: #6b7280;
        margin: 0;
      }
    `,
  ],
})
export class SliceChartsComponent {
  severityBars = input<BarDatum[]>([]);
  typeBars = input<BarDatum[]>([]);
  throughput = input<number[]>([]);

  readonly severityMax = computed(() => Math.max(1, maxValue(this.severityBars().map((bar) => bar.value))));
  readonly typeMax = computed(() => Math.max(1, maxValue(this.typeBars().map((bar) => bar.value))));

  barHeight(value: number, max: number): number {
    return Math.max(2, (value / max) * 96);
  }

  barTop(value: number, max: number): number {
    return 112 - this.barHeight(value, max);
  }

  typeWidth(value: number): number {
    return (value / this.typeMax()) * 100;
  }

  sparklinePoints(): string {
    const series = this.throughput();
    if (series.length === 0) {
      return '0,70 320,70';
    }
    const peak = Math.max(1, maxValue(series));
    const step = series.length === 1 ? 0 : 320 / (series.length - 1);
    return series
      .map((value, index) => {
        const x = index * step;
        const y = 70 - (value / peak) * 60;
        return `${x},${y}`;
      })
      .join(' ');
  }
}
