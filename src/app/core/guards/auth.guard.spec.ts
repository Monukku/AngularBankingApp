import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { Store } from '@ngrx/store';
import { authGuard } from './auth.guard';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

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

describe('authGuard', () => {
  let keycloakService: jasmine.SpyObj<KeycloakService>;
  let router: jasmine.SpyObj<Router>;
  let store: jasmine.SpyObj<Store>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    const keycloakSpy = jasmine.createSpyObj('KeycloakService', ['isLoggedIn', 'login', 'loadUserProfile']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const storeSpy = jasmine.createSpyObj('Store', ['dispatch']);

    TestBed.configureTestingModule({
      providers: [
        { provide: KeycloakService, useValue: keycloakSpy },
        { provide: Router, useValue: routerSpy },
        { provide: Store, useValue: storeSpy },
      ],
    });

    keycloakService = TestBed.inject(KeycloakService) as jasmine.SpyObj<KeycloakService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    store = TestBed.inject(Store) as jasmine.SpyObj<Store>;

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/dashboard' } as RouterStateSnapshot;
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  // Add additional tests for your guard logic here
});

