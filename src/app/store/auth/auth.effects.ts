import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { of, from } from 'rxjs';
import * as AuthActions from './auth.actions';
import { AuthService } from '../../core/services/auth.service';
import { LoggerService } from '../../core/services/logger.service';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly logger = inject(LoggerService);

  login$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.login),
        tap(() => {
          this.authService.login('/dashboard');
        })
      ),
    { dispatch: false }
  );

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
}
