import { Component, ChangeDetectionStrategy, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoanService } from '../../service/loan.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AccountService } from '../../../accounts/services/account.service';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface LoanTypeOption {
  key: string;
  label: string;
  min: number;
  max: number;
  rate: string;
  icon: string; // svg path key
}

const LOAN_TYPES: LoanTypeOption[] = [
  { key: 'PERSONAL',  label: 'Personal loan',  min: 10000,  max: 2000000,  rate: '10.5%', icon: 'user' },
  { key: 'HOME',      label: 'Home loan',       min: 500000, max: 20000000, rate: '8.2%',  icon: 'home' },
  { key: 'VEHICLE',   label: 'Auto loan',       min: 100000, max: 3000000,  rate: '9.1%',  icon: 'car'  },
  { key: 'EDUCATION', label: 'Education loan',  min: 50000,  max: 5000000,  rate: '7.9%',  icon: 'cap'  },
];

const TENURE_PICKS = [12, 24, 36, 60];

@Component({
  selector: 'app-loan-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './loan-create.component.html',
  styleUrl: './loan-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private loanService = inject(LoanService);
  private accountService = inject(AccountService);
  private notifications = inject(NotificationService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // ── Wizard state
  step = signal(0);
  readonly steps = ['Loan type', 'Amount & tenure', 'Purpose', 'Review'];

  // ── Loan type
  readonly LOAN_TYPES = LOAN_TYPES;
  readonly TENURE_PICKS = TENURE_PICKS;
  selectedType = signal<LoanTypeOption | null>(null);

  // ── Amount
  amount = signal(0);
  amountMin = computed(() => this.selectedType()?.min ?? 10000);
  amountMax = computed(() => this.selectedType()?.max ?? 5000000);
  amountStep = computed(() => Math.max(1000, Math.round(this.amountMin() / 10)));

  // ── Tenure
  tenure = signal(24);
  customTenure = signal(false);
  customTenureValue = 24;

  // ── Purpose
  purpose = signal('');

  // ── Account (auto-selected)
  accounts = signal<any[]>([]);
  primaryAccount = computed(() => this.accounts()[0] ?? null);

  // ── Submission
  submitting = signal(false);
  submitError = signal<string | null>(null);

  // ── EMI estimate
  monthlyEmi = computed(() => {
    const t = this.selectedType();
    const a = this.amount();
    const m = this.tenure();
    if (!t || !a || !m) return 0;
    return Math.round((a * 1.09) / m);
  });

  ngOnInit(): void {
    this.accountService.getMyAccounts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any) => {
          const list = Array.isArray(data) ? data : (data?.content ?? []);
          this.accounts.set(list);
        },
        error: () => {
          this.submitError.set('Could not load your accounts. Please refresh and try again.');
        }
      });
  }

  selectType(lt: LoanTypeOption): void {
    this.selectedType.set(lt);
    this.amount.set(lt.min);
  }

  setAmount(val: number): void {
    this.amount.set(val);
  }

  setTenurePick(m: number): void {
    this.tenure.set(m);
    this.customTenure.set(false);
  }

  enableCustomTenure(): void {
    this.customTenure.set(true);
    this.customTenureValue = this.tenure();
  }

  onCustomTenureChange(val: number): void {
    this.customTenureValue = val;
    this.tenure.set(val);
  }

  canProceed(): boolean {
    const s = this.step();
    if (s === 0) return !!this.selectedType();
    if (s === 1) {
      const a = this.amount();
      return a >= this.amountMin() && a <= this.amountMax() && this.tenure() >= 6;
    }
    if (s === 2) return this.purpose().trim().length > 5;
    return true;
  }

  next(): void { if (this.canProceed()) this.step.update(s => Math.min(s + 1, 3)); }
  back(): void { this.step.update(s => Math.max(s - 1, 0)); }

  formatInr(n: number): string {
    return '₹' + Number(n).toLocaleString('en-IN');
  }

  submit(): void {
    const t = this.selectedType();
    if (!t) return;
    this.submitError.set(null);

    const acc = this.primaryAccount();
    const accountId = acc?.id ?? acc?.accountId ?? acc?.account_id;
    if (!accountId) {
      this.submitError.set('No active account found. Please open an account before applying for a loan.');
      return;
    }

    this.submitting.set(true);
    this.loanService.createLoan({
      accountId,
      loanType:        t.key,
      requestedAmount: this.amount(),
      tenureMonths:    this.tenure(),
      purpose:         this.purpose(),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.submitting.set(false);
        this.notifications.success('Loan application submitted successfully.');
        this.router.navigate(['/loans']);
      },
      error: (err: any) => {
        this.submitting.set(false);
        const msg = err?.error?.message ?? err?.error?.errors?.[0]?.message ?? err?.message ?? 'Failed to submit loan application.';
        this.submitError.set(msg);
      },
    });
  }
}
