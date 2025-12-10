import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard', 
    loadComponent: () =>  import('./components/stock-dashboard/stock-dashboard.component')
      .then(m => m.StockDashboardComponent)
  },
  {
    path: 'stock/:ticker',
    loadComponent: () => import('./components/stock-detail/stock-detail.component')
      .then(m => m.StockDetailComponent)
  },
];
