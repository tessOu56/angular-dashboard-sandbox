import { Injectable, signal, computed } from '@angular/core';
import { sdk, ApprovalRequest, PaginationParams, FilterParams } from '../../shared/sdk';

export interface ApprovalFilters {
  status?: string[];
  requestType?: string[];
  priority?: string[];
  department?: string[];
  requesterId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

@Injectable({ providedIn: 'root' })
export class ApprovalsStore {
  // State signals
  private _approvals = signal<ApprovalRequest[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _filters = signal<ApprovalFilters>({});
  private _pagination = signal<PaginationParams>({ page: 1, limit: 10 });
  private _total = signal<number>(0);
  private _selectedApprovals = signal<string[]>([]);

  // Computed signals
  public readonly approvals = this._approvals.asReadonly();
  public readonly loading = this._loading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly filters = this._filters.asReadonly();
  public readonly pagination = this._pagination.asReadonly();
  public readonly total = this._total.asReadonly();
  public readonly selectedApprovals = this._selectedApprovals.asReadonly();

  // Derived computed signals
  public readonly pendingApprovals = computed(() =>
    this._approvals().filter((approval) => approval.status === 'pending')
  );

  public readonly approvedApprovals = computed(() =>
    this._approvals().filter((approval) => approval.status === 'approved')
  );

  public readonly rejectedApprovals = computed(() =>
    this._approvals().filter((approval) => approval.status === 'rejected')
  );

  public readonly draftApprovals = computed(() =>
    this._approvals().filter((approval) => approval.status === 'draft')
  );

  public readonly highPriorityApprovals = computed(() =>
    this._approvals().filter(
      (approval) =>
        approval.priority === 'high' ||
        approval.priority === 'urgent' ||
        approval.priority === 'critical'
    )
  );

  public readonly filteredApprovals = computed(() => {
    const approvals = this._approvals();
    const filters = this._filters();

    if (!filters || Object.keys(filters).length === 0) {
      return approvals;
    }

    return approvals.filter((approval) => {
      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(approval.status)) return false;
      }

      // Request type filter
      if (filters.requestType && filters.requestType.length > 0) {
        if (!filters.requestType.includes(approval.requestType)) return false;
      }

      // Priority filter
      if (filters.priority && filters.priority.length > 0) {
        if (!filters.priority.includes(approval.priority)) return false;
      }

      // Department filter
      if (filters.department && filters.department.length > 0) {
        if (!filters.department.includes(approval.department)) return false;
      }

      // Requester filter
      if (filters.requesterId) {
        if (approval.requesterId !== filters.requesterId) return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const approvalDate = new Date(approval.createdAt);
        if (approvalDate < filters.dateRange.start || approvalDate > filters.dateRange.end) {
          return false;
        }
      }

      return true;
    });
  });

  public readonly hasSelectedApprovals = computed(() => this._selectedApprovals().length > 0);

  public readonly selectedApprovalsData = computed(() =>
    this._approvals().filter((approval) => this._selectedApprovals().includes(approval.id))
  );

  // Actions
  async fetchApprovals(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const params = {
        ...this._pagination(),
        ...this._filters(),
      };

      const response = await sdk.approvals.list(params).toPromise();

      if (response) {
        this._approvals.set(response.data);
        this._total.set(response.pagination.total);
      }
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Failed to fetch approvals');
    } finally {
      this._loading.set(false);
    }
  }

  async fetchApproval(id: string): Promise<ApprovalRequest | null> {
    try {
      const approval = await sdk.approvals.get(id).toPromise();
      if (approval) {
        // Update the approval in the list
        this._approvals.update((approvals) => approvals.map((a) => (a.id === id ? approval : a)));
      }
      return approval || null;
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Failed to fetch approval');
      return null;
    }
  }

  async createApproval(approval: Partial<ApprovalRequest>): Promise<ApprovalRequest | null> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const newApproval = await sdk.approvals.create(approval).toPromise();
      if (newApproval) {
        this._approvals.update((approvals) => [newApproval, ...approvals]);
        this._total.update((total) => total + 1);
      }
      return newApproval || null;
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Failed to create approval');
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  async updateApproval(
    id: string,
    approval: Partial<ApprovalRequest>
  ): Promise<ApprovalRequest | null> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const updatedApproval = await sdk.approvals.update(id, approval).toPromise();
      if (updatedApproval) {
        this._approvals.update((approvals) =>
          approvals.map((a) => (a.id === id ? updatedApproval : a))
        );
      }
      return updatedApproval || null;
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Failed to update approval');
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  async approveApproval(id: string, comment?: string): Promise<ApprovalRequest | null> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const approvedApproval = await sdk.approvals.approve(id, comment).toPromise();
      if (approvedApproval) {
        this._approvals.update((approvals) =>
          approvals.map((a) => (a.id === id ? approvedApproval : a))
        );
      }
      return approvedApproval || null;
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Failed to approve request');
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  async rejectApproval(id: string, comment?: string): Promise<ApprovalRequest | null> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const rejectedApproval = await sdk.approvals.reject(id, comment).toPromise();
      if (rejectedApproval) {
        this._approvals.update((approvals) =>
          approvals.map((a) => (a.id === id ? rejectedApproval : a))
        );
      }
      return rejectedApproval || null;
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Failed to reject request');
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  // Filter actions
  setFilters(filters: ApprovalFilters): void {
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
  selectApproval(id: string): void {
    this._selectedApprovals.update((selected) => [...selected, id]);
  }

  deselectApproval(id: string): void {
    this._selectedApprovals.update((selected) =>
      selected.filter((approvalId) => approvalId !== id)
    );
  }

  selectAllApprovals(): void {
    const allIds = this._approvals().map((approval) => approval.id);
    this._selectedApprovals.set(allIds);
  }

  clearSelection(): void {
    this._selectedApprovals.set([]);
  }

  toggleApprovalSelection(id: string): void {
    const selected = this._selectedApprovals();
    if (selected.includes(id)) {
      this.deselectApproval(id);
    } else {
      this.selectApproval(id);
    }
  }

  // Utility actions
  clearError(): void {
    this._error.set(null);
  }

  refresh(): void {
    this.fetchApprovals();
  }
}
