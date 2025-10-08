import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import { Event, EventType, EventSeverity } from '../../../shared/sdk';

export interface EventItem extends Event {
  id: string;
  type: EventType;
  timestamp: string;
  userId?: string;
  username?: string;
  details: Record<string, any>;
  severity: EventSeverity;
  source: string;
  tags?: string[];
}

@Injectable({ providedIn: 'root' })
export class EventsSseService implements OnDestroy {
  private stream?: EventSource;
  private _events = signal<ReadonlyArray<EventItem>>([]);
  private _isConnected = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _lastEventTime = signal<Date | null>(null);

  private readonly MAX_EVENTS = 2000; // Ring buffer size
  private readonly RECONNECT_DELAY = 5000; // 5 seconds
  private reconnectTimer?: number;

  // Computed signals
  public readonly events = this._events.asReadonly();
  public readonly isConnected = this._isConnected.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly lastEventTime = this._lastEventTime.asReadonly();

  // Derived computed signals
  public readonly recentEvents = computed(
    () => this._events().slice(0, 100) // Last 100 events
  );

  public readonly criticalEvents = computed(() =>
    this._events().filter((event) => event.severity === 'critical')
  );

  public readonly highSeverityEvents = computed(() =>
    this._events().filter((event) => event.severity === 'high' || event.severity === 'critical')
  );

  public readonly eventCount = computed(() => this._events().length);

  public readonly eventTypes = computed(() => {
    const types = new Set<EventType>();
    this._events().forEach((event) => types.add(event.type));
    return Array.from(types);
  });

  public readonly eventSources = computed(() => {
    const sources = new Set<string>();
    this._events().forEach((event) => sources.add(event.source));
    return Array.from(sources);
  });

  /**
   * 開始 SSE 串流
   * @param url SSE 端點 URL
   * @param options 連線選項
   */
  start(url: string, options: { withCredentials?: boolean } = {}): void {
    this.stop(); // 停止現有連線

    // Development mode: use mock events instead of real SSE connection
    if (url.includes('localhost:3000')) {
      console.warn('Development mode: SSE connection disabled. Using mock events.');
      this._isConnected.set(true);
      this._error.set(null);
      this.startMockEvents();
      return;
    }

    try {
      this.stream = new EventSource(url, { withCredentials: options.withCredentials });

      this.stream.onopen = () => {
        this._isConnected.set(true);
        this._error.set(null);
        console.log('SSE connection opened');
      };

      this.stream.onmessage = (event) => {
        try {
          const eventData = JSON.parse(event.data) as EventItem;
          this.addEvent(eventData);
        } catch (error) {
          console.error('Failed to parse SSE event:', error);
        }
      };

      this.stream.onerror = (error) => {
        this._isConnected.set(false);
        this._error.set('SSE connection error');
        console.error('SSE connection error:', error);

        // 自動重連
        this.scheduleReconnect(url, options);
      };
    } catch (error) {
      this._error.set('Failed to create SSE connection');
      console.error('Failed to create SSE connection:', error);
    }
  }

  /**
   * 開發模式：產生模擬事件
   */
  private startMockEvents(): void {
    // Add some initial mock events
    const mockEvents: EventItem[] = [
      {
        id: '1',
        type: EventType.USER_LOGIN,
        timestamp: new Date().toISOString(),
        userId: '1',
        username: 'admin',
        details: { ip: '127.0.0.1', browser: 'Chrome' },
        severity: EventSeverity.LOW,
        source: 'auth-service',
        tags: ['authentication'],
      },
      {
        id: '2',
        type: EventType.APPROVAL_CREATED,
        timestamp: new Date(Date.now() - 300000).toISOString(),
        userId: '2',
        username: 'manager',
        details: { approvalId: 'APR-001', amount: 15000 },
        severity: EventSeverity.MEDIUM,
        source: 'approval-service',
        tags: ['approval', 'purchase'],
      },
      {
        id: '3',
        type: EventType.FLAG_PUBLISHED,
        timestamp: new Date(Date.now() - 600000).toISOString(),
        userId: '1',
        username: 'admin',
        details: { flagKey: 'new-dashboard', version: 2 },
        severity: EventSeverity.HIGH,
        source: 'flag-service',
        tags: ['feature-flag', 'deployment'],
      },
    ];

    mockEvents.forEach((event) => this.addEvent(event));
  }

  /**
   * 停止 SSE 串流
   */
  stop(): void {
    if (this.stream) {
      this.stream.close();
      this.stream = undefined;
    }

    this._isConnected.set(false);

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  /**
   * 重新連線
   * @param url SSE 端點 URL
   * @param options 連線選項
   */
  reconnect(url: string, options: { withCredentials?: boolean } = {}): void {
    this.stop();
    setTimeout(() => {
      this.start(url, options);
    }, this.RECONNECT_DELAY);
  }

  /**
   * 清除所有事件
   */
  clearEvents(): void {
    this._events.set([]);
    this._lastEventTime.set(null);
  }

  /**
   * 取得特定類型的事件
   * @param type 事件類型
   * @returns 事件陣列
   */
  getEventsByType(type: EventType): EventItem[] {
    return this._events().filter((event) => event.type === type);
  }

  /**
   * 取得特定嚴重程度的事件
   * @param severity 嚴重程度
   * @returns 事件陣列
   */
  getEventsBySeverity(severity: EventSeverity): EventItem[] {
    return this._events().filter((event) => event.severity === severity);
  }

  /**
   * 取得特定來源的事件
   * @param source 來源
   * @returns 事件陣列
   */
  getEventsBySource(source: string): EventItem[] {
    return this._events().filter((event) => event.source === source);
  }

  /**
   * 取得特定時間範圍的事件
   * @param start 開始時間
   * @param end 結束時間
   * @returns 事件陣列
   */
  getEventsByTimeRange(start: Date, end: Date): EventItem[] {
    return this._events().filter((event) => {
      const eventTime = new Date(event.timestamp);
      return eventTime >= start && eventTime <= end;
    });
  }

  /**
   * 搜尋事件
   * @param query 搜尋查詢
   * @returns 事件陣列
   */
  searchEvents(query: string): EventItem[] {
    const lowerQuery = query.toLowerCase();
    return this._events().filter(
      (event) =>
        event.details &&
        Object.values(event.details).some((value) =>
          String(value).toLowerCase().includes(lowerQuery)
        )
    );
  }

  /**
   * 匯出事件為 JSON
   * @returns JSON 字串
   */
  exportEvents(): string {
    return JSON.stringify(this._events(), null, 2);
  }

  /**
   * 匯出事件為 CSV
   * @returns CSV 字串
   */
  exportEventsAsCSV(): string {
    const events = this._events();
    if (events.length === 0) return '';

    const headers = ['timestamp', 'type', 'severity', 'source', 'userId', 'username', 'details'];
    const rows = events.map((event) => [
      event.timestamp,
      event.type,
      event.severity,
      event.source,
      event.userId || '',
      event.username || '',
      JSON.stringify(event.details),
    ]);

    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  }

  ngOnDestroy(): void {
    this.stop();
  }

  /**
   * 新增事件到 ring buffer
   * @param event 事件資料
   */
  private addEvent(event: EventItem): void {
    this._events.update((events) => {
      const newEvents = [event, ...events];
      // 保持 ring buffer 大小
      return newEvents.slice(0, this.MAX_EVENTS);
    });

    this._lastEventTime.set(new Date());
  }

  /**
   * 排程重新連線
   * @param url SSE 端點 URL
   * @param options 連線選項
   */
  private scheduleReconnect(url: string, options: { withCredentials?: boolean } = {}): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = window.setTimeout(() => {
      this.start(url, options);
    }, this.RECONNECT_DELAY);
  }
}
