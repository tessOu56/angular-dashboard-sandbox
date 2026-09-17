import { countBy, maxValue, severityBars, throughputSeries, toBarData, typeBars } from './chart-stats';

describe('chart-stats', () => {
  const events = [
    { type: 'user_login', severity: 'low', timestamp: '2026-09-16T00:00:00.000Z' },
    { type: 'user_login', severity: 'low', timestamp: '2026-09-16T00:00:01.000Z' },
    { type: 'approval_created', severity: 'medium', timestamp: '2026-09-16T00:00:02.000Z' },
    { type: 'system_alert', severity: 'critical', timestamp: '2026-09-16T00:00:03.000Z' },
  ];

  it('counts items by key', () => {
    expect(countBy(events, (event) => event.severity)).toEqual({
      low: 2,
      medium: 1,
      critical: 1,
    });
  });

  it('builds severity bars in palette order including zeros', () => {
    const bars = severityBars(events);
    expect(bars.map((bar) => bar.key)).toEqual(['low', 'medium', 'high', 'critical']);
    expect(bars.find((bar) => bar.key === 'low')?.value).toBe(2);
    expect(bars.find((bar) => bar.key === 'high')?.value).toBe(0);
    expect(bars.find((bar) => bar.key === 'critical')?.color).toBe('#dc2626');
  });

  it('builds type bars sorted by count', () => {
    const bars = typeBars(events);
    expect(bars[0]).toEqual(
      jasmine.objectContaining({ key: 'user_login', value: 2, label: 'user login' })
    );
  });

  it('maps counts to bar data with fallback color', () => {
    const bars = toBarData({ alpha: 1 });
    expect(bars[0].color).toBe('#6366f1');
    expect(bars[0].label).toBe('alpha');
  });

  it('buckets throughput with oldest first', () => {
    const now = Date.parse('2026-09-16T00:00:10.000Z');
    const series = throughputSeries(
      ['2026-09-16T00:00:09.500Z', '2026-09-16T00:00:03.000Z', '2026-09-16T00:00:00.000Z'],
      now,
      2000,
      4
    );
    expect(series.length).toBe(4);
    expect(series.reduce((sum, value) => sum + value, 0)).toBe(2);
    expect(series[3]).toBe(1);
  });

  it('returns zero max for empty series', () => {
    expect(maxValue([])).toBe(0);
    expect(maxValue([0, 4, 1])).toBe(4);
  });
});
