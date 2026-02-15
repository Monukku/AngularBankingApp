import { createAction, props } from '@ngrx/store';
import { NavigationExtras } from '@angular/router';

/**
 * ✅ ROUTER ACTIONS
 */

export const navigate = createAction(
  '[Router] Navigate',
  props<{ path: string; extras?: NavigationExtras }>()
);

export const navigateByUrl = createAction(
  '[Router] Navigate By URL',
  props<{ url: string }>()
);

export const back = createAction('[Router] Back');

export const forward = createAction('[Router] Forward');