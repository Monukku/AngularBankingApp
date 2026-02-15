// # Global state (auth only)
import { createAction, props } from '@ngrx/store';
import { UserProfile } from '../../core/models/user.model';

// Login actions
export const login = createAction('[Auth] Login');
export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: UserProfile }>()
);
export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// Logout actions
export const logout = createAction('[Auth] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');
export const logoutFailure = createAction(
  '[Auth] Logout Failure',
  props<{ error: string }>()
);

// Authentication status actions
export const setAuthenticated = createAction(
  '[Auth] Set Authenticated',
  props<{ authenticated: boolean }>()
);

// Load user actions
export const loadUser = createAction('[Auth] Load User');
export const loadUserSuccess = createAction(
  '[Auth] Load User Success',
  props<{ user: UserProfile }>()
);
export const loadUserFailure = createAction(
  '[Auth] Load User Failure',
  props<{ error: string }>()
);

// Token actions
export const refreshToken = createAction('[Auth] Refresh Token');
export const refreshTokenSuccess = createAction(
  '[Auth] Refresh Token Success',
  props<{ token: string }>()
);
export const refreshTokenFailure = createAction(
  '[Auth] Refresh Token Failure',
  props<{ error: string }>()
);
