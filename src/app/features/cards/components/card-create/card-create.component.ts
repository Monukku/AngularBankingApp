import {
  Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal, computed, inject
} from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CardService } from '../../service/card.service';
import { AccountService } from '../../../accounts/services/account.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-card-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TitleCasePipe],
  templateUrl: './card-create.component.html',
  styleUrl: './card-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardCreateComponent implements OnInit {
  private fb             = inject(FormBuilder);
  private cardService    = inject(CardService);
  private accountService = inject(AccountService);
  private notifications  = inject(NotificationService);
  private router         = inject(Router);
  private cdr            = inject(ChangeDetectorRef);

  submitting      = signal(false);
  accounts        = signal<any[]>([]);
  accountsLoading = signal(true);

  readonly STEPS        = ['Card format', 'Type & network', 'Details', 'Review'];
  readonly CARD_FORMATS = [
    { key: 'VIRTUAL',  label: 'Virtual card',   headline: 'Active in seconds',   sub: 'No shipping · use online right away' },
    { key: 'PHYSICAL', label: 'Physical card',  headline: 'Ships in 5–7 days',   sub: 'Activate at any branch with a teller' },
  ];
  readonly CARD_TYPES    = ['DEBIT', 'CREDIT'];
  readonly CARD_NETWORKS = ['VISA', 'MASTERCARD', 'RUPAY'];

  step        = signal(0);
  cardFormat  = signal<string | null>(null);
  cardType    = signal<string | null>(null);
  cardNetwork = signal<string | null>(null);

  isVirtual = computed(() => this.cardFormat() === 'VIRTUAL');

  form = this.fb.group({
    accountId:  ['', Validators.required],
    nameOnCard: ['', [Validators.maxLength(26)]],
  });

  ngOnInit(): void {
    this.accountService.getMyAccounts().subscribe({
      next: (data: any) => {
        const list: any[] = data?.content ?? (Array.isArray(data) ? data : []);
        const active = list.filter((a: any) => (a.status ?? a.accountStatus) === 'ACTIVE');
        this.accounts.set(active);
        if (active.length === 1) this.form.patchValue({ accountId: active[0].id });
        this.accountsLoading.set(false);
      },
      error: () => { this.accountsLoading.set(false); this.cdr.markForCheck(); },
    });
  }

  canContinue(): boolean {
    switch (this.step()) {
      case 0: return !!this.cardFormat();
      case 1: return !!this.cardType() && !!this.cardNetwork();
      case 2: return true;
      default: return true;
    }
  }

  next(): void { if (this.canContinue()) this.step.update(s => Math.min(s + 1, 3)); }
  back(): void { this.step.update(s => Math.max(s - 1, 0)); }

  selectedAccount(): any {
    const id = this.form.value.accountId;
    return this.accounts().find((a: any) => a.id === id) ?? this.accounts()[0];
  }

  submit(): void {
    if (this.form.invalid || !this.cardType() || !this.cardNetwork()) return;
    const v = this.form.value;
    this.submitting.set(true);
    this.cardService.createCard({
      accountId:   v.accountId,
      cardType:    this.cardType(),
      cardNetwork: this.cardNetwork(),
      nameOnCard:  v.nameOnCard || undefined,
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        const msg = this.isVirtual()
          ? 'Virtual card issued successfully. It is active immediately.'
          : 'Card requested successfully. Visit a branch to activate.';
        this.notifications.success(msg);
        this.router.navigate(['/cards']);
      },
      error: (err: any) => {
        this.submitting.set(false);
        this.notifications.error(err?.error?.message ?? 'Failed to request card.');
        this.cdr.markForCheck();
      },
    });
  }
}
