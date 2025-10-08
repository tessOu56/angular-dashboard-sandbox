import { Routes } from '@angular/router';
import { RequirePermGuard } from '../../core/auth/require-perm.guard';
import { Permission } from '../../../shared/sdk';

export const AUDIT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./audit-list/audit-list.component').then((m) => m.AuditListComponent),
    canMatch: [RequirePermGuard],
    data: { requirePerm: [Permission.VIEW_AUDIT_TRAIL] },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./audit-detail/audit-detail.component').then((m) => m.AuditDetailComponent),
    canMatch: [RequirePermGuard],
    data: { requirePerm: [Permission.VIEW_AUDIT_TRAIL] },
  },
];
