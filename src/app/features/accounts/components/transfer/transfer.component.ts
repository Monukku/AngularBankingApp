import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TransactionService } from '../../../transactions/services/transaction.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferFundsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);
  private accountService = inject(AccountService);
  private notifications = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  transferring = signal(false);
  success = signal(false);
  accounts = signal<any[]>([]);
  accountsLoading = signal(true);
  openDropdown: 'fromAccount' | null = null;

  openHoverDD(name: 'fromAccount') { this.openDropdown = name; this.cdr.markForCheck(); }
  closeHoverDD() { this.openDropdown = null; this.cdr.markForCheck(); }

  selectFromAccount(id: string) {
    this.form.get('fromAccountId')?.setValue(id);
    this.openDropdown = null;
    this.cdr.markForCheck();
  }

  get fromAccountLabel(): string {
    const id = this.form.get('fromAccountId')?.value;
    const a = this.accounts().find(x => (x.id ?? x.accountId) === id);
    return a ? `${a.accountType} · ${a.accountNumber}${a.balance != null ? ` (₹${Number(a.balance).toLocaleString('en-IN', {minimumFractionDigits:2})})` : ''}` : '— Select account —';
  }

  form = this.fb.group({
    fromAccountId:   ['', Validators.required],
    toAccountNumber: ['', Validators.required],
    amount:          [null as number | null, [Validators.required, Validators.min(1)]],
    description:     [''],
  });

  @HostListener('document:click')
  onDocumentClick(): void { this.openDropdown = null; this.cdr.markForCheck(); }

  ngOnInit(): void {
    this.accountService.getMyAccounts().subscribe({
      next: (data: any) => {
        const list: any[] = data?.content ?? (Array.isArray(data) ? data : []);
        const active = list.filter((a: any) => (a.status ?? a.accountStatus) === 'ACTIVE');
        this.accounts.set(active);
        if (active.length === 1) {
          this.form.patchValue({ fromAccountId: active[0].id ?? active[0].accountId });
        }
        this.accountsLoading.set(false);
      },
      error: () => { this.accountsLoading.set(false); this.cdr.markForCheck(); },
    });

    const qp = this.route.snapshot.queryParams;
    if (qp['toAccount']) {
      this.form.patchValue({ toAccountNumber: qp['toAccount'] });
    }
  }

  transfer(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    this.transferring.set(true);
    this.transactionService.transferFunds({
      fromAccountId:   v.fromAccountId!,
      toAccountNumber: v.toAccountNumber!,
      amount:          v.amount!,
      description:     v.description || undefined,
    }).subscribe({
      next: () => {
        this.transferring.set(false);
        this.success.set(true);
        this.form.reset();
        this.notifications.success('Funds transferred successfully.');
      },
      error: (err) => {
        this.transferring.set(false);
        this.notifications.error(err?.error?.message ?? 'Transfer failed. Please try again.');
      },
    });
  }

  hasError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.touched && ctrl.hasError(error));
  }
}
