import { createAction, props } from '@ngrx/store';
import { Transaction } from '../../features/transactions/models/transaction.model';
import { TransactionFilters, PaginationState } from './transaction.reducer';

export const loadTransactions = createAction(
  '[Transactions] Load Transactions'
);

export const loadTransactionsSuccess = createAction(
  '[Transactions] Load Transactions Success',
  props<{ transactions: Transaction[]; total: number }>()
);

export const loadTransactionsFailure = createAction(
  '[Transactions] Load Transactions Failure',
  props<{ error: string }>()
);

export const createTransaction = createAction(
  '[Transactions] Create Transaction',
  props<{ transaction: Omit<Transaction, 'id'> }>()
);

export const createTransactionSuccess = createAction(
  '[Transactions] Create Transaction Success',
  props<{ transaction: Transaction }>()
);

export const createTransactionFailure = createAction(
  '[Transactions] Create Transaction Failure',
  props<{ error: string }>()
);

export const selectTransaction = createAction(
  '[Transactions] Select Transaction',
  props<{ id: string }>()
);

export const clearSelectedTransaction = createAction(
  '[Transactions] Clear Selected Transaction'
);

export const setFilters = createAction(
  '[Transactions] Set Filters',
  props<{ filters: TransactionFilters }>()
);

export const clearFilters = createAction('[Transactions] Clear Filters');

export const setPage = createAction(
  '[Transactions] Set Page',
  props<{ pageIndex: number }>()
);

export const setPageSize = createAction(
  '[Transactions] Set Page Size',
  props<{ pageSize: number }>()
);
