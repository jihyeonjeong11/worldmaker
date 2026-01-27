/**
 * DroppableColumn Component
 *
 * Wraps a Kanban column with dnd-kit droppable functionality.
 * Contains sortable cards and handles drop zones.
 * Uses react-window virtualization for performance with large card lists.
 */
import { useRef, useEffect, useState, type CSSProperties, type ReactElement } from 'react';
import { useDroppable, useDndContext } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { List } from 'react-window';
import { SortableCard } from './SortableCard';
import { ColumnActions } from './ColumnActions';
import type { Column, Card, ColumnId, CardId } from '@/types';

/**
 * Constants for virtualization
 */
const CARD_HEIGHT = 90; // Approximate height of a card in pixels
const CARD_GAP = 8; // Gap between cards
const VIRTUALIZATION_THRESHOLD = 20; // Number of cards before virtualization kicks in

interface DroppableColumnProps {
  /** The column data */
  column: Column;
  /** Cards in this column */
  cards: Card[];
  /** IDs of cards for sortable context */
  cardIds: CardId[];
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
  /** Whether this column is currently a drag target */
  isActiveDropZone?: boolean;
}

/**
 * Props passed to each virtualized card row (rowProps in react-window v2)
 */
interface VirtualizedCardRowData {
  cards: Card[];
  columnId: ColumnId;
  onCardClick?: (card: Card) => void;
  onCardDelete?: (cardId: CardId) => void;
  onCardDuplicate?: (cardId: CardId) => void;
  onCardSaveAsTemplate?: (card: Card) => void;
}

/**
 * Virtualized card row renderer for react-window v2
 * Note: rowProps are spread into the component alongside index and style
 */
function VirtualizedCardRow(
  props: VirtualizedCardRowData & { index: number; style: CSSProperties }
): ReactElement | null {
  const { index, style, cards, columnId, onCardClick, onCardDelete, onCardDuplicate, onCardSaveAsTemplate } = props;
  const card = cards[index];

  if (!card) return null;

  // Adjust style to account for gap
  const adjustedStyle: CSSProperties = {
    ...style,
    height: CARD_HEIGHT,
    paddingBottom: CARD_GAP,
  };

  return (
    <div style={adjustedStyle}>
      <SortableCard
        card={card}
        columnId={columnId}
        onCardClick={onCardClick}
        onCardDelete={onCardDelete}
        onCardDuplicate={onCardDuplicate}
        onCardSaveAsTemplate={onCardSaveAsTemplate}
      />
    </div>
  );
}

/**
 * DroppableColumn - A column that accepts dropped cards
 * Uses virtualization for performance with large card counts
 */
export function DroppableColumn({
  column,
  cards,
  cardIds,
  onHeaderClick,
  onRename,
  onColorChange,
  onDelete,
  onAddCard,
  onCardClick,
  onCardDelete,
  onCardDuplicate,
  onCardSaveAsTemplate,
  isActiveDropZone = false,
}: DroppableColumnProps): JSX.Element {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  // Access dnd-kit context to check if dragging is active
  const { active } = useDndContext();
  const isDragging = active !== null;

  // Container ref for measuring height
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(300);

  // Measure container height for virtualization
  useEffect(() => {
    const measureHeight = (): void => {
      if (containerRef.current) {
        const height = containerRef.current.clientHeight;
        if (height > 0) {
          setContainerHeight(height);
        }
      }
    };

    measureHeight();

    const observer = new ResizeObserver(measureHeight);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const cardCount = cards.length;
  const hasMaxCards = column.maxCards !== undefined && column.maxCards > 0;
  const isAtLimit = hasMaxCards && cardCount >= (column.maxCards ?? 0);

  // Highlight the column when dragging over it
  const isHighlighted = isOver || isActiveDropZone;

  // Determine if we should use virtualization
  // Disable virtualization during drag for proper dnd-kit collision detection
  const shouldVirtualize = cardCount > VIRTUALIZATION_THRESHOLD && !isDragging;

  // Data for virtualized list - passed as rowProps in react-window v2
  const itemData: VirtualizedCardRowData = {
    cards,
    columnId: column.id,
    onCardClick,
    onCardDelete,
    onCardDuplicate,
    onCardSaveAsTemplate,
  };

  return (
    <div
      className={`kanban-column flex-shrink-0 h-full transition-all duration-200 ${
        column.isCollapsed ? 'max-w-[60px] min-w-[60px]' : ''
      } ${
        isHighlighted
          ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-background rounded-card'
          : ''
      }`}
      data-testid={`kanban-column-${column.id}`}
      data-column-id={column.id}
    >
      {/* Column Header */}
      <div
        className="flex items-center justify-between mb-4"
        data-testid={`column-header-${column.id}`}
      >
        {/* Left side: Color and Title */}
        <div
          className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
          onClick={onHeaderClick}
        >
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
                onRename={onRename ?? (() => {})}
                onColorChange={onColorChange ?? (() => {})}
                onDelete={onDelete ?? (() => {})}
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

      {/* Cards container with droppable zone */}
      {!column.isCollapsed && (
        <div
          ref={(node) => {
            setNodeRef(node);
            // Also update containerRef for height measurement
            if (containerRef.current !== node) {
              (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            }
          }}
          className={`flex flex-col gap-2 flex-1 overflow-y-auto min-h-[200px] p-1 -m-1 rounded-lg transition-colors duration-200 ${
            isHighlighted ? 'bg-primary-500/10' : ''
          }`}
          data-testid={`column-cards-${column.id}`}
        >
          <SortableContext
            items={cardIds}
            strategy={verticalListSortingStrategy}
          >
            {cards.length === 0 ? (
              <div
                className={`flex-1 flex items-center justify-center text-text-muted text-sm border-2 border-dashed rounded-card p-4 transition-colors duration-200 ${
                  isHighlighted
                    ? 'border-primary-500 bg-primary-500/5'
                    : 'border-border'
                }`}
                data-testid={`column-empty-${column.id}`}
              >
                <p>Drop cards here</p>
              </div>
            ) : shouldVirtualize ? (
              // Virtualized rendering for large card lists (when not dragging) - react-window v2
              <List
                defaultHeight={containerHeight}
                rowCount={cards.length}
                rowHeight={CARD_HEIGHT + CARD_GAP}
                rowProps={itemData}
                overscanCount={5}
                rowComponent={VirtualizedCardRow}
              />
            ) : (
              // Non-virtualized rendering for small lists or during drag
              cards.map((card) => (
                <SortableCard
                  key={card.id}
                  card={card}
                  columnId={column.id}
                  onCardClick={onCardClick}
                  onCardDelete={onCardDelete}
                  onCardDuplicate={onCardDuplicate}
                  onCardSaveAsTemplate={onCardSaveAsTemplate}
                />
              ))
            )}
          </SortableContext>
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

export default DroppableColumn;
