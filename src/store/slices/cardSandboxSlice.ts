/**
 * Card Sandbox Slice
 * Manages isolated sandbox state for testing/previewing cards
 * before committing changes to the main board.
 *
 * Cards in the sandbox are copies of real board cards (or new drafts).
 * Changes here do NOT affect the main board until explicitly committed.
 */
import type {
  Card,
  CardId,
  ColumnId,
  ProjectId,
  CardPriority,
  CardStatus,
  WorldbuildingData,
} from '@/types';
import { generateId, getTimestamp } from '../utils';

// ============================================================================
// Types
// ============================================================================

/** A sandbox draft card — a working copy isolated from the main board */
export interface SandboxDraftCard extends Card {
  /** If this card was cloned from a main board card, the original ID */
  originalCardId: CardId | null;
  /** Whether this card has been modified from its original */
  isDirty: boolean;
  /** Whether this is a brand-new card (not cloned from main board) */
  isNew: boolean;
}

/** State shape for the card sandbox */
export interface CardSandboxState {
  /** Whether sandbox mode is active */
  isSandboxActive: boolean;
  /** Draft cards being edited in the sandbox */
  sandboxDrafts: Record<CardId, SandboxDraftCard>;
  /** IDs of cards marked for deletion when committed */
  sandboxDeletions: CardId[];
  /** The project ID the sandbox is operating on */
  sandboxProjectId: ProjectId | null;
  /** Snapshot of main board cards at the time sandbox was entered (for conflict detection) */
  sandboxSnapshot: Record<CardId, string> | null; // cardId -> updatedAt
}

/** Payload for creating a new card in the sandbox */
export interface CreateSandboxDraftPayload {
  columnId: ColumnId;
  title: string;
  description?: string;
  priority?: CardPriority;
  tags?: string[];
  worldbuilding?: WorldbuildingData;
}

/** Payload for updating a sandbox draft card */
export interface UpdateSandboxDraftPayload {
  id: CardId;
  title?: string;
  description?: string;
  priority?: CardPriority;
  status?: CardStatus;
  tags?: string[];
  worldbuilding?: WorldbuildingData;
}

/** Result of committing sandbox changes */
export interface CommitResult {
  created: number;
  updated: number;
  deleted: number;
  conflicts: CardId[];
}

// ============================================================================
// Slice Interface
// ============================================================================

export interface CardSandboxActions {
  /** Enter sandbox mode — snapshots current board state */
  enterCardSandbox: () => void;
  /** Exit sandbox mode without committing (discards all changes) */
  exitCardSandbox: () => void;
  /** Clone a main board card into the sandbox for editing */
  cloneCardToSandbox: (cardId: CardId) => CardId | null;
  /** Clone all cards from a column into the sandbox */
  cloneColumnToSandbox: (columnId: ColumnId) => void;
  /** Create a new draft card in the sandbox */
  createSandboxDraft: (payload: CreateSandboxDraftPayload) => CardId;
  /** Update a draft card in the sandbox */
  updateSandboxDraft: (payload: UpdateSandboxDraftPayload) => void;
  /** Delete a draft card in the sandbox */
  deleteSandboxDraft: (id: CardId) => void;
  /** Mark a main board card for deletion on commit */
  markForDeletion: (cardId: CardId) => void;
  /** Unmark a card from deletion */
  unmarkForDeletion: (cardId: CardId) => void;
  /** Commit all sandbox changes to the main board */
  commitSandboxChanges: () => CommitResult;
  /** Get all sandbox drafts for a column */
  getSandboxDraftsByColumn: (columnId: ColumnId) => SandboxDraftCard[];
  /** Check if a main board card has been modified while sandbox was active */
  detectConflicts: () => CardId[];
  /** Get sandbox statistics */
  getSandboxStats: () => { newCards: number; modifiedCards: number; deletedCards: number; totalDrafts: number };
}

export interface CardSandboxSlice extends CardSandboxState, CardSandboxActions {}

// ============================================================================
// Slice Creator
// ============================================================================

/**
 * Create the card sandbox slice.
 * Requires access to the full store (get) for reading main board cards.
 */
export const createCardSandboxSlice = (
  set: (fn: (state: CardSandboxSlice & { cards: Record<CardId, Card>; activeProjectId: ProjectId | null }) => void) => void,
  get: () => CardSandboxSlice & {
    cards: Record<CardId, Card>;
    activeProjectId: ProjectId | null;
    createCard: (payload: { projectId: ProjectId; columnId: ColumnId; title: string; description?: string; priority?: CardPriority; tags?: string[]; worldbuilding?: WorldbuildingData }) => CardId;
    updateCard: (payload: { id: CardId; title?: string; description?: string; priority?: CardPriority; status?: CardStatus; tags?: string[]; worldbuilding?: WorldbuildingData }) => void;
    deleteCard: (id: CardId) => void;
  }
): CardSandboxSlice => ({
  // Initial state
  isSandboxActive: false,
  sandboxDrafts: {},
  sandboxDeletions: [],
  sandboxProjectId: null,
  sandboxSnapshot: null,

  // Actions
  enterCardSandbox: () => {
    const state = get();
    const projectId = state.activeProjectId;
    if (!projectId) return;

    // Take a snapshot of current card updatedAt timestamps for conflict detection
    const snapshot: Record<CardId, string> = {};
    Object.values(state.cards)
      .filter((c) => c.projectId === projectId)
      .forEach((c) => {
        snapshot[c.id] = c.updatedAt;
      });

    set((s) => {
      s.isSandboxActive = true;
      s.sandboxDrafts = {};
      s.sandboxDeletions = [];
      s.sandboxProjectId = projectId;
      s.sandboxSnapshot = snapshot;
    });
  },

  exitCardSandbox: () => {
    set((s) => {
      s.isSandboxActive = false;
      s.sandboxDrafts = {};
      s.sandboxDeletions = [];
      s.sandboxProjectId = null;
      s.sandboxSnapshot = null;
    });
  },

  cloneCardToSandbox: (cardId) => {
    const state = get();
    const original = state.cards[cardId];
    if (!original) return null;

    const draftId = generateId();
    const draft: SandboxDraftCard = {
      ...original,
      id: draftId,
      originalCardId: cardId,
      isDirty: false,
      isNew: false,
    };

    set((s) => {
      s.sandboxDrafts[draftId] = draft;
    });

    return draftId;
  },

  cloneColumnToSandbox: (columnId) => {
    const state = get();
    const projectId = state.sandboxProjectId;
    if (!projectId) return;

    const columnCards = Object.values(state.cards)
      .filter((c) => c.columnId === columnId && c.projectId === projectId)
      .sort((a, b) => a.position - b.position);

    set((s) => {
      for (const card of columnCards) {
        // Skip if already cloned
        const alreadyCloned = Object.values(s.sandboxDrafts).some(
          (d) => d.originalCardId === card.id
        );
        if (alreadyCloned) continue;

        const draftId = generateId();
        s.sandboxDrafts[draftId] = {
          ...card,
          id: draftId,
          originalCardId: card.id,
          isDirty: false,
          isNew: false,
        };
      }
    });
  },

  createSandboxDraft: (payload) => {
    const state = get();
    const projectId = state.sandboxProjectId;
    if (!projectId) return '';

    const id = generateId();
    const now = getTimestamp();

    // Calculate position
    const existingInColumn = Object.values(state.sandboxDrafts)
      .filter((d) => d.columnId === payload.columnId)
      .length;

    // Also count main board cards in that column that haven't been cloned
    const mainBoardInColumn = Object.values(state.cards)
      .filter((c) => c.columnId === payload.columnId && c.projectId === projectId)
      .length;

    const position = Math.max(existingInColumn, mainBoardInColumn);

    const draft: SandboxDraftCard = {
      id,
      projectId,
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
      originalCardId: null,
      isDirty: true,
      isNew: true,
    };

    set((s) => {
      s.sandboxDrafts[id] = draft;
    });

    return id;
  },

  updateSandboxDraft: (payload) => {
    set((s) => {
      const draft = s.sandboxDrafts[payload.id];
      if (!draft) return;
      if (payload.title !== undefined) draft.title = payload.title;
      if (payload.description !== undefined) draft.description = payload.description;
      if (payload.priority !== undefined) draft.priority = payload.priority;
      if (payload.status !== undefined) draft.status = payload.status;
      if (payload.tags !== undefined) draft.tags = payload.tags;
      if (payload.worldbuilding !== undefined) draft.worldbuilding = payload.worldbuilding;
      draft.isDirty = true;
      draft.updatedAt = getTimestamp();
    });
  },

  deleteSandboxDraft: (id) => {
    set((s) => {
      const draft = s.sandboxDrafts[id];
      if (!draft) return;
      // If it was cloned from main board, mark original for deletion
      if (draft.originalCardId && !draft.isNew) {
        if (!s.sandboxDeletions.includes(draft.originalCardId)) {
          s.sandboxDeletions.push(draft.originalCardId);
        }
      }
      delete s.sandboxDrafts[id];
    });
  },

  markForDeletion: (cardId) => {
    set((s) => {
      if (!s.sandboxDeletions.includes(cardId)) {
        s.sandboxDeletions.push(cardId);
      }
    });
  },

  unmarkForDeletion: (cardId) => {
    set((s) => {
      s.sandboxDeletions = s.sandboxDeletions.filter((id) => id !== cardId);
    });
  },

  commitSandboxChanges: () => {
    const state = get();
    const result: CommitResult = { created: 0, updated: 0, deleted: 0, conflicts: [] };

    if (!state.sandboxProjectId) return result;

    // Detect conflicts first
    const conflicts = state.detectConflicts();
    result.conflicts = conflicts;

    // Process new cards
    const newDrafts = Object.values(state.sandboxDrafts).filter((d) => d.isNew);
    for (const draft of newDrafts) {
      state.createCard({
        projectId: draft.projectId,
        columnId: draft.columnId,
        title: draft.title,
        description: draft.description,
        priority: draft.priority,
        tags: draft.tags,
        ...(draft.worldbuilding ? { worldbuilding: draft.worldbuilding } : {}),
      });
      result.created++;
    }

    // Process modified cards (skip conflicted ones)
    const modifiedDrafts = Object.values(state.sandboxDrafts).filter(
      (d) => !d.isNew && d.isDirty && d.originalCardId && !conflicts.includes(d.originalCardId)
    );
    for (const draft of modifiedDrafts) {
      state.updateCard({
        id: draft.originalCardId!,
        title: draft.title,
        description: draft.description,
        priority: draft.priority,
        status: draft.status,
        tags: draft.tags,
        ...(draft.worldbuilding ? { worldbuilding: draft.worldbuilding } : {}),
      });
      result.updated++;
    }

    // Process deletions (skip conflicted ones)
    for (const cardId of state.sandboxDeletions) {
      if (!conflicts.includes(cardId)) {
        state.deleteCard(cardId);
        result.deleted++;
      }
    }

    // Exit sandbox
    set((s) => {
      s.isSandboxActive = false;
      s.sandboxDrafts = {};
      s.sandboxDeletions = [];
      s.sandboxProjectId = null;
      s.sandboxSnapshot = null;
    });

    return result;
  },

  getSandboxDraftsByColumn: (columnId) => {
    return Object.values(get().sandboxDrafts)
      .filter((d) => d.columnId === columnId)
      .sort((a, b) => a.position - b.position);
  },

  detectConflicts: () => {
    const state = get();
    if (!state.sandboxSnapshot) return [];

    const conflicts: CardId[] = [];
    for (const [cardId, snapshotTimestamp] of Object.entries(state.sandboxSnapshot)) {
      const currentCard = state.cards[cardId];
      if (currentCard && currentCard.updatedAt !== snapshotTimestamp) {
        conflicts.push(cardId);
      }
      // Card was deleted from main board
      if (!currentCard) {
        conflicts.push(cardId);
      }
    }
    return conflicts;
  },

  getSandboxStats: () => {
    const state = get();
    const drafts = Object.values(state.sandboxDrafts);
    return {
      newCards: drafts.filter((d) => d.isNew).length,
      modifiedCards: drafts.filter((d) => !d.isNew && d.isDirty).length,
      deletedCards: state.sandboxDeletions.length,
      totalDrafts: drafts.length,
    };
  },
});
