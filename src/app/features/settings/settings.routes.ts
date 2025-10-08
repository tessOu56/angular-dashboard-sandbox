import { Routes } from '@angular/router';
import { RequirePermGuard } from '../../core/auth/require-perm.guard';
import { Permission } from '../../../shared/sdk';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./settings-dashboard/settings-dashboard.component').then(
        (m) => m.SettingsDashboardComponent
      ),
    canMatch: [RequirePermGuard],
    data: { requirePerm: [Permission.VIEW_SETTINGS] },
  },
  {
    path: 'dictionary',
    loadComponent: () =>
      import('./dictionary/dictionary.component').then((m) => m.DictionaryComponent),
    canMatch: [RequirePermGuard],
    data: { requirePerm: [Permission.VIEW_SETTINGS] },
  },
  {
    path: 'webhooks',
    loadComponent: () => import('./webhooks/webhooks.component').then((m) => m.WebhooksComponent),
    canMatch: [RequirePermGuard],
    data: { requirePerm: [Permission.MANAGE_SETTINGS] },
  },
  {
    path: 'permissions',
    loadComponent: () =>
      import('./permissions/permissions.component').then((m) => m.PermissionsComponent),
    canMatch: [RequirePermGuard],
    data: { requirePerm: [Permission.MANAGE_SETTINGS] },
  },
];
