import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LucideAngularModule, TrendingUp, TrendingDown } from 'lucide-angular';
import { StockService } from '../../services/stock.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stock-dashboard',
  imports: [LucideAngularModule],
  templateUrl: './stock-dashboard.component.html',
  styleUrl: './stock-dashboard.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockDashboardComponent {
  private readonly stockService = inject(StockService);
  private readonly router = inject(Router);
  
  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;

  private stockData = toSignal(this.stockService.getTopGainersLosers(), {
    initialValue: { topGainers: [], topLosers: [] }
  });

  topGainers = computed(() => {
    return [...this.stockData().topGainers]
      .sort((a, b) => parseFloat(b.change_amount) - parseFloat(a.change_amount))
      .slice(0, 5);
  });

  topLosers = computed(() => {
    return [...this.stockData().topLosers]
      .sort((a, b) => parseFloat(a.change_amount) - parseFloat(b.change_amount))
      .slice(0, 5);
  });

  navigateToDetail(ticker: string): void {
    this.router.navigate(['/stock', ticker]);
  }
}
