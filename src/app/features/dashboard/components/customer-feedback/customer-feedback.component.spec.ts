import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerFeedbackComponent } from './customer-feedback.component';

declare const expect: <T>(actual: T) => {
  toBe(expected: T): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeDefined(): void;
  toHaveBeenCalledWith(...args: any[]): void;
  toContain(expected: string): void;
  toBeGreaterThanOrEqual(expected: number): void;
  toEqual(expected: T): void;
};

describe('CustomerFeedbackComponent', () => {
  let component: CustomerFeedbackComponent;
  let fixture: ComponentFixture<CustomerFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerFeedbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

