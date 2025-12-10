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
  describe('getTopGainersLosers', () => {
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
  

  describe('getTimeSeriesDaily', () => {
    it('should fetch time series data in chronological order successfully', () => {
      const mockResponse = {
        'Meta Data': {
          '1. Information': 'Daily Prices',
          '2. Symbol': 'AAPL',
          '3. Last Refreshed': '2024-12-08',
          '4. Output Size': 'Compact',
          '5. Time Zone': 'US/Eastern'
        },
        'Time Series (Daily)': {
          '2024-12-08': {
            '1. open': '185.00',
            '2. high': '187.50',
            '3. low': '184.00',
            '4. close': '186.50',
            '5. volume': '52431242'
          },
          '2024-12-07': {
            '1. open': '183.00',
            '2. high': '185.00',
            '3. low': '182.50',
            '4. close': '184.75',
            '5. volume': '48234156'
          },
          '2024-12-06': {
            '1. open': '180.00',
            '2. high': '183.50',
            '3. low': '179.50',
            '4. close': '182.25',
            '5. volume': '45678901'
          }
        }
      };

      service.getTimeSeriesDaily('AAPL').subscribe({
        next: (result) => {
          expect(result.length).toBe(3);

          expect(result[0].date).toBe('2024-12-06');
          expect(result[0].open).toBe('180.00');
          expect(result[0].high).toBe('183.50');
          expect(result[0].low).toBe('179.50');
          expect(result[0].close).toBe('182.25');
          expect(result[0].volume).toBe('45678901');

          expect(result[1].date).toBe('2024-12-07');
          expect(result[1].open).toBe('183.00');
          expect(result[1].high).toBe('185.00');
          expect(result[1].low).toBe('182.50');
          expect(result[1].close).toBe('184.75');
          expect(result[1].volume).toBe('48234156');

          expect(result[2].date).toBe('2024-12-08');
          expect(result[2].open).toBe('185.00');
          expect(result[2].high).toBe('187.50');
          expect(result[2].low).toBe('184.00');
          expect(result[2].close).toBe('186.50');
          expect(result[2].volume).toBe('52431242');
        }
      });

      const expectedUrl = `${environment.apiBaseUrl}?function=TIME_SERIES_DAILY&symbol=AAPL&apikey=${environment.alphaVantageApiKey}`;
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return empty array when time series data is missing', () => {
      const mockResponse = {
        'Meta Data': {
          '1. Information': 'Daily Prices',
          '2. Symbol': 'INVALID',
          '3. Last Refreshed': '2024-12-08',
          '4. Output Size': 'Compact',
          '5. Time Zone': 'US/Eastern'
        }
      };

      service.getTimeSeriesDaily('INVALID').subscribe({
        next: (result) => {
          expect(result).toEqual([]);
        }
      });

      const expectedUrl = `${environment.apiBaseUrl}?function=TIME_SERIES_DAILY&symbol=INVALID&apikey=${environment.alphaVantageApiKey}`;
      const req = httpMock.expectOne(expectedUrl);
      req.flush(mockResponse);
    });

    it('should return empty array when API call fails', () => {
      const consoleErrorSpy = spyOn(console, 'error');

      service.getTimeSeriesDaily('AAPL').subscribe({
        next: (result) => {
          expect(result).toEqual([]);
          expect(consoleErrorSpy).toHaveBeenCalled();
        }
      });

      const expectedUrl = `${environment.apiBaseUrl}?function=TIME_SERIES_DAILY&symbol=AAPL&apikey=${environment.alphaVantageApiKey}`;
      const req = httpMock.expectOne(expectedUrl);
      
      req.error(new ProgressEvent('Network error'), {
        status: 500,
        statusText: 'Internal Server Error'
      });
    });
  });
});