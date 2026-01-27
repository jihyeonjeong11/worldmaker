/**
 * DraggableLibraryCard Component
 * A card from the sandbox card library that can be dragged onto board columns.
 * Uses dnd-kit's useDraggable hook.
 */
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { WorldbuildingCard } from './WorldbuildingCard';
import type { SandboxCard } from '@/types/sandbox';

interface DraggableLibraryCardProps {
  card: SandboxCard;
}

export function DraggableLibraryCard({ card }: DraggableLibraryCardProps): JSX.Element {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `library-${card.id}`,
    data: {
      type: 'sandbox-card',
      sandboxCard: card,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-testid={`draggable-library-card-${card.id}`}
    >
      <WorldbuildingCard card={card} compact />
      {!isDragging && (
        <p className="text-[10px] text-text-muted mt-0.5 text-center opacity-60">
          Drag to a column
        </p>
      )}
    </div>
  );
}
