import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CardState, selectAllCards } from './card.reducer';

/**
 * Card Selectors - Best Practices
 * Using createFeatureSelector for feature-based state management
 * Memoized selectors prevent unnecessary recalculations
 */

// Feature Selector
export const selectCardFeature = createFeatureSelector<CardState>('cards');

// Root Selectors
export const selectCardIds = createSelector(selectCardFeature, (state) => state.ids);

export const selectCardEntities = createSelector(
  selectCardFeature,
  (state) => state.entities
);

export const selectCardsLoading = createSelector(
  selectCardFeature,
  (state) => state.loading
);

export const selectCardsError = createSelector(
  selectCardFeature,
  (state) => state.error
);

export const selectSelectedCardId = createSelector(
  selectCardFeature,
  (state) => state.selectedCardId
);

// Composed Selectors - Using Entity Adapter's selectAll
export const selectAllCardsFromAdapter = createSelector(
  selectCardFeature,
  selectAllCards
);

// Select by ID (memoized)
export const selectCardById = (id: string) =>
  createSelector(selectCardEntities, (entities) => entities[id] || null);

// Select currently selected card
export const selectCurrentCard = createSelector(
  selectSelectedCardId,
  selectCardEntities,
  (selectedId, entities) => (selectedId ? entities[selectedId] || null : null)
);

// Select total count
export const selectCardCount = createSelector(
  selectAllCardsFromAdapter,
  (cards) => cards.length
);

// Select cards by type (example filter selector)
export const selectCardsByType = (type: string) =>
  createSelector(selectAllCardsFromAdapter, (cards) =>
    cards.filter((card) => card.cardType === type)
  );

// Select active cards (example filter)
export const selectActiveCards = createSelector(
  selectAllCardsFromAdapter,
  (cards) => cards.filter((card) => card.cardStatus === 'ACTIVE')
);

// Check if cards are loading
export const selectIsLoading = createSelector(
  selectCardsLoading,
  (loading) => loading
);

// Select has error
export const selectHasError = createSelector(
  selectCardsError,
  (error) => error !== null
);
