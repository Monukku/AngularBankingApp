import { Component, OnInit, ChangeDetectionStrategy, inject, DestroyRef } from '@angular/core';
import { CardService } from '../../service/card.service'; 
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports:[
    MatCardModule,
    CommonModule
  ],
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardListComponent implements OnInit {
  private cardService = inject(CardService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  cards: any[] = [];

  constructor() { }

  ngOnInit(): void {
    this.cardService.getCards()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(cards => {
        this.cards = cards;
      });
  }

  /**
   * TrackBy function for card list iteration
   * Improves performance by tracking by card ID instead of object reference
   */
  trackByCardId = (index: number, card: any) => card.id;

  viewCard(id: string) {
    this.router.navigate(['/cards', id]);
  }

  editCard(id: string) {
    this.router.navigate(['/cards', id, 'edit']);
  }

  deleteCard(id: string) {
    this.cardService.deleteCard(id).subscribe(() => {
      this.cards = this.cards.filter(card => card.id !== id);
    });
  }
}
