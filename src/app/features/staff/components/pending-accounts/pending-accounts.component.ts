import { Component, OnInit, HostListener, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-pending-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './pending-accounts.component.html',
  styleUrl: './pending-accounts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendingAccountsComponent implements OnInit {
  private api = inject(ApiService);

  accounts = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  actionMsg = signal<{ id: string; msg: string; ok: boolean } | null>(null);
  activating = signal<string | null>(null);
  rejecting = signal<string | null>(null);
  rejectTarget = signal<any | null>(null);
  rejectReason = '';

  searchQuery = '';
  typeFilter = '';
  openDropdown = signal<'type' | null>(null);

  readonly typeOptions = [
    { value: '', label: 'All types' },
    { value: 'SAVINGS', label: 'Savings' },
    { value: 'CURRENT', label: 'Current' },
    { value: 'BUSINESS', label: 'Business' },
  ];

  filteredAccounts = computed(() => {
    let list = this.accounts();
    if (this.typeFilter) {
      list = list.filter(a => (a.accountType ?? '').toUpperCase() === this.typeFilter);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(a =>
        (a.fullName ?? a.customerName ?? '').toLowerCase().includes(q) ||
        (a.accountNumber ?? '').toLowerCase().includes(q) ||
        (a.email ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  });

  readonly PAGE_SIZE = 10;
  currentPage   = signal(1);
  totalPages    = computed(() => Math.max(1, Math.ceil(this.filteredAccounts().length / this.PAGE_SIZE)));
  pagedAccounts = computed(() => {
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.filteredAccounts().slice(start, start + this.PAGE_SIZE);
  });
  showingFrom = computed(() => this.filteredAccounts().length === 0 ? 0 : (this.currentPage() - 1) * this.PAGE_SIZE + 1);
  showingTo   = computed(() => Math.min(this.currentPage() * this.PAGE_SIZE, this.filteredAccounts().length));
  pageNumbers = computed(() => {
    const total = this.totalPages(), current = this.currentPage(), delta = 2, pages: number[] = [];
    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) pages.push(i);
    return pages;
  });
  goToPage(p: number): void { if (p >= 1 && p <= this.totalPages()) this.currentPage.set(p); }

  openHoverDD(name: 'type') { this.openDropdown.set(name); }
  closeHoverDD() { this.openDropdown.set(null); }

  selectType(v: string) {
    this.typeFilter = v;
    this.currentPage.set(1);
    this.openDropdown.set(null);
  }

  get typeLabel(): string {
    return this.typeOptions.find(o => o.value === this.typeFilter)?.label ?? 'All types';
  }

  @HostListener('document:click')
  onDocumentClick(): void { this.openDropdown.set(null); }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getAccountsByStatus('PENDING').subscribe({
      next: (data) => {
        this.accounts.set(Array.isArray(data) ? data : []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load pending accounts.');
        this.loading.set(false);
      },
    });
  }

  activate(accountId: string): void {
    this.activating.set(accountId);
    this.actionMsg.set(null);
    this.api.activateAccount(accountId).subscribe({
      next: () => {
        this.actionMsg.set({ id: accountId, msg: 'Activated!', ok: true });
        this.activating.set(null);
        this.load();
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || 'Failed to activate account.';
        this.actionMsg.set({ id: accountId, msg, ok: false });
        this.activating.set(null);
      },
    });
  }

  openRejectDialog(acc: any): void {
    this.rejectTarget.set(acc);
    this.rejectReason = '';
  }

  confirmReject(): void {
    const acc = this.rejectTarget();
    if (!acc) return;
    this.rejecting.set(acc.id);
    const reason = this.rejectReason.trim() || 'Rejected by teller';
    this.api.rejectAccount(acc.id, reason).subscribe({
      next: () => {
        this.rejectTarget.set(null);
        this.rejecting.set(null);
        this.actionMsg.set({ id: acc.id, msg: 'Account rejected.', ok: true });
        this.load();
      },
      error: (err) => {
        const msg = err?.error?.message || 'Failed to reject account.';
        this.rejectTarget.set(null);
        this.rejecting.set(null);
        this.actionMsg.set({ id: acc.id, msg, ok: false });
      },
    });
  }
}
