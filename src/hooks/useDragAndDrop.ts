/**
 * useDragAndDrop Hook
 *
 * Custom hooks and utilities for dnd-kit drag-and-drop functionality
 * in the Kanban board. Provides draggable cards and droppable columns
 * with smooth animations.
 */
import { useState, useCallback } from 'react';
import {
  DragStartEvent,
  DragOverEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Card, CardId, ColumnId } from '@/types';

/**
 * Active drag state for the overlay
 */
export interface ActiveDragItem {
  id: UniqueIdentifier;
  type: 'card' | 'column';
  card?: Card;
}

/**
 * Hook for managing drag and drop state
 */
export function useDragDropState() {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeType, setActiveType] = useState<'card' | 'column' | null>(null);
  const [overColumnId, setOverColumnId] = useState<ColumnId | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const type = active.data.current?.type as 'card' | 'column' | undefined;

    setActiveId(active.id);
    setActiveType(type ?? null);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;

    if (!over) {
      setOverColumnId(null);
      return;
    }

    // Check if we're over a column
    const overType = over.data.current?.type;
    if (overType === 'column') {
      setOverColumnId(over.id as ColumnId);
    } else if (overType === 'card') {
      // If over a card, get its column
      const columnId = over.data.current?.columnId as ColumnId | undefined;
      setOverColumnId(columnId ?? null);
    }
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setActiveType(null);
    setOverColumnId(null);
  }, []);

  const resetDragState = useCallback(() => {
    setActiveId(null);
    setActiveType(null);
    setOverColumnId(null);
  }, []);

  return {
    activeId,
    activeType,
    overColumnId,
    handleDragStart,
    handleDragOver,
    handleDragCancel,
    resetDragState,
  };
}


/**
 * Calculate the new position for a card being dropped
 */
export function calculateDropPosition(
  cards: Card[],
  overCardId: CardId | null,
  overColumnId: ColumnId
): number {
  if (!overCardId) {
    // Dropped on empty column or at the end
    return cards.filter((c) => c.columnId === overColumnId).length;
  }

  // Find the position of the card we're dropping on
  const overCardIndex = cards.findIndex((c) => c.id === overCardId);
  if (overCardIndex === -1) {
    return cards.filter((c) => c.columnId === overColumnId).length;
  }

  return cards[overCardIndex].position;
}

/**
 * Get sorted card IDs for a column
 */
export function getCardIdsForColumn(
  cards: Card[],
  columnId: ColumnId
): CardId[] {
  return cards
    .filter((card) => card.columnId === columnId)
    .sort((a, b) => a.position - b.position)
    .map((card) => card.id);
}

/**
 * Reorder cards within the same column
 */
export function reorderCardsInColumn(
  cardIds: CardId[],
  activeId: CardId,
  overId: CardId
): CardId[] {
  const oldIndex = cardIds.indexOf(activeId);
  const newIndex = cardIds.indexOf(overId);

  if (oldIndex === -1 || newIndex === -1) {
    return cardIds;
  }

  return arrayMove(cardIds, oldIndex, newIndex);
}

/**
 * Type guard for checking if an ID is a card ID
 */
export function isCardId(
  id: UniqueIdentifier,
  cards: Card[]
): id is CardId {
  return cards.some((card) => card.id === id);
}

/**
 * Type guard for checking if an ID is a column ID
 */
export function isColumnId(
  id: UniqueIdentifier,
  columnIds: ColumnId[]
): id is ColumnId {
  return columnIds.includes(id as ColumnId);
}

/**
 * Animation configuration for smooth drag transitions
 */
export const defaultAnimationConfig = {
  duration: 200,
  easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
};

/**
 * Get drop animation configuration
 */
export function getDropAnimation() {
  return {
    duration: 250,
    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
  };
}
