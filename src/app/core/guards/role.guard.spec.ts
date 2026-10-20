import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  let keycloak: jasmine.SpyObj<KeycloakService>;
  let router: jasmine.SpyObj<Router>;

  const run = (roles?: string[]) =>
    TestBed.runInInjectionContext(() =>
      roleGuard({ data: { roles } } as unknown as ActivatedRouteSnapshot, {} as any));

  beforeEach(() => {
    keycloak = jasmine.createSpyObj('KeycloakService', ['updateToken', 'getUserRoles']);
    keycloak.updateToken.and.resolveTo(true);
    router = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        { provide: KeycloakService, useValue: keycloak },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('allows routes without required roles', async () => {
    expect(await run()).toBeTrue();
  });

  it('allows a user who has one of the roles', async () => {
    keycloak.getUserRoles.and.returnValue(['CUSTOMER']);
    expect(await run(['CUSTOMER', 'SUPER_ADMIN'])).toBeTrue();
  });

  it('redirects a user without the role', async () => {
    keycloak.getUserRoles.and.returnValue(['CUSTOMER']);
    spyOn(console, 'warn');
    expect(await run(['SUPER_ADMIN'])).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/unauthorized']);
  });

  it('blocks when the token cannot be refreshed', async () => {
    keycloak.updateToken.and.rejectWith(new Error('expired'));
    expect(await run(['CUSTOMER'])).toBeFalse();
  });
});
