/**
 * Persistence Service
 *
 * Main service that manages state persistence with debounced auto-save.
 * Automatically selects the appropriate adapter based on the environment.
 */

import { useBoardStore, type BoardStore } from '@/store/boardStore';
import type {
  PersistenceAdapter,
  PersistedState,
  PersistenceConfig,
  PersistenceResult,
} from './types';
import { DEFAULT_PERSISTENCE_CONFIG } from './types';
import { createLocalStorageAdapter } from './localStorageAdapter';
import { createElectronStorageAdapter } from './electronStorageAdapter';

/**
 * Type for the Zustand store with subscribe capability
 */
type ZustandStore = typeof useBoardStore;

/**
 * Debounce utility function
 */
function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };
}

/**
 * Status of the persistence service
 */
export interface PersistenceStatus {
  /** Whether the service is initialized */
  isInitialized: boolean;
  /** Whether auto-save is enabled */
  isAutoSaveEnabled: boolean;
  /** The active adapter name */
  adapterName: string;
  /** Last save timestamp */
  lastSaved: string | null;
  /** Last error message */
  lastError: string | null;
  /** Whether a save is pending */
  isSavePending: boolean;
}

/**
 * Persistence Service Class
 */
export class PersistenceService {
  private adapter: PersistenceAdapter;
  private config: PersistenceConfig;
  private debouncedSave: (() => void) | null = null;
  private unsubscribe: (() => void) | null = null;
  private lastSaved: string | null = null;
  private lastError: string | null = null;
  private isSavePending = false;
  private isInitialized = false;
  private store: ZustandStore | null = null;

  constructor(config: Partial<PersistenceConfig> = {}) {
    this.config = { ...DEFAULT_PERSISTENCE_CONFIG, ...config };
    this.adapter = this.selectAdapter();
  }

  /**
   * Select the appropriate adapter based on the environment
   */
  private selectAdapter(): PersistenceAdapter {
    // Try Electron first
    const electronAdapter = createElectronStorageAdapter(
      `${this.config.storageKey}.json`
    );
    if (electronAdapter.isAvailable()) {
      console.log('[PersistenceService] Using Electron file system adapter');
      return electronAdapter;
    }

    // Fall back to localStorage
    const localStorageAdapter = createLocalStorageAdapter(this.config.storageKey);
    if (localStorageAdapter.isAvailable()) {
      console.log('[PersistenceService] Using localStorage adapter');
      return localStorageAdapter;
    }

    // If nothing is available, still return localStorage adapter
    // (it will fail gracefully when used)
    console.warn('[PersistenceService] No storage adapter available');
    return localStorageAdapter;
  }

  /**
   * Extract persisted state from the store
   */
  private extractPersistedState(state: BoardStore): PersistedState {
    return {
      version: this.config.version,
      lastSaved: new Date().toISOString(),
      projects: state.projects,
      activeProjectId: state.activeProjectId,
      columns: state.columns,
      cards: state.cards,
      templates: state.templates ?? {},
      selectedTemplateId: state.selectedTemplateId ?? null,
    };
  }

  /**
   * Get the current status of the persistence service
   */
  getStatus(): PersistenceStatus {
    return {
      isInitialized: this.isInitialized,
      isAutoSaveEnabled: this.config.enableAutoSave && this.unsubscribe !== null,
      adapterName: this.adapter.name,
      lastSaved: this.lastSaved,
      lastError: this.lastError,
      isSavePending: this.isSavePending,
    };
  }

  /**
   * Initialize the persistence service with a store reference
   */
  initialize(store: ZustandStore): void {
    if (this.isInitialized) {
      console.warn('[PersistenceService] Already initialized');
      return;
    }

    this.store = store;
    this.isInitialized = true;

    if (this.config.enableAutoSave) {
      this.enableAutoSave();
    }

    console.log('[PersistenceService] Initialized', {
      adapter: this.adapter.name,
      autoSave: this.config.enableAutoSave,
      debounceMs: this.config.debounceMs,
    });
  }

  /**
   * Enable auto-save functionality
   */
  enableAutoSave(): void {
    if (!this.store) {
      console.error('[PersistenceService] Cannot enable auto-save: not initialized');
      return;
    }

    if (this.unsubscribe) {
      console.warn('[PersistenceService] Auto-save already enabled');
      return;
    }

    // Create debounced save function
    this.debouncedSave = debounce(() => {
      void this.save();
    }, this.config.debounceMs);

    // Subscribe to store changes
    this.unsubscribe = this.store.subscribe((state: BoardStore, prevState: BoardStore) => {
      // Only save if relevant state has changed
      if (
        state.projects !== prevState.projects ||
        state.activeProjectId !== prevState.activeProjectId ||
        state.columns !== prevState.columns ||
        state.cards !== prevState.cards ||
        state.templates !== prevState.templates ||
        state.selectedTemplateId !== prevState.selectedTemplateId
      ) {
        this.isSavePending = true;
        this.debouncedSave?.();
      }
    });

    console.log('[PersistenceService] Auto-save enabled');
  }

  /**
   * Disable auto-save functionality
   */
  disableAutoSave(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.debouncedSave = null;
    console.log('[PersistenceService] Auto-save disabled');
  }

  /**
   * Manually save the current state
   */
  async save(): Promise<PersistenceResult> {
    if (!this.store) {
      return {
        success: false,
        error: 'Persistence service not initialized',
      };
    }

    try {
      const state = this.store.getState();
      const persistedState = this.extractPersistedState(state);

      const result = await this.adapter.save(persistedState);

      if (result.success) {
        this.lastSaved = persistedState.lastSaved;
        this.lastError = null;
        console.log('[PersistenceService] State saved successfully', {
          projects: Object.keys(persistedState.projects).length,
          columns: Object.keys(persistedState.columns).length,
          cards: Object.keys(persistedState.cards).length,
        });
      } else {
        this.lastError = result.error || 'Unknown save error';
        console.error('[PersistenceService] Save failed:', this.lastError);
      }

      this.isSavePending = false;
      return result;
    } catch (error) {
      this.isSavePending = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.lastError = errorMessage;
      console.error('[PersistenceService] Save error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Load persisted state
   */
  async load(): Promise<PersistenceResult<PersistedState | null>> {
    try {
      const result = await this.adapter.load();

      if (result.success) {
        if (result.data) {
          console.log('[PersistenceService] State loaded successfully', {
            version: result.data.version,
            projects: Object.keys(result.data.projects).length,
            columns: Object.keys(result.data.columns).length,
            cards: Object.keys(result.data.cards).length,
            lastSaved: result.data.lastSaved,
          });
        } else {
          console.log('[PersistenceService] No saved state found');
        }
      } else {
        console.error('[PersistenceService] Load failed:', result.error);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[PersistenceService] Load error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Clear all persisted data
   */
  async clear(): Promise<PersistenceResult> {
    try {
      const result = await this.adapter.clear();

      if (result.success) {
        this.lastSaved = null;
        this.lastError = null;
        console.log('[PersistenceService] Persisted data cleared');
      } else {
        console.error('[PersistenceService] Clear failed:', result.error);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[PersistenceService] Clear error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Cleanup and dispose the service
   */
  dispose(): void {
    this.disableAutoSave();
    this.store = null;
    this.isInitialized = false;
    console.log('[PersistenceService] Disposed');
  }
}

// Singleton instance for the application
let persistenceServiceInstance: PersistenceService | null = null;

/**
 * Get or create the persistence service singleton
 */
export function getPersistenceService(
  config?: Partial<PersistenceConfig>
): PersistenceService {
  if (!persistenceServiceInstance) {
    persistenceServiceInstance = new PersistenceService(config);
  }
  return persistenceServiceInstance;
}

/**
 * Reset the persistence service singleton (for testing)
 */
export function resetPersistenceService(): void {
  if (persistenceServiceInstance) {
    persistenceServiceInstance.dispose();
    persistenceServiceInstance = null;
  }
}
