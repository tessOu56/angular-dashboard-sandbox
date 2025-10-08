import { Routes } from '@angular/router';
import { RequirePermGuard } from '../../core/auth/require-perm.guard';
import { Permission } from '../../../shared/sdk';

export const APPROVALS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./approvals-list/approvals-list.component').then((m) => m.ApprovalsListComponent),
    canMatch: [RequirePermGuard],
    data: { requirePerm: [Permission.VIEW_APPROVALS] },
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./approval-form/approval-form.component').then((m) => m.ApprovalFormComponent),
    canMatch: [RequirePermGuard],
    data: { requirePerm: [Permission.CREATE_APPROVAL] },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./approval-detail/approval-detail.component').then((m) => m.ApprovalDetailComponent),
    canMatch: [RequirePermGuard],
    data: { requirePerm: [Permission.VIEW_APPROVALS] },
  },
];
