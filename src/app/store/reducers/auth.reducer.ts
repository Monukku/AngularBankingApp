// import { createReducer, on } from '@ngrx/store';
// import * as AuthActions from '../actions/auth.actions';

// export interface AuthState {
//   authenticated: boolean;
// }

// export const initialState: AuthState = {
//   authenticated: false,
// };

// export const authReducer = createReducer(
//   initialState,
//   on(AuthActions.setAuthenticated, (state, { authenticated }) => ({
//     ...state,
//     authenticated,
//   }))
// );

import { createReducer, on } from '@ngrx/store';
import * as AuthActions from '../actions/auth.actions';

export interface AuthState {
  authenticated: boolean;
}

export const initialState: AuthState = {
  authenticated: false,
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.setAuthenticated, (state, { authenticated }) => ({
    ...state,
    authenticated,
  }))
);
