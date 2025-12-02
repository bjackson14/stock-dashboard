import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, map, Observable, of } from 'rxjs';
import { StockData } from '../interfaces/StockData';
import { AlphaVantageTopGainersLosersResponse } from '../interfaces/AlphaVantageTopGainersLosersResponse';

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
}
