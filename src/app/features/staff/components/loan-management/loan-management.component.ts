import {
  Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { from } from 'rxjs';
import { concatMap, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-loan-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loan-management.component.html',
  styleUrls: ['./loan-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanManagementComponent implements OnInit {
  private api           = inject(ApiService);
  private snackBar      = inject(MatSnackBar);
  private cdr           = inject(ChangeDetectorRef);
  protected authService = inject(AuthService);

  totalLoans    = signal<number>(0);
  loading       = signal(true);
  activeFilter  = signal<string>('ALL');
  actionLoading = signal<string | null>(null);

  // Review modal
  reviewModal   = signal<any>(null);
  reviewDecision = 'APPROVE';
  approvedAmount = '';
  interestRate   = '';
  reviewNotes    = '';
  rejectionReason = '';

  // Disburse confirm
  disburseTarget = signal<any>(null);

  // Bulk selection
  selected         = signal<Set<string>>(new Set());
  copied           = signal<string | null>(null);
  selectableIds    = computed(() => this.filteredLoans().filter(l => l.status === 'APPROVED').map((l: any) => l.id));
  allApprovedSelected = computed(() => {
    const ids = this.selectableIds();
    return ids.length > 0 && ids.every((id: string) => this.selected().has(id));
  });

  readonly filters = ['ALL', 'APPLIED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DISBURSED', 'CLOSED'];
  readonly PAGE_SIZE = 5;

  searchQuery = signal('');

  // All loans loaded once; filter + search applied client-side
  allLoans = signal<any[]>([]);

  filteredLoans = computed(() => {
    const filter = this.activeFilter();
    const q = this.searchQuery().trim().toLowerCase();
    let list = filter === 'ALL' ? this.allLoans() : this.allLoans().filter(l => l.status === filter);
    if (q) list = list.filter(l =>
      (l.keycloakUserId ?? '').toLowerCase().includes(q) ||
      (l.id ?? '').toLowerCase().includes(q) ||
      (l.loanType ?? '').toLowerCase().includes(q)
    );
    return list;
  });

  currentPage = signal(1);
  totalPages  = computed(() => Math.max(1, Math.ceil(this.filteredLoans().length / this.PAGE_SIZE)));
  pagedLoans  = computed(() => {
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.filteredLoans().slice(start, start + this.PAGE_SIZE);
  });
  showingFrom = computed(() => this.filteredLoans().length === 0 ? 0 : (this.currentPage() - 1) * this.PAGE_SIZE + 1);
  showingTo   = computed(() => Math.min(this.currentPage() * this.PAGE_SIZE, this.filteredLoans().length));
  pageNumbers = computed(() => {
    const total = this.totalPages(), current = this.currentPage(), delta = 2, pages: number[] = [];
    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) pages.push(i);
    return pages;
  });
  goToPage(p: number): void { if (p >= 1 && p <= this.totalPages()) this.currentPage.set(p); }

  ngOnInit(): void {
    this.loadLoans();
  }

  loadLoans(): void {
    this.loading.set(true);
    this.allLoans.set([]);
    this.api.getAllLoans({ page: 0, size: 500 }).subscribe({
      next: (data: any) => {
        const list = data?.content ?? (Array.isArray(data) ? data : []);
        this.allLoans.set(list);
        this.totalLoans.set(data?.totalElements ?? list.length);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  setFilter(f: string): void {
    this.activeFilter.set(f);
    this.currentPage.set(1);
  }

  startReview(loan: any): void {
    this.actionLoading.set(loan.id);
    this.api.startLoanReview(loan.id).subscribe({
      next: () => {
        this.snackBar.open('Review started', 'Close', { duration: 2500, panelClass: ['success-snackbar'] });
        this.actionLoading.set(null);
        this.loadLoans();
      },
      error: (err: any) => {
        this.snackBar.open(err?.error?.message ?? 'Failed to start review', 'Close',
          { duration: 3000, panelClass: ['error-snackbar'] });
        this.actionLoading.set(null);
      },
    });
  }

  openReviewModal(loan: any): void {
    this.reviewModal.set(loan);
    this.reviewDecision = 'APPROVE';
    this.approvedAmount = loan.requestedAmount?.toString() ?? '';
    this.interestRate   = '';
    this.reviewNotes    = '';
    this.rejectionReason = '';
  }

  confirmReview(): void {
    const loan = this.reviewModal();
    if (!loan) return;

    if (this.reviewDecision === 'APPROVE') {
      if (!this.approvedAmount || !this.interestRate) {
        this.snackBar.open('Approved amount and interest rate are required', 'Close',
          { duration: 3000, panelClass: ['error-snackbar'] });
        return;
      }
    } else {
      if (!this.rejectionReason.trim()) {
        this.snackBar.open('Rejection reason is required', 'Close',
          { duration: 3000, panelClass: ['error-snackbar'] });
        return;
      }
    }

    this.actionLoading.set(loan.id);
    const payload: any = { decision: this.reviewDecision, reviewNotes: this.reviewNotes };
    if (this.reviewDecision === 'APPROVE') {
      payload.approvedAmount  = parseFloat(this.approvedAmount);
      payload.interestRate    = parseFloat(this.interestRate);
    } else {
      payload.rejectionReason = this.rejectionReason;
    }

    this.api.reviewLoan(loan.id, payload).subscribe({
      next: () => {
        this.snackBar.open(
          this.reviewDecision === 'APPROVE' ? 'Loan approved!' : 'Loan rejected',
          'Close', { duration: 3000, panelClass: ['success-snackbar'] });
        this.reviewModal.set(null);
        this.actionLoading.set(null);
        this.loadLoans();
      },
      error: (err: any) => {
        this.snackBar.open(err?.error?.message ?? 'Review failed', 'Close',
          { duration: 3500, panelClass: ['error-snackbar'] });
        this.actionLoading.set(null);
      },
    });
  }

  openDisburseConfirm(loan: any): void {
    this.disburseTarget.set(loan);
  }

  confirmDisburse(): void {
    const loan = this.disburseTarget();
    if (!loan) return;
    this.actionLoading.set(loan.id);
    this.api.disburseLoan(loan.id).subscribe({
      next: () => {
        this.snackBar.open('Loan disbursed successfully!', 'Close',
          { duration: 3000, panelClass: ['success-snackbar'] });
        this.disburseTarget.set(null);
        this.actionLoading.set(null);
        this.loadLoans();
      },
      error: (err: any) => {
        this.snackBar.open(err?.error?.message ?? 'Disburse failed', 'Close',
          { duration: 3500, panelClass: ['error-snackbar'] });
        this.disburseTarget.set(null);
        this.actionLoading.set(null);
      },
    });
  }

  toggleOne(id: string, status: string): void {
    if (status !== 'APPROVED') return;
    this.selected.update(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  toggleAll(): void {
    const ids = this.selectableIds();
    if (ids.length === 0) return;
    this.selected.update(s => {
      if (this.allApprovedSelected()) {
        const next = new Set(s);
        ids.forEach((id: string) => next.delete(id));
        return next;
      }
      return new Set([...s, ...ids]);
    });
  }

  clearSelection(): void {
    this.selected.set(new Set());
  }

  copyId(id: string): void {
    navigator.clipboard?.writeText(id);
    this.copied.set(id);
    setTimeout(() => this.copied.set(null), 1200);
  }

  disburseSelected(): void {
    const ids = [...this.selected()];
    if (ids.length === 0) return;
    const total = ids.length;
    let failed = 0;

    from(ids).pipe(
      concatMap(id => {
        this.actionLoading.set(id);
        return this.api.disburseLoan(id).pipe(
          catchError((err: any) => {
            failed++;
            this.snackBar.open(err?.error?.message ?? `Failed to disburse ${id.slice(0, 8)}…`, 'Close',
              { duration: 3500, panelClass: ['error-snackbar'] });
            return of(null);
          })
        );
      }),
      finalize(() => {
        this.actionLoading.set(null);
        this.clearSelection();
        const succeeded = total - failed;
        if (succeeded > 0) {
          this.snackBar.open(`${succeeded} loan(s) disbursed`, 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
        }
        this.loadLoans();
        this.cdr.markForCheck();
      })
    ).subscribe();
  }

  fraudClass(action: string): string {
    if (action === 'REVIEW') return 'medium';
    if (action === 'BLOCK')  return 'high';
    return '';
  }

  formatCurrency(v: number): string {
    if (!v) return '—';
    return '₹' + v.toLocaleString('en-IN');
  }

  filterLabel(f: string): string {
    const map: Record<string, string> = {
      ALL: 'All', APPLIED: 'Applied', UNDER_REVIEW: 'Under review',
      APPROVED: 'Approved', REJECTED: 'Rejected', DISBURSED: 'Disbursed', CLOSED: 'Closed',
    };
    return map[f] ?? f;
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      APPLIED: 'Applied', UNDER_REVIEW: 'Under review',
      APPROVED: 'Approved', REJECTED: 'Rejected', DISBURSED: 'Disbursed', CLOSED: 'Closed',
    };
    return map[s] ?? s;
  }

  fraudLabel(_score: number, action: string): string {
    if (!action || action === 'ALLOW') return 'Low';
    if (action === 'REVIEW') return 'Medium';
    return 'High';
  }
}
