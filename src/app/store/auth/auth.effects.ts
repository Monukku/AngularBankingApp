// import { Injectable } from '@angular/core';
// import { Actions, createEffect, ofType } from '@ngrx/effects';
// import { map, switchMap, catchError, tap } from 'rxjs/operators';
// import { of } from 'rxjs';
// import * as AuthActions from '../actions/auth.actions';
// import { AuthService } from '../../authentication/services/auth.service';
// import { LoggerService } from '../../core/services/logger.service';
// import { Router } from '@angular/router';

// /**
//  * Auth Effects - Handle side effects for authentication
//  * Manages login, logout, token refresh, and user loading
//  */
// @Injectable()
// export class AuthEffects {
//   login$ = createEffect(() =>
//     this.actions$.pipe(
//       ofType(AuthActions.login),
//       switchMap(() =>
//         from(this.authService.login()).pipe(
//           switchMap(() => from(this.authService.loadUserProfile())),
//           map((user) => AuthActions.loginSuccess({ user })),
//           catchError((error) => {
//             this.logger.error('Login effect failed', error);
//             return of(
//               AuthActions.loginFailure({
//                 error: error.message || 'Login failed',
//               })
//             );
//           })
//         )
//       )
//     )
//   );

//   logout$ = createEffect(() =>
//     this.actions$.pipe(
//       ofType(AuthActions.logout),
//       switchMap(() =>
//         from(this.authService.logout()).pipe(
//           map(() => AuthActions.logoutSuccess()),
//           catchError((error) => {
//             this.logger.error('Logout effect failed', error);
//             return of(
//               AuthActions.logoutFailure({
//                 error: error.message || 'Logout failed',
//               })
//             );
//           })
//         )
//       )
//     )
//   );

//   loadUser$ = createEffect(() =>
//     this.actions$.pipe(
//       ofType(AuthActions.loadUser),
//       switchMap(() =>
//         from(this.authService.loadUserProfile()).pipe(
//           map((user) => AuthActions.loadUserSuccess({ user })),
//           catchError((error) => {
//             this.logger.error('Load user effect failed', error);
//             return of(
//               AuthActions.loadUserFailure({
//                 error: error.message || 'Failed to load user',
//               })
//             );
//           })
//         )
//       )
//     )
//   );

//   refreshToken$ = createEffect(() =>
//     this.actions$.pipe(
//       ofType(AuthActions.refreshToken),
//       switchMap(() =>
//         from(this.authService.getToken()).pipe(
//           map((token) => AuthActions.refreshTokenSuccess({ token })),
//           catchError((error) => {
//             this.logger.error('Token refresh effect failed', error);
//             return of(
//               AuthActions.refreshTokenFailure({
//                 error: error.message || 'Token refresh failed',
//               })
//             );
//           })
//         )
//       )
//     )
//   );


//   loginSuccessNavigate$ = createEffect(
//   () =>
//     this.actions$.pipe(
//       ofType(AuthActions.loginSuccess),
//       tap(() => {
//         this.router.navigate(['/dashboard']);
//       })
//     ),
//   { dispatch: false }
// );


//   constructor(
//     private actions$: Actions,
//     private authService: AuthService,
//     private logger: LoggerService,
//     private router: Router
//   ) {}
// }

// // Import required for type safety
// import { from } from 'rxjs';


import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { of, from } from 'rxjs';
import * as AuthActions from './auth.actions';
import { AuthService } from '../../core/services/auth.service';
import { LoggerService } from '../../core/services/logger.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthEffects {
  // ✅ Login effect - triggers Keycloak login
  login$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.login),
        tap(() => {
          // ✅ This will redirect to Keycloak login page
          this.authService.login('/dashboard');
        })
      ),
    { dispatch: false } // ✅ No action dispatched, just side effect
  );

  // ✅ Logout effect
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() =>
        from(this.authService.logout()).pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError((error) => {
            this.logger.error('Logout effect failed', error);
            return of(
              AuthActions.logoutFailure({
                error: error.message || 'Logout failed',
              })
            );
          })
        )
      )
    )
  );

  // ✅ Load user effect
  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUser),
      switchMap(() =>
        from(this.authService.loadUserProfile()).pipe(
          map((user) => AuthActions.loadUserSuccess({ user })),
          catchError((error) => {
            this.logger.error('Load user effect failed', error);
            return of(
              AuthActions.loadUserFailure({
                error: error.message || 'Failed to load user',
              })
            );
          })
        )
      )
    )
  );

  // ✅ Refresh token effect
  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      switchMap(() =>
        from(this.authService.getToken()).pipe(
          map((token) => AuthActions.refreshTokenSuccess({ token })),
          catchError((error) => {
            this.logger.error('Token refresh effect failed', error);
            return of(
              AuthActions.refreshTokenFailure({
                error: error.message || 'Token refresh failed',
              })
            );
          })
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private logger: LoggerService,
    private router: Router
  ) {}
}


