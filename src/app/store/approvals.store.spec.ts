import { TestBed } from '@angular/core/testing';
import { ApprovalsStore } from './approvals.store';
import { ApprovalRequest, ApprovalStatus } from '../../shared/sdk';

describe('ApprovalsStore', () => {
  let store: ApprovalsStore;

  const mockApprovals: ApprovalRequest[] = [
    {
      id: '1',
      title: 'Test Approval 1',
      description: 'Description 1',
      requestType: 'expense',
      requesterId: 'user1',
      requesterName: 'User One',
      department: 'IT',
      amount: 1000,
      priority: 'high',
      status: ApprovalStatus.PENDING,
      approvals: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Test Approval 2',
      description: 'Description 2',
      requestType: 'purchase',
      requesterId: 'user2',
      requesterName: 'User Two',
      department: 'Sales',
      amount: 5000,
      priority: 'urgent',
      status: ApprovalStatus.APPROVED,
      approvals: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Test Approval 3',
      description: 'Description 3',
      requestType: 'travel',
      requesterId: 'user1',
      requesterName: 'User One',
      department: 'IT',
      amount: 2000,
      priority: 'medium',
      status: ApprovalStatus.REJECTED,
      approvals: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(ApprovalsStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have empty approvals array', () => {
      expect(store.approvals()).toEqual([]);
    });

    it('should not be loading', () => {
      expect(store.loading()).toBe(false);
    });

    it('should have no error', () => {
      expect(store.error()).toBeNull();
    });

    it('should have default pagination', () => {
      const pagination = store.pagination();
      expect(pagination.page).toBe(1);
      expect(pagination.limit).toBe(10);
    });
  });

  describe('computed signals', () => {
    beforeEach(() => {
      // Manually set approvals for testing computed properties
      (store as any)._approvals.set(mockApprovals);
    });

    it('should filter pending approvals', () => {
      const pending = store.pendingApprovals();
      expect(pending).toHaveLength(1);
      expect(pending[0].status).toBe(ApprovalStatus.PENDING);
    });

    it('should filter approved approvals', () => {
      const approved = store.approvedApprovals();
      expect(approved).toHaveLength(1);
      expect(approved[0].status).toBe(ApprovalStatus.APPROVED);
    });

    it('should filter rejected approvals', () => {
      const rejected = store.rejectedApprovals();
      expect(rejected).toHaveLength(1);
      expect(rejected[0].status).toBe(ApprovalStatus.REJECTED);
    });

    it('should filter high priority approvals', () => {
      const highPriority = store.highPriorityApprovals();
      expect(highPriority).toHaveLength(2); // high + urgent
      expect(highPriority.every((a) => ['high', 'urgent', 'critical'].includes(a.priority))).toBe(
        true
      );
    });
  });

  describe('setFilters', () => {
    it('should set filters correctly', () => {
      const filters = { status: [ApprovalStatus.PENDING] };
      store.setFilters(filters);

      expect(store.filters()).toEqual(filters);
    });

    it('should reset page to 1 when setting filters', () => {
      store.setPage(3);
      store.setFilters({ status: [ApprovalStatus.PENDING] });

      expect(store.pagination().page).toBe(1);
    });
  });

  describe('clearFilters', () => {
    it('should clear all filters', () => {
      store.setFilters({ status: [ApprovalStatus.PENDING] });
      store.clearFilters();

      expect(store.filters()).toEqual({});
    });

    it('should reset page to 1 when clearing filters', () => {
      store.setPage(3);
      store.clearFilters();

      expect(store.pagination().page).toBe(1);
    });
  });

  describe('pagination', () => {
    it('should set page correctly', () => {
      store.setPage(5);
      expect(store.pagination().page).toBe(5);
    });

    it('should set page size and reset to page 1', () => {
      store.setPage(3);
      store.setPageSize(20);

      const pagination = store.pagination();
      expect(pagination.limit).toBe(20);
      expect(pagination.page).toBe(1);
    });
  });

  describe('selection', () => {
    it('should select approval', () => {
      store.selectApproval('1');
      expect(store.selectedApprovals()).toContain('1');
    });

    it('should deselect approval', () => {
      store.selectApproval('1');
      store.deselectApproval('1');
      expect(store.selectedApprovals()).not.toContain('1');
    });

    it('should toggle approval selection', () => {
      store.toggleApprovalSelection('1');
      expect(store.selectedApprovals()).toContain('1');

      store.toggleApprovalSelection('1');
      expect(store.selectedApprovals()).not.toContain('1');
    });

    it('should select all approvals', () => {
      (store as any)._approvals.set(mockApprovals);
      store.selectAllApprovals();

      expect(store.selectedApprovals()).toHaveLength(mockApprovals.length);
      expect(store.hasSelectedApprovals()).toBe(true);
    });

    it('should clear selection', () => {
      store.selectApproval('1');
      store.selectApproval('2');
      store.clearSelection();

      expect(store.selectedApprovals()).toEqual([]);
      expect(store.hasSelectedApprovals()).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      (store as any)._error.set('Test error');
      store.clearError();

      expect(store.error()).toBeNull();
    });
  });
});
