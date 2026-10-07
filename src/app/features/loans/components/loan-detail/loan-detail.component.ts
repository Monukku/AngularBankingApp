import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LoanService } from '../../service/loan.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-loan-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent],
  templateUrl: './loan-detail.component.html',
  styleUrl: './loan-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private loanService = inject(LoanService);
  protected authService = inject(AuthService);

  loan = signal<any>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  actionLoading = signal<string | null>(null);
  actionError = signal('');

  get isStaff(): boolean {
    return this.authService.isStaff() && !this.authService.isCustomer();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loanService.getLoan(id).subscribe({
        next: (l) => { this.loan.set(l); this.loading.set(false); },
        error: () => { this.error.set('Loan not found.'); this.loading.set(false); },
      });
    }
  }

  private reload() {
    const id = this.loan()?.id;
    if (!id) return;
    this.loanService.getLoan(id).subscribe({
      next: (l) => { this.loan.set(l); this.actionLoading.set(null); },
      error: () => this.actionLoading.set(null)
    });
  }

  startReview() {
    this.actionLoading.set('review');
    this.actionError.set('');
    this.loanService.startReview(this.loan().id).subscribe({
      next: () => this.reload(),
      error: (e: any) => { this.actionError.set(e?.message ?? 'Failed'); this.actionLoading.set(null); }
    });
  }

  approveLoan() {
    this.actionLoading.set('approve');
    this.actionError.set('');
    this.loanService.reviewLoan(this.loan().id, { decision: 'APPROVE', reviewNotes: 'Approved by staff' }).subscribe({
      next: () => this.reload(),
      error: (e: any) => { this.actionError.set(e?.message ?? 'Failed'); this.actionLoading.set(null); }
    });
  }

  rejectLoan() {
    this.actionLoading.set('reject');
    this.actionError.set('');
    this.loanService.reviewLoan(this.loan().id, { decision: 'REJECT', rejectionReason: 'Rejected by staff' }).subscribe({
      next: () => this.reload(),
      error: (e: any) => { this.actionError.set(e?.message ?? 'Failed'); this.actionLoading.set(null); }
    });
  }

  disburseLoan() {
    this.actionLoading.set('disburse');
    this.actionError.set('');
    this.loanService.disburseLoan(this.loan().id).subscribe({
      next: () => this.reload(),
      error: (e: any) => { this.actionError.set(e?.message ?? 'Failed'); this.actionLoading.set(null); }
    });
  }
}
