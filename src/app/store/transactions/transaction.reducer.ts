import { createReducer, on, Action } from '@ngrx/store';
import { EntityAdapter, EntityState, createEntityAdapter } from '@ngrx/entity';
import { Transaction } from '../../features/transactions/models/transaction.model';
import * as TransactionActions from './transaction.actions';

export interface TransactionState extends EntityState<Transaction> {
  selectedTransactionId: string | null;
  loading: boolean;
  error: string | null;
  filters: TransactionFilters;
  pagination: PaginationState;
}

export interface TransactionFilters {
  type?: string;
  status?: string;
  accountId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
  total: number;
}

export const transactionAdapter: EntityAdapter<Transaction> =
  createEntityAdapter<Transaction>({
    selectId: (transaction: Transaction) => transaction.id,
    sortComparer: (a: Transaction, b: Transaction) =>
      new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
  });

export const initialState: TransactionState = transactionAdapter.getInitialState({
  selectedTransactionId: null,
  loading: false,
  error: null,
  filters: {},
  pagination: {
    pageIndex: 0,
    pageSize: 20,
    total: 0,
  },
});

const transactionReducerImpl = createReducer(
  initialState,

  // Load transactions
  on(TransactionActions.loadTransactions, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(TransactionActions.loadTransactionsSuccess, (state, { transactions, total }) =>
    transactionAdapter.setAll(transactions, {
      ...state,
      loading: false,
      error: null,
      pagination: {
        ...state.pagination,
        total,
      },
    })
  ),

  on(TransactionActions.loadTransactionsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Create transaction (e.g., transfer)
  on(TransactionActions.createTransactionSuccess, (state, { transaction }) =>
    transactionAdapter.addOne(transaction, {
      ...state,
      loading: false,
      error: null,
    })
  ),

  on(TransactionActions.createTransactionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Select transaction
  on(TransactionActions.selectTransaction, (state, { id }) => ({
    ...state,
    selectedTransactionId: id,
  })),

  on(TransactionActions.clearSelectedTransaction, (state) => ({
    ...state,
    selectedTransactionId: null,
  })),

  // Filters
  on(TransactionActions.setFilters, (state, { filters }) => ({
    ...state,
    filters,
    pagination: {
      ...state.pagination,
      pageIndex: 0,
    },
  })),

  on(TransactionActions.clearFilters, (state) => ({
    ...state,
    filters: {},
    pagination: {
      ...state.pagination,
      pageIndex: 0,
    },
  })),

  // Pagination
  on(TransactionActions.setPage, (state, { pageIndex }) => ({
    ...state,
    pagination: {
      ...state.pagination,
      pageIndex,
    },
  })),

  on(TransactionActions.setPageSize, (state, { pageSize }) => ({
    ...state,
    pagination: {
      ...state.pagination,
      pageSize,
      pageIndex: 0,
    },
  }))
);

export function transactionReducer(
  state: TransactionState | undefined,
  action: Action
) {
  return transactionReducerImpl(state, action);
}

export const {
  selectIds: selectTransactionIds,
  selectEntities: selectTransactionEntities,
  selectAll: selectAllTransactions,
  selectTotal: selectTransactionTotal,
} = transactionAdapter.getSelectors();
