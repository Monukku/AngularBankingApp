import { createReducer, on, Action } from '@ngrx/store';
import { EntityAdapter, EntityState, createEntityAdapter } from '@ngrx/entity';
import { Loan } from '../../features/loans/models/loan.model';
import * as LoanActions from './loan.actions';

export interface LoanState extends EntityState<Loan> {
  selectedLoanId: string | null;
  loading: boolean;
  error: string | null;
  filters: LoanFilters;
}

export interface LoanFilters {
  status?: string;
  loanType?: string;
}

export const loanAdapter: EntityAdapter<Loan> = createEntityAdapter<Loan>({
  selectId: (loan: Loan) => loan.loanId,
  sortComparer: (a: Loan, b: Loan) =>
    new Date(b.createdDate || 0).getTime() - new Date(a.createdDate || 0).getTime(),
});

export const initialState: LoanState = loanAdapter.getInitialState({
  selectedLoanId: null,
  loading: false,
  error: null,
  filters: {},
});

const loanReducerImpl = createReducer(
  initialState,

  // Load loans
  on(LoanActions.loadLoans, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(LoanActions.loadLoansSuccess, (state, { loans }) =>
    loanAdapter.setAll(loans, {
      ...state,
      loading: false,
      error: null,
    })
  ),

  on(LoanActions.loadLoansFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Create loan
  on(LoanActions.createLoanSuccess, (state, { loan }) =>
    loanAdapter.addOne(loan, {
      ...state,
      loading: false,
      error: null,
    })
  ),

  on(LoanActions.createLoanFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Update loan
  on(LoanActions.updateLoanSuccess, (state, { loan }) =>
    loanAdapter.updateOne(
      { id: loan.loanId, changes: loan },
      {
        ...state,
        loading: false,
        error: null,
      }
    )
  ),

  on(LoanActions.updateLoanFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Delete loan
  on(LoanActions.deleteLoanSuccess, (state, { id }) =>
    loanAdapter.removeOne(id, {
      ...state,
      loading: false,
      error: null,
    })
  ),

  on(LoanActions.deleteLoanFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Select loan
  on(LoanActions.selectLoan, (state, { id }) => ({
    ...state,
    selectedLoanId: id,
  })),

  on(LoanActions.clearSelectedLoan, (state) => ({
    ...state,
    selectedLoanId: null,
  })),

  // Set filters
  on(LoanActions.setFilters, (state, { filters }) => ({
    ...state,
    filters,
  })),

  on(LoanActions.clearFilters, (state) => ({
    ...state,
    filters: {},
  }))
);

export function loanReducer(state: LoanState | undefined, action: Action) {
  return loanReducerImpl(state, action);
}

export const {
  selectIds: selectLoanIds,
  selectEntities: selectLoanEntities,
  selectAll: selectAllLoans,
  selectTotal: selectLoanTotal,
} = loanAdapter.getSelectors();
