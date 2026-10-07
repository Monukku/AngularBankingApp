import {
  Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef,
  signal, computed, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AccountService } from '../../../accounts/services/account.service';

type PaymentMethod = 'IMPS' | 'NEFT' | 'RTGS';

const METHOD_META: Record<PaymentMethod, { arrival: string; minAmount: number; maxAmount: number }> = {
  IMPS: { arrival: 'Instant (24×7)',              minAmount: 1,      maxAmount: 500000    },
  NEFT: { arrival: 'Within 2 hours',              minAmount: 1,      maxAmount: 200000000 },
  RTGS: { arrival: 'Within 30 minutes',           minAmount: 200000, maxAmount: 200000000 },
};

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];


@Component({
  selector: 'app-transfer-funds',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './transfer-funds.component.html',
  styleUrl: './transfer-funds.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferFundsComponent implements OnInit {
  private fb            = inject(FormBuilder);
  private transactionService = inject(TransactionService);
  private accountService     = inject(AccountService);
  private notifications      = inject(NotificationService);
  private cdr                = inject(ChangeDetectorRef);

  readonly QUICK_AMOUNTS  = QUICK_AMOUNTS;
  readonly methods: PaymentMethod[] = ['IMPS', 'NEFT', 'RTGS'];
  readonly METHOD_META    = METHOD_META;

  // ── state
  step            = signal<'recipient' | 'amount' | 'review' | 'success'>('recipient');
  accounts        = signal<any[]>([]);
  accountsLoading = signal(true);
  transferring    = signal(false);
  successTxn      = signal<any>(null);
  selectedMethod  = signal<PaymentMethod>('IMPS');
  noteText        = '';

  // step 1 form
  recipientForm = this.fb.group({
    fromAccountId:   ['', Validators.required],
    beneficiaryName: [''],
    toAccountNumber: ['', Validators.required],
    toIfsc:          [''],
  });

  // step 2 form
  amountForm = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  // ── computed
  fromAccount = computed(() => {
    const id = this.recipientForm.get('fromAccountId')?.value;
    return this.accounts().find(a => (a.id ?? a.accountId) === id) ?? null;
  });

  amountValue = computed(() => this.amountForm.get('amount')?.value ?? 0);

  amountError = computed(() => {
    const amt = this.amountValue();
    const m = METHOD_META[this.selectedMethod()];
    if (!amt) return null;
    if (amt < m.minAmount) return `Min for ${this.selectedMethod()} is ₹${m.minAmount.toLocaleString('en-IN')}`;
    if (amt > m.maxAmount) return `Max for ${this.selectedMethod()} is ₹${(m.maxAmount).toLocaleString('en-IN')}`;
    return null;
  });

  stepIndex = computed(() => {
    const map: Record<string, number> = { recipient: 0, amount: 1, review: 2, success: 3 };
    return map[this.step()] ?? 0;
  });

  readonly steps = ['Recipient', 'Amount', 'Review'];

  ngOnInit(): void {
    this.accountService.getMyAccounts().subscribe({
      next: (data: any) => {
        const list: any[] = data?.content ?? (Array.isArray(data) ? data : []);
        const active = list.filter((a: any) =>
          (a.status ?? a.accountStatus) === 'ACTIVE' &&
          ['SAVINGS', 'CURRENT', 'BUSINESS', 'SALARY'].includes(a.accountType)
        );
        this.accounts.set(active);
        if (active.length >= 1) {
          this.recipientForm.patchValue({ fromAccountId: active[0].id ?? active[0].accountId });
        }
        this.accountsLoading.set(false);
        this.cdr.markForCheck();
      },
      error: () => { this.accountsLoading.set(false); this.cdr.markForCheck(); },
    });
  }

  setMethod(m: PaymentMethod): void {
    this.selectedMethod.set(m);
    this.cdr.markForCheck();
  }

  setQuickAmount(v: number): void {
    this.amountForm.patchValue({ amount: v });
    this.cdr.markForCheck();
  }

  setMaxAmount(): void {
    const bal = this.fromAccount()?.balance ?? 0;
    this.amountForm.patchValue({ amount: bal });
    this.cdr.markForCheck();
  }

  // Step 1 → 2
  continueToAmount(): void {
    this.recipientForm.markAllAsTouched();
    if (this.recipientForm.invalid) return;
    this.step.set('amount');
    this.cdr.markForCheck();
  }

  // Step 2 → 3
  continueToReview(): void {
    this.amountForm.markAllAsTouched();
    if (this.amountForm.invalid || this.amountError()) return;
    this.step.set('review');
    this.cdr.markForCheck();
  }

  // Step back
  goBack(): void {
    const cur = this.step();
    if (cur === 'amount')  this.step.set('recipient');
    if (cur === 'review')  this.step.set('amount');
    this.cdr.markForCheck();
  }

  confirmTransfer(): void {
    this.transferring.set(true);
    const v  = this.recipientForm.value;
    const amt = this.amountForm.value.amount!;

    this.transactionService.transferFunds({
      fromAccountId:   v.fromAccountId!,
      toAccountNumber: v.toAccountNumber ?? '',
      amount:          amt,
      description:     this.noteText || undefined,
      paymentMethod:   this.selectedMethod(),
    }).subscribe({
      next: (txn: any) => {
        this.transferring.set(false);
        this.successTxn.set(txn);
        this.step.set('success');
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.transferring.set(false);
        this.step.set('review');
        this.notifications.error(err?.error?.message ?? 'Transfer failed. Please try again.');
        this.cdr.markForCheck();
      },
    });
  }

  newTransfer(): void {
    this.recipientForm.reset();
    this.amountForm.reset();
    this.noteText = '';
    this.step.set('recipient');
    this.successTxn.set(null);
    this.selectedMethod.set('IMPS');
    const accs = this.accounts();
    if (accs.length) this.recipientForm.patchValue({ fromAccountId: accs[0].id ?? accs[0].accountId });
    this.cdr.markForCheck();
  }

  hasRecipientError(field: string, error: string): boolean {
    const ctrl = this.recipientForm.get(field);
    return !!(ctrl?.touched && ctrl.hasError(error));
  }

  hasAmountError(field: string, error: string): boolean {
    const ctrl = this.amountForm.get(field);
    return !!(ctrl?.touched && ctrl.hasError(error));
  }

  formatInr(amount: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);
  }
}
