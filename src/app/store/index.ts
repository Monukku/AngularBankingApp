import { ActionReducerMap } from '@ngrx/store';
import { RouterReducerState, routerReducer } from '@ngrx/router-store';
import { authReducer, AuthState } from './auth/auth.reducer';
import { RouterStateUrl } from './router/custom-router-serializer';

export interface AppState {
  auth: AuthState;
  router: RouterReducerState<RouterStateUrl>;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  router: routerReducer,
};
