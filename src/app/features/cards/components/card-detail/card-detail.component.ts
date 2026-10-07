import {
  Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CardService } from '../../service/card.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent, ReactiveFormsModule],
  templateUrl: './card-detail.component.html',
  styleUrl: './card-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardDetailComponent implements OnInit {
  private route         = inject(ActivatedRoute);
  private cardService   = inject(CardService);
  private authService   = inject(AuthService);
  private notifications = inject(NotificationService);
  private cdr           = inject(ChangeDetectorRef);
  private fb            = inject(FormBuilder);

  card    = signal<any>(null);
  loading = signal(true);
  error   = signal<string | null>(null);
  acting  = signal(false);

  // freeze panel state
  showFreezePanel  = signal(false);
  showUnfreezePanel = signal(false);

  get isStaff():    boolean { return this.authService.isStaff(); }
  get isCustomer(): boolean { return !this.isStaff; }

  blockForm = this.fb.group({
    otp:    [''],
    reason: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cardService.getCard(id).subscribe({
        next: (c) => { this.card.set(c); this.loading.set(false); },
        error: () => { this.error.set('Card not found.'); this.loading.set(false); },
      });
    }
  }

  openFreezePanel(): void {
    this.showFreezePanel.set(true);
    this.showUnfreezePanel.set(false);
    this.blockForm.reset();
  }

  openUnfreezePanel(): void {
    this.showUnfreezePanel.set(true);
    this.showFreezePanel.set(false);
  }

  cancelPanel(): void {
    this.showFreezePanel.set(false);
    this.showUnfreezePanel.set(false);
    this.blockForm.reset();
  }

  confirmFreeze(): void {
    const { otp, reason } = this.blockForm.value;

    if (this.isCustomer && !otp?.trim()) {
      this.notifications.error('Please enter the OTP sent to your registered mobile.');
      return;
    }

    this.acting.set(true);
    this.cardService.blockCard(this.card().id, otp?.trim() ?? '', reason?.trim()).subscribe({
      next: (c) => {
        this.card.set(c);
        this.acting.set(false);
        this.showFreezePanel.set(false);
        this.blockForm.reset();
        this.notifications.success('Card frozen successfully.');
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.acting.set(false);
        this.notifications.error(err?.error?.message ?? 'Failed to freeze card.');
        this.cdr.markForCheck();
      },
    });
  }

  confirmUnfreeze(): void {
    this.acting.set(true);
    this.cardService.unblockCard(this.card().id).subscribe({
      next: (c) => {
        this.card.set(c);
        this.acting.set(false);
        this.showUnfreezePanel.set(false);
        this.notifications.success('Card unfrozen successfully.');
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.acting.set(false);
        this.notifications.error(err?.error?.message ?? 'Failed to unfreeze card.');
        this.cdr.markForCheck();
      },
    });
  }

  statusClass(status: string): string {
    return (status ?? '').toLowerCase();
  }
}
