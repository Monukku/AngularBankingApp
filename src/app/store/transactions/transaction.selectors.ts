import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TransactionState, selectAllTransactions } from './transaction.reducer';

export const selectTransactionFeature = createFeatureSelector<TransactionState>(
  'transactions'
);

export const selectTransactionIds = createSelector(
  selectTransactionFeature,
  (state) => state.ids
);

export const selectTransactionEntities = createSelector(
  selectTransactionFeature,
  (state) => state.entities
);

export const selectTransactionsLoading = createSelector(
  selectTransactionFeature,
  (state) => state.loading
);

export const selectTransactionsError = createSelector(
  selectTransactionFeature,
  (state) => state.error
);

export const selectSelectedTransactionId = createSelector(
  selectTransactionFeature,
  (state) => state.selectedTransactionId
);

export const selectAllTransactionsFromAdapter = createSelector(
  selectTransactionFeature,
  selectAllTransactions
);

export const selectCurrentTransaction = createSelector(
  selectSelectedTransactionId,
  selectTransactionEntities,
  (selectedId, entities) =>
    selectedId ? entities[selectedId] || null : null
);

export const selectTransactionCount = createSelector(
  selectAllTransactionsFromAdapter,
  (transactions) => transactions.length
);

export const selectTransactionFilters = createSelector(
  selectTransactionFeature,
  (state) => state.filters
);

export const selectPagination = createSelector(
  selectTransactionFeature,
  (state) => state.pagination
);

export const selectPageIndex = createSelector(
  selectPagination,
  (pagination) => pagination.pageIndex
);

export const selectPageSize = createSelector(
  selectPagination,
  (pagination) => pagination.pageSize
);

export const selectTotalTransactions = createSelector(
  selectPagination,
  (pagination) => pagination.total
);

// Filter by type
export const selectTransactionsByType = (type: string) =>
  createSelector(selectAllTransactionsFromAdapter, (transactions) =>
    transactions.filter((t) => t.transactionType === type)
  );

// Recent transactions (last 10)
export const selectRecentTransactions = createSelector(
  selectAllTransactionsFromAdapter,
  (transactions) => transactions.slice(0, 10)
);

// Pending transactions
export const selectPendingTransactions = createSelector(
  selectAllTransactionsFromAdapter,
  (transactions) =>
    transactions.filter(
      (t) => t.transactionStatus === 'PENDING' || t.transactionStatus === 'PROCESSING'
    )
);

// Failed transactions
export const selectFailedTransactions = createSelector(
  selectAllTransactionsFromAdapter,
  (transactions) => transactions.filter((t) => t.transactionStatus === 'FAILED')
);

// Total by type
export const selectDebitTotal = createSelector(
  selectAllTransactionsFromAdapter,
  (transactions) =>
    transactions
      .filter((t) => t.transactionType === 'DEBIT')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
);

export const selectCreditTotal = createSelector(
  selectAllTransactionsFromAdapter,
  (transactions) =>
    transactions
      .filter((t) => t.transactionType === 'CREDIT')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
);
