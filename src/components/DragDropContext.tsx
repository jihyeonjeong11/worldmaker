/**
 * DragDropContext Component
 *
 * Provides the dnd-kit context and configuration for the Kanban board.
 * Wraps the board with DndContext and provides sensors and collision detection.
 */
import { useMemo, type ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  MeasuringStrategy,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import type { Card } from '@/types';
import type { SandboxCard } from '@/types/sandbox';

interface DragDropProviderProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Callback when drag starts */
  onDragStart?: (event: DragStartEvent) => void;
  /** Callback when drag is over an element */
  onDragOver?: (event: DragOverEvent) => void;
  /** Callback when drag ends */
  onDragEnd: (event: DragEndEvent) => void;
  /** Callback when drag is cancelled */
  onDragCancel?: () => void;
  /** Currently active drag item ID */
  activeId: UniqueIdentifier | null;
  /** Card data for overlay rendering */
  cards: Card[];
  /** Currently dragged sandbox card (from library) */
  activeSandboxCard?: SandboxCard | null;
}

/**
 * DragDropProvider - Configures dnd-kit context for Kanban board
 */
export function DragDropProvider({
  children,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragCancel,
  activeId,
  cards,
  activeSandboxCard,
}: DragDropProviderProps): JSX.Element {
  // Configure sensors for mouse/touch and keyboard interaction
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require slight movement before drag starts to allow clicking
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Measuring configuration for accurate positioning
  const measuring = useMemo(
    () => ({
      droppable: {
        strategy: MeasuringStrategy.Always,
      },
    }),
    []
  );

  // Find the active card for the overlay
  const activeCard = useMemo(() => {
    if (!activeId) return null;
    return cards.find((card) => card.id === activeId) ?? null;
  }, [activeId, cards]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={measuring}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      {children}

      {/* Drag Overlay - Shows a preview of the dragged card */}
      <DragOverlay
        dropAnimation={{
          duration: 250,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}
      >
        {activeCard ? (
          <DragOverlayCard card={activeCard} />
        ) : activeSandboxCard ? (
          <SandboxCardOverlay card={activeSandboxCard} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

/**
 * Priority badge colors for visual distinction
 */
const PRIORITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#3b82f6',
  high: '#f59e0b',
  critical: '#ef4444',
};

/**
 * DragOverlayCard - Renders the card preview during drag
 */
function DragOverlayCard({ card }: { card: Card }): JSX.Element {
  return (
    <div
      className="story-card p-3 rounded-card shadow-lg ring-2 ring-primary-500 opacity-95 cursor-grabbing"
      style={{
        width: '252px', // Match the column width minus padding
        transform: 'rotate(3deg)',
      }}
    >
      {/* Card header with title and priority */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="font-medium text-text-primary text-sm line-clamp-2 flex-1">
          {card.title}
        </h4>
        <span
          className="px-1.5 py-0.5 rounded text-xs text-white capitalize flex-shrink-0"
          style={{
            backgroundColor:
              PRIORITY_COLORS[card.priority] || PRIORITY_COLORS.medium,
          }}
        >
          {card.priority}
        </span>
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

/**
 * SandboxCardOverlay - Renders a sandbox card preview during drag from library
 */
function SandboxCardOverlay({ card }: { card: SandboxCard }): JSX.Element {
  return (
    <div
      className="p-3 rounded-card shadow-lg ring-2 ring-purple-500 opacity-95 cursor-grabbing"
      style={{
        width: '252px',
        transform: 'rotate(3deg)',
        backgroundColor: '#1e1b2e',
        border: '1px solid #8b5cf6',
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="font-medium text-white text-sm line-clamp-2 flex-1">
          {card.title}
        </h4>
        <span
          className="px-1.5 py-0.5 rounded text-xs text-white capitalize flex-shrink-0"
          style={{ backgroundColor: '#8b5cf6' }}
        >
          {card.category}
        </span>
      </div>
      {card.cue && (
        <p className="text-gray-300 text-xs line-clamp-2">{card.cue}</p>
      )}
    </div>
  );
}

export default DragDropProvider;
