import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StockDashboard } from './stock-dashboard/stock-dashboard';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, StockDashboard],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('stock-dashboard');
}
