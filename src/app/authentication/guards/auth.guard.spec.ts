import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { AuthGuard } from './auth.guard';

describe('AppAuthGuard', () => {
  let guard: AuthGuard;
  let keycloakService: KeycloakService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: KeycloakService, useValue: jasmine.createSpyObj('KeycloakService', ['isLoggedIn', 'login']) },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
      ],
    });

    guard = TestBed.inject(AuthGuard);
    keycloakService = TestBed.inject(KeycloakService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  // Add additional tests for your guard logic here
});
