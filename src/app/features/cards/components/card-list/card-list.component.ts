import { Component, OnInit, ChangeDetectionStrategy, inject, DestroyRef, signal, ChangeDetectorRef } from '@angular/core';
import { CardService } from '../../service/card.service';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [MatCardModule, CommonModule, RouterLink, FormsModule],
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardListComponent implements OnInit {
  private cardService = inject(CardService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  protected authService = inject(AuthService);

  cards: any[] = [];

  // OTP modal state
  otpModalCard = signal<any>(null);
  otpValue = signal('');
  otpError = signal('');
  otpLoading = signal(false);

  get isStaff(): boolean {
    return this.authService.isStaff() && !this.authService.isCustomer();
  }

  ngOnInit(): void {
    if (this.isStaff) return;
    this.loadCards();
  }

  trackByCardId = (index: number, card: any) => card.id;

  viewCard(id: string) {
    this.router.navigate(['/cards', id]);
  }

  openBlockModal(card: any) {
    this.otpModalCard.set(card);
    this.otpValue.set('');
    this.otpError.set('');
    this.otpLoading.set(false);
  }

  closeBlockModal() {
    this.otpModalCard.set(null);
  }

  confirmBlock() {
    const otp = this.otpValue().trim();
    if (!otp || otp.length < 4) {
      this.otpError.set('Please enter a valid OTP');
      return;
    }
    this.otpLoading.set(true);
    this.otpError.set('');
    this.cardService.blockCard(this.otpModalCard().id, otp).subscribe({
      next: () => {
        this.otpModalCard.set(null);
        this.otpLoading.set(false);
        this.cardService.invalidateCardsCache();
        this.loadCards();
      },
      error: (err: any) => {
        this.otpError.set(err?.message ?? 'Invalid OTP or block failed');
        this.otpLoading.set(false);
      }
    });
  }

  unblockCard(id: string) {
    this.cardService.unblockCard(id).subscribe(() => {
      this.cardService.invalidateCardsCache();
      this.loadCards();
    });
  }

  private loadCards() {
    this.cardService.getCards()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(cards => {
        this.cards = cards;
        this.cdr.markForCheck();
      });
  }
}
