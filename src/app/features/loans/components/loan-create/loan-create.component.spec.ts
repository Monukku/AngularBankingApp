import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanCreateComponent } from './loan-create.component';

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
