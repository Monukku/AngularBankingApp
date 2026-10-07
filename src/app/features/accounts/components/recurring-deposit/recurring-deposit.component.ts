import {
  Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, HostListener, inject, signal
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../../services/account.service';
import { UserService } from '../../../../core/services/user.service';

function rdMaturityAmount(installment: number, tenureMonths: number, annualRate: number): number {
  const r = annualRate / 100 / 12;
  return installment * ((Math.pow(1 + r, tenureMonths) - 1) / r) * (1 + r);
}

const RATE = 7.0;

@Component({
  selector: 'app-recurring-deposit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recurring-deposit.component.html',
  styleUrls: ['./recurring-deposit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecurringDepositComponent implements OnInit {
  private accountService = inject(AccountService);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  rds = signal<any[]>([]);
  accounts = signal<any[]>([]);
  loading = signal(true);
  showForm = signal(false);
  submitting = signal(false);
  customerId: string | null = null;

  tenureOptions = [6, 12, 24, 36, 48, 60, 84, 120];
  interestRate = RATE;
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
    installmentAmount: [null, [Validators.required, Validators.min(500)]],
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
    this.loadRds();
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

  private loadRds(): void {
    this.loading.set(true);
    this.accountService.getMyRecurringDeposits().subscribe({
      next: (data: any) => {
        const list: any[] = data?.content ?? (Array.isArray(data) ? data : []);
        this.rds.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  get estimatedMaturity(): number {
    const v = this.form.value;
    if (!v.installmentAmount || !v.tenureMonths) return 0;
    return rdMaturityAmount(v.installmentAmount, v.tenureMonths, RATE);
  }

  get totalInvested(): number {
    const v = this.form.value;
    return (v.installmentAmount ?? 0) * (v.tenureMonths ?? 0);
  }

  open(): void {
    if (this.form.invalid || !this.customerId) return;
    this.submitting.set(true);
    const { sourceAccountId, installmentAmount, tenureMonths } = this.form.value;
    this.accountService.openRecurringDeposit(
      { sourceAccountId, installmentAmount, tenureMonths },
      this.customerId
    ).subscribe({
      next: () => {
        this.snackBar.open('Recurring Deposit opened!', 'Close', { duration: 3500, panelClass: ['success-snackbar'] });
        this.showForm.set(false);
        this.form.reset({ tenureMonths: 12 });
        this.submitting.set(false);
        this.loadRds();
        this.loadAccounts();
      },
      error: (err: any) => {
        const msg = err?.error?.message ?? err?.message ?? 'Failed to open Recurring Deposit';
        this.snackBar.open(msg, 'Close', { duration: 4000, panelClass: ['error-snackbar'] });
        this.submitting.set(false);
      },
    });
  }
}
