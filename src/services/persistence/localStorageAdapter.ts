/**
 * LocalStorage Persistence Adapter
 *
 * Implements persistence using the browser's localStorage API.
 * Works in both browser and Electron renderer environments.
 */

import type { PersistenceAdapter, PersistedState, PersistenceResult } from './types';
import { DEFAULT_PERSISTENCE_CONFIG } from './types';

/**
 * LocalStorage adapter for persisting state
 */
export class LocalStorageAdapter implements PersistenceAdapter {
  readonly name = 'localStorage';
  private storageKey: string;

  constructor(storageKey: string = DEFAULT_PERSISTENCE_CONFIG.storageKey) {
    this.storageKey = storageKey;
  }

  /**
   * Check if localStorage is available
   */
  isAvailable(): boolean {
    try {
      const testKey = '__storymaker_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Save state to localStorage
   */
  async save(state: PersistedState): Promise<PersistenceResult> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          error: 'localStorage is not available',
        };
      }

      const serialized = JSON.stringify(state);
      localStorage.setItem(this.storageKey, serialized);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during save';
      console.error('[LocalStorageAdapter] Save failed:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Load state from localStorage
   */
  async load(): Promise<PersistenceResult<PersistedState | null>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          error: 'localStorage is not available',
        };
      }

      const serialized = localStorage.getItem(this.storageKey);

      if (!serialized) {
        // No saved state found - this is not an error
        return {
          success: true,
          data: null,
        };
      }

      const state = JSON.parse(serialized) as PersistedState;

      // Basic validation
      if (!state.version) {
        return {
          success: false,
          error: 'Invalid state: missing version',
        };
      }

      return {
        success: true,
        data: state,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during load';
      console.error('[LocalStorageAdapter] Load failed:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Clear persisted data from localStorage
   */
  async clear(): Promise<PersistenceResult> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          error: 'localStorage is not available',
        };
      }

      localStorage.removeItem(this.storageKey);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during clear';
      console.error('[LocalStorageAdapter] Clear failed:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

/**
 * Create a localStorage adapter instance
 */
export function createLocalStorageAdapter(storageKey?: string): LocalStorageAdapter {
  return new LocalStorageAdapter(storageKey);
}
