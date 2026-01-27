/**
 * useCardSearch Hook
 *
 * A custom hook for searching and filtering cards/templates by keywords, titles, and tags.
 * Features real-time search with debouncing for optimal performance and
 * provides match information for result highlighting.
 *
 * @example
 * ```tsx
 * const { searchQuery, setSearchQuery, results, isSearching, highlightText } = useCardSearch({
 *   items: templates,
 *   getTitle: (t) => t.name,
 *   getDescription: (t) => t.description,
 *   getTags: (t) => t.tags,
 *   debounceMs: 300,
 * });
 * ```
 */
import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import type { SearchMatch, SearchResult, SearchOptions } from '@/types';

/**
 * Configuration for the useCardSearch hook
 */
export interface UseCardSearchConfig<T> {
  /** Array of items to search through */
  items: T[];
  /** Function to get the title/name from an item */
  getTitle: (item: T) => string;
  /** Function to get the description from an item */
  getDescription: (item: T) => string;
  /** Function to get tags from an item */
  getTags: (item: T) => string[];
  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number;
  /** Search options */
  options?: SearchOptions;
}

/**
 * Return type for the useCardSearch hook
 */
export interface UseCardSearchReturn<T> {
  /** Current search query (raw input) */
  searchQuery: string;
  /** Update the search query */
  setSearchQuery: (query: string) => void;
  /** Debounced search query (used for actual searching) */
  debouncedQuery: string;
  /** Whether a search is actively happening (query exists) */
  isSearching: boolean;
  /** Filtered and scored search results */
  results: SearchResult<T>[];
  /** Total number of items */
  totalItems: number;
  /** Number of items after filtering */
  filteredCount: number;
  /** Clear the search query */
  clearSearch: () => void;
  /** Helper function to highlight matching text in a string */
  highlightText: (text: string, field: 'title' | 'description' | 'tag') => HighlightedText[];
  /** Get all matches for a specific item */
  getItemMatches: (item: T) => SearchMatch[];
}

/**
 * Represents a segment of text that may or may not be highlighted
 */
export interface HighlightedText {
  /** The text content */
  text: string;
  /** Whether this segment should be highlighted */
  isHighlighted: boolean;
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Find all matches of a query in a text
 */
function findMatches(
  text: string,
  query: string,
  field: 'title' | 'description' | 'tag',
  caseSensitive: boolean = false
): SearchMatch[] {
  if (!text || !query) return [];

  const matches: SearchMatch[] = [];
  const searchText = caseSensitive ? text : text.toLowerCase();
  const searchQuery = caseSensitive ? query : query.toLowerCase();
  const escapedQuery = escapeRegex(searchQuery);

  try {
    const regex = new RegExp(escapedQuery, caseSensitive ? 'g' : 'gi');
    let match: RegExpExecArray | null;

    while ((match = regex.exec(searchText)) !== null) {
      matches.push({
        field,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        matchedText: text.substring(match.index, match.index + match[0].length),
      });
    }
  } catch {
    // If regex fails, fall back to simple includes check
    const index = searchText.indexOf(searchQuery);
    if (index !== -1) {
      matches.push({
        field,
        startIndex: index,
        endIndex: index + query.length,
        matchedText: text.substring(index, index + query.length),
      });
    }
  }

  return matches;
}

/**
 * Calculate a relevance score for search results
 * Higher scores indicate better matches
 */
function calculateScore(matches: SearchMatch[], query: string): number {
  if (matches.length === 0) return 0;

  let score = 0;

  for (const match of matches) {
    // Title matches are worth more
    if (match.field === 'title') {
      score += 10;
      // Exact match bonus
      if (match.matchedText.toLowerCase() === query.toLowerCase()) {
        score += 5;
      }
      // Start of title bonus
      if (match.startIndex === 0) {
        score += 3;
      }
    }
    // Tag matches are worth more than description
    else if (match.field === 'tag') {
      score += 5;
      // Exact tag match bonus
      if (match.matchedText.toLowerCase() === query.toLowerCase()) {
        score += 3;
      }
    }
    // Description matches
    else {
      score += 2;
    }
  }

  return score;
}

/**
 * Custom hook for searching cards/templates with debouncing and highlighting
 */
export function useCardSearch<T>({
  items,
  getTitle,
  getDescription,
  getTags,
  debounceMs = 300,
  options = {},
}: UseCardSearchConfig<T>): UseCardSearchReturn<T> {
  const {
    caseSensitive = false,
    minSearchLength = 1,
    searchFields = ['title', 'description', 'tags'],
    maxResults,
  } = options;

  // Raw search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Debounced query for actual searching
  const debouncedQuery = useDebounce(searchQuery, debounceMs);

  // Determine if we're actively searching
  const isSearching = debouncedQuery.length >= minSearchLength;

  // Memoized search results
  const results = useMemo(() => {
    if (!isSearching) {
      // Return all items with empty matches when not searching
      return items.map((item) => ({
        item,
        matches: [],
        score: 0,
      }));
    }

    const searchResults: SearchResult<T>[] = [];

    for (const item of items) {
      const matches: SearchMatch[] = [];

      // Search in title
      if (searchFields.includes('title')) {
        const titleMatches = findMatches(getTitle(item), debouncedQuery, 'title', caseSensitive);
        matches.push(...titleMatches);
      }

      // Search in description
      if (searchFields.includes('description')) {
        const descMatches = findMatches(
          getDescription(item),
          debouncedQuery,
          'description',
          caseSensitive
        );
        matches.push(...descMatches);
      }

      // Search in tags
      if (searchFields.includes('tags')) {
        const tags = getTags(item);
        for (const tag of tags) {
          const tagMatches = findMatches(tag, debouncedQuery, 'tag', caseSensitive);
          matches.push(...tagMatches);
        }
      }

      // Only include items with matches
      if (matches.length > 0) {
        const score = calculateScore(matches, debouncedQuery);
        searchResults.push({ item, matches, score });
      }
    }

    // Sort by score (descending)
    searchResults.sort((a, b) => b.score - a.score);

    // Apply max results limit if specified
    if (maxResults && searchResults.length > maxResults) {
      return searchResults.slice(0, maxResults);
    }

    return searchResults;
  }, [
    items,
    debouncedQuery,
    isSearching,
    caseSensitive,
    searchFields,
    maxResults,
    getTitle,
    getDescription,
    getTags,
  ]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Helper function to split text into highlighted segments
  const highlightText = useCallback(
    (text: string, field: 'title' | 'description' | 'tag'): HighlightedText[] => {
      if (!isSearching || !text) {
        return [{ text, isHighlighted: false }];
      }

      const matches = findMatches(text, debouncedQuery, field, caseSensitive);

      if (matches.length === 0) {
        return [{ text, isHighlighted: false }];
      }

      // Sort matches by start index
      matches.sort((a, b) => a.startIndex - b.startIndex);

      const segments: HighlightedText[] = [];
      let lastIndex = 0;

      for (const match of matches) {
        // Add non-highlighted text before this match
        if (match.startIndex > lastIndex) {
          segments.push({
            text: text.substring(lastIndex, match.startIndex),
            isHighlighted: false,
          });
        }

        // Add highlighted match
        segments.push({
          text: text.substring(match.startIndex, match.endIndex),
          isHighlighted: true,
        });

        lastIndex = match.endIndex;
      }

      // Add remaining non-highlighted text
      if (lastIndex < text.length) {
        segments.push({
          text: text.substring(lastIndex),
          isHighlighted: false,
        });
      }

      return segments;
    },
    [isSearching, debouncedQuery, caseSensitive]
  );

  // Get matches for a specific item
  const getItemMatches = useCallback(
    (item: T): SearchMatch[] => {
      const result = results.find((r) => r.item === item);
      return result?.matches ?? [];
    },
    [results]
  );

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    isSearching,
    results,
    totalItems: items.length,
    filteredCount: isSearching ? results.length : items.length,
    clearSearch,
    highlightText,
    getItemMatches,
  };
}

export default useCardSearch;
