// import { Injectable } from '@angular/core';
// import { Actions, createEffect, ofType } from '@ngrx/effects';
// import { map } from 'rxjs/operators';
// import * as AuthActions from '../actions/auth.actions';
// import { KeycloakAuthService } from '../../authentication/services/KeyCloakAuthService';

// @Injectable()
// export class AuthEffects {
//   constructor(
//     private actions$: Actions,
//     private keycloakAuthService: KeycloakAuthService
//   ) {}

//   login$ = createEffect(() =>
//     this.actions$.pipe(
//       ofType(AuthActions.login),
//       map(() => {
//         this.keycloakAuthService.login();
//         return AuthActions.setAuthenticated({ authenticated: true });
//       })
//     )
//   );

//   logout$ = createEffect(() =>
//     this.actions$.pipe(
//       ofType(AuthActions.logout),
//       map(() => {
//         this.keycloakAuthService.logout();
//         return AuthActions.setAuthenticated({ authenticated: false });
//       })
//     )
//   );
// }

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs/operators';
import * as AuthActions from '../actions/auth.actions';
import { KeycloakAuthService } from '../../authentication/services/KeyCloakAuthService';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private keycloakAuthService: KeycloakAuthService
  ) {}

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(() => {
        return this.keycloakAuthService.login().then(() => {
          return AuthActions.setAuthenticated({ authenticated: true });
        });
      })
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() => {
        return this.keycloakAuthService.logout().then(() => {
          return AuthActions.setAuthenticated({ authenticated: false });
        });
      })
    )
  );
}
