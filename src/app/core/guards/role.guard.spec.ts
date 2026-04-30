/// <reference types="jasmine" />
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { roleGuard } from './role.guard';
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

describe('roleGuard', () => {
  let keycloakService: jasmine.SpyObj<KeycloakService>;
  let router: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    const keycloakSpy = jasmine.createSpyObj('KeycloakService', ['getUserRoles']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: KeycloakService, useValue: keycloakSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    keycloakService = TestBed.inject(KeycloakService) as jasmine.SpyObj<KeycloakService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    mockRoute = { data: { roles: ['admin'] } } as unknown as ActivatedRouteSnapshot;
    mockState = { url: '/admin' } as unknown as RouterStateSnapshot;
  });

  it('should be defined', () => {
    expect(roleGuard).toBeDefined();
  });

  // Add additional tests for your guard logic here
});

