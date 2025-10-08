import { Routes } from '@angular/router';
import { RequirePermGuard } from '../../core/auth/require-perm.guard';
import { Permission } from '../../../shared/sdk';

export const EVENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./events-monitor/events-monitor.component').then((m) => m.EventsMonitorComponent),
    canMatch: [RequirePermGuard],
    data: { requirePerm: [Permission.VIEW_EVENTS] },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./event-detail/event-detail.component').then((m) => m.EventDetailComponent),
    canMatch: [RequirePermGuard],
    data: { requirePerm: [Permission.VIEW_EVENTS] },
  },
];
