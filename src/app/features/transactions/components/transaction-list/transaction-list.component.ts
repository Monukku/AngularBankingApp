import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, HostListener, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TransactionService } from '../../services/transaction.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoaderComponent],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionListComponent implements OnInit {
  private api = inject(ApiService);
  private transactionService = inject(TransactionService);
  protected authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  transactions = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  page = signal(0);
  totalPages = signal(0);
  actionMsg = signal<{ id: string; msg: string; ok: boolean } | null>(null);
  processing = signal<string | null>(null);

  reverseModal = signal<string | null>(null);
  reverseReason = '';

  typeFilter = signal<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
  statusFilter = signal('');
  searchText = signal('');

  readonly statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'REVERSED', label: 'Reversed' },
  ];
  openDropdown: 'status' | null = null;

  closeDropdowns() { this.openDropdown = null; this.cdr.markForCheck(); }

  openHoverDD(name: 'status') { this.openDropdown = name; this.cdr.markForCheck(); }
  closeHoverDD() { this.openDropdown = null; this.cdr.markForCheck(); }

  selectStatus(value: string) {
    this.statusFilter.set(value);
    this.openDropdown = null;
  }

  get statusLabel(): string {
    return this.statusOptions.find(o => o.value === this.statusFilter())?.label ?? 'All statuses';
  }

  get isStaff(): boolean {
    return this.authService.isStaff() && !this.authService.isCustomer();
  }

  get dateRangeLabel(): string {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${fmt(start)} — ${fmt(now)}`;
  }

  filteredTxns = computed(() => {
    let list = this.transactions();
    const tf = this.typeFilter();
    if (tf !== 'ALL') {
      list = list.filter(t => {
        const type = (t.transactionType ?? '').toUpperCase();
        if (tf === 'CREDIT') return type === 'CREDIT' || type === 'DEPOSIT';
        if (tf === 'DEBIT')  return type === 'DEBIT' || type === 'WITHDRAWAL' || type === 'TRANSFER';
        return true;
      });
    }
    const sf = this.statusFilter();
    if (sf) {
      list = list.filter(t => (t.transactionStatus ?? t.status ?? '').toUpperCase() === sf);
    }
    const q = this.searchText().toLowerCase().trim();
    if (q) {
      list = list.filter(t =>
        (t.description ?? '').toLowerCase().includes(q) ||
        (t.referenceNumber ?? '').toLowerCase().includes(q) ||
        (t.id ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  });

  totalMoneyIn = computed(() =>
    this.filteredTxns().filter(t => this.isCreditTxn(t)).reduce((s, t) => s + (t.amount ?? 0), 0)
  );

  totalMoneyOut = computed(() =>
    this.filteredTxns().filter(t => !this.isCreditTxn(t)).reduce((s, t) => s + (t.amount ?? 0), 0)
  );

  groupedTxns = computed(() => {
    const txns = [...this.filteredTxns()].sort((a, b) =>
      new Date(b.createdAt ?? b.date).getTime() - new Date(a.createdAt ?? a.date).getTime()
    );
    const startOfWeek = (d: Date) => {
      const c = new Date(d); c.setHours(0,0,0,0); c.setDate(c.getDate() - c.getDay()); return c.getTime();
    };
    const now = new Date();
    const thisWeekStart = startOfWeek(now);
    const lastWeekStart = thisWeekStart - 7 * 86400000;
    const buckets = new Map<string, any[]>();
    for (const t of txns) {
      const d = new Date(t.createdAt ?? t.date);
      const ws = startOfWeek(d);
      let label: string;
      if (ws >= thisWeekStart) label = 'THIS WEEK';
      else if (ws >= lastWeekStart) label = 'LAST WEEK';
      else label = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }).toUpperCase();
      if (!buckets.has(label)) buckets.set(label, []);
      buckets.get(label)!.push(t);
    }
    return Array.from(buckets.entries()).map(([label, items]) => ({ label, items }));
  });

  @HostListener('document:click')
  onDocumentClick(): void { this.closeDropdowns(); }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    const obs$ = this.isStaff
      ? this.api.getAllTransactions({ page: this.page(), size: 50 })
      : this.transactionService.getTransactions({ page: this.page(), size: 50 });
    obs$.subscribe({
      next: (data: any) => {
        this.transactions.set(data?.content ?? (Array.isArray(data) ? data : []));
        this.totalPages.set(data?.totalPages ?? 1);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set(err?.message || 'Failed to load transactions.');
        this.loading.set(false);
      },
    });
  }

  setTypeFilter(f: 'ALL' | 'CREDIT' | 'DEBIT'): void { this.typeFilter.set(f); }

  exportCsv(): void {
    const rows = this.filteredTxns();
    if (!rows.length) return;
    const headers = ['Date', 'Reference', 'Description', 'Type', 'Amount', 'Status'];
    const lines = rows.map(t => [
      new Date(t.createdAt ?? t.date).toLocaleDateString('en-IN'),
      t.referenceNumber ?? t.id,
      t.description ?? '',
      t.transactionType ?? '',
      t.amount,
      t.transactionStatus ?? t.status ?? '',
    ].join(','));
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  prevPage(): void {
    if (this.page() > 0) { this.page.update(p => p - 1); this.load(); }
  }
  nextPage(): void {
    if (this.page() < this.totalPages() - 1) { this.page.update(p => p + 1); this.load(); }
  }

  openReverseModal(txnId: string): void {
    this.reverseReason = '';
    this.reverseModal.set(txnId);
  }

  confirmReverse(): void {
    const txnId = this.reverseModal();
    if (!txnId) return;
    const reason = this.reverseReason.trim();
    if (!reason) return;
    this.reverseModal.set(null);
    this.processing.set(txnId);
    this.actionMsg.set(null);
    this.api.reverseTransaction(txnId, reason).subscribe({
      next: () => {
        this.actionMsg.set({ id: txnId, msg: 'Reversed successfully.', ok: true });
        this.processing.set(null);
        this.load();
      },
      error: (err: any) => {
        this.actionMsg.set({ id: txnId, msg: err?.message || 'Failed to reverse.', ok: false });
        this.processing.set(null);
      },
    });
  }

  isCreditTxn(t: any): boolean {
    const type = (t.transactionType ?? '').toUpperCase();
    return type === 'CREDIT' || type === 'DEPOSIT';
  }

  isDebitTxn(t: any): boolean {
    const type = (t.transactionType ?? '').toUpperCase();
    return type === 'DEBIT' || type === 'WITHDRAWAL';
  }

  isFailedTxn(t: any): boolean {
    return (t.transactionStatus ?? t.status ?? '').toUpperCase() === 'FAILED';
  }

  txnIconClass(t: any): string {
    if (this.isCreditTxn(t)) return 'credit';
    if (this.isDebitTxn(t)) return 'debit';
    return 'transfer';
  }

  txnLabel(t: any): string {
    if (t.description) return t.description;
    const type = (t.transactionType ?? '').toLowerCase();
    const from = t.sourceAccountNumber ? `from ${t.sourceAccountNumber}` : '';
    const to   = t.destinationAccountNumber ? `to ${t.destinationAccountNumber}` : '';
    return `${type.charAt(0).toUpperCase() + type.slice(1)} ${from || to}`.trim() || 'Transaction';
  }

  formatStatus(status: string): string {
    if (!status) return '';
    if (status.toUpperCase() === 'COMPLETED') return 'Success';
    const s = status.toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  statusClass(status: string): string { return (status ?? '').toLowerCase(); }
  typeClass(type: string): string { return (type ?? '').toLowerCase(); }
}
