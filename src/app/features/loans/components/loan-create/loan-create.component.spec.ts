import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanCreateComponent } from './loan-create.component';
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
describe('LoanCreateComponent', () => {
  let component: LoanCreateComponent;
  let fixture: ComponentFixture<LoanCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

