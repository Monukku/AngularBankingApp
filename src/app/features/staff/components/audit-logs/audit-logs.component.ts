import { Component, OnInit, HostListener, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';

type FilterMode = 'user' | 'aggregate' | 'event-type' | 'date-range';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditLogsComponent implements OnInit {
  private api = inject(ApiService);

  logs = signal<any[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  page = signal(0);
  totalPages = signal(0);

  filterMode = signal<FilterMode>('date-range');
  searchValue = '';
  fromDate = '';
  toDate = '';

  readonly eventTypeOptions = [
    'Login', 'Transfer initiated', 'Transfer completed',
    'KYC updated', 'Card issued', 'Permission changed',
  ];
  openDropdown: 'eventType' | null = null;

  openHoverDD(name: 'eventType') { this.openDropdown = name; }
  closeHoverDD() { this.openDropdown = null; }

  selectEventType(val: string) {
    this.searchValue = val;
    this.openDropdown = null;
  }

  @HostListener('document:click')
  onDocumentClick(): void { this.openDropdown = null; }

  ngOnInit(): void {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    this.fromDate = weekAgo.toISOString().slice(0, 16);
    this.toDate = today.toISOString().slice(0, 16);
    this.search();
  }

  search(): void {
    this.page.set(0);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    const params = { page: this.page(), size: 50 };
    let obs$;

    switch (this.filterMode()) {
      case 'user':
        obs$ = this.api.getUserAuditLogs(this.searchValue.trim(), params);
        break;
      case 'aggregate':
        obs$ = this.api.getAggregateAuditLogs(this.searchValue.trim(), params);
        break;
      case 'event-type':
        obs$ = this.api.getAuditLogsByEventType(this.searchValue.trim(), params);
        break;
      default:
        obs$ = this.api.getAuditLogsByDateRange({
          from: new Date(this.fromDate).toISOString(),
          to: new Date(this.toDate).toISOString(),
        });
    }

    obs$.subscribe({
      next: (data) => {
        const items = data?.content ?? (Array.isArray(data) ? data : []);
        this.logs.set(items);
        this.totalPages.set(data?.totalPages ?? 1);
        this.loading.set(false);
      },
      error: (err) => {
        const status = err?.status;
        if (status === 401 || status === 403) {
          this.error.set('You do not have permission to view audit logs.');
        } else {
          this.error.set('service-unavailable');
        }
        this.loading.set(false);
      },
    });
  }

  setMode(mode: FilterMode): void {
    this.filterMode.set(mode);
    this.searchValue = '';
  }

  prevPage(): void {
    if (this.page() > 0) { this.page.set(this.page() - 1); this.load(); }
  }

  nextPage(): void {
    if (this.page() < this.totalPages() - 1) { this.page.set(this.page() + 1); this.load(); }
  }
}
