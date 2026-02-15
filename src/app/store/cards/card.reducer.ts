import { createReducer, on, Action } from '@ngrx/store';
import { EntityAdapter, EntityState, createEntityAdapter } from '@ngrx/entity';
import { Card } from '../../features/cards/models/card.model';
import * as CardActions from './card.actions';

/**
 * Card Entity State with Entity Adapter
 * Provides efficient array-to-object normalization for cards
 */
export interface CardState extends EntityState<Card> {
  selectedCardId: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Entity Adapter for Card
 * Provides built-in reducers: addOne, updateOne, deleteOne, addAll, etc.
 */
export const cardAdapter: EntityAdapter<Card> = createEntityAdapter<Card>({
  selectId: (card: Card) => card.cardId,
  sortComparer: (a: Card, b: Card) => a.cardId.localeCompare(b.cardId),
});

export const initialState: CardState = cardAdapter.getInitialState({
  selectedCardId: null,
  loading: false,
  error: null,
});

const cardReducerImpl = createReducer(
  initialState,

  // Load cards
  on(CardActions.loadCards, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(CardActions.loadCardsSuccess, (state, { cards }) =>
    cardAdapter.setAll(cards, {
      ...state,
      loading: false,
      error: null,
    })
  ),

  on(CardActions.loadCardsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Create card
  on(CardActions.createCardSuccess, (state, { card }) =>
    cardAdapter.addOne(card, {
      ...state,
      loading: false,
      error: null,
    })
  ),

  on(CardActions.createCardFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Update card
  on(CardActions.updateCardSuccess, (state, { card }) =>
    cardAdapter.updateOne(
      { id: card.cardId, changes: card },
      {
        ...state,
        loading: false,
        error: null,
      }
    )
  ),

  on(CardActions.updateCardFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Delete card
  on(CardActions.deleteCardSuccess, (state, { id }) =>
    cardAdapter.removeOne(id, {
      ...state,
      loading: false,
      error: null,
    })
  ),

  on(CardActions.deleteCardFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Select card
  on(CardActions.selectCard, (state, { id }) => ({
    ...state,
    selectedCardId: id,
  })),

  // Clear selected card
  on(CardActions.clearSelectedCard, (state) => ({
    ...state,
    selectedCardId: null,
  }))
);

export function cardReducer(state: CardState | undefined, action: Action) {
  return cardReducerImpl(state, action);
}

/**
 * Entity Adapter Selectors
 * These are auto-generated selectors for common queries
 */
export const {
  selectIds: selectCardIds,
  selectEntities: selectCardEntities,
  selectAll: selectAllCards,
  selectTotal: selectCardTotal,
} = cardAdapter.getSelectors();
