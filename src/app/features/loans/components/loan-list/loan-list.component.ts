import { Component, OnInit, ChangeDetectionStrategy, inject, DestroyRef } from '@angular/core';
import { LoanService } from '../../service/loan.service'; 
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoanDetails } from '../../models/loan.model';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports:[
    CommonModule,
    MatCardModule
  ],
  templateUrl: './loan-list.component.html',
  styleUrls: ['./loan-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanListComponent implements OnInit {
  private loanService = inject(LoanService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  loans: LoanDetails[] = [];

  constructor() { }

  ngOnInit(): void {
    this.loanService.getLoans()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(response => {
        this.loans = response.data;
      });
  }

  /**
   * TrackBy function for loan list iteration
   * Improves performance by tracking by loan ID instead of object reference
   */
  trackByLoanId = (index: number, loan: LoanDetails) => loan.loanId;

  viewLoan(id: string) {
    this.router.navigate(['/loans', id]);
  }

  editLoan(id: string) {
    this.router.navigate(['/loans', id, 'edit']);
  }

  deleteLoan(id: string) {
    this.loanService.deleteLoan(id).subscribe(() => {
      this.loans = this.loans.filter(loan => loan.loanId !== id);
    });
  }
}
