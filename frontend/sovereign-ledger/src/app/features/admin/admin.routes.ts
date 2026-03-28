import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./overview/overview.component').then(m => m.OverviewComponent),
      },
      {
        path: 'pending',
        loadComponent: () => import('./pending/pending-requests.component').then(m => m.PendingRequestsComponent),
      },
      {
        path: 'analytics',
        loadComponent: () => import('./analytics/analytics.component').then(m => m.AnalyticsComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users.component').then(m => m.UsersComponent),
      },
      {
        path: 'compliance',
        loadComponent: () => import('./compliance/compliance.component').then(m => m.ComplianceComponent),
      },
      {
        path: 'audit',
        loadComponent: () => import('./audit/audit.component').then(m => m.AuditComponent),
      },
    ],
  },
];
