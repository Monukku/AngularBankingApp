import { createAction, props } from '@ngrx/store';
import { Card } from '../../features/cards/models/card.model';

/**
 * Card Actions - Best Practices with Feature-level naming
 * Pattern: [Feature] Event Description
 */

// Load Cards
export const loadCards = createAction('[Cards] Load Cards');

export const loadCardsSuccess = createAction(
  '[Cards] Load Cards Success',
  props<{ cards: Card[] }>()
);

export const loadCardsFailure = createAction(
  '[Cards] Load Cards Failure',
  props<{ error: string }>()
);

// Create Card
export const createCard = createAction(
  '[Cards] Create Card',
  props<{ card: Omit<Card, 'id'> }>()
);

export const createCardSuccess = createAction(
  '[Cards] Create Card Success',
  props<{ card: Card }>()
);

export const createCardFailure = createAction(
  '[Cards] Create Card Failure',
  props<{ error: string }>()
);

// Update Card
export const updateCard = createAction(
  '[Cards] Update Card',
  props<{ id: string; card: Partial<Card> }>()
);

export const updateCardSuccess = createAction(
  '[Cards] Update Card Success',
  props<{ card: Card }>()
);

export const updateCardFailure = createAction(
  '[Cards] Update Card Failure',
  props<{ error: string }>()
);

// Delete Card
export const deleteCard = createAction(
  '[Cards] Delete Card',
  props<{ id: string }>()
);

export const deleteCardSuccess = createAction(
  '[Cards] Delete Card Success',
  props<{ id: string }>()
);

export const deleteCardFailure = createAction(
  '[Cards] Delete Card Failure',
  props<{ error: string }>()
);

// Select Card
export const selectCard = createAction(
  '[Cards] Select Card',
  props<{ id: string }>()
);

export const clearSelectedCard = createAction('[Cards] Clear Selected Card');
