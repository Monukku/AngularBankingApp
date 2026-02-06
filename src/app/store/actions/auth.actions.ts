import { createAction, props } from '@ngrx/store';

export const login = createAction('[Auth] Login');
export const logout = createAction('[Auth] Logout');
export const setAuthenticated = createAction(
  '[Auth] Set Authenticated',
  props<{ authenticated: boolean }>()
);
