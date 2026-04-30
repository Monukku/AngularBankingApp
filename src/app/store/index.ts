// # Root state - Global + Feature States
// 
// Architecture Pattern:
// - Global States: Auth, Router (shared across all features)
// - Feature States: Cards, Loans, Transactions (isolated, lazy-loaded)
// 
// State composition: AppState = Global + Feature States

import { ActionReducerMap, ActionReducerFactory } from '@ngrx/store';
import { RouterReducerState, routerReducer } from '@ngrx/router-store';

// Global State
import { authReducer, AuthState } from './auth/auth.reducer';
import { RouterStateUrl } from './router/custom-router-serializer';

// Feature States
import { cardReducer, CardState } from './cards/card.reducer';
import { loanReducer, LoanState } from './loans/loan.reducer';
import { transactionReducer, TransactionState } from './transactions/transaction.reducer';

/**
 * Global App State Interface
 * Combines all global and feature states
 */
export interface AppState {
  // Global states
  auth: AuthState;
  router: RouterReducerState<RouterStateUrl>;

  // Feature states
  cards?: CardState;
  loans?: LoanState;
  transactions?: TransactionState;
}

/**
 * Root Reducers Map
 * All feature reducers are registered here
 */
export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  router: routerReducer,
  cards: cardReducer,
  loans: loanReducer,
  transactions: transactionReducer,
};