import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusBadge',
  standalone: true,
})
export class StatusBadgePipe implements PipeTransform {
  transform(value: string, type: 'status' | 'priority' | 'role' = 'status'): string {
    if (!value) return '';

    switch (type) {
      case 'status':
        return this.getStatusClass(value);
      case 'priority':
        return this.getPriorityClass(value);
      case 'role':
        return this.getRoleClass(value);
      default:
        return '';
    }
  }

  private getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      draft: 'status-draft',
      pending: 'status-pending',
      in_review: 'status-in-review',
      approved: 'status-approved',
      rejected: 'status-rejected',
      cancelled: 'status-cancelled',
      expired: 'status-expired',
      published: 'status-published',
      archived: 'status-archived',
      active: 'status-active',
      inactive: 'status-inactive',
    };
    return statusMap[status.toLowerCase()] || 'status-default';
  }

  private getPriorityClass(priority: string): string {
    const priorityMap: Record<string, string> = {
      low: 'priority-low',
      medium: 'priority-medium',
      high: 'priority-high',
      urgent: 'priority-urgent',
      critical: 'priority-critical',
    };
    return priorityMap[priority.toLowerCase()] || 'priority-default';
  }

  private getRoleClass(role: string): string {
    const roleMap: Record<string, string> = {
      super_admin: 'role-super-admin',
      admin: 'role-admin',
      manager: 'role-manager',
      approver: 'role-approver',
      operator: 'role-operator',
      viewer: 'role-viewer',
    };
    return roleMap[role.toLowerCase()] || 'role-default';
  }
}
