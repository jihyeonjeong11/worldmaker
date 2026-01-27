/**
 * Persistence Service Exports
 *
 * Re-exports all persistence-related types, adapters, and services
 */

// Types
export type {
  PersistedState,
  PersistenceResult,
  PersistenceAdapter,
  PersistenceConfig,
  PersistedStateKey,
} from './types';

export { DEFAULT_PERSISTENCE_CONFIG, PERSISTED_STATE_KEYS } from './types';

// Adapters
export { LocalStorageAdapter, createLocalStorageAdapter } from './localStorageAdapter';
export { ElectronStorageAdapter, createElectronStorageAdapter } from './electronStorageAdapter';

// Service
export {
  PersistenceService,
  getPersistenceService,
  resetPersistenceService,
  type PersistenceStatus,
} from './persistenceService';
