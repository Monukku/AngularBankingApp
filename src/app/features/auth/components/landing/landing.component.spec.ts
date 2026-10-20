import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [
        provideRouter([]),
        { provide: KeycloakService, useValue: jasmine.createSpyObj('KeycloakService', ['login', 'isLoggedIn']) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 3 stats', () => {
    expect(component.stats.length).toBe(3);
  });

  it('should display stats in the template', () => {
    expect(fixture.nativeElement.querySelectorAll('.stat').length).toBe(3);
  });

  it('should display feature cards in the template', () => {
    expect(fixture.nativeElement.querySelectorAll('.feature-card').length).toBeGreaterThan(0);
  });
});
