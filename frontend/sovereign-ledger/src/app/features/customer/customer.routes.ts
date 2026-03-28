import { Routes } from '@angular/router';

export const customerRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'banking',
    loadComponent: () => import('./banking/banking.component').then(m => m.BankingComponent),
  },
  {
    path: 'transfer',
    loadComponent: () => import('./transfer/transfer.component').then(m => m.TransferComponent),
  },
  {
    path: 'history',
    loadComponent: () => import('./history/history.component').then(m => m.HistoryComponent),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
