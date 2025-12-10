import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { StockDashboardComponent } from './stock-dashboard.component';
import { StockService } from '../../services/stock.service';
import { StockData } from '../../interfaces/StockData';

describe('StockDashboardComponent', () => {
  let component: StockDashboardComponent;
  let fixture: ComponentFixture<StockDashboardComponent>;
  let stockService: jasmine.SpyObj<StockService>;

  const mockStockData = {
    topGainers: [
      {
        ticker: 'AAPL',
        price: '185.50',
        change_amount: '12.30',
        change_percentage: '7.12%',
        volume: '52431242'
      },
      {
        ticker: 'TSLA',
        price: '242.84',
        change_amount: '15.62',
        change_percentage: '6.87%',
        volume: '98234156'
      },
      {
        ticker: 'MSFT',
        price: '378.91',
        change_amount: '8.45',
        change_percentage: '2.28%',
        volume: '23456789'
      },
      {
        ticker: 'GOOGL',
        price: '140.23',
        change_amount: '5.67',
        change_percentage: '4.21%',
        volume: '34567890'
      },
      {
        ticker: 'AMZN',
        price: '155.32',
        change_amount: '3.21',
        change_percentage: '2.11%',
        volume: '45678901'
      },
      {
        ticker: 'META',
        price: '345.67',
        change_amount: '2.10',
        change_percentage: '0.61%',
        volume: '56789012'
      }
    ] as StockData[],
    topLosers: [
      {
        ticker: 'INTC',
        price: '42.31',
        change_amount: '-3.82',
        change_percentage: '-8.24%',
        volume: '78234567'
      },
      {
        ticker: 'BA',
        price: '198.42',
        change_amount: '-14.63',
        change_percentage: '-6.85%',
        volume: '45678901'
      },
      {
        ticker: 'DIS',
        price: '91.23',
        change_amount: '-2.45',
        change_percentage: '-2.61%',
        volume: '34567890'
      },
      {
        ticker: 'NFLX',
        price: '456.78',
        change_amount: '-8.90',
        change_percentage: '-1.91%',
        volume: '23456789'
      },
      {
        ticker: 'PYPL',
        price: '67.89',
        change_amount: '-1.23',
        change_percentage: '-1.78%',
        volume: '12345678'
      },
      {
        ticker: 'UBER',
        price: '54.32',
        change_amount: '-0.98',
        change_percentage: '-1.77%',
        volume: '98765432'
      }
    ] as StockData[]
  };

  beforeEach(async () => {
    const stockServiceSpy = jasmine.createSpyObj('StockService', ['getTopGainersLosers']);
    stockServiceSpy.getTopGainersLosers.and.returnValue(of(mockStockData));

    await TestBed.configureTestingModule({
      imports: [StockDashboardComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: StockService, useValue: stockServiceSpy }
      ]
    }).compileComponents();

    stockService = TestBed.inject(StockService) as jasmine.SpyObj<StockService>;
    
    fixture = TestBed.createComponent(StockDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call stockService.getTopGainersLosers on initialization', () => {
    fixture.detectChanges();
    expect(stockService.getTopGainersLosers).toHaveBeenCalled();
  });

  it('should display loading spinner when no data is available', () => {
    stockService.getTopGainersLosers.and.returnValue(of({ topGainers: [], topLosers: [] }));
    fixture = TestBed.createComponent(StockDashboardComponent);
    fixture.detectChanges();

    const loadingSpinner = fixture.nativeElement.querySelector('.animate-spin');
    expect(loadingSpinner).toBeTruthy();
  });

  it('should display stock data when available', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const gainersSection = fixture.nativeElement.querySelector('[aria-labelledby="gainers-heading"]');
    const losersSection = fixture.nativeElement.querySelector('[aria-labelledby="losers-heading"]');

    expect(gainersSection).toBeTruthy();
    expect(losersSection).toBeTruthy();
  });

  it('should sort top gainers and top losers by change_amount in descending order', () => {
    fixture.detectChanges();

    const sortedGainers = component.topGainers();
    const sortedLosers = component.topLosers();
    
    expect(sortedGainers[0].ticker).toBe('TSLA');
    expect(sortedGainers[1].ticker).toBe('AAPL');
    expect(sortedGainers[2].ticker).toBe('MSFT');
    
    expect(sortedLosers[0].ticker).toBe('BA');
    expect(sortedLosers[1].ticker).toBe('NFLX');
    expect(sortedLosers[2].ticker).toBe('INTC');
  });

  it('should limit top gainers and top losers to 5 stocks', () => {
    fixture.detectChanges();

    const gainers = component.topGainers();
    const losers = component.topLosers();

    expect(gainers.length).toBe(5);
    expect(losers.length).toBe(5);
  });

  it('should display correct number of gainer list items and loser list items in the DOM', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const gainerItems = fixture.nativeElement.querySelectorAll('[aria-labelledby="gainers-heading"] li');
    const loserItems = fixture.nativeElement.querySelectorAll('[aria-labelledby="losers-heading"] li');

    expect(gainerItems.length).toBe(5);
    expect(loserItems.length).toBe(5);
  });

  it('should display information for gainers and losers', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const gainersHeading = fixture.nativeElement.querySelector('#gainers-heading');
    const firstGainerTicker = fixture.nativeElement.querySelector('[aria-labelledby="gainers-heading"] li:first-child h3');
    const firstGainerItem = fixture.nativeElement.querySelector('[aria-labelledby="gainers-heading"] li:first-child');
    const gainerPriceElement = firstGainerItem.querySelector('.text-right p.text-lg');
    const gainerChangeElement = firstGainerItem.querySelector('.text-green-900');
    const gainerPercentageSpan = firstGainerItem.querySelector('span[aria-label]');

    expect(gainersHeading.textContent).toContain('Top Gainers');
    expect(firstGainerTicker.textContent.trim()).toBe('TSLA');
    expect(gainerPriceElement.textContent).toContain('$242.84');
    expect(gainerChangeElement.textContent).toContain('+$15.62');
    expect(gainerChangeElement.textContent).toContain('(6.87%)');
    expect(gainerPercentageSpan.getAttribute('aria-label')).toBe('up 6.87%');

    const losersHeading = fixture.nativeElement.querySelector('#losers-heading');
    const firstLoserTicker = fixture.nativeElement.querySelector('[aria-labelledby="losers-heading"] li:first-child h3');
    const firstLoserItem = fixture.nativeElement.querySelector('[aria-labelledby="losers-heading"] li:first-child');
    const loserPriceElement = firstLoserItem.querySelector('.text-right p.text-lg');
    const loserChangeElement = firstLoserItem.querySelector('.text-red-900');
    const loserPercentageSpan = firstLoserItem.querySelector('span[aria-label]');

    expect(losersHeading.textContent).toContain('Top Losers');
    expect(firstLoserTicker.textContent.trim()).toBe('BA');
    expect(loserPriceElement.textContent).toContain('$198.42');
    expect(loserChangeElement.textContent).toContain('$-14.63');
    expect(loserChangeElement.textContent).toContain('(-6.85%)');
    expect(loserPercentageSpan.getAttribute('aria-label')).toBe('down -6.85%');
  })

  it('should have correct ARIA labels for accessibility', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const gainersHeading = fixture.nativeElement.querySelector('#gainers-heading');
    const losersHeading = fixture.nativeElement.querySelector('#losers-heading');
    const gainersSection = fixture.nativeElement.querySelector('[aria-labelledby="gainers-heading"]');
    const losersSection = fixture.nativeElement.querySelector('[aria-labelledby="losers-heading"]');

    expect(gainersHeading).toBeTruthy();
    expect(losersHeading).toBeTruthy();
    expect(gainersSection).toBeTruthy();
    expect(losersSection).toBeTruthy();
  });

  it('should have screen reader only text for prices', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const srOnlyElements = fixture.nativeElement.querySelectorAll('.sr-only');
    const srTexts = Array.from(srOnlyElements).map((el: any) => el.textContent);
    
    expect(srTexts).toContain('Current price:');
    expect(srTexts).toContain('Change:');
  });

  it('should display the page title', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toBe('Stock Market Dashboard');
  });

  it('should display the subtitle', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const subtitle = fixture.nativeElement.querySelector('header p');
    expect(subtitle.textContent).toBe('Real-time market movers');
  });

  it('should handle empty stock data gracefully', async () => {
    stockService.getTopGainersLosers.and.returnValue(of({ topGainers: [], topLosers: [] }));
    fixture = TestBed.createComponent(StockDashboardComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const gainers = fixture.componentInstance.topGainers();
    const losers = fixture.componentInstance.topLosers();

    expect(gainers.length).toBe(0);
    expect(losers.length).toBe(0);
  });
});