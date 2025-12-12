import { ComponentFixture, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { HeaderComponent } from './header.component';
import { StockService } from '../../services/stock.service';
import { SymbolSearchResult } from '../../interfaces/SymbolSerachResult';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let stockService: jasmine.SpyObj<StockService>;
  let router: jasmine.SpyObj<Router>;

  const mockSearchResults: SymbolSearchResult[] = [
    {
      '1. symbol': 'AAPL',
      '2. name': 'Apple Inc',
      '3. type': 'Equity',
      '4. region': 'United States',
      '5. marketOpen': '09:30',
      '6. marketClose': '16:00',
      '7. timezone': 'UTC-04',
      '8. currency': 'USD',
      '9. matchScore': '1.0000'
    },
    {
      '1. symbol': 'GOOGL',
      '2. name': 'Alphabet Inc',
      '3. type': 'Equity',
      '4. region': 'United States',
      '5. marketOpen': '09:30',
      '6. marketClose': '16:00',
      '7. timezone': 'UTC-04',
      '8. currency': 'USD',
      '9. matchScore': '0.8000'
    }
  ];

  beforeEach(async () => {
    const stockServiceSpy = jasmine.createSpyObj('StockService', ['searchSymbol']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    stockServiceSpy.searchSymbol.and.returnValue(of(mockSearchResults));

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: StockService, useValue: stockServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    stockService = TestBed.inject(StockService) as jasmine.SpyObj<StockService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display brand name, search input, and button', () => {
    const brandElement = fixture.nativeElement.querySelector('.text-2xl');
    const searchInput = fixture.nativeElement.querySelector('input[aria-label="Search for stocks"]');
    const button = fixture.nativeElement.querySelector('button[aria-label="View stock details"]');

    expect(brandElement.textContent.trim()).toBe('Market Insights');
    expect(searchInput).toBeTruthy();
    expect(searchInput.placeholder).toContain('Search stocks');
    expect(button).toBeTruthy();
    expect(button.textContent.trim()).toBe('View Details');
    expect(button.disabled).toBe(true);
  });

  it('should update searchQuery signal on input', () => {
    component.onSearchInput('apple');
    expect(component.searchQuery()).toBe('apple');
    expect(component.showDropdown()).toBe(true);
  });

  it('should show dropdown when input has value', () => {
    component.onSearchInput('apple');
    
  });

  it('should hide dropdown when input is empty', () => {
    component.onSearchInput('apple');
    expect(component.showDropdown()).toBe(true);
    
    component.onSearchInput('');
    expect(component.showDropdown()).toBe(false);
  });

  it('should clear selectedStock when typing', () => {
    component.selectedStock.set(mockSearchResults[0]);
    component.onSearchInput('test');
    expect(component.selectedStock()).toBeNull();
  });

  it('should select stock and update search query', () => {
    component.selectStock(mockSearchResults[0]);
    
    expect(component.selectedStock()).toEqual(mockSearchResults[0]);
    expect(component.searchQuery()).toBe('Apple Inc (AAPL)');
    expect(component.showDropdown()).toBe(false);
  });

  it('should enable View Details button when stock is selected', async () => {
    component.selectStock(mockSearchResults[0]);
    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('button[aria-label="View stock details"]');
    expect(button.disabled).toBe(false);
  });

  it('should navigate to stock detail when viewStockDetails is called', () => {
    component.selectedStock.set(mockSearchResults[0]);
    component.viewStockDetails();

    expect(router.navigate).toHaveBeenCalledWith(['/stock', 'AAPL']);
    expect(component.searchQuery()).toBe('');
    expect(component.selectedStock()).toBeNull();
  });

  it('should not navigate if no stock is selected', () => {
    component.selectedStock.set(null);
    component.viewStockDetails();

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should navigate to dashboard when brand is clicked', () => {
    const brandElement = fixture.nativeElement.querySelector('.text-2xl');
    brandElement.click();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should call navigateHome method', () => {
    component.navigateHome();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should close dropdown after delay', (done) => {
    component.showDropdown.set(true);
    component.closeDropdown();

    expect(component.showDropdown()).toBe(true);
    
    setTimeout(() => {
      expect(component.showDropdown()).toBe(false);
      done();
    }, 250);
  });

  it('should display search results in dropdown', async () => {
    component.onSearchInput('apple');
    component.showDropdown.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const dropdown = fixture.nativeElement.querySelector('.absolute.z-10');
    expect(dropdown).toBeTruthy();
  });

  it('should call searchSymbol after debounce when query has value', (done) => {
    component.onSearchInput('apple');
    
    expect(stockService.searchSymbol).not.toHaveBeenCalled();
    
    setTimeout(() => {
      expect(stockService.searchSymbol).toHaveBeenCalledWith('apple');
      done();
    }, 350);
  });

  it('should not call searchSymbol when query is empty or whitespace', (done) => {
    component.onSearchInput('   ');
    
    setTimeout(() => {
      expect(stockService.searchSymbol).not.toHaveBeenCalled();
      expect(component.searchResults()).toEqual([]);
      done();
    }, 350);
  });

  it('should handle empty query in switchMap', (done) => {
    (component as any).searchSubject.next('   ');
    
    setTimeout(() => {
      expect(stockService.searchSymbol).not.toHaveBeenCalled();
      done();
    }, 350);
  });
});