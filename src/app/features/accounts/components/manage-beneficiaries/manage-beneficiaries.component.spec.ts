import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBeneficiariesComponent } from './manage-beneficiaries.component';

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

describe('ManageBeneficiariesComponent', () => {
  let component: ManageBeneficiariesComponent;
  let fixture: ComponentFixture<ManageBeneficiariesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageBeneficiariesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageBeneficiariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

