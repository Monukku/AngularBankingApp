import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';

// Actions
import * as RouterActions from '../actions/router.actions'; 

/**
 * ✅ ROUTER EFFECTS
 */
@Injectable()
export class RouterEffects {
  private readonly actions$ = inject(Actions);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  /**
   * ✅ Navigate
   */
  navigate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(RouterActions.navigate),
        tap(({ path, extras }) => {
          this.router.navigate([path], extras);
        })
      ),
    { dispatch: false }
  );

  /**
   * ✅ Navigate By URL
   */
  navigateByUrl$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(RouterActions.navigateByUrl),
        tap(({ url }) => {
          this.router.navigateByUrl(url);
        })
      ),
    { dispatch: false }
  );

  /**
   * ✅ Back
   */
  back$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(RouterActions.back),
        tap(() => {
          this.location.back();
        })
      ),
    { dispatch: false }
  );

  /**
   * ✅ Forward
   */
  forward$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(RouterActions.forward),
        tap(() => {
          this.location.forward();
        })
      ),
    { dispatch: false }
  );
}