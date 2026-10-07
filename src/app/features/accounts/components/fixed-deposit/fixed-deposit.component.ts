import {
  Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, HostListener, inject, signal
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../../services/account.service';
import { UserService } from '../../../../core/services/user.service';

const RATE_TABLE: Record<number, number> = {
  6: 6.5, 12: 7.0, 24: 7.5, 36: 8.0, 60: 8.5, 120: 8.25,
};

function nearestTenure(months: number): number {
  const keys = Object.keys(RATE_TABLE).map(Number).sort((a, b) => a - b);
  return keys.reduce((prev, curr) =>
    Math.abs(curr - months) < Math.abs(prev - months) ? curr : prev
  );
}

function fdMaturityAmount(principal: number, tenureMonths: number): number {
  const r = (RATE_TABLE[nearestTenure(tenureMonths)] ?? 7.0) / 100;
  const n = tenureMonths / 12;
  return principal * Math.pow(1 + r / 4, 4 * n);
}

@Component({
  selector: 'app-fixed-deposit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './fixed-deposit.component.html',
  styleUrls: ['./fixed-deposit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FixedDepositComponent implements OnInit {
  private accountService = inject(AccountService);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  fds = signal<any[]>([]);
  accounts = signal<any[]>([]);
  loading = signal(true);
  showForm = signal(false);
  submitting = signal(false);
  customerId: string | null = null;

  tenureOptions = [6, 12, 24, 36, 60, 120];
  openDropdown: 'account' | 'tenure' | null = null;

  @HostListener('document:click')
  onDocumentClick(): void { this.openDropdown = null; this.cdr.markForCheck(); }

  openHoverDD(name: 'account' | 'tenure') { this.openDropdown = name; this.cdr.markForCheck(); }
  closeHoverDD() { this.openDropdown = null; this.cdr.markForCheck(); }

  selectAccount(id: string) {
    this.form.get('sourceAccountId')?.setValue(id);
    this.openDropdown = null;
    this.cdr.markForCheck();
  }

  selectTenure(t: number) {
    this.form.get('tenureMonths')?.setValue(t);
    this.openDropdown = null;
    this.cdr.markForCheck();
  }

  get selectedAccountLabel(): string {
    const id = this.form.get('sourceAccountId')?.value;
    const a = this.accounts().find(x => x.id === id);
    return a ? `${a.accountType} · ${a.accountNumber}` : 'Select account…';
  }

  get selectedTenureLabel(): string {
    const t = this.form.get('tenureMonths')?.value;
    return t ? `${t} months${t >= 12 ? ` (${(t/12).toFixed(1).replace('.0','')} yr)` : ''}` : 'Select tenure…';
  }

  form: FormGroup = this.fb.group({
    sourceAccountId: ['', Validators.required],
    depositAmount: [null, [Validators.required, Validators.min(1000), Validators.max(100000000)]],
    tenureMonths: [12, Validators.required],
  });

  ngOnInit(): void {
    this.userService.getCustomerProfile().subscribe({
      next: (p) => {
        this.customerId = p?.id ?? p?.customerId ?? null;
        this.cdr.markForCheck();
      },
    });
    this.loadAccounts();
    this.loadFds();
  }

  private loadAccounts(): void {
    this.accountService.getMyAccounts().subscribe({
      next: (data: any) => {
        const list: any[] = data?.content ?? (Array.isArray(data) ? data : []);
        this.accounts.set(
          list.filter((a: any) => {
            const t = a.accountType ?? '';
            const s = a.status ?? a.accountStatus ?? '';
            return ['SAVINGS', 'CURRENT', 'BUSINESS'].includes(t) && s === 'ACTIVE';
          })
        );
        if (this.accounts().length === 1) {
          this.form.patchValue({ sourceAccountId: this.accounts()[0].id });
        }
        this.cdr.markForCheck();
      },
    });
  }

  private loadFds(): void {
    this.loading.set(true);
    this.accountService.getMyFixedDeposits().subscribe({
      next: (data: any) => {
        const list: any[] = data?.content ?? (Array.isArray(data) ? data : []);
        this.fds.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  get estimatedMaturity(): number {
    const v = this.form.value;
    if (!v.depositAmount || !v.tenureMonths) return 0;
    return fdMaturityAmount(v.depositAmount, v.tenureMonths);
  }

  get interestRate(): number {
    const tenure = this.form.value.tenureMonths ?? 12;
    return RATE_TABLE[nearestTenure(tenure)] ?? 7.0;
  }

  open(): void {
    if (this.form.invalid || !this.customerId) return;
    this.submitting.set(true);
    const { sourceAccountId, depositAmount, tenureMonths } = this.form.value;
    this.accountService.openFixedDeposit(
      { sourceAccountId, depositAmount, tenureMonths },
      this.customerId
    ).subscribe({
      next: () => {
        this.snackBar.open('Fixed Deposit opened successfully!', 'Close', { duration: 3500, panelClass: ['success-snackbar'] });
        this.showForm.set(false);
        this.form.reset({ tenureMonths: 12 });
        this.submitting.set(false);
        this.loadFds();
        this.loadAccounts();
      },
      error: (err: any) => {
        const msg = err?.error?.message ?? err?.message ?? 'Failed to open Fixed Deposit';
        this.snackBar.open(msg, 'Close', { duration: 4000, panelClass: ['error-snackbar'] });
        this.submitting.set(false);
      },
    });
  }
}
