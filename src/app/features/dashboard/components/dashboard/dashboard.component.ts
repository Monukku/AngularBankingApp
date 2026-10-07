import {
  Component, signal, inject, OnInit,
  ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../../core/services/auth.service';
import { ApiService } from '../../../../core/services/api.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    LoaderComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  protected authService = inject(AuthService);

  // ── Shared ──────────────────────────────────────────────────────
  loading = signal(true);
  error = signal<string | null>(null);

  // ── Staff dashboard ──────────────────────────────────────────────
  staffLoading = signal(false);
  staffError = signal<string | null>(null);
  staffAccountCounts = signal<{ active: number; pending: number; frozen: number; closed: number }>({
    active: 0, pending: 0, frozen: 0, closed: 0,
  });
  staffPendingKyc = signal(0);
  staffRecentTxns = signal<any[]>([]);

  // ── Customer dashboard ───────────────────────────────────────────
  accounts = signal<any[]>([]);
  totalBalance = signal(0);
  recentTxns = signal<any[]>([]);
  cards = signal<any[]>([]);
  loans = signal<any[]>([]);
  kycStatus = signal<string | null>(null);

  get isStaff(): boolean {
    return this.authService.isStaff() && !this.authService.isCustomer();
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  get displayName(): string {
    try {
      const p = (this.authService as any).keycloakService?.getKeycloakInstance?.()?.idTokenParsed;
      return p?.given_name || p?.name || p?.preferred_username || 'there';
    } catch { return 'there'; }
  }

  get totalBalanceNum(): number {
    return this.accounts().reduce((s, a) => s + (a.balance ?? 0), 0);
  }

  get activeLoans(): any[] {
    return this.loans().filter(l => l.status === 'DISBURSED' || l.status === 'ACTIVE');
  }

  get totalLoanOutstanding(): number {
    return this.activeLoans.reduce((s, l) => s + (l.outstandingAmount ?? l.loanAmount ?? 0), 0);
  }

  ngOnInit(): void {
    if (this.isStaff) {
      this.loadStaffDashboard();
    } else {
      this.loadCustomerDashboard();
    }
  }

  // ── Staff ────────────────────────────────────────────────────────
  loadStaffDashboard(): void {
    this.staffLoading.set(true);
    this.staffError.set(null);

    forkJoin({
      active:  this.api.getAccountsByStatus('ACTIVE'),
      pending: this.api.getAccountsByStatus('PENDING'),
      frozen:  this.api.getAccountsByStatus('FROZEN'),
      closed:  this.api.getAccountsByStatus('CLOSED'),
      kyc:     this.api.getPendingKyc(),
      txns:    this.api.getAllTransactions({ page: 0, size: 10 }),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        this.staffAccountCounts.set({
          active:  (res.active?.content  ?? res.active  ?? []).length,
          pending: (res.pending?.content ?? res.pending ?? []).length,
          frozen:  (res.frozen?.content  ?? res.frozen  ?? []).length,
          closed:  (res.closed?.content  ?? res.closed  ?? []).length,
        });
        this.staffPendingKyc.set((res.kyc?.content ?? res.kyc ?? []).length);
        this.staffRecentTxns.set(res.txns?.content ?? (Array.isArray(res.txns) ? res.txns : []));
        this.staffLoading.set(false);
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.staffError.set(err?.message || 'Failed to load staff data.');
        this.staffLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  // ── Customer ─────────────────────────────────────────────────────
  loadCustomerDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      accounts: this.api.getMyAccounts().pipe(catchError(() => of([]))),
      txns:     this.api.getMyTransactions({ page: 0, size: 5 }).pipe(catchError(() => of([]))),
      cards:    this.api.getMyCards().pipe(catchError(() => of([]))),
      loans:    this.api.getMyLoans().pipe(catchError(() => of([]))),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        const allAccounts: any[] = res.accounts?.content ?? (Array.isArray(res.accounts) ? res.accounts : []);
this.accounts.set(allAccounts);
        this.recentTxns.set(res.txns?.content ?? (Array.isArray(res.txns) ? res.txns : []));
        this.cards.set(res.cards?.content ?? (Array.isArray(res.cards) ? res.cards : []));
        this.loans.set(res.loans?.content ?? (Array.isArray(res.loans) ? res.loans : []));
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.error.set(err?.message || 'Failed to load dashboard.');
        this.loading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  refresh(): void {
    if (this.isStaff) this.loadStaffDashboard();
    else this.loadCustomerDashboard();
  }

  // ── Helpers ──────────────────────────────────────────────────────
  accountStatusClass(status: string): string {
    const s = (status ?? '').toLowerCase();
    if (s === 'active')  return 'active';
    if (s === 'pending') return 'pending';
    if (s === 'frozen')  return 'frozen';
    return 'closed';
  }

  txnTypeClass(type: string): string { return (type ?? '').toLowerCase(); }
  txnStatusClass(status: string): string { return (status ?? '').toLowerCase(); }

  cardNetworkIcon(network: string): string {
    const n = (network ?? '').toLowerCase();
    if (n.includes('visa'))       return 'VISA';
    if (n.includes('master'))     return 'MC';
    if (n.includes('rupay'))      return 'RuPay';
    return network ?? '';
  }

  loanTypeLabel(type: string): string {
    const m: Record<string, string> = {
      HOME_LOAN: 'Home Loan', CAR_LOAN: 'Car Loan', PERSONAL_LOAN: 'Personal Loan',
      EDUCATION_LOAN: 'Education Loan', BUSINESS_LOAN: 'Business Loan',
    };
    return m[type] ?? type ?? 'Loan';
  }

  get hasKycAlert(): boolean {
    return this.accounts().some(a =>
      (a.status ?? a.accountStatus) === 'PENDING' || (a.kycStatus ?? '').toUpperCase() === 'PENDING'
    );
  }

  get hasFrozenAccount(): boolean {
    return this.accounts().some(a => (a.status ?? a.accountStatus) === 'FROZEN');
  }

  readonly today = new Date();

  // staff helpers (keep same as before)
  statusClass(s: string): string { return (s ?? '').toLowerCase(); }
  typeClass(t: string): string    { return (t ?? '').toLowerCase(); }
}
