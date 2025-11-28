import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideAngularModule, TrendingUp, TrendingDown } from 'lucide-angular';
import { StockData } from '../interfaces/StockData';

@Component({
  selector: 'app-stock-dashboard',
  imports: [LucideAngularModule],
  templateUrl: './stock-dashboard.html',
  styleUrl: './stock-dashboard.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockDashboard {
  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;

  topGainers = signal<StockData[]>([
    { ticker: 'AAPL', price: '185.50', changeAmount: '12.30', changePercentage: '7.12%', volume: '52431242' },
    { ticker: 'TSLA', price: '242.84', changeAmount: '15.62', changePercentage: '6.87%', volume: '98234156' },
    { ticker: 'NVDA', price: '495.22', changeAmount: '28.41', changePercentage: '6.09%', volume: '45123789' },
    { ticker: 'MSFT', price: '378.91', changeAmount: '18.23', changePercentage: '5.05%', volume: '31245678' },
    { ticker: 'GOOGL', price: '142.34', changeAmount: '6.51', changePercentage: '4.79%', volume: '28456123' }
  ]);

  topLosers = signal<StockData[]>([
    { ticker: 'INTC', price: '42.31', changeAmount: '-3.82', changePercentage: '-8.24%', volume: '78234567' },
    { ticker: 'BA', price: '198.42', changeAmount: '-14.63', changePercentage: '-6.85%', volume: '45678901' },
    { ticker: 'DIS', price: '88.23', changeAmount: '-5.92', changePercentage: '-6.27%', volume: '34567890' },
    { ticker: 'PYPL', price: '62.14', changeAmount: '-3.71', changePercentage: '-5.62%', volume: '23456789' },
    { ticker: 'SNAP', price: '9.87', changeAmount: '-0.52', changePercentage: '-5.01%', volume: '89012345' }
  ]);

  constructor() {}
}
