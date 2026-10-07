import {
  Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, HostListener, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CardService } from '../../../cards/service/card.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ApiService } from '../../../../core/services/api.service';

const PAGE_SIZE = 5;

@Component({
  selector: 'app-card-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card-management.component.html',
  styleUrls: ['./card-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardManagementComponent implements OnInit {
  private cardService   = inject(CardService);
  private apiService    = inject(ApiService);
  private snackBar      = inject(MatSnackBar);
  private cdr           = inject(ChangeDetectorRef);
  protected authService = inject(AuthService);

  // All cards
  allCards    = signal<any[]>([]);
  allLoading  = signal(true);


  // Search / filter
  searchQuery  = signal('');
  statusFilter = signal('ALL');
  typeFilter   = signal('ALL');
  openDropdown: 'status' | 'type' | null = null;

  readonly statusOptions = ['ALL', 'ACTIVE', 'PENDING', 'BLOCKED', 'CANCELLED', 'EXPIRED'];
  readonly typeOptions   = ['ALL', 'DEBIT', 'CREDIT', 'PREPAID'];

  // Selected customer + their cards (kept for search flow)
  selectedCustomer = signal<any>(null);
  customerCards    = signal<any[]>([]);
  lookupLoading    = signal(false);

  readonly filteredCards = computed(() => {
    let list = this.allCards();
    const sf = this.statusFilter();
    const tf = this.typeFilter();
    const q  = this.searchQuery().trim().toLowerCase();
    if (sf !== 'ALL') list = list.filter(c => (c.status ?? '').toUpperCase() === sf);
    if (tf !== 'ALL') list = list.filter(c => (c.cardType ?? '').toUpperCase() === tf);
    if (q) list = list.filter(c =>
      (c.cardLastFour ?? '').includes(q) ||
      (c.nameOnCard ?? '').toLowerCase().includes(q) ||
      (c.cardNetwork ?? '').toLowerCase().includes(q) ||
      (c.keycloakUserId ?? '').toLowerCase().includes(q)
    );
    return list;
  });

  // Pagination
  currentPage = signal(1);
  totalPages  = computed(() => Math.max(1, Math.ceil(this.filteredCards().length / PAGE_SIZE)));
  pagedCards  = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.filteredCards().slice(start, start + PAGE_SIZE);
  });
  showingFrom = computed(() => this.filteredCards().length === 0 ? 0 : (this.currentPage() - 1) * PAGE_SIZE + 1);
  showingTo   = computed(() => Math.min(this.currentPage() * PAGE_SIZE, this.filteredCards().length));
  pageNumbers = computed(() => {
    const total = this.totalPages(), current = this.currentPage(), delta = 2, pages: number[] = [];
    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) pages.push(i);
    return pages;
  });
  goToPage(p: number): void { if (p >= 1 && p <= this.totalPages()) this.currentPage.set(p); }

  // Action state
  actionLoading = signal<string | null>(null);

  // Block modal
  blockModal  = signal<any>(null);
  blockReason = '';

  // Cancel confirm
  cancelTarget = signal<any>(null);
  cancelReason = '';

  // Super Admin: bulk select + reveal
  selectedCards  = new Set<string>();
  revealedCards  = new Set<string>();
  searchResults  = signal<any[]>([]);
  searchLoading  = signal(false);
  searchError    = signal('');


  openHoverDD(name: 'status' | 'type') { this.openDropdown = name; this.cdr.markForCheck(); }
  closeHoverDD() { this.openDropdown = null; this.cdr.markForCheck(); }
  selectStatus(v: string) { this.statusFilter.set(v); this.currentPage.set(1); this.openDropdown = null; this.cdr.markForCheck(); }
  selectType(v: string)   { this.typeFilter.set(v);   this.currentPage.set(1); this.openDropdown = null; this.cdr.markForCheck(); }

  get statusLabel(): string { return this.statusFilter() === 'ALL' ? 'All statuses' : this.statusFilter(); }
  get typeLabel():   string { return this.typeFilter()   === 'ALL' ? 'All types'    : this.typeFilter(); }

  @HostListener('document:click')
  onDocumentClick(): void { this.openDropdown = null; this.cdr.markForCheck(); }

  ngOnInit(): void {
    this.loadAllCards();
  }

  reload(): void {
    this.loadAllCards();
  }

  loadAllCards(): void {
    this.allLoading.set(true);
    this.cardService.getAllCards().subscribe({
      next: (data: any) => {
        this.allCards.set(Array.isArray(data) ? data : (data?.content ?? []));
        this.allLoading.set(false);
      },
      error: () => { this.allLoading.set(false); },
    });
  }

  private refreshCards(): void {
    this.loadAllCards();
  }

  // Pagination — handled by goToPage()

  // Activate (pending queue)
  activate(card: any): void {
    this.actionLoading.set(card.id);
    this.cardService.activateCard(card.id).subscribe({
      next: () => {
        this.snackBar.open(`Card •••• ${card.cardLastFour} activated`, 'Close',
          { duration: 3000, panelClass: ['success-snackbar'] });
        this.actionLoading.set(null);
        this.refreshCards();
      },
      error: (err: any) => {
        this.snackBar.open(err?.error?.message ?? 'Activation failed', 'Close',
          { duration: 3500, panelClass: ['error-snackbar'] });
        this.actionLoading.set(null);
      },
    });
  }

  openBlockModal(card: any): void {
    this.blockModal.set(card);
    this.blockReason = '';
  }

  confirmBlock(): void {
    const card = this.blockModal();
    if (!card) return;
    this.actionLoading.set(card.id);
    this.cardService.staffBlockCard(card.id, this.blockReason || 'Blocked by branch staff').subscribe({
      next: () => {
        this.snackBar.open(`Card •••• ${card.cardLastFour} blocked`, 'Close',
          { duration: 3000, panelClass: ['success-snackbar'] });
        this.blockModal.set(null);
        this.actionLoading.set(null);
        this.refreshCards();
      },
      error: (err: any) => {
        this.snackBar.open(err?.error?.message ?? 'Block failed', 'Close',
          { duration: 3500, panelClass: ['error-snackbar'] });
        this.blockModal.set(null);
        this.actionLoading.set(null);
      },
    });
  }

  unblock(card: any): void {
    this.actionLoading.set(card.id);
    this.cardService.unblockCard(card.id).subscribe({
      next: () => {
        this.snackBar.open(`Card •••• ${card.cardLastFour} unblocked`, 'Close',
          { duration: 3000, panelClass: ['success-snackbar'] });
        this.actionLoading.set(null);
        this.refreshCards();
      },
      error: (err: any) => {
        this.snackBar.open(err?.error?.message ?? 'Unblock failed', 'Close',
          { duration: 3500, panelClass: ['error-snackbar'] });
        this.actionLoading.set(null);
      },
    });
  }

  reissueCard(card: any): void {
    this.snackBar.open(`Reissue request for card •••• ${card.cardLastFour} submitted`, 'Close',
      { duration: 3000, panelClass: ['success-snackbar'] });
  }

  openCancelConfirm(card: any): void {
    this.cancelTarget.set(card);
    this.cancelReason = '';
  }

  confirmCancel(): void {
    const card = this.cancelTarget();
    if (!card) return;
    this.actionLoading.set(card.id);
    this.cardService.cancelCard(card.id, this.cancelReason || 'Cancelled by branch manager').subscribe({
      next: () => {
        this.snackBar.open(`Card •••• ${card.cardLastFour} permanently cancelled`, 'Close',
          { duration: 3500, panelClass: ['success-snackbar'] });
        this.cancelTarget.set(null);
        this.actionLoading.set(null);
        this.refreshCards();
      },
      error: (err: any) => {
        this.snackBar.open(err?.error?.message ?? 'Cancel failed', 'Close',
          { duration: 3500, panelClass: ['error-snackbar'] });
        this.cancelTarget.set(null);
        this.actionLoading.set(null);
      },
    });
  }

  toggleReveal(cardId: string): void {
    if (this.revealedCards.has(cardId)) this.revealedCards.delete(cardId);
    else this.revealedCards.add(cardId);
    this.cdr.markForCheck();
  }

  toggleSelectCard(cardId: string, disabled: boolean): void {
    if (disabled) return;
    if (this.selectedCards.has(cardId)) this.selectedCards.delete(cardId);
    else this.selectedCards.add(cardId);
    this.cdr.markForCheck();
  }

  clearSelection(): void {
    this.selectedCards.clear();
    this.cdr.markForCheck();
  }

  bulkBlock(): void {
    const ids = Array.from(this.selectedCards);
    const cards = this.customerCards().filter(c => ids.includes(c.id));
    this.snackBar.open(`Blocking ${ids.length} card${ids.length > 1 ? 's' : ''}…`, 'Close',
      { duration: 2500, panelClass: ['success-snackbar'] });
    cards.forEach(card => {
      this.cardService.staffBlockCard(card.id, 'Bulk blocked by super admin').subscribe({
        next: () => {
          this.selectedCards.delete(card.id);
          this.refreshCards();
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.snackBar.open(err?.error?.message ?? `Failed to block •••• ${card.cardLastFour}`, 'Close',
            { duration: 3000, panelClass: ['error-snackbar'] });
          this.cdr.markForCheck();
        },
      });
    });
  }
}
