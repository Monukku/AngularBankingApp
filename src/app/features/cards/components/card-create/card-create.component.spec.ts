import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardCreateComponent } from './card-create.component';

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

describe('CardCreateComponent', () => {
  let component: CardCreateComponent;
  let fixture: ComponentFixture<CardCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

