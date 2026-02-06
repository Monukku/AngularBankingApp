import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardCreateComponent } from './card-create.component';

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
