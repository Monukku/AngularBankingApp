import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { KeycloakService } from 'keycloak-angular';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let keycloak: jasmine.SpyObj<KeycloakService>;
  let store: jasmine.SpyObj<Store>;

  const run = (url = '/transactions/list') =>
    TestBed.runInInjectionContext(() => authGuard({} as any, { url } as any));

  const configure = (platform: 'browser' | 'server') => {
    keycloak = jasmine.createSpyObj('KeycloakService', ['isLoggedIn', 'login', 'loadUserProfile']);
    store = jasmine.createSpyObj('Store', ['dispatch']);
    TestBed.configureTestingModule({
      providers: [
        { provide: KeycloakService, useValue: keycloak },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: Store, useValue: store },
        { provide: PLATFORM_ID, useValue: platform },
      ],
    });
  };

  it('blocks during server-side rendering', async () => {
    configure('server');
    expect(await run()).toBeFalse();
    expect(keycloak.isLoggedIn).not.toHaveBeenCalled();
  });

  it('sends anonymous users to the Keycloak login', async () => {
    configure('browser');
    (keycloak.isLoggedIn as jasmine.Spy).and.resolveTo(false);
    keycloak.login.and.resolveTo();
    expect(await run()).toBeFalse();
    expect(keycloak.login).toHaveBeenCalled();
  });

  it('allows logged-in users and syncs the profile', async () => {
    configure('browser');
    (keycloak.isLoggedIn as jasmine.Spy).and.resolveTo(true);
    keycloak.loadUserProfile.and.resolveTo({ username: 'user' } as any);
    expect(await run()).toBeTrue();
    expect(store.dispatch).toHaveBeenCalledTimes(2);
  });
});
