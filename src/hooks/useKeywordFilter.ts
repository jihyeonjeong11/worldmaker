/**
 * useKeywordFilter Hook
 *
 * A custom hook for managing keyword/tag filtering state.
 * Handles toggle, clear, and filtering logic for cards based on selected keywords.
 */
import { useState, useCallback, useMemo } from 'react';
import type { Card } from '@/types';

/**
 * Filter mode options
 */
export type FilterMode = 'any' | 'all';

/**
 * Return type for the useKeywordFilter hook
 */
export interface UseKeywordFilterReturn {
  /** Currently active/selected keywords */
  activeKeywords: string[];
  /** Toggle a keyword on/off */
  toggleKeyword: (keyword: string) => void;
  /** Clear all active keywords */
  clearKeywords: () => void;
  /** Set multiple keywords at once */
  setKeywords: (keywords: string[]) => void;
  /** Check if a keyword is active */
  isKeywordActive: (keyword: string) => boolean;
  /** Filter cards by active keywords */
  filterCards: (cards: Card[]) => Card[];
  /** Whether any filters are active */
  hasActiveFilters: boolean;
  /** Filter mode (any or all) */
  filterMode: FilterMode;
  /** Set filter mode */
  setFilterMode: (mode: FilterMode) => void;
}

/**
 * Options for the useKeywordFilter hook
 */
export interface UseKeywordFilterOptions {
  /** Initial keywords to select */
  initialKeywords?: string[];
  /** Initial filter mode */
  initialFilterMode?: FilterMode;
  /** Callback when keywords change */
  onKeywordsChange?: (keywords: string[]) => void;
}

/**
 * useKeywordFilter - Manage keyword filtering state
 */
export function useKeywordFilter(
  options: UseKeywordFilterOptions = {}
): UseKeywordFilterReturn {
  const {
    initialKeywords = [],
    initialFilterMode = 'any',
    onKeywordsChange,
  } = options;

  // State for active keywords
  const [activeKeywords, setActiveKeywords] = useState<string[]>(initialKeywords);

  // State for filter mode
  const [filterMode, setFilterMode] = useState<FilterMode>(initialFilterMode);

  // Toggle a keyword on/off
  const toggleKeyword = useCallback(
    (keyword: string) => {
      setActiveKeywords((prev) => {
        const normalizedKeyword = keyword.toLowerCase();
        const isActive = prev.some(
          (k) => k.toLowerCase() === normalizedKeyword
        );

        const newKeywords = isActive
          ? prev.filter((k) => k.toLowerCase() !== normalizedKeyword)
          : [...prev, keyword];

        // Notify about change
        if (onKeywordsChange) {
          onKeywordsChange(newKeywords);
        }

        return newKeywords;
      });
    },
    [onKeywordsChange]
  );

  // Clear all keywords
  const clearKeywords = useCallback(() => {
    setActiveKeywords([]);
    if (onKeywordsChange) {
      onKeywordsChange([]);
    }
  }, [onKeywordsChange]);

  // Set multiple keywords at once
  const setKeywords = useCallback(
    (keywords: string[]) => {
      setActiveKeywords(keywords);
      if (onKeywordsChange) {
        onKeywordsChange(keywords);
      }
    },
    [onKeywordsChange]
  );

  // Check if a keyword is active
  const isKeywordActive = useCallback(
    (keyword: string): boolean => {
      return activeKeywords.some(
        (k) => k.toLowerCase() === keyword.toLowerCase()
      );
    },
    [activeKeywords]
  );

  // Filter cards by active keywords
  const filterCards = useCallback(
    (cards: Card[]): Card[] => {
      if (activeKeywords.length === 0) {
        return cards;
      }

      const normalizedActive = activeKeywords.map((k) => k.toLowerCase());

      return cards.filter((card) => {
        if (!card.tags || card.tags.length === 0) {
          return false;
        }

        const cardTags = card.tags.map((t) => t.toLowerCase());

        if (filterMode === 'any') {
          // Card matches if it has ANY of the active keywords
          return normalizedActive.some((keyword) =>
            cardTags.includes(keyword)
          );
        } else {
          // Card matches if it has ALL of the active keywords
          return normalizedActive.every((keyword) =>
            cardTags.includes(keyword)
          );
        }
      });
    },
    [activeKeywords, filterMode]
  );

  // Check if any filters are active
  const hasActiveFilters = useMemo(
    () => activeKeywords.length > 0,
    [activeKeywords]
  );

  return {
    activeKeywords,
    toggleKeyword,
    clearKeywords,
    setKeywords,
    isKeywordActive,
    filterCards,
    hasActiveFilters,
    filterMode,
    setFilterMode,
  };
}

export default useKeywordFilter;
