import {
  Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef,
  signal, computed, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { AccountService } from '../../../accounts/services/account.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PaymentMethod, PaymentOrder } from '../../models/payment.model';

type Stage = 'form' | 'processing' | 'success' | 'failed' | 'pending';

const QUICK_AMOUNTS = [500, 1000, 5000, 10000];
const MIN_AMOUNT = 1;
const MAX_AMOUNT = 100000;

@Component({
  selector: 'app-add-money',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-money.component.html',
  styleUrl: './add-money.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMoneyComponent implements OnInit {
  private fb                  = inject(FormBuilder);
  private paymentService      = inject(PaymentService);
  private accountService      = inject(AccountService);
  private notifications       = inject(NotificationService);
  private cdr                 = inject(ChangeDetectorRef);

  readonly QUICK_AMOUNTS = QUICK_AMOUNTS;
  readonly methods: PaymentMethod[] = ['UPI', 'CARD'];

  stage           = signal<Stage>('form');
  accounts        = signal<any[]>([]);
  accountsLoading = signal(true);
  submitting      = signal(false);
  method          = signal<PaymentMethod>('UPI');
  result          = signal<PaymentOrder | null>(null);
  failureMessage  = signal('');
  history         = signal<PaymentOrder[]>([]);
  historyLoading  = signal(true);

  // One key per attempt: a retry after a request error reuses it, a new payment gets a new one
  private idempotencyKey = crypto.randomUUID();

  form = this.fb.group({
    accountId: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(MIN_AMOUNT), Validators.max(MAX_AMOUNT)]],
  });

  selectedAccount = computed(() => {
    const id = this.form.get('accountId')?.value;
    return this.accounts().find(a => (a.id ?? a.accountId) === id) ?? null;
  });

  ngOnInit(): void {
    this.accountService.getMyAccounts().subscribe({
      next: (data: any) => {
        const list: any[] = data?.content ?? (Array.isArray(data) ? data : []);
        const active = list.filter((a: any) => (a.status ?? a.accountStatus) === 'ACTIVE');
        this.accounts.set(active);
        if (active.length) this.form.patchValue({ accountId: active[0].id ?? active[0].accountId });
        this.accountsLoading.set(false);
        this.cdr.markForCheck();
      },
      error: () => { this.accountsLoading.set(false); this.cdr.markForCheck(); },
    });
    this.loadHistory();
  }

  setMethod(m: PaymentMethod): void {
    this.method.set(m);
  }

  setQuickAmount(v: number): void {
    this.form.patchValue({ amount: v });
    this.cdr.markForCheck();
  }

  hasError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.touched && ctrl.hasError(error));
  }

  async pay(): Promise<void> {
    this.form.markAllAsTouched();
    const account = this.selectedAccount();
    if (this.form.invalid || !account || this.submitting()) return;

    this.submitting.set(true);
    this.paymentService.createOrder({
      sourceAccountId: account.id ?? account.accountId,
      sourceAccountNumber: account.accountNumber,
      amount: this.form.value.amount!,
      paymentMethod: this.method(),
    }, this.idempotencyKey).subscribe({
      next: order => this.startCheckout(order),
      error: err => {
        this.submitting.set(false);
        this.notifications.error(err?.error?.message ?? 'Could not start the payment. Please try again.');
        this.cdr.markForCheck();
      },
    });
  }

  private async startCheckout(order: PaymentOrder): Promise<void> {
    try {
      const res = await this.paymentService.openCheckout(order);
      if (res.outcome === 'dismissed') {
        // User closed the popup — they may change the amount, and the backend would
        // return the old order for a reused key, so the next attempt gets a new one
        this.idempotencyKey = crypto.randomUUID();
        this.submitting.set(false);
        this.cdr.markForCheck();
        return;
      }
      if (res.outcome === 'failed') {
        this.fail(res.message ?? 'The payment was declined.');
        return;
      }
      this.waitForConfirmation(order.id);
    } catch (e: any) {
      this.submitting.set(false);
      this.notifications.error(e?.message ?? 'Could not open the payment gateway.');
      this.cdr.markForCheck();
    }
  }

  /** Popup success is not proof of payment: wait for the webhook-driven status. */
  private waitForConfirmation(orderId: string): void {
    this.stage.set('processing');
    this.cdr.markForCheck();

    let latest: PaymentOrder | null = null;
    this.paymentService.pollUntilFinal(orderId).subscribe({
      next: order => { latest = order; },
      error: () => { this.finish(latest); },
      complete: () => { this.finish(latest); },
    });
  }

  private finish(order: PaymentOrder | null): void {
    this.submitting.set(false);
    this.result.set(order);
    if (order?.status === 'COMPLETED') {
      this.stage.set('success');
    } else if (order?.status === 'FAILED') {
      this.fail('The payment could not be completed.');
      return;
    } else {
      this.stage.set('pending');
    }
    this.loadHistory();
    this.cdr.markForCheck();
  }

  private fail(message: string): void {
    this.submitting.set(false);
    this.failureMessage.set(message);
    this.stage.set('failed');
    this.loadHistory();
    this.cdr.markForCheck();
  }

  /** Back to the form; a fresh key because this is a new payment attempt. */
  reset(): void {
    this.idempotencyKey = crypto.randomUUID();
    this.form.patchValue({ amount: null });
    this.form.get('amount')?.markAsUntouched();
    this.result.set(null);
    this.stage.set('form');
    this.cdr.markForCheck();
  }

  private loadHistory(): void {
    this.paymentService.getMyOrders({ page: 0, size: 5 }).subscribe({
      next: page => {
        this.history.set(page?.content ?? []);
        this.historyLoading.set(false);
        this.cdr.markForCheck();
      },
      error: () => { this.historyLoading.set(false); this.cdr.markForCheck(); },
    });
  }

  formatInr(amount: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);
  }
}
