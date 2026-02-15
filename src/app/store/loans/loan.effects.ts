import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';

import * as LoanActions from './loan.actions';
import { LoanService } from '../../features/loans/service/loan.service';
import { LoggerService } from '../../core/services/logger.service';

@Injectable()
export class LoanEffects {
  private readonly actions$ = inject(Actions);
  private readonly loanService = inject(LoanService);
  private readonly logger = inject(LoggerService);

  loadLoans$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoanActions.loadLoans),
      switchMap(() =>
        this.loanService.getLoans().pipe(
          map((response) =>
            LoanActions.loadLoansSuccess({
              loans: response.data || [],
            })
          ),
          tap(() => this.logger.debug('Loans loaded successfully')),
          catchError((error) => {
            this.logger.error('Load loans failed', error);
            return of(
              LoanActions.loadLoansFailure({
                error: error?.message || 'Failed to load loans',
              })
            );
          })
        )
      )
    )
  );

  createLoan$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoanActions.createLoan),
      switchMap(({ loan }) =>
        this.loanService.createLoan(loan as any).pipe(
          map((newLoan) => LoanActions.createLoanSuccess({ loan: newLoan })),
          tap(() => {
            this.logger.debug('Loan created successfully');
            this.loanService.invalidateLoansCache();
          }),
          catchError((error) => {
            this.logger.error('Create loan failed', error);
            return of(
              LoanActions.createLoanFailure({
                error: error?.message || 'Failed to create loan',
              })
            );
          })
        )
      )
    )
  );

  updateLoan$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoanActions.updateLoan),
      switchMap(({ id, loan }) =>
        this.loanService.updateLoan(id, loan).pipe(
          map((updatedLoan) =>
            LoanActions.updateLoanSuccess({ loan: updatedLoan })
          ),
          tap(() => {
            this.logger.debug('Loan updated successfully');
            this.loanService.invalidateLoansCache();
          }),
          catchError((error) => {
            this.logger.error('Update loan failed', error);
            return of(
              LoanActions.updateLoanFailure({
                error: error?.message || 'Failed to update loan',
              })
            );
          })
        )
      )
    )
  );

  deleteLoan$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoanActions.deleteLoan),
      switchMap(({ id }) =>
        this.loanService.deleteLoan(id).pipe(
          map(() => LoanActions.deleteLoanSuccess({ id })),
          tap(() => {
            this.logger.debug('Loan deleted successfully');
            this.loanService.invalidateLoansCache();
          }),
          catchError((error) => {
            this.logger.error('Delete loan failed', error);
            return of(
              LoanActions.deleteLoanFailure({
                error: error?.message || 'Failed to delete loan',
              })
            );
          })
        )
      )
    )
  );
}
