/**
 * Cards Slice
 * Manages card state and actions
 */
import type {
  Card,
  CardId,
  ColumnId,
  ProjectId,
  CardsState,
  CreateCardPayload,
  UpdateCardPayload,
  MoveCardPayload,
} from '@/types';
import { generateId, getTimestamp } from '../utils';

/**
 * Cards slice actions
 */
export interface CardsActions {
  /** Create a new card */
  createCard: (payload: CreateCardPayload) => CardId;
  /** Update an existing card */
  updateCard: (payload: UpdateCardPayload) => void;
  /** Delete a card */
  deleteCard: (id: CardId) => void;
  /** Move a card to a different column or position */
  moveCard: (payload: MoveCardPayload) => void;
  /** Get a card by ID */
  getCard: (id: CardId) => Card | undefined;
  /** Get all cards for a column */
  getCardsByColumn: (columnId: ColumnId) => Card[];
  /** Get all cards for a project */
  getCardsByProject: (projectId: ProjectId) => Card[];
  /** Delete all cards for a column */
  deleteCardsByColumn: (columnId: ColumnId) => void;
  /** Delete all cards for a project */
  deleteCardsByProject: (projectId: ProjectId) => void;
}

/**
 * Combined cards state and actions
 */
export interface CardsSlice extends CardsState, CardsActions {}

/**
 * Create the cards slice
 * @param set - Zustand set function
 * @param get - Zustand get function
 */
export const createCardsSlice = (
  set: (fn: (state: CardsSlice) => void) => void,
  get: () => CardsSlice
): CardsSlice => ({
  // Initial state
  cards: {},

  // Actions
  createCard: (payload) => {
    const id = generateId();
    const now = getTimestamp();

    // Calculate position within the column
    const existingCards = get().getCardsByColumn(payload.columnId);
    const position = existingCards.length;

    const newCard: Card = {
      id,
      projectId: payload.projectId,
      columnId: payload.columnId,
      title: payload.title,
      description: payload.description ?? '',
      priority: payload.priority ?? 'medium',
      status: 'active',
      position,
      tags: payload.tags ?? [],
      ...(payload.worldbuilding ? { worldbuilding: payload.worldbuilding } : {}),
      createdAt: now,
      updatedAt: now,
    };

    set((state) => {
      state.cards[id] = newCard;
    });

    return id;
  },

  updateCard: (payload) => {
    set((state) => {
      const card = state.cards[payload.id];
      if (card) {
        if (payload.title !== undefined) card.title = payload.title;
        if (payload.description !== undefined) card.description = payload.description;
        if (payload.priority !== undefined) card.priority = payload.priority;
        if (payload.status !== undefined) card.status = payload.status;
        if (payload.tags !== undefined) card.tags = payload.tags;
        if (payload.worldbuilding !== undefined) card.worldbuilding = payload.worldbuilding;
        card.updatedAt = getTimestamp();
      }
    });
  },

  deleteCard: (id) => {
    set((state) => {
      delete state.cards[id];
    });
  },

  moveCard: (payload) => {
    const { cardId, targetColumnId, targetPosition } = payload;

    set((state) => {
      const card = state.cards[cardId];
      if (!card) return;

      const sourceColumnId = card.columnId;

      // Get cards in source and target columns (excluding the moved card)
      const sourceCards = Object.values(state.cards)
        .filter((c) => c.columnId === sourceColumnId && c.id !== cardId)
        .sort((a, b) => a.position - b.position);

      const targetCards = Object.values(state.cards)
        .filter((c) => c.columnId === targetColumnId && c.id !== cardId)
        .sort((a, b) => a.position - b.position);

      // Reindex source column if moving to different column
      if (sourceColumnId !== targetColumnId) {
        sourceCards.forEach((c, index) => {
          state.cards[c.id].position = index;
        });
      }

      // Insert card at target position and shift other cards
      targetCards.forEach((c, index) => {
        if (index >= targetPosition) {
          state.cards[c.id].position = index + 1;
        }
      });

      // Update the moved card
      card.columnId = targetColumnId;
      card.position = targetPosition;
      card.updatedAt = getTimestamp();
    });
  },

  getCard: (id) => {
    return get().cards[id];
  },

  getCardsByColumn: (columnId) => {
    return Object.values(get().cards)
      .filter((card) => card.columnId === columnId)
      .sort((a, b) => a.position - b.position);
  },

  getCardsByProject: (projectId) => {
    return Object.values(get().cards)
      .filter((card) => card.projectId === projectId)
      .sort((a, b) => a.position - b.position);
  },

  deleteCardsByColumn: (columnId) => {
    set((state) => {
      const cardIds = Object.values(state.cards)
        .filter((card) => card.columnId === columnId)
        .map((card) => card.id);

      cardIds.forEach((id) => {
        delete state.cards[id];
      });
    });
  },

  deleteCardsByProject: (projectId) => {
    set((state) => {
      const cardIds = Object.values(state.cards)
        .filter((card) => card.projectId === projectId)
        .map((card) => card.id);

      cardIds.forEach((id) => {
        delete state.cards[id];
      });
    });
  },
});
