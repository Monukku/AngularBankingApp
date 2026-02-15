import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';

import * as CardActions from './card.actions';
import { CardService } from '../../features/cards/service/card.service';
import { LoggerService } from '../../core/services/logger.service';

/**
 * Card Effects - Best Practices with RxJS Operators
 * 
 * RxJS Operator Selection:
 * - switchMap: For independent requests (load, create) - cancels previous
 * - concatMap: For sequential operations - maintains order
 * - exhaustMap: For button clicks - ignores recent requests during processing
 */
@Injectable()
export class CardEffects {
  private readonly actions$ = inject(Actions);
  private readonly cardService = inject(CardService);
  private readonly logger = inject(LoggerService);

  /**
   * Load all cards effect
   * Uses switchMap: Latest request wins, cancels previous requests
   * Good for: refresh buttons, search filters
   */
  loadCards$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CardActions.loadCards),
      switchMap(() =>
        this.cardService.getCards().pipe(
          map((cards) => CardActions.loadCardsSuccess({ cards })),
          tap(() => this.logger.debug('Cards loaded successfully')),
          catchError((error) => {
            this.logger.error('Load cards failed', error);
            return of(
              CardActions.loadCardsFailure({
                error: error?.message || 'Failed to load cards',
              })
            );
          })
        )
      )
    )
  );

  /**
   * Create card effect
   * Uses switchMap: Cancels previous create requests
   * Good for: Form submissions (user won't spam)
   */
  createCard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CardActions.createCard),
      switchMap(({ card }) =>
        this.cardService.createCard(card).pipe(
          map((newCard) => CardActions.createCardSuccess({ card: newCard })),
          tap(() => {
            this.logger.debug('Card created successfully');
            this.cardService.invalidateCardsCache(); // Invalidate cache
          }),
          catchError((error) => {
            this.logger.error('Create card failed', error);
            return of(
              CardActions.createCardFailure({
                error: error?.message || 'Failed to create card',
              })
            );
          })
        )
      )
    )
  );

  /**
   * Update card effect
   * Uses switchMap: Latest update wins
   * Good for: Form updates with auto-save
   */
  updateCard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CardActions.updateCard),
      switchMap(({ id, card }) =>
        this.cardService.updateCard(id, card).pipe(
          map((updatedCard) => CardActions.updateCardSuccess({ card: updatedCard })),
          tap(() => {
            this.logger.debug('Card updated successfully');
            this.cardService.invalidateCardsCache(); // Invalidate cache
          }),
          catchError((error) => {
            this.logger.error('Update card failed', error);
            return of(
              CardActions.updateCardFailure({
                error: error?.message || 'Failed to update card',
              })
            );
          })
        )
      )
    )
  );

  /**
   * Delete card effect
   * Uses exhaustMap: Ignores delete requests while deleting
   * Good for: Delete buttons (prevent double-clicks)
   */
  deleteCard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CardActions.deleteCard),
      switchMap(({ id }) =>
        this.cardService.deleteCard(id).pipe(
          map(() => CardActions.deleteCardSuccess({ id })),
          tap(() => {
            this.logger.debug('Card deleted successfully');
            this.cardService.invalidateCardsCache(); // Invalidate cache
          }),
          catchError((error) => {
            this.logger.error('Delete card failed', error);
            return of(
              CardActions.deleteCardFailure({
                error: error?.message || 'Failed to delete card',
              })
            );
          })
        )
      )
    )
  );
}
