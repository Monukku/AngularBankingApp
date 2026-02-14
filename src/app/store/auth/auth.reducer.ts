import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';

export interface AuthState {
  authenticated: boolean;
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  authenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,
  // Set authenticated
  on(AuthActions.setAuthenticated, (state, { authenticated }) => ({
    ...state,
    authenticated,
  })),

  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.loginSuccess, (state, { user }) => ({
    ...state,
    authenticated: true,
    user,
    loading: false,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    authenticated: false,
    user: null,
    loading: false,
    error,
  })),

  // Logout
  on(AuthActions.logout, (state) => ({
    ...state,
    loading: true,
  })),
  on(AuthActions.logoutSuccess, (state) => ({
    ...state,
    authenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null,
  })),
  on(AuthActions.logoutFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Load user
  on(AuthActions.loadUser, (state) => ({
    ...state,
    loading: true,
  })),
  on(AuthActions.loadUserSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    error: null,
  })),
  on(AuthActions.loadUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Refresh token
  on(AuthActions.refreshToken, (state) => ({
    ...state,
    loading: true,
  })),
  on(AuthActions.refreshTokenSuccess, (state, { token }) => ({
    ...state,
    token,
    loading: false,
    error: null,
  })),
  on(AuthActions.refreshTokenFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);
