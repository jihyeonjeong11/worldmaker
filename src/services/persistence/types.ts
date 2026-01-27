/**
 * Type definitions for the persistence service
 */

import type {
  ProjectId,
  Project,
  ColumnId,
  Column,
  CardId,
  Card,
  TemplateId,
  Template,
} from '@/types';

/**
 * The serializable state that gets persisted
 * This includes all entity data but excludes action functions
 */
export interface PersistedState {
  /** Version for migration handling */
  version: string;
  /** Last save timestamp */
  lastSaved: string;
  /** Projects data */
  projects: Record<ProjectId, Project>;
  /** Active project ID */
  activeProjectId: ProjectId | null;
  /** Columns data */
  columns: Record<ColumnId, Column>;
  /** Cards data */
  cards: Record<CardId, Card>;
  /** Templates data */
  templates: Record<TemplateId, Template>;
  /** Selected template ID */
  selectedTemplateId: TemplateId | null;
}

/**
 * Result of a persistence operation
 */
export interface PersistenceResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Interface for persistence adapters
 * Different adapters can be used for different environments (browser, Electron)
 */
export interface PersistenceAdapter {
  /** Unique identifier for this adapter */
  readonly name: string;

  /** Check if this adapter is available in the current environment */
  isAvailable(): boolean;

  /** Save state to storage */
  save(state: PersistedState): Promise<PersistenceResult>;

  /** Load state from storage */
  load(): Promise<PersistenceResult<PersistedState | null>>;

  /** Clear all persisted data */
  clear(): Promise<PersistenceResult>;
}

/**
 * Configuration for the persistence service
 */
export interface PersistenceConfig {
  /** Debounce delay in milliseconds for auto-save */
  debounceMs: number;
  /** Storage key for localStorage */
  storageKey: string;
  /** Current schema version */
  version: string;
  /** Whether to enable auto-save */
  enableAutoSave: boolean;
}

/**
 * Default persistence configuration
 */
export const DEFAULT_PERSISTENCE_CONFIG: PersistenceConfig = {
  debounceMs: 1000,
  storageKey: 'storymaker-state',
  version: '1.0.0',
  enableAutoSave: true,
};

/**
 * State keys that should trigger auto-save when changed
 */
export const PERSISTED_STATE_KEYS = [
  'projects',
  'activeProjectId',
  'columns',
  'cards',
  'templates',
  'selectedTemplateId',
] as const;

export type PersistedStateKey = typeof PERSISTED_STATE_KEYS[number];
