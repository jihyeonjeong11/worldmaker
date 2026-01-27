/**
 * WorldbuildingCard Component
 * Atomic card unit for the Worldbuilding Sandbox.
 * Displays a card with category color theme, title, and cue strip.
 */
import { useMemo } from 'react';
import type { SandboxCard, CardColorTheme } from '@/types/sandbox';
import { CARD_COLOR_THEMES } from '@/types/sandbox';
import { WORLDBUILDING_CARD_TYPES } from '@/types';

export interface WorldbuildingCardProps {
  card: SandboxCard;
  /** Show only the cue strip (for tucked cards) */
  cueOnly?: boolean;
  /** Show as a vertical side-tucked landmark (rotated text) */
  sideTucked?: boolean;
  /** Side tuck direction */
  sideTuckSide?: 'left' | 'right';
  /** Whether the card is draggable from the pool */
  isDragging?: boolean;
  /** Whether the card is a drop target */
  isDropTarget?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Remove handler */
  onRemove?: () => void;
  /** Compact display for sidebar */
  compact?: boolean;
}

export function WorldbuildingCard({
  card,
  cueOnly = false,
  sideTucked = false,
  sideTuckSide = 'left',
  isDragging = false,
  isDropTarget = false,
  onClick,
  onRemove,
  compact = false,
}: WorldbuildingCardProps): JSX.Element {
  const theme: CardColorTheme = useMemo(
    () => card.colorTheme ?? CARD_COLOR_THEMES[card.category],
    [card.colorTheme, card.category]
  );

  const meta = useMemo(
    () => WORLDBUILDING_CARD_TYPES.find((t) => t.type === card.category),
    [card.category]
  );

  // Side-tucked landmark card (vertical text showing along left/right edge)
  if (sideTucked) {
    return (
      <div
        className={`
          relative flex items-center justify-center cursor-pointer
          transition-all duration-200 rounded-lg
          ${isDropTarget ? 'ring-2 ring-primary-400 ring-offset-2 ring-offset-background' : ''}
          ${isDragging ? 'opacity-50' : ''}
        `}
        style={{
          width: 48,
          minHeight: 180,
          backgroundColor: theme.bg,
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          transform: sideTuckSide === 'left' ? 'rotate(180deg)' : undefined,
        }}
        onClick={onClick}
        title={`${card.title}: ${card.cue}`}
      >
        {onRemove && (
          <button
            className="absolute top-1 text-white/60 hover:text-white z-10"
            style={{
              writingMode: 'horizontal-tb',
              transform: sideTuckSide === 'left' ? 'rotate(180deg)' : undefined,
              right: sideTuckSide === 'left' ? undefined : 4,
              left: sideTuckSide === 'left' ? 4 : undefined,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label="Remove card"
          >
            ✕
          </button>
        )}
        <span
          className="text-xs font-bold uppercase tracking-wider px-2 py-3"
          style={{ color: theme.text }}
        >
          {card.cue || card.title}
        </span>
      </div>
    );
  }

  // Cue-only strip (for bottom-tucked cards — only the cue strip shows)
  if (cueOnly) {
    return (
      <div
        className={`
          relative flex items-center justify-center text-center
          rounded-b-xl transition-all duration-200 cursor-pointer group
          ${isDropTarget ? 'ring-2 ring-primary-400' : ''}
          ${isDragging ? 'opacity-50' : ''}
        `}
        style={{
          backgroundColor: theme.cueBg,
          color: theme.cueText,
          padding: '10px 16px',
          minHeight: 44,
          width: '100%',
        }}
        onClick={onClick}
        title={`${meta?.icon} ${card.title}: ${card.cue}`}
      >
        {onRemove && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label="Remove card"
          >
            ✕
          </button>
        )}
        <span className="text-sm font-semibold uppercase tracking-wide">
          {card.cue || card.title}
        </span>
      </div>
    );
  }

  // Compact display for sidebar
  if (compact) {
    return (
      <div
        className={`
          flex items-center gap-2 p-2 rounded-lg cursor-grab transition-all duration-200
          hover:brightness-110 active:cursor-grabbing
          ${isDragging ? 'opacity-50 scale-105 shadow-lg' : ''}
          ${isDropTarget ? 'ring-2 ring-primary-400' : ''}
        `}
        style={{ backgroundColor: theme.bg, color: theme.text }}
        onClick={onClick}
        draggable
      >
        <span className="text-base">{meta?.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold truncate">{card.title}</div>
          <div className="text-xs opacity-75 truncate">{card.cue}</div>
        </div>
      </div>
    );
  }

  // Full card display (Region card or card pool preview)
  return (
    <div
      className={`
        relative rounded-xl overflow-hidden transition-all duration-200
        ${isDragging ? 'opacity-50 scale-105 shadow-lg' : 'shadow-md'}
        ${isDropTarget ? 'ring-2 ring-primary-400 ring-offset-2 ring-offset-background' : ''}
        ${onClick ? 'cursor-pointer hover:shadow-lg hover:brightness-105' : ''}
      `}
      style={{ backgroundColor: theme.bg, color: theme.text, width: '100%', maxWidth: 320 }}
      onClick={onClick}
    >
      {onRemove && (
        <button
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white flex items-center justify-center text-xs z-10 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove card"
        >
          ✕
        </button>
      )}
      {/* Card header with category badge */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-2">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider"
          style={{ backgroundColor: theme.accent, color: theme.text }}
        >
          {meta?.icon} {meta?.label}
        </span>
      </div>
      {/* Title area */}
      <div className="px-4 pb-3">
        <h3 className="text-xl font-bold uppercase tracking-wider">{card.title}</h3>
      </div>
      {/* Cue strip at the bottom */}
      <div
        className="px-4 py-3 text-center"
        style={{ backgroundColor: theme.cueBg, color: theme.cueText }}
      >
        <span className="text-sm font-semibold uppercase tracking-wide">{card.cue}</span>
      </div>
    </div>
  );
}
