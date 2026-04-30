import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferFundsComponent } from './transfer.component';

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

describe('TransferFundsComponent', () => {
  let component: TransferFundsComponent;
  let fixture: ComponentFixture<TransferFundsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferFundsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferFundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

