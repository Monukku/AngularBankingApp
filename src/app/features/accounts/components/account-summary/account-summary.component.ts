import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AccountService } from '../../services/account.service';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ApiService } from '../../../../core/services/api.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-account-summary',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule, MatSnackBarModule, LoaderComponent],
  templateUrl: './account-summary.component.html',
  styleUrl: './account-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSummaryComponent implements OnInit {
  private accountService = inject(AccountService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  protected authService = inject(AuthService);
  private api = inject(ApiService);

  // ── Customer view state ──
  accounts = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  showCreateForm = signal(false);
  creating = signal(false);
  createError = signal<string | null>(null);
  kycStatus = signal<string | null>(null);
  protected customerId: string | null = null;


  private readonly selfServiceTypes = ['SAVINGS', 'CURRENT', 'BUSINESS'];
  availableAccountTypes: string[] = [...this.selfServiceTypes];

  createForm: FormGroup = this.fb.group({
    accountType: ['SAVINGS', Validators.required],
  });

  // ── Staff view state ──
  staffAccounts = signal<any[]>([]);
  staffLoading = signal(true);
  staffError = signal<string | null>(null);
  staffStatusFilter = signal('ALL');
  staffSearch = signal('');
  actionMsg = signal<{ id: string; msg: string; ok: boolean } | null>(null);
  processing = signal<string | null>(null);
  staffFreezeReasonMap = signal<Record<string, string>>({});
  staffConfirmCloseId = signal<string | null>(null);
  staffConfirmFreezeId = signal<string | null>(null);

  // ── Pagination ──
  readonly pageSize = 5;
  currentPage = signal(1);

  // ── Detail modal ──
  viewAccount = signal<any | null>(null);

  getStaffFreezeReason(id: string): string { return this.staffFreezeReasonMap()[id] ?? ''; }
  setStaffFreezeReason(id: string, v: string): void { this.staffFreezeReasonMap.update(m => ({ ...m, [id]: v })); }

  readonly statusOptions = ['ALL', 'ACTIVE', 'PENDING', 'FROZEN', 'CLOSED'];

  get isStaff(): boolean {
    return this.authService.isStaff() && !this.authService.isCustomer();
  }

  ngOnInit(): void {
    if (this.isStaff) {
      this.loadStaffAccounts();
    } else {
      this.userService.getCustomerProfile().subscribe({
        next: (profile) => {
          this.customerId = profile?.id ?? null;
          this.kycStatus.set(profile?.kycStatus ?? null);
        },
      });
      this.loadAccounts();
    }
  }

  // ── Customer methods ──

  get hasPendingAccounts(): boolean {
    return this.accounts().some(a => (a.status || a.accountStatus) === 'PENDING');
  }

  get kycBannerType(): 'not_submitted' | 'submitted' | 'under_review' | 'rejected' | null {
    if (!this.hasPendingAccounts) return null;
    switch (this.kycStatus()) {
      case 'NOT_SUBMITTED': return 'not_submitted';
      case 'SUBMITTED':     return 'submitted';
      case 'UNDER_REVIEW':  return 'under_review';
      case 'REJECTED':      return 'rejected';
      default:              return null;
    }
  }

  loadAccounts(): void {
    this.loading.set(true);
    this.accountService.getMyAccounts().subscribe({
      next: (data: any) => {
        const accs = Array.isArray(data) ? data : (data?.content ?? []);
        this.accounts.set(accs);
        const existingTypes = new Set(accs.map((a: any) => a.accountType));
        this.availableAccountTypes = this.selfServiceTypes.filter(t => !existingTypes.has(t));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load accounts.');
        this.loading.set(false);
      },
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm.set(!this.showCreateForm());
    if (this.showCreateForm()) {
      this.createForm.get('accountType')?.setValue(this.availableAccountTypes[0] ?? 'SAVINGS');
      this.createError.set(null);
    }
  }

  createAccount(): void {
    if (this.createForm.invalid || this.creating()) return;
    if (!this.customerId) {
      this.createError.set('Account creation is only available for customers.');
      return;
    }
    this.creating.set(true);
    this.createError.set(null);
    const payload = { ...this.createForm.value, customerId: this.customerId };
    this.accountService.createAccount(payload).subscribe({
      next: () => {
        this.snackBar.open('Account created successfully!', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
        this.showCreateForm.set(false);
        this.creating.set(false);
        this.loadAccounts();
      },
      error: (err) => {
        this.createError.set(err?.message || 'Failed to create account. Please try again.');
        this.creating.set(false);
      },
    });
  }

  getStatusClass(status: string): string {
    return status?.toLowerCase() ?? '';
  }

  // ── Staff methods ──

  loadStaffAccounts(): void {
    this.staffLoading.set(true);
    this.staffError.set(null);
    this.actionMsg.set(null);

    // Always load all statuses — filtering is done client-side
    forkJoin(
      ['PENDING', 'ACTIVE', 'FROZEN', 'CLOSED'].map(s =>
        this.api.getAccountsByStatus(s).pipe(catchError(() => of([])))
      )
    ).subscribe({
      next: (results: any[]) => {
        const all = results.flatMap((r: any) => r?.content ?? (Array.isArray(r) ? r : []));
        this.staffAccounts.set(all);
        this.staffLoading.set(false);
      },
      error: (err: any) => {
        this.staffError.set(err?.message || 'Failed to load accounts.');
        this.staffLoading.set(false);
      },
    });

  }

  readonly staffActiveCount = computed(() =>
    this.staffAccounts().filter(a => (a.status || a.accountStatus) === 'ACTIVE').length
  );
  readonly staffFrozenCount = computed(() =>
    this.staffAccounts().filter(a => (a.status || a.accountStatus) === 'FROZEN').length
  );
  readonly staffTotalBalance = computed(() =>
    this.staffAccounts().reduce((s: number, a: any) => s + (a.balance ?? 0), 0)
  );

  readonly filteredStaffAccounts = computed(() => {
    const status = this.staffStatusFilter();
    const q = this.staffSearch().trim().toLowerCase();
    let list = status === 'ALL' ? this.staffAccounts()
      : this.staffAccounts().filter((a: any) => (a.status || a.accountStatus) === status);
    if (q) list = list.filter((a: any) =>
      (a.accountNumber ?? '').toLowerCase().includes(q) ||
      (a.customerId ?? '').toLowerCase().includes(q) ||
      (a.accountType ?? '').toLowerCase().includes(q)
    );
    return list;
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredStaffAccounts().length / this.pageSize))
  );

  readonly pagedStaffAccounts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredStaffAccounts().slice(start, start + this.pageSize);
  });

  readonly showingFrom = computed(() =>
    this.filteredStaffAccounts().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize + 1
  );

  readonly showingTo = computed(() =>
    Math.min(this.currentPage() * this.pageSize, this.filteredStaffAccounts().length)
  );

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 2;
    const pages: number[] = [];
    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
      pages.push(i);
    }
    return pages;
  });

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  staffActivate(accountId: string): void {
    this.processing.set(accountId);
    this.actionMsg.set(null);
    this.api.activateAccount(accountId).subscribe({
      next: () => {
        this.actionMsg.set({ id: accountId, msg: 'Account activated.', ok: true });
        this.processing.set(null);
        this.loadStaffAccounts();
      },
      error: (err) => {
        this.actionMsg.set({ id: accountId, msg: err?.message || 'Failed to activate.', ok: false });
        this.processing.set(null);
      },
    });
  }

  staffFreeze(accountId: string, reason: string): void {
    if (!reason?.trim()) return;
    this.processing.set(accountId);
    this.actionMsg.set(null);
    this.api.freezeAccount(accountId, reason).subscribe({
      next: () => {
        this.actionMsg.set({ id: accountId, msg: 'Account frozen.', ok: true });
        this.processing.set(null);
        this.loadStaffAccounts();
      },
      error: (err) => {
        this.actionMsg.set({ id: accountId, msg: err?.message || 'Failed to freeze.', ok: false });
        this.processing.set(null);
      },
    });
  }

  staffUnfreeze(accountId: string): void {
    this.processing.set(accountId);
    this.actionMsg.set(null);
    this.api.unfreezeAccount(accountId).subscribe({
      next: () => {
        this.actionMsg.set({ id: accountId, msg: 'Account unfrozen.', ok: true });
        this.processing.set(null);
        this.loadStaffAccounts();
      },
      error: (err) => {
        this.actionMsg.set({ id: accountId, msg: err?.message || 'Failed to unfreeze.', ok: false });
        this.processing.set(null);
      },
    });
  }

  staffCloseConfirmId = signal<string | null>(null);

  staffClose(accountId: string): void {
    this.processing.set(accountId);
    this.actionMsg.set(null);
    this.api.closeAccount(accountId).subscribe({
      next: () => {
        this.actionMsg.set({ id: accountId, msg: 'Account closed.', ok: true });
        this.processing.set(null);
        this.loadStaffAccounts();
      },
      error: (err) => {
        this.actionMsg.set({ id: accountId, msg: err?.message || 'Failed to close.', ok: false });
        this.processing.set(null);
      },
    });
  }
}
