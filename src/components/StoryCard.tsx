/**
 * StoryCard Component
 *
 * A reusable story card component with customizable fields and interactive states.
 * Supports title, description, category, tags, and handles hover/selected/dragging states.
 */
import { useCallback, type KeyboardEvent, type MouseEvent } from 'react';
import type { Card, CardPriority, CardStatus } from '@/types';

/**
 * Story card category for visual categorization
 */
export type StoryCategory =
  | 'scene'
  | 'chapter'
  | 'character'
  | 'setting'
  | 'plot'
  | 'note'
  | 'custom';

/**
 * Props for the StoryCard component
 */
export interface StoryCardProps {
  /** Unique identifier for the card */
  id: string;
  /** Title of the story card */
  title: string;
  /** Optional description text */
  description?: string;
  /** Category of the story element */
  category?: StoryCategory;
  /** Tags for the card */
  tags?: string[];
  /** Priority level */
  priority?: CardPriority;
  /** Card status */
  status?: CardStatus;
  /** Whether the card is currently selected */
  isSelected?: boolean;
  /** Whether the card is currently being dragged */
  isDragging?: boolean;
  /** Whether the card is a drop target */
  isDropTarget?: boolean;
  /** Whether the card is disabled */
  isDisabled?: boolean;
  /** Maximum number of tags to display before truncating */
  maxVisibleTags?: number;
  /** Callback when card is clicked */
  onClick?: (id: string) => void;
  /** Callback when card is double-clicked */
  onDoubleClick?: (id: string) => void;
  /** Callback when drag starts */
  onDragStart?: (id: string) => void;
  /** Callback when drag ends */
  onDragEnd?: (id: string) => void;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Get category badge styling
 */
function getCategoryStyles(category: StoryCategory): string {
  switch (category) {
    case 'scene':
      return 'bg-primary-500/20 text-primary-300';
    case 'chapter':
      return 'bg-secondary-500/20 text-secondary-300';
    case 'character':
      return 'bg-success-500/20 text-success-400';
    case 'setting':
      return 'bg-warning-500/20 text-warning-400';
    case 'plot':
      return 'bg-error-500/20 text-error-400';
    case 'note':
      return 'bg-surface-600/50 text-text-muted';
    case 'custom':
    default:
      return 'bg-surface-600/50 text-text-secondary';
  }
}

/**
 * Get category display label
 */
function getCategoryLabel(category: StoryCategory): string {
  switch (category) {
    case 'scene':
      return 'Scene';
    case 'chapter':
      return 'Chapter';
    case 'character':
      return 'Character';
    case 'setting':
      return 'Setting';
    case 'plot':
      return 'Plot';
    case 'note':
      return 'Note';
    case 'custom':
    default:
      return 'Custom';
  }
}


/**
 * StoryCard - A reusable card component for story elements
 *
 * Features:
 * - Customizable fields (title, description, category, tags)
 * - Visual hierarchy with category and priority badges
 * - Interactive states (hover, selected, dragging)
 * - Accessible with keyboard navigation
 */
export function StoryCard({
  id,
  title,
  description,
  category,
  tags = [],
  // priority and status props preserved for API compatibility but not displayed
  priority: _priority = 'low', // eslint-disable-line @typescript-eslint/no-unused-vars
  status: _status = 'active', // eslint-disable-line @typescript-eslint/no-unused-vars
  isSelected = false,
  isDragging = false,
  isDropTarget = false,
  isDisabled = false,
  maxVisibleTags = 3,
  onClick,
  onDoubleClick,
  onDragStart,
  onDragEnd,
  className = '',
}: StoryCardProps): JSX.Element {
  /**
   * Handle card click
   */
  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (isDisabled) return;
      e.stopPropagation();
      onClick?.(id);
    },
    [id, isDisabled, onClick]
  );

  /**
   * Handle card double click
   */
  const handleDoubleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (isDisabled) return;
      e.stopPropagation();
      onDoubleClick?.(id);
    },
    [id, isDisabled, onDoubleClick]
  );

  /**
   * Handle keyboard interaction
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (isDisabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.(id);
      }
    },
    [id, isDisabled, onClick]
  );

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback(() => {
    if (isDisabled) return;
    onDragStart?.(id);
  }, [id, isDisabled, onDragStart]);

  /**
   * Handle drag end
   */
  const handleDragEnd = useCallback(() => {
    onDragEnd?.(id);
  }, [id, onDragEnd]);

  // Build class names based on state
  const cardClasses = [
    'story-card',
    'p-3',
    'rounded-card',
    'animate-fade-in',
    'transition-all',
    'duration-200',
    // Dragging state
    isDragging && 'dragging',
    // Selected state
    isSelected && 'ring-2 ring-primary-500 ring-offset-2 ring-offset-background',
    // Drop target state
    isDropTarget && 'drop-target',
    // Disabled state
    isDisabled && 'opacity-50 cursor-not-allowed',
    // Custom classes
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Visible tags (limited by maxVisibleTags)
  const visibleTags = tags.slice(0, maxVisibleTags);
  const hiddenTagsCount = tags.length - maxVisibleTags;

  return (
    <div
      className={cardClasses}
      data-testid={`story-card-${id}`}
      data-card-id={id}
      data-selected={isSelected}
      data-dragging={isDragging}
      data-disabled={isDisabled}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      draggable={!isDisabled}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-disabled={isDisabled}
      aria-selected={isSelected}
      aria-label={`Story card: ${title}${category ? `, Category: ${getCategoryLabel(category)}` : ''}`}
    >
      {/* Card Header - Category Badge */}
      {category && (
        <div className="flex items-start justify-between gap-2 mb-2">
          {/* Category Badge */}
          <span
            className={`badge text-xs ${getCategoryStyles(category)}`}
            data-testid={`story-card-category-${id}`}
          >
            {getCategoryLabel(category)}
          </span>
        </div>
      )}

      {/* Card Title */}
      <h4
        className="font-medium text-text-primary text-sm line-clamp-2 mb-1"
        data-testid={`story-card-title-${id}`}
      >
        {title}
      </h4>

      {/* Card Description */}
      {description && (
        <p
          className="text-text-muted text-xs line-clamp-2 mb-2"
          data-testid={`story-card-description-${id}`}
        >
          {description}
        </p>
      )}

      {/* Card Tags */}
      {tags.length > 0 && (
        <div
          className="flex flex-wrap gap-1 mt-2"
          data-testid={`story-card-tags-${id}`}
        >
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="badge badge-primary text-xs py-0"
              data-testid={`story-card-tag-${id}-${tag}`}
            >
              {tag}
            </span>
          ))}
          {hiddenTagsCount > 0 && (
            <span
              className="text-text-muted text-xs"
              data-testid={`story-card-tags-overflow-${id}`}
            >
              +{hiddenTagsCount}
            </span>
          )}
        </div>
      )}

      {/* Card Status Indicator - hidden by default */}
    </div>
  );
}

/**
 * Create a StoryCard from a Card type object
 * Helper function to convert the store Card type to StoryCard props
 */
export function createStoryCardFromCard(
  card: Card,
  options?: {
    isSelected?: boolean;
    isDragging?: boolean;
    isDropTarget?: boolean;
    isDisabled?: boolean;
    category?: StoryCategory;
    onClick?: (id: string) => void;
    onDoubleClick?: (id: string) => void;
    onDragStart?: (id: string) => void;
    onDragEnd?: (id: string) => void;
  }
): StoryCardProps {
  return {
    id: card.id,
    title: card.title,
    description: card.description,
    tags: card.tags,
    priority: card.priority,
    status: card.status,
    category: options?.category,
    isSelected: options?.isSelected,
    isDragging: options?.isDragging,
    isDropTarget: options?.isDropTarget,
    isDisabled: options?.isDisabled,
    onClick: options?.onClick,
    onDoubleClick: options?.onDoubleClick,
    onDragStart: options?.onDragStart,
    onDragEnd: options?.onDragEnd,
  };
}

export default StoryCard;
