/**
 * KanbanCard Component
 *
 * Renders a single card in the Kanban board.
 * Prepared for drag-and-drop functionality.
 */
import type { Card } from '@/types';
import { WORLDBUILDING_CARD_TYPES } from '@/types';

interface KanbanCardProps {
  /** The card data */
  card: Card;
  /** Whether the card is currently being dragged */
  isDragging?: boolean;
  /** Callback when card is clicked */
  onClick?: () => void;
}


/**
 * KanbanCard - A single card in the Kanban board
 */
export function KanbanCard({
  card,
  isDragging = false,
  onClick,
}: KanbanCardProps): JSX.Element {
  return (
    <div
      className={`story-card p-3 rounded-card animate-fade-in ${
        isDragging ? 'dragging' : ''
      }`}
      data-testid={`kanban-card-${card.id}`}
      data-card-id={card.id}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-text-primary text-sm line-clamp-2 flex-1">
          {card.title}
        </h4>
      </div>

      {/* Worldbuilding Type Badge */}
      {card.worldbuilding && (() => {
        const meta = WORLDBUILDING_CARD_TYPES.find((m) => m.type === card.worldbuilding!.cardType);
        return meta ? (
          <div className="mb-2">
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
                      <span className="text-text-muted italic ml-1">— {cue.suggestion}</span>
                    )}
                  </div>
                ))}
                {card.worldbuilding!.cues.length > 2 && (
                  <span className="text-xs text-text-muted">+{card.worldbuilding!.cues.length - 2} more cues</span>
                )}
              </div>
            )}
          </div>
        ) : null;
      })()}

      {/* Card Description */}
      {card.description && (
        <p className="text-text-muted text-xs line-clamp-2 mb-2">
          {card.description}
        </p>
      )}

      {/* Card Tags */}
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="badge badge-primary text-xs py-0"
            >
              {tag}
            </span>
          ))}
          {card.tags.length > 3 && (
            <span className="text-text-muted text-xs">
              +{card.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default KanbanCard;
