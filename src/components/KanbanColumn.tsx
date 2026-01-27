/**
 * KanbanColumn Component
 *
 * Renders a single column in the Kanban board with header and card container.
 * Supports column management actions (rename, delete, color change).
 * Supports card CRUD operations (create, edit, delete, duplicate, save as template).
 * Prepared for drag-and-drop functionality.
 */
import { useState, useRef, useEffect } from 'react';
import type { Column, Card, ColumnId, CardId } from '@/types';
import { WORLDBUILDING_CARD_TYPES } from '@/types';
import { ColumnActions } from './ColumnActions';

// Priority badge colors for visual distinction
const PRIORITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#3b82f6',
  high: '#f59e0b',
  critical: '#ef4444',
};

interface KanbanColumnProps {
  /** The column data */
  column: Column;
  /** Cards in this column */
  cards: Card[];
  /** Whether the column is a drop target (for drag-and-drop) */
  isDropTarget?: boolean;
  /** Callback when column header is clicked */
  onHeaderClick?: () => void;
  /** Callback when column is renamed */
  onRename?: (id: ColumnId, newTitle: string) => void;
  /** Callback when column color is changed */
  onColorChange?: (id: ColumnId, newColor: string) => void;
  /** Callback when column is deleted */
  onDelete?: (id: ColumnId) => void;
  /** Callback when add card button is clicked */
  onAddCard?: (columnId: ColumnId) => void;
  /** Callback when a card is clicked for editing */
  onCardClick?: (card: Card) => void;
  /** Callback when a card delete is requested */
  onCardDelete?: (cardId: CardId) => void;
  /** Callback when a card duplicate is requested */
  onCardDuplicate?: (cardId: CardId) => void;
  /** Callback when saving a card as template is requested */
  onCardSaveAsTemplate?: (card: Card) => void;
  /** Whether column is being dragged */
  isDragging?: boolean;
  /** Drag handle props for reordering */
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

/**
 * KanbanColumn - A single column in the Kanban board
 */
export function KanbanColumn({
  column,
  cards,
  isDropTarget = false,
  isDragging = false,
  onHeaderClick,
  onRename,
  onColorChange,
  onDelete,
  onAddCard,
  onCardClick,
  onCardDelete,
  onCardDuplicate,
  onCardSaveAsTemplate,
  dragHandleProps,
}: KanbanColumnProps): JSX.Element {
  // State for card action menus
  const [activeCardMenu, setActiveCardMenu] = useState<CardId | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveCardMenu(null);
      }
    };

    if (activeCardMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeCardMenu]);

  // Handle card action menu toggle
  const handleCardMenuToggle = (cardId: CardId, e: React.MouseEvent): void => {
    e.stopPropagation();
    setActiveCardMenu(activeCardMenu === cardId ? null : cardId);
  };

  // Handle duplicate card action
  const handleDuplicateCard = (cardId: CardId, e: React.MouseEvent): void => {
    e.stopPropagation();
    onCardDuplicate?.(cardId);
    setActiveCardMenu(null);
  };

  // Handle save as template action
  const handleSaveAsTemplate = (card: Card, e: React.MouseEvent): void => {
    e.stopPropagation();
    onCardSaveAsTemplate?.(card);
    setActiveCardMenu(null);
  };

  // Handle delete card action
  const handleDeleteCard = (cardId: CardId, e: React.MouseEvent): void => {
    e.stopPropagation();
    onCardDelete?.(cardId);
    setActiveCardMenu(null);
  };
  const cardCount = cards.length;
  const hasMaxCards = column.maxCards !== undefined && column.maxCards > 0;
  const isAtLimit = hasMaxCards && cardCount >= (column.maxCards ?? 0);

  // Default handlers for column actions
  const handleRename = (id: ColumnId, newTitle: string): void => {
    onRename?.(id, newTitle);
  };

  const handleColorChange = (id: ColumnId, newColor: string): void => {
    onColorChange?.(id, newColor);
  };

  const handleDelete = (id: ColumnId): void => {
    onDelete?.(id);
  };

  return (
    <div
      className={`kanban-column flex-shrink-0 h-full ${
        isDropTarget ? 'drop-target' : ''
      } ${isDragging ? 'dragging' : ''} ${
        column.isCollapsed ? 'max-w-[60px] min-w-[60px]' : ''
      }`}
      data-testid={`kanban-column-${column.id}`}
      data-column-id={column.id}
    >
      {/* Column Header */}
      <div
        className="flex items-center justify-between mb-4"
        data-testid={`column-header-${column.id}`}
      >
        {/* Left side: Color, Title, and optional drag handle */}
        <div
          className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
          onClick={onHeaderClick}
          {...dragHandleProps}
        >
          {/* Drag handle indicator */}
          {dragHandleProps && !column.isCollapsed && (
            <div className="text-text-muted hover:text-text-secondary cursor-grab">
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
                  d="M4 8h16M4 16h16"
                />
              </svg>
            </div>
          )}

          {/* Color indicator */}
          {column.color && (
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: column.color }}
              aria-hidden="true"
            />
          )}

          {/* Title */}
          {!column.isCollapsed && (
            <h3 className="font-semibold text-text-primary truncate">
              {column.title}
            </h3>
          )}
        </div>

        {/* Right side: Card count badge and actions menu */}
        {!column.isCollapsed && (
          <div className="flex items-center gap-2">
            {/* Card count badge */}
            <div
              className={`badge ${
                isAtLimit ? 'badge-warning' : 'badge-primary'
              }`}
              data-testid={`column-count-${column.id}`}
            >
              {cardCount}
              {hasMaxCards && `/${column.maxCards}`}
            </div>

            {/* Column actions menu */}
            {(onRename || onColorChange || onDelete) && (
              <ColumnActions
                column={column}
                onRename={handleRename}
                onColorChange={handleColorChange}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}
      </div>

      {/* Collapsed state - vertical title */}
      {column.isCollapsed && (
        <div
          className="flex-1 flex items-center justify-center cursor-pointer"
          onClick={onHeaderClick}
          data-testid={`column-collapsed-${column.id}`}
        >
          <span
            className="text-text-secondary font-medium writing-mode-vertical"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            {column.title}
          </span>
        </div>
      )}

      {/* Cards container */}
      {!column.isCollapsed && (
        <div
          className="flex flex-col gap-2 flex-1 overflow-y-auto min-h-[200px]"
          data-testid={`column-cards-${column.id}`}
        >
          {cards.length === 0 ? (
            <div
              className="flex-1 flex items-center justify-center text-text-muted text-sm border-2 border-dashed border-border rounded-card p-4"
              data-testid={`column-empty-${column.id}`}
            >
              <p>Drop cards here</p>
            </div>
          ) : (
            cards.map((card) => (
              <div
                key={card.id}
                className="story-card p-3 rounded-card cursor-pointer hover:ring-1 hover:ring-primary-500 transition-all group relative"
                data-testid={`card-${card.id}`}
                data-card-id={card.id}
                onClick={() => onCardClick?.(card)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onCardClick?.(card);
                  }
                }}
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
                      style={{ backgroundColor: PRIORITY_COLORS[card.priority] || PRIORITY_COLORS.medium }}
                    >
                      {card.priority}
                    </span>
                    {/* Card actions menu button (visible on hover) */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => handleCardMenuToggle(card.id, e)}
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
                      {/* Card actions dropdown menu */}
                      {activeCardMenu === card.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-full mt-1 w-48 bg-surface-700 border border-border rounded-card shadow-modal z-10 py-1 animate-fade-in"
                          data-testid={`card-actions-menu-${card.id}`}
                        >
                          {onCardDuplicate && (
                            <button
                              type="button"
                              onClick={(e) => handleDuplicateCard(card.id, e)}
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
                              onClick={(e) => handleSaveAsTemplate(card, e)}
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
                                onClick={(e) => handleDeleteCard(card.id, e)}
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
                {card.description && (
                  <p className="text-text-muted text-xs line-clamp-2">
                    {card.description}
                  </p>
                )}
                {/* Worldbuilding Badge & Cues */}
                {card.worldbuilding && (() => {
                  const meta = WORLDBUILDING_CARD_TYPES.find((m) => m.type === card.worldbuilding!.cardType);
                  return meta ? (
                    <div className="mt-1.5" data-testid={`card-wb-${card.id}`}>
                      <span
                        className="inline-block px-1.5 py-0.5 rounded text-xs text-white"
                        style={{ backgroundColor: meta.color }}
                      >
                        {meta.icon} {meta.label}
                      </span>
                      {card.worldbuilding!.cues.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {card.worldbuilding!.cues.slice(0, 2).map((cue, i) => (
                            <div key={i} className="text-xs">
                              <span className="text-text-secondary">• {cue.text}</span>
                              {cue.suggestion && (
                                <span className="text-text-muted italic text-[10px] ml-1">— {cue.suggestion}</span>
                              )}
                            </div>
                          ))}
                          {card.worldbuilding!.cues.length > 2 && (
                            <span className="text-[10px] text-text-muted">
                              +{card.worldbuilding!.cues.length - 2} more cues
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : null;
                })()}
                {card.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {card.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="badge badge-primary text-xs py-0"
                      >
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
            ))
          )}
        </div>
      )}

      {/* Add card button */}
      {!column.isCollapsed && !isAtLimit && (
        <button
          className="mt-3 w-full btn-ghost text-text-muted text-sm py-2 border border-dashed border-border rounded-button hover:border-primary-500 hover:text-primary-400 transition-colors"
          data-testid={`add-card-btn-${column.id}`}
          onClick={() => onAddCard?.(column.id)}
        >
          + Add Card
        </button>
      )}
    </div>
  );
}

export default KanbanColumn;
