/**
 * KeywordFilterBar Component
 *
 * A container component that displays a row of clickable keyword/tag pills
 * for filtering cards. Shows frequently used keywords extracted from cards
 * with counts and active states.
 */
import { useMemo, useCallback } from 'react';
import { KeywordPillButton } from './KeywordPillButton';
import type { Card } from '@/types';

/**
 * Represents a keyword with its frequency count
 */
export interface KeywordWithCount {
  keyword: string;
  count: number;
}

/**
 * Props for the KeywordFilterBar component
 */
export interface KeywordFilterBarProps {
  /** Cards to extract keywords from */
  cards: Card[];
  /** Currently active/selected keywords */
  activeKeywords: string[];
  /** Callback when a keyword is toggled */
  onKeywordToggle: (keyword: string) => void;
  /** Callback to clear all active keywords */
  onClearAll?: () => void;
  /** Maximum number of keywords to display (default: 10) */
  maxKeywords?: number;
  /** Minimum count threshold to show a keyword (default: 1) */
  minCount?: number;
  /** Size variant for pills */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant for active pills */
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  /** Optional CSS class name */
  className?: string;
  /** Whether to show the "Clear all" button */
  showClearButton?: boolean;
  /** Label for the filter bar */
  label?: string;
}

/**
 * Extract and count keywords from cards
 */
function extractKeywords(
  cards: Card[],
  maxKeywords: number,
  minCount: number
): KeywordWithCount[] {
  // Count keyword occurrences
  const keywordCounts = new Map<string, number>();

  for (const card of cards) {
    if (card.tags && Array.isArray(card.tags)) {
      for (const tag of card.tags) {
        const normalizedTag = tag.trim().toLowerCase();
        if (normalizedTag) {
          keywordCounts.set(
            normalizedTag,
            (keywordCounts.get(normalizedTag) || 0) + 1
          );
        }
      }
    }
  }

  // Convert to array and filter by minimum count
  const keywords: KeywordWithCount[] = [];
  keywordCounts.forEach((count, keyword) => {
    if (count >= minCount) {
      // Capitalize first letter for display
      const displayKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);
      keywords.push({ keyword: displayKeyword, count });
    }
  });

  // Sort by count (descending), then alphabetically
  keywords.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return a.keyword.localeCompare(b.keyword);
  });

  // Limit to max keywords
  return keywords.slice(0, maxKeywords);
}

/**
 * KeywordFilterBar - Container for keyword filter pills
 */
export function KeywordFilterBar({
  cards,
  activeKeywords,
  onKeywordToggle,
  onClearAll,
  maxKeywords = 10,
  minCount = 1,
  size = 'md',
  variant = 'primary',
  className = '',
  showClearButton = true,
  label = 'Filter by tags:',
}: KeywordFilterBarProps): JSX.Element | null {
  // Extract and memoize keywords from cards
  const keywords = useMemo(
    () => extractKeywords(cards, maxKeywords, minCount),
    [cards, maxKeywords, minCount]
  );

  // Check if a keyword is active (case-insensitive)
  const isKeywordActive = useCallback(
    (keyword: string): boolean => {
      return activeKeywords.some(
        (active) => active.toLowerCase() === keyword.toLowerCase()
      );
    },
    [activeKeywords]
  );

  // Handle clear all
  const handleClearAll = useCallback(() => {
    if (onClearAll) {
      onClearAll();
    }
  }, [onClearAll]);

  // Don't render if no keywords
  if (keywords.length === 0) {
    return null;
  }

  const hasActiveFilters = activeKeywords.length > 0;

  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      data-testid="keyword-filter-bar"
      role="group"
      aria-label="Keyword filters"
    >
      {/* Label */}
      {label && (
        <span className="text-sm text-text-muted whitespace-nowrap" data-testid="keyword-filter-label">
          {label}
        </span>
      )}

      {/* Keywords container */}
      <div className="flex flex-wrap items-center gap-2" data-testid="keyword-pills-container">
        {keywords.map(({ keyword, count }) => (
          <KeywordPillButton
            key={keyword}
            keyword={keyword}
            count={count}
            isActive={isKeywordActive(keyword)}
            onClick={onKeywordToggle}
            size={size}
            variant={variant}
          />
        ))}
      </div>

      {/* Clear all button */}
      {showClearButton && hasActiveFilters && onClearAll && (
        <button
          type="button"
          onClick={handleClearAll}
          className="text-sm text-text-muted hover:text-text-secondary transition-colors duration-200 whitespace-nowrap ml-2"
          data-testid="keyword-filter-clear-all"
          aria-label="Clear all filters"
        >
          Clear all
        </button>
      )}

      {/* Active filters indicator */}
      {hasActiveFilters && (
        <span
          className="text-xs text-text-muted whitespace-nowrap"
          data-testid="keyword-filter-active-count"
        >
          ({activeKeywords.length} active)
        </span>
      )}
    </div>
  );
}

export default KeywordFilterBar;
