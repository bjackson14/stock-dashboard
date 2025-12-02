import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '', 
    loadComponent: () =>  import('./stock-dashboard/stock-dashboard.component')
      .then(m => m.StockDashboardComponent)
  }
];
