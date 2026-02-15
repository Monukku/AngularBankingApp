import { createAction, props } from '@ngrx/store';
import { Loan } from '../../features/loans/models/loan.model';
import { LoanFilters } from './loan.reducer';

export const loadLoans = createAction('[Loans] Load Loans');

export const loadLoansSuccess = createAction(
  '[Loans] Load Loans Success',
  props<{ loans: Loan[] }>()
);

export const loadLoansFailure = createAction(
  '[Loans] Load Loans Failure',
  props<{ error: string }>()
);

export const createLoan = createAction(
  '[Loans] Create Loan',
  props<{ loan: Omit<Loan, 'loanId'> }>()
);

export const createLoanSuccess = createAction(
  '[Loans] Create Loan Success',
  props<{ loan: Loan }>()
);

export const createLoanFailure = createAction(
  '[Loans] Create Loan Failure',
  props<{ error: string }>()
);

export const updateLoan = createAction(
  '[Loans] Update Loan',
  props<{ id: string; loan: Partial<Loan> }>()
);

export const updateLoanSuccess = createAction(
  '[Loans] Update Loan Success',
  props<{ loan: Loan }>()
);

export const updateLoanFailure = createAction(
  '[Loans] Update Loan Failure',
  props<{ error: string }>()
);

export const deleteLoan = createAction(
  '[Loans] Delete Loan',
  props<{ id: string }>()
);

export const deleteLoanSuccess = createAction(
  '[Loans] Delete Loan Success',
  props<{ id: string }>()
);

export const deleteLoanFailure = createAction(
  '[Loans] Delete Loan Failure',
  props<{ error: string }>()
);

export const selectLoan = createAction(
  '[Loans] Select Loan',
  props<{ id: string }>()
);

export const clearSelectedLoan = createAction('[Loans] Clear Selected Loan');

export const setFilters = createAction(
  '[Loans] Set Filters',
  props<{ filters: LoanFilters }>()
);

export const clearFilters = createAction('[Loans] Clear Filters');
