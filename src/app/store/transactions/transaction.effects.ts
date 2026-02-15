import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, switchMap, catchError, tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import * as TransactionActions from './transaction.actions';
import { TransactionService } from '../../features/accounts/services/transaction.service';
import { LoggerService } from '../../core/services/logger.service';

@Injectable()
export class TransactionEffects {
  private readonly actions$ = inject(Actions);
  private readonly transactionService = inject(TransactionService);
  private readonly logger = inject(LoggerService);

  /**
   * Load transactions with debouncing for filters
   * Uses switchMap with debounceTime to prevent excessive API calls during filter changes
   */
  loadTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        TransactionActions.loadTransactions,
        TransactionActions.setFilters,
        TransactionActions.setPage,
        TransactionActions.setPageSize
      ),
      debounceTime(300), // Wait 300ms after last action
      distinctUntilChanged(), // Only if the source value has changed
      switchMap(() =>
        this.transactionService.getTransactionHistory().pipe(
          map((response) => {
            const transactions = Array.isArray(response) ? response : (response as any).transactions || [];
            return TransactionActions.loadTransactionsSuccess({
              transactions,
              total: transactions.length,
            });
          }),
          tap(() => this.logger.debug('Transactions loaded successfully')),
          catchError((error) => {
            this.logger.error('Load transactions failed', error);
            return of(
              TransactionActions.loadTransactionsFailure({
                error: error?.message || 'Failed to load transactions',
              })
            );
          })
        )
      )
    )
  );

  /**
   * Create transaction (e.g., transfer funds)
   * Uses switchMap: Latest transfer request wins
   */
  createTransaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionActions.createTransaction),
      switchMap(({ transaction }) =>
        this.transactionService.transferFunds(
          transaction.accountNumber || '',
          (transaction as any).toAccountNumber || '',
          transaction.amount || 0
        ).pipe(
          map((newTransaction) =>
            TransactionActions.createTransactionSuccess({
              transaction: newTransaction,
            })
          ),
          tap(() => {
            this.logger.debug('Transaction created successfully');
          }),
          catchError((error) => {
            this.logger.error('Create transaction failed', error);
            return of(
              TransactionActions.createTransactionFailure({
                error: error?.message || 'Failed to create transaction',
              })
            );
          })
        )
      )
    )
  );
}
