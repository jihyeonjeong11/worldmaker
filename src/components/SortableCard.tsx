/**
 * SortableCard Component
 *
 * Wraps a card with dnd-kit sortable functionality.
 * Provides drag handle, dragging styles, and drop animations.
 */
import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card, CardId, ColumnId } from '@/types';

/**
 * Priority badge colors for visual distinction
 */
const PRIORITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#3b82f6',
  high: '#f59e0b',
  critical: '#ef4444',
};

interface SortableCardProps {
  /** The card data */
  card: Card;
  /** Callback when card is clicked for editing */
  onCardClick?: (card: Card) => void;
  /** Callback when card delete is requested */
  onCardDelete?: (cardId: CardId) => void;
  /** Callback when card duplicate is requested */
  onCardDuplicate?: (cardId: CardId) => void;
  /** Callback when saving card as template is requested */
  onCardSaveAsTemplate?: (card: Card) => void;
  /** Column ID this card belongs to */
  columnId: ColumnId;
}

/**
 * SortableCard - A draggable card in the Kanban board
 */
export function SortableCard({
  card,
  onCardClick,
  onCardDelete,
  onCardDuplicate,
  onCardSaveAsTemplate,
  columnId,
}: SortableCardProps): JSX.Element {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      card,
      columnId,
    },
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger click if we're in the middle of a drag
    if (isDragging) {
      e.preventDefault();
      return;
    }
    onCardClick?.(card);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCardClick?.(card);
    }
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCardDelete?.(card.id);
    setShowMenu(false);
  };

  const handleDuplicateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCardDuplicate?.(card.id);
    setShowMenu(false);
  };

  const handleSaveAsTemplateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCardSaveAsTemplate?.(card);
    setShowMenu(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`story-card p-3 rounded-card transition-all group touch-manipulation ${
        isDragging
          ? 'ring-2 ring-primary-500 shadow-lg z-50'
          : 'hover:ring-1 hover:ring-primary-500'
      }`}
      data-testid={`card-${card.id}`}
      data-card-id={card.id}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      {/* Card header with title and actions */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="font-medium text-text-primary text-sm line-clamp-2 flex-1">
          {card.title}
        </h4>
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Priority badge */}
          <span
            className="px-1.5 py-0.5 rounded text-xs text-white capitalize"
            style={{
              backgroundColor:
                PRIORITY_COLORS[card.priority] || PRIORITY_COLORS.medium,
            }}
          >
            {card.priority}
          </span>
          {/* Actions menu button (visible on hover) */}
          <div className="relative">
            <button
              type="button"
              onClick={handleMenuToggle}
              className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-text-primary hover:bg-surface-600 rounded transition-all"
              title="Card actions"
              data-testid={`card-menu-btn-${card.id}`}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
            {/* Actions dropdown menu */}
            {showMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 top-full mt-1 w-48 bg-surface-700 border border-border rounded-card shadow-modal z-50 py-1 animate-fade-in"
                data-testid={`card-actions-menu-${card.id}`}
              >
                {onCardDuplicate && (
                  <button
                    type="button"
                    onClick={handleDuplicateClick}
                    className="w-full px-3 py-2 text-left text-sm text-text-secondary hover:bg-surface-600 hover:text-text-primary flex items-center gap-2 transition-colors"
                    data-testid={`card-duplicate-btn-${card.id}`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Duplicate Card
                  </button>
                )}
                {onCardSaveAsTemplate && (
                  <button
                    type="button"
                    onClick={handleSaveAsTemplateClick}
                    className="w-full px-3 py-2 text-left text-sm text-text-secondary hover:bg-surface-600 hover:text-text-primary flex items-center gap-2 transition-colors"
                    data-testid={`card-save-template-btn-${card.id}`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                      />
                    </svg>
                    Save as Template
                  </button>
                )}
                {onCardDelete && (
                  <>
                    <div className="border-t border-border my-1" />
                    <button
                      type="button"
                      onClick={handleDeleteClick}
                      className="w-full px-3 py-2 text-left text-sm text-error-400 hover:bg-error-500/10 flex items-center gap-2 transition-colors"
                      data-testid={`card-delete-btn-${card.id}`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete Card
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card description */}
      {card.description && (
        <p className="text-text-muted text-xs line-clamp-2">
          {card.description}
        </p>
      )}

      {/* Card tags */}
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {card.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="badge badge-primary text-xs py-0">
              {tag}
            </span>
          ))}
          {card.tags.length > 3 && (
            <span className="text-xs text-text-muted">
              +{card.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default SortableCard;
