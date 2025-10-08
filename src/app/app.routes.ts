import { Routes } from '@angular/router';
import { RequirePermGuard } from './core/auth/require-perm.guard';
import { Permission } from '../shared/sdk';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canMatch: [RequirePermGuard],
    data: { requirePerm: [Permission.VIEW_DASHBOARD] },
  },
  {
    path: 'approvals',
    loadChildren: () =>
      import('./features/approvals/approvals.routes').then((m) => m.APPROVALS_ROUTES),
    canMatch: [RequirePermGuard],
    data: { requirePerm: [Permission.VIEW_APPROVALS] },
  },
  {
    path: 'flags',
    loadChildren: () => import('./features/flags/flags.routes').then((m) => m.FLAGS_ROUTES),
    canMatch: [RequirePermGuard],
    data: { requirePerm: [Permission.VIEW_FLAGS] },
  },
  {
    path: 'events',
    loadChildren: () => import('./features/events/events.routes').then((m) => m.EVENTS_ROUTES),
    canMatch: [RequirePermGuard],
    data: { requirePerm: [Permission.VIEW_EVENTS] },
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./features/settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
    canMatch: [RequirePermGuard],
    data: { requirePerm: [Permission.VIEW_SETTINGS] },
  },
  {
    path: 'audit',
    loadChildren: () => import('./features/audit/audit.routes').then((m) => m.AUDIT_ROUTES),
    canMatch: [RequirePermGuard],
    data: { requirePerm: [Permission.VIEW_AUDIT_TRAIL] },
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./components/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent
      ),
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
