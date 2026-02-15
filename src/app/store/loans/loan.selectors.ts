import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LoanState, selectAllLoans } from './loan.reducer';

export const selectLoanFeature = createFeatureSelector<LoanState>('loans');

export const selectLoanIds = createSelector(selectLoanFeature, (state) => state.ids);

export const selectLoanEntities = createSelector(
  selectLoanFeature,
  (state) => state.entities
);

export const selectLoansLoading = createSelector(
  selectLoanFeature,
  (state) => state.loading
);

export const selectLoansError = createSelector(
  selectLoanFeature,
  (state) => state.error
);

export const selectSelectedLoanId = createSelector(
  selectLoanFeature,
  (state) => state.selectedLoanId
);

export const selectAllLoansFromAdapter = createSelector(
  selectLoanFeature,
  selectAllLoans
);

export const selectCurrentLoan = createSelector(
  selectSelectedLoanId,
  selectLoanEntities,
  (selectedId, entities) => (selectedId ? entities[selectedId] || null : null)
);

export const selectLoanCount = createSelector(
  selectAllLoansFromAdapter,
  (loans) => loans.length
);

export const selectLoanFilters = createSelector(
  selectLoanFeature,
  (state) => state.filters
);

// Filtered loans by status
export const selectLoansByStatus = (status: string) =>
  createSelector(selectAllLoansFromAdapter, (loans) =>
    loans.filter((loan) => loan.loanStatus === status)
  );

// Active loans
export const selectActiveLoans = createSelector(
  selectAllLoansFromAdapter,
  (loans) => loans.filter((loan) => loan.loanStatus === 'ACTIVE' || loan.loanStatus === 'APPROVED')
);

// Pending approvals
export const selectPendingLoans = createSelector(
  selectAllLoansFromAdapter,
  (loans) => loans.filter((loan) => loan.loanStatus === 'PENDING_APPROVAL')
);
