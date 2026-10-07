import { Component, OnInit, HostListener, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-fraud-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './fraud-alerts.component.html',
  styleUrl: './fraud-alerts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FraudAlertsComponent implements OnInit {
  private api = inject(ApiService);

  alerts = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  actionMsg = signal<{ id: string; msg: string; ok: boolean } | null>(null);
  processing = signal<string | null>(null);
  page = signal(0);

  resolveModal = signal<string | null>(null);
  resolveNotes = '';
  totalPages = signal(0);

  searchQuery = signal('');
  severityFilter = signal('');
  openDropdown = signal<'severity' | null>(null);

  readonly severityOptions = [
    { value: '', label: 'All severity' },
    { value: 'high', label: 'High (≥80)' },
    { value: 'medium', label: 'Medium (50–79)' },
    { value: 'low', label: 'Low (<50)' },
  ];

  filteredAlerts = computed(() => {
    let list = this.alerts();
    const sf = this.severityFilter();
    if (sf) {
      list = list.filter(a => {
        const score = a.fraudScore ?? a.score ?? 0;
        if (sf === 'high')   return score >= 80;
        if (sf === 'medium') return score >= 50 && score < 80;
        if (sf === 'low')    return score < 50;
        return true;
      });
    }
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(a =>
        (a.accountId ?? '').toLowerCase().includes(q) ||
        (a.transactionId ?? '').toLowerCase().includes(q) ||
        (a.id ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  });

  openHoverDD(name: 'severity') { this.openDropdown.set(name); }
  closeHoverDD() { this.openDropdown.set(null); }

  selectSeverity(v: string) {
    this.severityFilter.set(v);
    this.openDropdown.set(null);
  }

  get severityLabel(): string {
    return this.severityOptions.find(o => o.value === this.severityFilter())?.label ?? 'All severity';
  }

  @HostListener('document:click')
  onDocumentClick(): void { this.openDropdown.set(null); }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getFraudAlerts({ page: this.page(), size: 20 }).subscribe({
      next: (data) => {
        const items = data?.content ?? (Array.isArray(data) ? data : []);
        this.alerts.set(items);
        this.totalPages.set(data?.totalPages ?? 1);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load fraud alerts.');
        this.loading.set(false);
      },
    });
  }

  openResolveModal(alertId: string): void {
    this.resolveNotes = '';
    this.resolveModal.set(alertId);
  }

  confirmResolve(): void {
    const alertId = this.resolveModal();
    if (!alertId) return;
    this.resolveModal.set(null);
    this.processing.set(alertId);
    this.actionMsg.set(null);
    this.api.resolveFraudAlert(alertId, this.resolveNotes.trim(), 'RESOLVED').subscribe({
      next: () => {
        this.actionMsg.set({ id: alertId, msg: 'Alert resolved.', ok: true });
        this.processing.set(null);
        this.load();
      },
      error: (err) => {
        this.actionMsg.set({ id: alertId, msg: err?.message || 'Failed to resolve.', ok: false });
        this.processing.set(null);
      },
    });
  }

  prevPage(): void {
    if (this.page() > 0) { this.page.set(this.page() - 1); this.load(); }
  }

  nextPage(): void {
    if (this.page() < this.totalPages() - 1) { this.page.set(this.page() + 1); this.load(); }
  }

  severityClass(score: number): string {
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }
}
