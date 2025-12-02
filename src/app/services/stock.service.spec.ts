import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { StockService } from './stock.service';
import { environment } from '../../environments/environment';

describe('StockService', () => {
  let service: StockService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(StockService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch top gainers and losers successfully', async () => {
    const mockResponse = {
      metadata: 'Top gainers, losers, and most actively traded US tickers',
      last_updated: '2024-12-02',
      top_gainers: [
        {
          ticker: 'AAPL',
          price: '185.50',
          change_amount: '12.30',
          change_percentage: '7.12%',
          volume: '52431242'
        }
      ],
      top_losers: [
        {
          ticker: 'INTC',
          price: '42.31',
          change_amount: '-3.82',
          change_percentage: '-8.24%',
          volume: '78234567'
        }
      ],
      most_actively_traded: []
    };

    service.getTopGainersLosers().subscribe({
      next: (result) => {
        expect(result.topGainers.length).toBe(1);
        expect(result.topGainers[0].ticker).toBe('AAPL');
        expect(result.topGainers[0].price).toBe('185.50');
        expect(result.topGainers[0].change_amount).toBe('12.30');
        expect(result.topGainers[0].change_percentage).toBe('7.12%');
        expect(result.topGainers[0].volume).toBe('52431242');

        expect(result.topLosers.length).toBe(1);
        expect(result.topLosers[0].ticker).toBe('INTC');
        expect(result.topLosers[0].price).toBe('42.31');
        expect(result.topLosers[0].change_amount).toBe('-3.82');
        expect(result.topLosers[0].change_percentage).toBe('-8.24%');
        expect(result.topLosers[0].volume).toBe('78234567');
      }
    });

    const expectedUrl = `${environment.apiBaseUrl}?function=TOP_GAINERS_LOSERS&apikey=${environment.alphaVantageApiKey}`;
    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should return empty arrays when API call fails', () => {
    const consoleErrorSpy = spyOn(console, 'error');

    service.getTopGainersLosers().subscribe({
      next: (result) => {
        expect(result.topGainers).toEqual([]);
        expect(result.topLosers).toEqual([]);
        expect(consoleErrorSpy).toHaveBeenCalled();
      }
    });

    const expectedUrl = `${environment.apiBaseUrl}?function=TOP_GAINERS_LOSERS&apikey=${environment.alphaVantageApiKey}`;
    const req = httpMock.expectOne(expectedUrl);
    
    req.error(new ProgressEvent('Network error'), {
      status: 500,
      statusText: 'Internal Server Error'
    });
  });
});