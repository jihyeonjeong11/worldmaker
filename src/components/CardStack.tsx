/**
 * CardStack Component
 * Renders the visual tucked-card stack for a microsetting.
 * - Region card is the central element
 * - Bottom-tucked cards show only their cue strips stacked below
 * - Left/right landmarks show as vertical side-tucked strips
 */
import { useMemo } from 'react';
import { WorldbuildingCard } from './WorldbuildingCard';
import type { SandboxCard, TuckedCard, TuckPosition } from '@/types/sandbox';

export interface CardStackProps {
  /** The region card (base of the stack) */
  regionCard: SandboxCard | null;
  /** All tucked cards with metadata */
  tuckedCards: TuckedCard[];
  /** Card library lookup */
  cardLibrary: Record<string, SandboxCard>;
  /** Called when a tuck zone is clicked to add a card */
  onTuckZoneClick?: (position: TuckPosition) => void;
  /** Called when removing a card */
  onRemoveCard?: (cardId: string) => void;
  /** Called when removing the region card */
  onRemoveRegion?: () => void;
  /** Called when region zone is clicked */
  onRegionZoneClick?: () => void;
}

export function CardStack({
  regionCard,
  tuckedCards,
  cardLibrary,
  onTuckZoneClick,
  onRemoveCard,
  onRemoveRegion,
  onRegionZoneClick,
}: CardStackProps): JSX.Element {
  const leftCards = useMemo(
    () =>
      tuckedCards
        .filter((tc) => tc.position === 'left')
        .sort((a, b) => a.order - b.order)
        .map((tc) => ({ ...tc, card: cardLibrary[tc.cardId] }))
        .filter((tc) => tc.card),
    [tuckedCards, cardLibrary]
  );

  const rightCards = useMemo(
    () =>
      tuckedCards
        .filter((tc) => tc.position === 'right')
        .sort((a, b) => a.order - b.order)
        .map((tc) => ({ ...tc, card: cardLibrary[tc.cardId] }))
        .filter((tc) => tc.card),
    [tuckedCards, cardLibrary]
  );

  const bottomCards = useMemo(
    () =>
      tuckedCards
        .filter((tc) => tc.position === 'bottom')
        .sort((a, b) => a.order - b.order)
        .map((tc) => ({ ...tc, card: cardLibrary[tc.cardId] }))
        .filter((tc) => tc.card),
    [tuckedCards, cardLibrary]
  );

  const tuckZoneStyle =
    'flex items-center justify-center border-2 border-dashed border-surface-600 rounded-lg text-text-muted text-sm hover:border-primary-400 hover:text-primary-400 hover:bg-primary-500/5 transition-all duration-200 cursor-pointer';

  return (
    <div className="flex items-start justify-center gap-1">
      {/* Left tuck zone / landmarks */}
      <div className="flex flex-col items-center gap-1 mt-2" style={{ minWidth: 56 }}>
        {leftCards.map((tc) => (
          <WorldbuildingCard
            key={tc.cardId}
            card={tc.card}
            sideTucked
            sideTuckSide="left"
            onRemove={onRemoveCard ? () => onRemoveCard(tc.cardId) : undefined}
          />
        ))}
        <button
          className={tuckZoneStyle}
          style={{ width: 48, minHeight: 60, writingMode: 'vertical-rl' }}
          onClick={() => onTuckZoneClick?.('left')}
          title="Tuck a Landmark card on the left"
        >
          + Left
        </button>
      </div>

      {/* Center column: Region + bottom tucks */}
      <div className="flex flex-col items-center" style={{ width: 320 }}>
        {/* Region card or empty zone */}
        {regionCard ? (
          <WorldbuildingCard
            card={regionCard}
            onRemove={onRemoveRegion}
          />
        ) : (
          <button
            className={tuckZoneStyle}
            style={{ width: '100%', minHeight: 180 }}
            onClick={onRegionZoneClick}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">🏔️</span>
              <span>Place a Region Card</span>
            </div>
          </button>
        )}

        {/* Bottom tucked cards — only cue strips visible */}
        {bottomCards.map((tc) => (
          <WorldbuildingCard
            key={tc.cardId}
            card={tc.card}
            cueOnly
            onRemove={onRemoveCard ? () => onRemoveCard(tc.cardId) : undefined}
          />
        ))}

        {/* Bottom tuck zone */}
        <button
          className={`${tuckZoneStyle} mt-1`}
          style={{ width: '100%', minHeight: 44 }}
          onClick={() => onTuckZoneClick?.('bottom')}
          title="Tuck a card below (Namesake, Origin, Attribute, or Advent)"
        >
          + Tuck Below
        </button>
      </div>

      {/* Right tuck zone / landmarks */}
      <div className="flex flex-col items-center gap-1 mt-2" style={{ minWidth: 56 }}>
        {rightCards.map((tc) => (
          <WorldbuildingCard
            key={tc.cardId}
            card={tc.card}
            sideTucked
            sideTuckSide="right"
            onRemove={onRemoveCard ? () => onRemoveCard(tc.cardId) : undefined}
          />
        ))}
        <button
          className={tuckZoneStyle}
          style={{ width: 48, minHeight: 60, writingMode: 'vertical-rl' }}
          onClick={() => onTuckZoneClick?.('right')}
          title="Tuck a Landmark card on the right"
        >
          + Right
        </button>
      </div>
    </div>
  );
}
