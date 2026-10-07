import { Component, OnInit, HostListener, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-kyc-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './kyc-approvals.component.html',
  styleUrl: './kyc-approvals.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KycApprovalsComponent implements OnInit {
  private api = inject(ApiService);

  customers = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  actionMsg = signal<{ id: string; msg: string; ok: boolean } | null>(null);
  processing = signal<string | null>(null);

  rejectModal = signal<string | null>(null);
  rejectReason = '';

  searchQuery = signal('');
  statusFilter = signal('');
  openDropdown = signal<'status' | null>(null);

  readonly statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'UNDER_REVIEW', label: 'Under Review' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'REJECTED', label: 'Rejected' },
  ];

  filtered = computed(() => {
    let list = this.customers();
    const sf = this.statusFilter();
    if (sf) {
      list = list.filter(c => (c.kycStatus ?? '').toUpperCase() === sf);
    }
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(c =>
        (c.fullName ?? '').toLowerCase().includes(q) ||
        (c.email ?? '').toLowerCase().includes(q) ||
        (c.mobileNumber ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  });

  readonly PAGE_SIZE = 10;
  currentPage = signal(1);
  totalPages  = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.PAGE_SIZE)));
  pagedItems  = computed(() => {
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.filtered().slice(start, start + this.PAGE_SIZE);
  });
  showingFrom = computed(() => this.filtered().length === 0 ? 0 : (this.currentPage() - 1) * this.PAGE_SIZE + 1);
  showingTo   = computed(() => Math.min(this.currentPage() * this.PAGE_SIZE, this.filtered().length));
  pageNumbers = computed(() => {
    const total = this.totalPages(), current = this.currentPage(), delta = 2, pages: number[] = [];
    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) pages.push(i);
    return pages;
  });
  goToPage(p: number): void { if (p >= 1 && p <= this.totalPages()) this.currentPage.set(p); }

  openHoverDD(name: 'status') { this.openDropdown.set(name); }
  closeHoverDD() { this.openDropdown.set(null); }

  selectStatus(v: string) {
    this.statusFilter.set(v);
    this.currentPage.set(1);
    this.openDropdown.set(null);
  }

  get statusLabel(): string {
    return this.statusOptions.find(o => o.value === this.statusFilter())?.label ?? 'All statuses';
  }

  @HostListener('document:click')
  onDocumentClick(): void { this.openDropdown.set(null); }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getPendingKyc().subscribe({
      next: (data) => {
        this.customers.set(Array.isArray(data) ? data : []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load KYC queue.');
        this.loading.set(false);
      },
    });
  }

  startReview(customerId: string): void {
    this.processing.set(customerId);
    this.actionMsg.set(null);
    this.api.startKycReview(customerId).subscribe({
      next: () => {
        this.actionMsg.set({ id: customerId, msg: 'Moved to Under Review', ok: true });
        this.processing.set(null);
        this.load();
      },
      error: (err) => {
        this.actionMsg.set({ id: customerId, msg: err?.message || 'Failed.', ok: false });
        this.processing.set(null);
      },
    });
  }

  approve(customerId: string): void {
    this.processing.set(customerId + '_approve');
    this.actionMsg.set(null);
    this.api.verifyKyc(customerId, { decision: 'VERIFIED' }).subscribe({
      next: () => {
        this.actionMsg.set({ id: customerId, msg: 'KYC Approved!', ok: true });
        this.processing.set(null);
        this.load();
      },
      error: (err) => {
        this.actionMsg.set({ id: customerId, msg: err?.message || 'Failed to approve.', ok: false });
        this.processing.set(null);
      },
    });
  }

  openRejectModal(customerId: string): void {
    this.rejectReason = '';
    this.rejectModal.set(customerId);
  }

  confirmReject(): void {
    const customerId = this.rejectModal();
    if (!customerId) return;
    const rejectionReason = this.rejectReason.trim();
    if (!rejectionReason) {
      this.actionMsg.set({ id: customerId, msg: 'Rejection reason is required.', ok: false });
      return;
    }
    this.rejectModal.set(null);
    this.processing.set(customerId + '_reject');
    this.actionMsg.set(null);
    this.api.verifyKyc(customerId, { decision: 'REJECTED', rejectionReason }).subscribe({
      next: () => {
        this.actionMsg.set({ id: customerId, msg: 'KYC Rejected.', ok: false });
        this.processing.set(null);
        this.load();
      },
      error: (err) => {
        this.actionMsg.set({ id: customerId, msg: err?.message || 'Failed to reject.', ok: false });
        this.processing.set(null);
      },
    });
  }

  isProcessing(id: string): boolean {
    const p = this.processing();
    return p === id || p === id + '_approve' || p === id + '_reject';
  }

  viewDocument(documentId: string): void {
    this.api.getKycDocumentUrl(documentId).subscribe({
      next: (res: any) => {
        const url = res?.url ?? res?.viewUrl ?? res;
        if (url && typeof url === 'string') {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      },
      error: () => {},
    });
  }
}
