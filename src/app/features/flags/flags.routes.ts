import { Routes } from '@angular/router';
import { RequirePermGuard } from '../../core/auth/require-perm.guard';
import { Permission } from '../../../shared/sdk';

export const FLAGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./flags-list/flags-list.component').then((m) => m.FlagsListComponent),
    canMatch: [RequirePermGuard],
    data: { requirePerm: [Permission.VIEW_FLAGS] },
  },
  {
    path: 'new',
    loadComponent: () => import('./flag-form/flag-form.component').then((m) => m.FlagFormComponent),
    canMatch: [RequirePermGuard],
    data: { requirePerm: [Permission.MANAGE_FLAGS] },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./flag-detail/flag-detail.component').then((m) => m.FlagDetailComponent),
    canMatch: [RequirePermGuard],
    data: { requirePerm: [Permission.VIEW_FLAGS] },
  },
  {
    path: ':id/compare',
    loadComponent: () =>
      import('./flag-compare/flag-compare.component').then((m) => m.FlagCompareComponent),
    canMatch: [RequirePermGuard],
    data: { requirePerm: [Permission.VIEW_FLAGS] },
  },
];
