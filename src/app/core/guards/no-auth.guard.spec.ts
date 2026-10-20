import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { noAuthGuard } from './no-auth.guard';

describe('noAuthGuard', () => {
  let keycloak: jasmine.SpyObj<KeycloakService>;
  let router: jasmine.SpyObj<Router>;

  const run = () => TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));

  beforeEach(() => {
    keycloak = jasmine.createSpyObj('KeycloakService', ['isLoggedIn']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        { provide: KeycloakService, useValue: keycloak },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('allows anonymous users', async () => {
    (keycloak.isLoggedIn as jasmine.Spy).and.resolveTo(false);
    expect(await run()).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('redirects logged-in users to the dashboard', async () => {
    (keycloak.isLoggedIn as jasmine.Spy).and.resolveTo(true);
    expect(await run()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
