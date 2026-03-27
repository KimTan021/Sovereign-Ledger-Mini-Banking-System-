import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'request-account',
    loadComponent: () => import('./features/auth/request-account/request-account.component').then(m => m.RequestAccountComponent),
  },
  {
    path: 'customer',
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'customer' },
    loadChildren: () => import('./features/customer/customer.routes').then(m => m.customerRoutes),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'admin' },
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
