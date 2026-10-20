import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { KeycloakService } from 'keycloak-angular';

function createKeycloakStub() {
  const stub = jasmine.createSpyObj('KeycloakService', [
    'isLoggedIn', 'login', 'logout', 'loadUserProfile', 'getUserRoles',
    'updateToken', 'getToken', 'getUsername', 'getKeycloakInstance',
  ]);
  stub.getUserRoles.and.returnValue([]);
  stub.getKeycloakInstance.and.returnValue({});
  return stub;
}

/**
 * Picked up by Karma as a spec file, so this top-level beforeEach runs for every spec.
 * It supplies the app-wide providers (HTTP, router, store, Keycloak) that components and
 * services expect, so each spec only configures what is specific to it. Providers a spec
 * sets itself are merged afterwards and take precedence.
 */
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
      provideNoopAnimations(),
      provideMockStore(),
      { provide: KeycloakService, useFactory: createKeycloakStub },
    ],
  });
});
