import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [
        provideZonelessChangeDetection()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct text', () => {
    const footerText = fixture.nativeElement.querySelector('footer p');
    const currentYear = new Date().getFullYear();

    expect(component.currentYear).toBe(currentYear);
    expect(footerText.textContent).toContain('©');
    expect(footerText.textContent).toContain(currentYear.toString());
    expect(footerText.textContent).toContain(component.yourName);
    expect(footerText.textContent).toContain('All rights reserved');
  });
});