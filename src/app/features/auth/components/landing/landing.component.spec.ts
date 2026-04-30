/// <reference types="jasmine" />
import 'jasmine';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingComponent } from './landing.component';
import { Router, ActivatedRoute } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

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

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;
  let router: jasmine.SpyObj<Router>;
  let keycloakService: jasmine.SpyObj<KeycloakService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    keycloakService = jasmine.createSpyObj('KeycloakService', ['login']);
    activatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: jasmine.createSpyObj('ActivatedRouteSnapshot', [], {
        queryParams: {}
      })
    });

    await TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: KeycloakService, useValue: keycloakService },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 6 features', () => {
    expect(component.features.length).toBe(6);
  });

  it('should have 3 stats', () => {
    expect(component.stats.length).toBe(3);
  });

  it('should navigate to login when navigateToLogin is called', () => {
    component.navigateToLogin();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should navigate to register when navigateToRegister is called', () => {
    component.navigateToRegister();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/register']);
  });

  it('should display all features in the template', () => {
    const compiled = fixture.nativeElement;
    const featureCards = compiled.querySelectorAll('.feature-card');
    expect(featureCards.length).toBe(6);
  });

  it('should display stats in the template', () => {
    const compiled = fixture.nativeElement;
    const statsItems = compiled.querySelectorAll('.stat-item');
    expect(statsItems.length).toBe(3);
  });
});


