import { Injectable, signal, computed } from '@angular/core';
import {
  sdk,
  Event,
  PaginationParams,
  FilterParams,
  EventType,
  EventSeverity,
} from '../../shared/sdk';

export interface EventFilters {
  types?: EventType[];
  severity?: EventSeverity[];
  userId?: string;
  source?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

@Injectable({ providedIn: 'root' })
export class EventsStore {
  // State signals
  private _events = signal<Event[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _filters = signal<EventFilters>({});
  private _pagination = signal<PaginationParams>({ page: 1, limit: 10 });
  private _total = signal<number>(0);
  private _selectedEvents = signal<string[]>([]);
  private _isStreaming = signal<boolean>(false);

  // Computed signals
  public readonly events = this._events.asReadonly();
  public readonly loading = this._loading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly filters = this._filters.asReadonly();
  public readonly pagination = this._pagination.asReadonly();
  public readonly total = this._total.asReadonly();
  public readonly selectedEvents = this._selectedEvents.asReadonly();
  public readonly isStreaming = this._isStreaming.asReadonly();

  // Derived computed signals
  public readonly criticalEvents = computed(() =>
    this._events().filter((event) => event.severity === 'critical')
  );

  public readonly highSeverityEvents = computed(() =>
    this._events().filter((event) => event.severity === 'high' || event.severity === 'critical')
  );

  public readonly userEvents = computed(() => this._events().filter((event) => event.userId));

  public readonly systemEvents = computed(() => this._events().filter((event) => !event.userId));

  public readonly recentEvents = computed(() =>
    this._events()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50)
  );

  public readonly filteredEvents = computed(() => {
    const events = this._events();
    const filters = this._filters();

    if (!filters || Object.keys(filters).length === 0) {
      return events;
    }

    return events.filter((event) => {
      // Type filter
      if (filters.types && filters.types.length > 0) {
        if (!filters.types.includes(event.type)) return false;
      }

      // Severity filter
      if (filters.severity && filters.severity.length > 0) {
        if (!filters.severity.includes(event.severity)) return false;
      }

      // User filter
      if (filters.userId) {
        if (event.userId !== filters.userId) return false;
      }

      // Source filter
      if (filters.source && filters.source.length > 0) {
        if (!filters.source.includes(event.source)) return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const eventDate = new Date(event.timestamp);
        if (eventDate < filters.dateRange.start || eventDate > filters.dateRange.end) {
          return false;
        }
      }

      return true;
    });
  });

  public readonly hasSelectedEvents = computed(() => this._selectedEvents().length > 0);

  public readonly selectedEventsData = computed(() =>
    this._events().filter((event) => this._selectedEvents().includes(event.id))
  );

  // Actions
  async fetchEvents(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const params = {
        ...this._pagination(),
        ...this._filters(),
      };

      const response = await sdk.events.list(params).toPromise();

      if (response) {
        this._events.set(response.data);
        this._total.set(response.pagination.total);
      }
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Failed to fetch events');
    } finally {
      this._loading.set(false);
    }
  }

  async fetchEvent(id: string): Promise<Event | null> {
    try {
      const event = await sdk.events.get(id).toPromise();
      if (event) {
        // Update the event in the list
        this._events.update((events) => events.map((e) => (e.id === id ? event : e)));
      }
      return event || null;
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Failed to fetch event');
      return null;
    }
  }

  // Filter actions
  setFilters(filters: EventFilters): void {
    this._filters.set(filters);
    this._pagination.update((p) => ({ ...p, page: 1 })); // Reset to first page
  }

  clearFilters(): void {
    this._filters.set({});
    this._pagination.update((p) => ({ ...p, page: 1 }));
  }

  // Pagination actions
  setPage(page: number): void {
    this._pagination.update((p) => ({ ...p, page }));
  }

  setPageSize(size: number): void {
    this._pagination.update((p) => ({ ...p, limit: size, page: 1 }));
  }

  // Selection actions
  selectEvent(id: string): void {
    this._selectedEvents.update((selected) => [...selected, id]);
  }

  deselectEvent(id: string): void {
    this._selectedEvents.update((selected) => selected.filter((eventId) => eventId !== id));
  }

  selectAllEvents(): void {
    const allIds = this._events().map((event) => event.id);
    this._selectedEvents.set(allIds);
  }

  clearSelection(): void {
    this._selectedEvents.set([]);
  }

  toggleEventSelection(id: string): void {
    const selected = this._selectedEvents();
    if (selected.includes(id)) {
      this.deselectEvent(id);
    } else {
      this.selectEvent(id);
    }
  }

  // Utility actions
  clearError(): void {
    this._error.set(null);
  }

  refresh(): void {
    this.fetchEvents();
  }

  // Streaming actions
  startStreaming(): void {
    this._isStreaming.set(true);
  }

  stopStreaming(): void {
    this._isStreaming.set(false);
  }

  addEvent(event: Event): void {
    this._events.update((events) => [event, ...events]);
    this._total.update((total) => total + 1);
  }

  clearEvents(): void {
    this._events.set([]);
    this._total.set(0);
  }
}
