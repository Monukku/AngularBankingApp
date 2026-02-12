import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '../reducers/auth.reducer';

// ✅ Select the auth feature state
export const selectAuthState = createFeatureSelector<AuthState>('auth');

// ✅ Select authenticated status
export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state: AuthState) => state.authenticated
);

// ✅ Select current user
export const selectCurrentUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.user
);

// ✅ Select loading state
export const selectAuthLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.loading
);

// ✅ Select error state
export const selectAuthError = createSelector(
  selectAuthState,
  (state: AuthState) => state.error
);