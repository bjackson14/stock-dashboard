import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StockService } from '../../services/stock.service';
import { SymbolSearchResult } from '../../interfaces/SymbolSerachResult';
import { debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
private readonly router = inject(Router);
  private readonly stockService = inject(StockService);

  searchQuery = signal<string>('');
  showDropdown = signal<boolean>(false);
  selectedStock = signal<SymbolSearchResult | null>(null);
  
  private searchSubject = new Subject<string>();
  
  searchResults = toSignal(
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.trim().length === 0) {
          return of([]);
        }
        return this.stockService.searchSymbol(query);
      })
    ),
    { initialValue: [] as SymbolSearchResult[] }
  );

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.selectedStock.set(null);
    if (value.trim().length > 0) {
      this.showDropdown.set(true);
      this.searchSubject.next(value);
    } else {
      this.showDropdown.set(false);
    }
  }

  selectStock(result: SymbolSearchResult): void {
    this.selectedStock.set(result);
    this.searchQuery.set(`${result['2. name']} (${result['1. symbol']})`);
    this.showDropdown.set(false);
  }

  viewStockDetails(): void {
    const stock = this.selectedStock();
    if (stock) {
      this.router.navigate(['/stock', stock['1. symbol']]);
      this.searchQuery.set('');
      this.selectedStock.set(null);
    }
  }

  closeDropdown(): void {
    setTimeout(() => {
      this.showDropdown.set(false);
    }, 200);
  }

  navigateHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
