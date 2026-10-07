// core/providers/state.providers.ts
import { isDevMode } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import {
  NavigationActionTiming,
  provideRouterStore,
  routerReducer,
  RouterState,
} from '@ngrx/router-store';
import { authReducer } from '../../store/auth/auth.reducer';
import { AuthEffects } from '../../store/auth/auth.effects';
import { cardReducer } from '../../store/cards/card.reducer';
import { CardEffects } from '../../store/cards/card.effects';
import { loanReducer } from '../../store/loans/loan.reducer';
import { LoanEffects } from '../../store/loans/loan.effects';
import { transactionReducer } from '../../store/transactions/transaction.reducer';
import { TransactionEffects } from '../../store/transactions/transaction.effects';
import { CustomRouterSerializer } from '../../store/router/custom-router-serializer';

export function provideStateManagement() {
  return [
    provideStore({
      auth: authReducer,
      router: routerReducer,
      cards: cardReducer,
      loans: loanReducer,
      transactions: transactionReducer,
    }),
    provideEffects([AuthEffects, CardEffects, LoanEffects, TransactionEffects]),
    provideRouterStore({
      serializer: CustomRouterSerializer,
      navigationActionTiming: NavigationActionTiming.PostActivation,
      routerState: RouterState.Minimal,
    }),
    ...(isDevMode()
      ? [
          provideStoreDevtools({
            maxAge: 25,
            logOnly: false,
            autoPause: true,
            trace: false,
            traceLimit: 75,
            connectInZone: true,
          }),
        ]
      : []),
  ];
}