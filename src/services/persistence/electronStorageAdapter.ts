/**
 * Electron File System Persistence Adapter
 *
 * Implements persistence using Electron's IPC to read/write files.
 * Falls back to localStorage if Electron APIs are not available.
 */

import type { PersistenceAdapter, PersistedState, PersistenceResult } from './types';
import { DEFAULT_PERSISTENCE_CONFIG } from './types';

/**
 * Type definition for Electron API (matches preload.ts)
 */
interface ElectronAPI {
  ipc: {
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  };
}

/**
 * Check if Electron API is available
 */
function getElectronAPI(): ElectronAPI | null {
  if (typeof window !== 'undefined' && 'electronAPI' in window) {
    return window.electronAPI as ElectronAPI;
  }
  return null;
}

/**
 * Electron file system adapter for persisting state
 */
export class ElectronStorageAdapter implements PersistenceAdapter {
  readonly name = 'electronFileSystem';
  private fileName: string;

  constructor(fileName: string = `${DEFAULT_PERSISTENCE_CONFIG.storageKey}.json`) {
    this.fileName = fileName;
  }

  /**
   * Check if Electron file system APIs are available
   */
  isAvailable(): boolean {
    const api = getElectronAPI();
    return api !== null && typeof api.ipc?.invoke === 'function';
  }

  /**
   * Save state to file via Electron IPC
   */
  async save(state: PersistedState): Promise<PersistenceResult> {
    try {
      const api = getElectronAPI();
      if (!api) {
        return {
          success: false,
          error: 'Electron API is not available',
        };
      }

      const serialized = JSON.stringify(state, null, 2);
      const result = await api.ipc.invoke('file:write', this.fileName, serialized) as {
        success: boolean;
        error?: string;
      };

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Unknown error during file write',
        };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during save';
      console.error('[ElectronStorageAdapter] Save failed:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Load state from file via Electron IPC
   */
  async load(): Promise<PersistenceResult<PersistedState | null>> {
    try {
      const api = getElectronAPI();
      if (!api) {
        return {
          success: false,
          error: 'Electron API is not available',
        };
      }

      const result = await api.ipc.invoke('file:read', this.fileName) as {
        success: boolean;
        data?: string;
        error?: string;
        notFound?: boolean;
      };

      if (!result.success) {
        // File not found is not an error - just means no saved state
        if (result.notFound) {
          return {
            success: true,
            data: null,
          };
        }
        return {
          success: false,
          error: result.error || 'Unknown error during file read',
        };
      }

      if (!result.data) {
        return {
          success: true,
          data: null,
        };
      }

      const state = JSON.parse(result.data) as PersistedState;

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
      console.error('[ElectronStorageAdapter] Load failed:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Clear persisted data by deleting the file
   */
  async clear(): Promise<PersistenceResult> {
    try {
      const api = getElectronAPI();
      if (!api) {
        return {
          success: false,
          error: 'Electron API is not available',
        };
      }

      // Write empty content to effectively clear
      const result = await api.ipc.invoke('file:write', this.fileName, '') as {
        success: boolean;
        error?: string;
      };

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Unknown error during clear',
        };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during clear';
      console.error('[ElectronStorageAdapter] Clear failed:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

/**
 * Create an Electron storage adapter instance
 */
export function createElectronStorageAdapter(fileName?: string): ElectronStorageAdapter {
  return new ElectronStorageAdapter(fileName);
}
