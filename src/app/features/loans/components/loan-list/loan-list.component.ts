import { Component, OnInit, ChangeDetectionStrategy, inject, DestroyRef, signal, computed } from '@angular/core';
import { LoanService } from '../../service/loan.service';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { CommonModule, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { ApiService, PagedResponse } from '../../../../core/services/api.service';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, CurrencyPipe, TitleCasePipe, RouterLink],
  templateUrl: './loan-list.component.html',
  styleUrls: ['./loan-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanListComponent implements OnInit {
  private loanService = inject(LoanService);
  private api = inject(ApiService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  protected authService = inject(AuthService);

  get isStaff(): boolean {
    return this.authService.isStaff() && !this.authService.isCustomer();
  }

  // ── Customer view ─────────────────────────────────────────────────────────────
  private refreshLoans$ = new BehaviorSubject<void>(undefined);
  loans$: Observable<any[]> | null = null;

  // ── Staff view ────────────────────────────────────────────────────────────────
  readonly STATUSES = ['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DISBURSED', 'CLOSED'];
  activeFilter = signal('ALL');
  allStaffLoans = signal<any[]>([]);
  staffLoans = computed(() => {
    const f = this.activeFilter();
    return f === 'ALL' ? this.allStaffLoans() : this.allStaffLoans().filter(l => l.status === f);
  });
  staffLoading = signal(false);
  staffError = signal('');
  actionLoading = signal<string | null>(null);

  ngOnInit(): void {
    if (this.isStaff) {
      this.loadStaffLoans('ALL');
    } else {
      this.loans$ = this.refreshLoans$.pipe(
        switchMap(() => this.loanService.getLoans()),
        takeUntilDestroyed(this.destroyRef)
      );
    }
  }

  loadStaffLoans(status: string): void {
    this.activeFilter.set(status);
    // If we already have data, just switch filter — no API call needed
    if (this.allStaffLoans().length > 0 && status !== 'ALL') return;
    this.staffLoading.set(true);
    this.staffError.set('');
    this.api.getAllLoans({ size: 500 }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: PagedResponse<any>) => {
        this.allStaffLoans.set(res?.content ?? []);
        this.staffLoading.set(false);
      },
      error: (err: any) => {
        this.staffError.set(err?.message ?? 'Failed to load loans');
        this.staffLoading.set(false);
      }
    });
  }

  startReview(loan: any): void {
    this.actionLoading.set(loan.id);
    this.loanService.startReview(loan.id).subscribe({
      next: () => { this.actionLoading.set(null); this.allStaffLoans.set([]); this.loadStaffLoans(this.activeFilter()); },
      error: () => this.actionLoading.set(null)
    });
  }

  approveLoan(loan: any): void {
    this.actionLoading.set(loan.id);
    this.loanService.reviewLoan(loan.id, { decision: 'APPROVE', reviewNotes: 'Approved by staff' }).subscribe({
      next: () => { this.actionLoading.set(null); this.allStaffLoans.set([]); this.loadStaffLoans(this.activeFilter()); },
      error: () => this.actionLoading.set(null)
    });
  }

  rejectLoan(loan: any): void {
    this.actionLoading.set(loan.id);
    this.loanService.reviewLoan(loan.id, { decision: 'REJECT', rejectionReason: 'Rejected by staff' }).subscribe({
      next: () => { this.actionLoading.set(null); this.allStaffLoans.set([]); this.loadStaffLoans(this.activeFilter()); },
      error: () => this.actionLoading.set(null)
    });
  }

  disburseLoan(loan: any): void {
    this.actionLoading.set(loan.id);
    this.loanService.disburseLoan(loan.id).subscribe({
      next: () => { this.actionLoading.set(null); this.allStaffLoans.set([]); this.loadStaffLoans(this.activeFilter()); },
      error: () => this.actionLoading.set(null)
    });
  }

  trackByLoanId = (_index: number, loan: any) => loan.id;

  viewLoan(id: string): void { this.router.navigate(['/loans', id]); }

  getLoanStatusClass(status: string): string {
    return (status ?? '').toLowerCase().replace('_', '-');
  }
}
