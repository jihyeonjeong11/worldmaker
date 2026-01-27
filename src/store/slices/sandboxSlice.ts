/**
 * Sandbox Slice
 * Manages worldbuilding sandbox state: card library, microsettings, and tucking
 */
import type {
  SandboxState,
  SandboxCard,
  SandboxCardId,
  Microsetting,
  MicrosettingId,
  CreateSandboxCardPayload,
  CreateMicrosettingPayload,
  TuckCardPayload,
} from '@/types/sandbox';
import { generateId, getTimestamp } from '../utils';

/** Sandbox slice actions */
export interface SandboxActions {
  // Card Library
  createSandboxCard: (payload: CreateSandboxCardPayload) => SandboxCardId;
  updateSandboxCard: (id: SandboxCardId, updates: Partial<Pick<SandboxCard, 'title' | 'cue' | 'colorTheme'>>) => void;
  deleteSandboxCard: (id: SandboxCardId) => void;
  getSandboxCard: (id: SandboxCardId) => SandboxCard | undefined;
  getCardsByCategory: (category: SandboxCard['category']) => SandboxCard[];

  // Microsettings
  createMicrosetting: (payload: CreateMicrosettingPayload) => MicrosettingId;
  deleteMicrosetting: (id: MicrosettingId) => void;
  setActiveMicrosetting: (id: MicrosettingId | null) => void;
  setRegionCard: (microsettingId: MicrosettingId, cardId: SandboxCardId | null) => void;
  tuckCard: (microsettingId: MicrosettingId, payload: TuckCardPayload) => void;
  untuckCard: (microsettingId: MicrosettingId, cardId: SandboxCardId) => void;
  reorderTuckedCard: (microsettingId: MicrosettingId, cardId: SandboxCardId, newOrder: number) => void;
  getActiveMicrosetting: () => Microsetting | undefined;
  getMicrosettingSummary: (microsettingId: MicrosettingId) => string;
}

/** Combined state + actions */
export interface SandboxSlice extends SandboxState, SandboxActions {}

/**
 * Create the sandbox slice
 */
export const createSandboxSlice = (
  set: (fn: (state: SandboxSlice) => void) => void,
  get: () => SandboxSlice
): SandboxSlice => ({
  // Initial state
  cardLibrary: {},
  microsettings: {},
  activeMicrosettingId: null,

  // Card Library actions
  createSandboxCard: (payload) => {
    const id = generateId();
    const now = getTimestamp();
    const card: SandboxCard = {
      id,
      category: payload.category,
      title: payload.title,
      cue: payload.cue,
      colorTheme: payload.colorTheme,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      state.cardLibrary[id] = card;
    });
    return id;
  },

  updateSandboxCard: (id, updates) => {
    set((state) => {
      const card = state.cardLibrary[id];
      if (card) {
        if (updates.title !== undefined) card.title = updates.title;
        if (updates.cue !== undefined) card.cue = updates.cue;
        if (updates.colorTheme !== undefined) card.colorTheme = updates.colorTheme;
        card.updatedAt = getTimestamp();
      }
    });
  },

  deleteSandboxCard: (id) => {
    set((state) => {
      delete state.cardLibrary[id];
      // Remove from all microsettings
      Object.values(state.microsettings).forEach((ms) => {
        if (ms.regionCardId === id) ms.regionCardId = null;
        ms.tuckedCards = ms.tuckedCards.filter((tc) => tc.cardId !== id);
      });
    });
  },

  getSandboxCard: (id) => get().cardLibrary[id],

  getCardsByCategory: (category) =>
    Object.values(get().cardLibrary)
      .filter((c) => c.category === category)
      .sort((a, b) => a.title.localeCompare(b.title)),

  // Microsetting actions
  createMicrosetting: (payload) => {
    const id = generateId();
    const now = getTimestamp();
    const ms: Microsetting = {
      id,
      name: payload.name,
      regionCardId: payload.regionCardId ?? null,
      tuckedCards: [],
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      state.microsettings[id] = ms;
      state.activeMicrosettingId = id;
    });
    return id;
  },

  deleteMicrosetting: (id) => {
    set((state) => {
      delete state.microsettings[id];
      if (state.activeMicrosettingId === id) {
        state.activeMicrosettingId = null;
      }
    });
  },

  setActiveMicrosetting: (id) => {
    set((state) => {
      state.activeMicrosettingId = id;
    });
  },

  setRegionCard: (microsettingId, cardId) => {
    set((state) => {
      const ms = state.microsettings[microsettingId];
      if (ms) {
        ms.regionCardId = cardId;
        ms.updatedAt = getTimestamp();
      }
    });
  },

  tuckCard: (microsettingId, payload) => {
    set((state) => {
      const ms = state.microsettings[microsettingId];
      if (!ms) return;
      // Don't add duplicates
      if (ms.tuckedCards.some((tc) => tc.cardId === payload.cardId)) return;
      // Calculate order for this position
      const samePosition = ms.tuckedCards.filter((tc) => tc.position === payload.position);
      ms.tuckedCards.push({
        cardId: payload.cardId,
        position: payload.position,
        order: samePosition.length,
      });
      ms.updatedAt = getTimestamp();
    });
  },

  untuckCard: (microsettingId, cardId) => {
    set((state) => {
      const ms = state.microsettings[microsettingId];
      if (!ms) return;
      const removedPosition = ms.tuckedCards.find((tc) => tc.cardId === cardId)?.position;
      ms.tuckedCards = ms.tuckedCards.filter((tc) => tc.cardId !== cardId);
      // Reindex orders for that position
      if (removedPosition) {
        ms.tuckedCards
          .filter((tc) => tc.position === removedPosition)
          .sort((a, b) => a.order - b.order)
          .forEach((tc, i) => { tc.order = i; });
      }
      ms.updatedAt = getTimestamp();
    });
  },

  reorderTuckedCard: (microsettingId, cardId, newOrder) => {
    set((state) => {
      const ms = state.microsettings[microsettingId];
      if (!ms) return;
      const card = ms.tuckedCards.find((tc) => tc.cardId === cardId);
      if (!card) return;
      const samePos = ms.tuckedCards
        .filter((tc) => tc.position === card.position)
        .sort((a, b) => a.order - b.order);
      // Remove and reinsert
      const idx = samePos.findIndex((tc) => tc.cardId === cardId);
      if (idx === -1) return;
      samePos.splice(idx, 1);
      samePos.splice(newOrder, 0, card);
      samePos.forEach((tc, i) => { tc.order = i; });
      ms.updatedAt = getTimestamp();
    });
  },

  getActiveMicrosetting: () => {
    const state = get();
    return state.activeMicrosettingId
      ? state.microsettings[state.activeMicrosettingId]
      : undefined;
  },

  getMicrosettingSummary: (microsettingId) => {
    const state = get();
    const ms = state.microsettings[microsettingId];
    if (!ms) return '';

    const parts: string[] = [];

    // Region
    if (ms.regionCardId) {
      const region = state.cardLibrary[ms.regionCardId];
      if (region) parts.push(region.title);
    }

    // Landmarks (left/right)
    const landmarks = ms.tuckedCards
      .filter((tc) => tc.position === 'left' || tc.position === 'right')
      .sort((a, b) => a.order - b.order);
    for (const lm of landmarks) {
      const card = state.cardLibrary[lm.cardId];
      if (card) parts.push(card.cue);
    }

    // Bottom stack cards
    const bottom = ms.tuckedCards
      .filter((tc) => tc.position === 'bottom')
      .sort((a, b) => a.order - b.order);
    for (const b of bottom) {
      const card = state.cardLibrary[b.cardId];
      if (card) parts.push(card.cue);
    }

    return parts.join(' · ');
  },
});
