import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { Card } from '../models/card.model';

@Injectable({ providedIn: 'root' })
export class CardService {
  private api = inject(ApiService);
  private cardsCache$: Observable<Card[]> | null = null;

  getCards(): Observable<Card[]> {
    if (!this.cardsCache$) {
      this.cardsCache$ = this.api.getMyCards().pipe(shareReplay(1));
    }
    return this.cardsCache$;
  }

  invalidateCardsCache(): void { this.cardsCache$ = null; }

  getCard(id: string): Observable<Card> { return this.api.getCard(id); }

  createCard(card: Record<string, unknown>): Observable<Card> {
    return this.api.createCard(card).pipe(tap(() => this.invalidateCardsCache()));
  }

  blockCard(id: string, otp: string, reason?: string): Observable<Card> {
    return this.api.blockCard(id, { otp, reason }).pipe(tap(() => this.invalidateCardsCache()));
  }

  staffBlockCard(id: string, reason: string): Observable<Card> {
    return this.api.blockCard(id, { reason }).pipe(tap(() => this.invalidateCardsCache()));
  }

  unblockCard(id: string): Observable<Card> {
    return this.api.unblockCard(id).pipe(tap(() => this.invalidateCardsCache()));
  }

  activateCard(id: string): Observable<Card> {
    return this.api.activateCard(id).pipe(tap(() => this.invalidateCardsCache()));
  }

  cancelCard(id: string, reason: string): Observable<Card> {
    return this.api.cancelCard(id, reason).pipe(tap(() => this.invalidateCardsCache()));
  }

  getAllCards(): Observable<Card[]> { return this.api.getAllCards(); }
  getPendingCards(): Observable<Card[]> { return this.api.getPendingCards(); }
  getCardsByCustomer(customerId: string): Observable<Card[]> { return this.api.getCardsByCustomer(customerId); }
  getCardsByKeycloakUserId(keycloakUserId: string): Observable<Card[]> { return this.api.getCardsByKeycloakUserId(keycloakUserId); }
}
