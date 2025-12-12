import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HighchartsChartComponent } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { StockService } from '../../services/stock.service';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-stock-detail',
  standalone: true,
  imports: [CommonModule, HighchartsChartComponent, LucideAngularModule],
  templateUrl: '././stock-detail.component.html',
  styleUrl: './stock-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly stockService = inject(StockService);

  readonly ArrowLeft = ArrowLeft;
  
  ticker = signal<string>('');
  
  highcharts: typeof Highcharts = Highcharts;

  private timeSeriesData = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => {
        const ticker = params.get('ticker');
        if (ticker) {
          this.ticker.set(ticker);
          return this.stockService.getTimeSeriesDaily(ticker);
        }
        return of([]);
      })
    ),
    { initialValue: [] }
  );

  chartOptions = computed(() => {
    const data = this.timeSeriesData();
    
    if (data.length === 0) {
      return {};
    }

    const last30Days = data.slice(-30);
    
    const dates = last30Days.map(d => d.date);
    const prices = last30Days.map(d => parseFloat(d.close));

    return {
      title: {
        text: `${this.ticker()} - 30 Day Price History`
      },
      xAxis: {
        categories: dates,
        title: {
          text: 'Date'
        }
      },
      yAxis: {
        title: {
          text: 'Price (USD)'
        }
      },
      series: [{
        name: 'Close Price',
        data: prices,
        type: 'line',
        color: '#2563eb'
      }],
      credits: {
        enabled: false
      },
      legend: {
        enabled: false
      }
    } as Highcharts.Options;
  });

  loading = computed(() => {
    return this.timeSeriesData().length === 0;
  });
}