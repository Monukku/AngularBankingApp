import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService, PagedResponse } from '../../../core/services/api.service';
import { Loan } from '../models/loan.model';

@Injectable({ providedIn: 'root' })
export class LoanService {
  private api = inject(ApiService);
  private loansCache$: Observable<Loan[]> | null = null;

  getLoans(): Observable<Loan[]> {
    if (!this.loansCache$) {
      this.loansCache$ = this.api.getMyLoans().pipe(shareReplay(1));
    }
    return this.loansCache$;
  }

  invalidateLoansCache(): void { this.loansCache$ = null; }

  getLoan(id: string): Observable<Loan> { return this.api.getLoan(id); }

  getAllLoans(params?: { page?: number; size?: number }): Observable<PagedResponse<Loan>> {
    return this.api.getAllLoans(params);
  }

  getLoansByStatus(status: string, params?: { page?: number; size?: number }): Observable<PagedResponse<Loan>> {
    return this.api.getLoansByStatus(status, params);
  }

  createLoan(data: Record<string, unknown>): Observable<Loan> {
    return this.api.applyLoan(data).pipe(tap(() => this.invalidateLoansCache()));
  }

  startReview(id: string): Observable<Loan> {
    return this.api.startLoanReview(id).pipe(tap(() => this.invalidateLoansCache()));
  }

  reviewLoan(id: string, data: {
    decision: string;
    approvedAmount?: number;
    interestRate?: number;
    reviewNotes?: string;
    rejectionReason?: string;
  }): Observable<Loan> {
    return this.api.reviewLoan(id, data).pipe(tap(() => this.invalidateLoansCache()));
  }

  disburseLoan(id: string): Observable<Loan> {
    return this.api.disburseLoan(id).pipe(tap(() => this.invalidateLoansCache()));
  }
}
