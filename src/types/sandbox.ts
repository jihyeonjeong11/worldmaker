/**
 * Worldbuilding Sandbox Types
 * Types for the Deck of Worlds microsetting builder
 */

import type { WorldbuildingCardType } from './index';

/** Unique identifier for a sandbox card */
export type SandboxCardId = string;

/** Unique identifier for a microsetting */
export type MicrosettingId = string;

/** Position where a card is tucked relative to the region card */
export type TuckPosition = 'bottom' | 'left' | 'right';

/** Color themes for worldbuilding cards */
export interface CardColorTheme {
  /** Primary background color */
  bg: string;
  /** Accent/header color */
  accent: string;
  /** Text color */
  text: string;
  /** Cue strip background */
  cueBg: string;
  /** Cue strip text color */
  cueText: string;
}

/** Default color themes for each card category */
export const CARD_COLOR_THEMES: Record<WorldbuildingCardType, CardColorTheme> = {
  region: {
    bg: '#4a7c59',
    accent: '#3d6b4a',
    text: '#ffffff',
    cueBg: '#3d6b4a',
    cueText: '#e8f5e9',
  },
  landmark: {
    bg: '#8b6914',
    accent: '#7a5b0e',
    text: '#ffffff',
    cueBg: '#7a5b0e',
    cueText: '#fff8e1',
  },
  namesake: {
    bg: '#7c5cbf',
    accent: '#6a4aad',
    text: '#ffffff',
    cueBg: '#6a4aad',
    cueText: '#f3e8ff',
  },
  origin: {
    bg: '#2d8659',
    accent: '#1f7347',
    text: '#ffffff',
    cueBg: '#1f7347',
    cueText: '#e0f2e9',
  },
  attribute: {
    bg: '#c95a8d',
    accent: '#b44a7d',
    text: '#ffffff',
    cueBg: '#b44a7d',
    cueText: '#fce4ec',
  },
  advent: {
    bg: '#3a8f9c',
    accent: '#2e7d8a',
    text: '#ffffff',
    cueBg: '#2e7d8a',
    cueText: '#e0f7fa',
  },
};

/**
 * A sandbox card — the atomic unit of worldbuilding.
 * Cards live in the Card Library and can be reused across microsettings.
 */
export interface SandboxCard {
  /** Unique identifier */
  id: SandboxCardId;
  /** Card category (Region, Landmark, etc.) */
  category: WorldbuildingCardType;
  /** The main title (e.g., "Swamp", "Settlement") */
  title: string;
  /** The descriptive cue sentence at the bottom of the card */
  cue: string;
  /** Color theme override (optional — defaults by category) */
  colorTheme?: CardColorTheme;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * A tucked card placement within a microsetting.
 * References a card from the library plus its position in the stack.
 */
export interface TuckedCard {
  /** The sandbox card ID (references Card Library) */
  cardId: SandboxCardId;
  /** Where this card is tucked */
  position: TuckPosition;
  /** Order within the same tuck position (0-based) */
  order: number;
}

/**
 * A Microsetting — a composed stack of tucked cards around a Region card.
 */
export interface Microsetting {
  /** Unique identifier */
  id: MicrosettingId;
  /** Display name of this microsetting */
  name: string;
  /** The Region card ID (always the central/base card) */
  regionCardId: SandboxCardId | null;
  /** Array of tucked cards (non-region) */
  tuckedCards: TuckedCard[];
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/** State shape for the sandbox slice */
export interface SandboxState {
  /** Card Library — all user-created sandbox cards */
  cardLibrary: Record<SandboxCardId, SandboxCard>;
  /** All microsettings */
  microsettings: Record<MicrosettingId, Microsetting>;
  /** Currently active microsetting */
  activeMicrosettingId: MicrosettingId | null;
}

/** Payload for creating a new sandbox card */
export interface CreateSandboxCardPayload {
  category: WorldbuildingCardType;
  title: string;
  cue: string;
  colorTheme?: CardColorTheme;
}

/** Payload for tucking a card into the active microsetting */
export interface TuckCardPayload {
  cardId: SandboxCardId;
  position: TuckPosition;
}

/** Payload for creating a new microsetting */
export interface CreateMicrosettingPayload {
  name: string;
  regionCardId?: SandboxCardId;
}
