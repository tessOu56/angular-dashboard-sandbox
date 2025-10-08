import { Injectable, signal, computed } from '@angular/core';
import { sdk, FeatureFlag, PaginationParams, FilterParams } from '../../shared/sdk';

export interface FlagFilters {
  status?: string[];
  type?: string[];
  isEnabled?: boolean;
  createdBy?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

@Injectable({ providedIn: 'root' })
export class FlagsStore {
  // State signals
  private _flags = signal<FeatureFlag[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _filters = signal<FlagFilters>({});
  private _pagination = signal<PaginationParams>({ page: 1, limit: 10 });
  private _total = signal<number>(0);
  private _selectedFlags = signal<string[]>([]);

  // Computed signals
  public readonly flags = this._flags.asReadonly();
  public readonly loading = this._loading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly filters = this._filters.asReadonly();
  public readonly pagination = this._pagination.asReadonly();
  public readonly total = this._total.asReadonly();
  public readonly selectedFlags = this._selectedFlags.asReadonly();

  // Derived computed signals
  public readonly publishedFlags = computed(() =>
    this._flags().filter((flag) => flag.status === 'published')
  );

  public readonly draftFlags = computed(() =>
    this._flags().filter((flag) => flag.status === 'draft')
  );

  public readonly pendingFlags = computed(() =>
    this._flags().filter((flag) => flag.status === 'pending_approval')
  );

  public readonly enabledFlags = computed(() => this._flags().filter((flag) => flag.isEnabled));

  public readonly disabledFlags = computed(() => this._flags().filter((flag) => !flag.isEnabled));

  public readonly booleanFlags = computed(() =>
    this._flags().filter((flag) => flag.type === 'boolean')
  );

  public readonly stringFlags = computed(() =>
    this._flags().filter((flag) => flag.type === 'string')
  );

  public readonly numberFlags = computed(() =>
    this._flags().filter((flag) => flag.type === 'number')
  );

  public readonly jsonFlags = computed(() => this._flags().filter((flag) => flag.type === 'json'));

  public readonly filteredFlags = computed(() => {
    const flags = this._flags();
    const filters = this._filters();

    if (!filters || Object.keys(filters).length === 0) {
      return flags;
    }

    return flags.filter((flag) => {
      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(flag.status)) return false;
      }

      // Type filter
      if (filters.type && filters.type.length > 0) {
        if (!filters.type.includes(flag.type)) return false;
      }

      // Enabled filter
      if (filters.isEnabled !== undefined) {
        if (flag.isEnabled !== filters.isEnabled) return false;
      }

      // Created by filter
      if (filters.createdBy) {
        if (flag.createdBy !== filters.createdBy) return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const flagDate = new Date(flag.createdAt);
        if (flagDate < filters.dateRange.start || flagDate > filters.dateRange.end) {
          return false;
        }
      }

      return true;
    });
  });

  public readonly hasSelectedFlags = computed(() => this._selectedFlags().length > 0);

  public readonly selectedFlagsData = computed(() =>
    this._flags().filter((flag) => this._selectedFlags().includes(flag.id))
  );

  // Actions
  async fetchFlags(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const params = {
        ...this._pagination(),
        ...this._filters(),
      };

      const response = await sdk.flags.list(params).toPromise();

      if (response) {
        this._flags.set(response.data);
        this._total.set(response.pagination.total);
      }
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Failed to fetch flags');
    } finally {
      this._loading.set(false);
    }
  }

  async fetchFlag(id: string): Promise<FeatureFlag | null> {
    try {
      const flag = await sdk.flags.get(id).toPromise();
      if (flag) {
        // Update the flag in the list
        this._flags.update((flags) => flags.map((f) => (f.id === id ? flag : f)));
      }
      return flag || null;
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Failed to fetch flag');
      return null;
    }
  }

  async createFlag(flag: Partial<FeatureFlag>): Promise<FeatureFlag | null> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const newFlag = await sdk.flags.create(flag).toPromise();
      if (newFlag) {
        this._flags.update((flags) => [newFlag, ...flags]);
        this._total.update((total) => total + 1);
      }
      return newFlag || null;
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Failed to create flag');
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  async updateFlag(id: string, flag: Partial<FeatureFlag>): Promise<FeatureFlag | null> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const updatedFlag = await sdk.flags.update(id, flag).toPromise();
      if (updatedFlag) {
        this._flags.update((flags) => flags.map((f) => (f.id === id ? updatedFlag : f)));
      }
      return updatedFlag || null;
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Failed to update flag');
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  async publishFlag(id: string): Promise<FeatureFlag | null> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const publishedFlag = await sdk.flags.publish(id).toPromise();
      if (publishedFlag) {
        this._flags.update((flags) => flags.map((f) => (f.id === id ? publishedFlag : f)));
      }
      return publishedFlag || null;
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Failed to publish flag');
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  async archiveFlag(id: string): Promise<FeatureFlag | null> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const archivedFlag = await sdk.flags.archive(id).toPromise();
      if (archivedFlag) {
        this._flags.update((flags) => flags.map((f) => (f.id === id ? archivedFlag : f)));
      }
      return archivedFlag || null;
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Failed to archive flag');
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  // Filter actions
  setFilters(filters: FlagFilters): void {
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
  selectFlag(id: string): void {
    this._selectedFlags.update((selected) => [...selected, id]);
  }

  deselectFlag(id: string): void {
    this._selectedFlags.update((selected) => selected.filter((flagId) => flagId !== id));
  }

  selectAllFlags(): void {
    const allIds = this._flags().map((flag) => flag.id);
    this._selectedFlags.set(allIds);
  }

  clearSelection(): void {
    this._selectedFlags.set([]);
  }

  toggleFlagSelection(id: string): void {
    const selected = this._selectedFlags();
    if (selected.includes(id)) {
      this.deselectFlag(id);
    } else {
      this.selectFlag(id);
    }
  }

  // Utility actions
  clearError(): void {
    this._error.set(null);
  }

  refresh(): void {
    this.fetchFlags();
  }
}
