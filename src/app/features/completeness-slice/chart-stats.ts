/** Pure chart helpers for the T-2026-224 completeness slice. No chart library. */

export interface ChartEvent {
  type: string;
  severity: string;
  timestamp: string;
}

export interface BarDatum {
  key: string;
  label: string;
  value: number;
  color: string;
}

export const SEVERITY_PALETTE: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: '#10b981' },
  medium: { label: 'Medium', color: '#f59e0b' },
  high: { label: 'High', color: '#f97316' },
  critical: { label: 'Critical', color: '#dc2626' },
};

export function countBy<T>(items: T[], keyFn: (item: T) => string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = keyFn(item) || 'unknown';
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

export function toBarData(
  counts: Record<string, number>,
  palette?: Record<string, { label: string; color: string }>,
  fallbackColor = '#6366f1'
): BarDatum[] {
  return Object.entries(counts)
    .map(([key, value]) => ({
      key,
      label: palette?.[key]?.label ?? key.replace(/_/g, ' '),
      value,
      color: palette?.[key]?.color ?? fallbackColor,
    }))
    .sort((a, b) => b.value - a.value || a.key.localeCompare(b.key));
}

export function severityBars(events: ChartEvent[]): BarDatum[] {
  const counts = countBy(events, (event) => event.severity);
  const keys = Object.keys(SEVERITY_PALETTE);
  return keys.map((key) => ({
    key,
    label: SEVERITY_PALETTE[key].label,
    value: counts[key] || 0,
    color: SEVERITY_PALETTE[key].color,
  }));
}

export function typeBars(events: ChartEvent[], limit = 6): BarDatum[] {
  return toBarData(countBy(events, (event) => event.type)).slice(0, limit);
}

/**
 * Count events in equal time buckets ending at `now`.
 * Oldest bucket is index 0.
 */
export function throughputSeries(
  timestamps: string[],
  now = Date.now(),
  bucketMs = 2000,
  bucketCount = 16
): number[] {
  const buckets = Array.from({ length: bucketCount }, () => 0);
  const windowMs = bucketMs * bucketCount;
  const windowStart = now - windowMs;

  for (const stamp of timestamps) {
    const time = new Date(stamp).getTime();
    if (Number.isNaN(time) || time < windowStart || time > now) {
      continue;
    }
    const index = Math.min(bucketCount - 1, Math.floor((time - windowStart) / bucketMs));
    buckets[index] += 1;
  }

  return buckets;
}

export function maxValue(values: number[]): number {
  return values.reduce((max, value) => (value > max ? value : value), 0);
}
