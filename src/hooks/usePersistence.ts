/**
 * usePersistence Hook
 *
 * Custom React hook for managing state persistence and hydration.
 * Handles loading persisted state on app initialization and provides
 * status information about the persistence service.
 */

import { useState, useEffect, useCallback } from 'react';
import { useBoardStore } from '@/store';
import {
  getPersistenceService,
  type PersistenceStatus,
  type PersistedState,
} from '@/services/persistence';

export interface UsePersistenceResult {
  /** Whether the initial hydration is complete */
  isHydrated: boolean;
  /** Whether hydration is currently in progress */
  isLoading: boolean;
  /** Current status of the persistence service */
  status: PersistenceStatus | null;
  /** Error message if hydration failed */
  error: string | null;
  /** Manually trigger a save */
  save: () => Promise<void>;
  /** Clear all persisted data */
  clear: () => Promise<void>;
}

/**
 * Hook for managing persistence and hydration of app state
 */
export function usePersistence(): UsePersistenceResult {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<PersistenceStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get store action to apply loaded state
  const resetStore = useBoardStore((state) => state.resetStore);

  /**
   * Apply loaded state to the store
   */
  const applyPersistedState = useCallback(
    (persistedState: PersistedState) => {
      // First reset the store to clear any existing state
      resetStore();

      // Then apply the persisted state by directly setting values
      // We use the store's setState to merge the persisted state
      useBoardStore.setState({
        projects: persistedState.projects,
        activeProjectId: persistedState.activeProjectId,
        columns: persistedState.columns,
        cards: persistedState.cards,
        templates: persistedState.templates ?? {},
        selectedTemplateId: persistedState.selectedTemplateId ?? null,
      });
    },
    [resetStore]
  );

  /**
   * Initialize persistence and hydrate state
   */
  useEffect(() => {
    const initializePersistence = async (): Promise<void> => {
      try {
        const persistenceService = getPersistenceService();

        // Initialize the service with the store
        persistenceService.initialize(useBoardStore);

        // Load persisted state
        const result = await persistenceService.load();

        if (result.success && result.data) {
          // Apply the loaded state
          applyPersistedState(result.data);
          console.log('[usePersistence] State hydrated successfully');
        } else if (!result.success) {
          console.error('[usePersistence] Failed to load state:', result.error);
          setError(result.error || 'Failed to load persisted state');
        }

        // Update status
        setStatus(persistenceService.getStatus());
        setIsHydrated(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('[usePersistence] Initialization error:', errorMessage);
        setError(errorMessage);
        setIsHydrated(true); // Mark as hydrated even on error to unblock the app
      } finally {
        setIsLoading(false);
      }
    };

    void initializePersistence();

    // Cleanup on unmount
    return () => {
      // Don't dispose the service on unmount as it should persist across re-renders
    };
  }, [applyPersistedState]);

  /**
   * Manually trigger a save
   */
  const save = useCallback(async (): Promise<void> => {
    try {
      const persistenceService = getPersistenceService();
      const result = await persistenceService.save();

      if (!result.success) {
        setError(result.error || 'Save failed');
      } else {
        setError(null);
      }

      setStatus(persistenceService.getStatus());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    }
  }, []);

  /**
   * Clear all persisted data
   */
  const clear = useCallback(async (): Promise<void> => {
    try {
      const persistenceService = getPersistenceService();
      const result = await persistenceService.clear();

      if (!result.success) {
        setError(result.error || 'Clear failed');
      } else {
        setError(null);
      }

      setStatus(persistenceService.getStatus());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    }
  }, []);

  return {
    isHydrated,
    isLoading,
    status,
    error,
    save,
    clear,
  };
}

export default usePersistence;
