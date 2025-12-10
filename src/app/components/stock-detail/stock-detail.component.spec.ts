import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHighcharts } from 'highcharts-angular';
import { of } from 'rxjs';
import { StockDetailComponent } from './stock-detail.component';
import { StockService } from '../../services/stock.service';
import { TimeSeriesDataPoint } from '../../interfaces/TimeSeriesDataPoint';

describe('StockDetailComponent', () => {
  let component: StockDetailComponent;
  let fixture: ComponentFixture<StockDetailComponent>;
  let stockService: jasmine.SpyObj<StockService>;
  let router: jasmine.SpyObj<Router>;

  const mockTimeSeriesData: TimeSeriesDataPoint[] = [
    {
      date: '2024-11-08',
      open: '180.00',
      high: '183.50',
      low: '179.50',
      close: '182.25',
      volume: '45678901'
    },
    {
      date: '2024-11-09',
      open: '183.00',
      high: '185.00',
      low: '182.50',
      close: '184.75',
      volume: '48234156'
    },
    {
      date: '2024-11-10',
      open: '185.00',
      high: '187.50',
      low: '184.00',
      close: '186.50',
      volume: '52431242'
    }
  ];

  // ✅ Helper function to create component with custom mock data
  function createFreshComponent(mockData: TimeSeriesDataPoint[]): void {
    stockService.getTimeSeriesDaily.and.returnValue(of(mockData));
    fixture = TestBed.createComponent(StockDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    const stockServiceSpy = jasmine.createSpyObj('StockService', ['getTimeSeriesDaily']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    stockServiceSpy.getTimeSeriesDaily.and.returnValue(of(mockTimeSeriesData));

    await TestBed.configureTestingModule({
      imports: [StockDetailComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideHighcharts(),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: (key: string) => key === 'ticker' ? 'AAPL' : null
            })
          }
        },
        { provide: StockService, useValue: stockServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    stockService = TestBed.inject(StockService) as jasmine.SpyObj<StockService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(StockDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should extract ticker from route params on init and call service with ticker', () => {
    fixture.detectChanges();
    
    expect(component.ticker()).toBe('AAPL');
    expect(stockService.getTimeSeriesDaily).toHaveBeenCalledWith('AAPL');
  });

  it('should set loading to false when data is loaded', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.loading()).toBe(false);
  });

  it('should show loading spinner when data is empty', () => {
    createFreshComponent([]);

    const loadingSpinner = fixture.nativeElement.querySelector('.animate-spin');
    expect(loadingSpinner).toBeTruthy();
  });

  it('should display chart with correct chart options when data is available', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const chartElement = fixture.nativeElement.querySelector('highcharts-chart');
    const chartOptions = component.chartOptions();
    const series = chartOptions.series?.[0] as any;
    const xAxis = chartOptions.xAxis as any;

    expect(chartElement).toBeTruthy();
    expect(chartOptions.title?.text).toBe('AAPL - 30 Day Price History');
    expect(chartOptions.credits?.enabled).toBe(false);
    expect(chartOptions.legend?.enabled).toBe(false);
    expect(series.name).toBe('Close Price');
    expect(series.type).toBe('line');
    expect(series.color).toBe('#2563eb');
    expect(typeof series.data[0]).toBe('number');
    expect(typeof series.data[1]).toBe('number');
    expect(typeof series.data[2]).toBe('number');
    expect(series.data).toEqual([182.25, 184.75, 186.50]);
    expect(xAxis.categories).toEqual(['2024-11-08', '2024-11-09', '2024-11-10']);
  });

  it('should use last 30 days of data for chart', async () => {
    const mockLargeDataSet: TimeSeriesDataPoint[] = [];
    for (let i = 0; i < 50; i++) {
      mockLargeDataSet.push({
        date: `2024-10-${String(i + 1).padStart(2, '0')}`,
        open: '100.00',
        high: '105.00',
        low: '99.00',
        close: '102.00',
        volume: '1000000'
      });
    }

    createFreshComponent(mockLargeDataSet);
    await fixture.whenStable();

    const chartOptions = component.chartOptions();
    const seriesData = (chartOptions.series?.[0] as any)?.data;
    
    expect(seriesData?.length).toBe(30);
  });

  it('should handle empty time series data gracefully', () => {
    createFreshComponent([]);

    const chartOptions = component.chartOptions();
    expect(chartOptions).toEqual({});
  });

  it('should display page header', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const title = fixture.nativeElement.querySelector('h1');
    const subtitle = fixture.nativeElement.querySelector('header p');
    const backButton = fixture.nativeElement.querySelector('button[aria-label="Go back to dashboard"]');
    
    expect(title.textContent).toContain('AAPL Stock Details');
    expect(subtitle.textContent).toBe('30-day price history');
    expect(backButton).toBeTruthy();
    expect(backButton.textContent).toContain('Back to Dashboard');
  });

  it('should navigate back to dashboard when goBack is called', () => {
    component.goBack();
    
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should call goBack when back button is clicked', async () => {
    spyOn(component, 'goBack');
    fixture.detectChanges();
    await fixture.whenStable();

    const backButton = fixture.nativeElement.querySelector('button[aria-label="Go back to dashboard"]');
    backButton.click();

    expect(component.goBack).toHaveBeenCalled();
  });
});