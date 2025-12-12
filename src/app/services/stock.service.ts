import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, map, Observable, of } from 'rxjs';
import { StockData } from '../interfaces/StockData';
import { AlphaVantageTopGainersLosersResponse } from '../interfaces/AlphaVantageTopGainersLosersResponse';
import { TimeSeriesDataPoint } from '../interfaces/TimeSeriesDataPoint';
import { AlphaVantageTimeSeriesResponse } from '../interfaces/AlphaVantageTimeSeriesResponse';
import { AlphaVantageSymbolSearchResponse } from '../interfaces/AlphaVantageSymboleSearcgResponse';
import { SymbolSearchResult } from '../interfaces/SymbolSerachResult';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  private http = inject(HttpClient);
  private apiKey = environment.alphaVantageApiKey;
  private baseUrl = environment.apiBaseUrl;

  getTopGainersLosers(): Observable<{ topGainers: StockData[], topLosers: StockData[] }> {
    const url = `${this.baseUrl}?function=TOP_GAINERS_LOSERS&apikey=${this.apiKey}`;
    
    return this.http.get<AlphaVantageTopGainersLosersResponse>(url).pipe(
      map(response => ({
        topGainers: response.top_gainers,
        topLosers: response.top_losers
      })),
      catchError(error => {
        console.error('Error fetching stock data:', error);
        return of({ topGainers: [], topLosers: [] });
      })
    );
  }

  getTimeSeriesDaily(symbol: string): Observable<TimeSeriesDataPoint[]> {
    const url = `${this.baseUrl}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${this.apiKey}`;


    return this.http.get<AlphaVantageTimeSeriesResponse>(url).pipe(
      map(response => {
        const timeSeries = response['Time Series (Daily)'];
        if (!timeSeries) {
          return [];
        }

        return Object.entries(timeSeries).map(([date, values]) => ({
          date,
          open: values['1. open'],
          high: values['2. high'],
          low: values['3. low'],
          close: values['4. close'],
          volume: values['5. volume']
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }),
      catchError(error => {
        console.error('Error fetching time series data:', error);
        return of([])
      })
    );
  }

  searchSymbol(keywords: string): Observable<SymbolSearchResult[]> {
    if (!keywords || keywords.trim().length === 0) {
      return of([]);
    }

    const url = `${this.baseUrl}?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${this.apiKey}`;
    
    return this.http.get<AlphaVantageSymbolSearchResponse>(url).pipe(
      map(response => response.bestMatches || []),
      catchError(error => {
        console.error('Error searching symbols:', error);
        return of([]);
      })
    );
  }
}
