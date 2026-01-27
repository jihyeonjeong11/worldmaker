/**
 * SandboxCardLibraryPanel Component
 * Displays the sandbox card library within the Board tab,
 * allowing users to import worldbuilding cards created in the Sandbox
 * as regular board cards into a selected column.
 */
import { useState, useMemo, useCallback } from 'react';
import { useBoardStore } from '@/store';
import { DraggableLibraryCard } from './DraggableLibraryCard';
import { WORLDBUILDING_CARD_TYPES, type WorldbuildingCardType } from '@/types';

export interface SandboxCardLibraryPanelProps {
  /** Called when panel is closed */
  onClose: () => void;
}

export function SandboxCardLibraryPanel({ onClose }: SandboxCardLibraryPanelProps): JSX.Element {
  const cardLibrary = useBoardStore((s) => s.cardLibrary);
  const activeProjectId = useBoardStore((s) => s.activeProjectId);
  const createCard = useBoardStore((s) => s.createCard);
  const microsettings = useBoardStore((s) => s.microsettings);
  const createColumn = useBoardStore((s) => s.createColumn);

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<WorldbuildingCardType | null>(null);
  const [importMode, setImportMode] = useState<'cards' | 'microsetting'>('cards');

  // Filter cards
  const filteredCards = useMemo(() => {
    let list = Object.values(cardLibrary);
    if (activeFilter) {
      list = list.filter((c) => c.category === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) || c.cue.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => a.title.localeCompare(b.title));
  }, [cardLibrary, activeFilter, search]);

  const microsettingList = useMemo(
    () => Object.values(microsettings).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [microsettings]
  );

  const cardCount = Object.keys(cardLibrary).length;

  // Import an entire microsetting as a new column with cards
  const handleImportMicrosetting = useCallback(
    (microsettingId: string) => {
      if (!activeProjectId) return;

      const ms = microsettings[microsettingId];
      if (!ms) return;

      // Create a new column for the microsetting
      const columnId = createColumn({
        projectId: activeProjectId,
        title: ms.name,
        color: '#8b5cf6',
      });

      // Import region card
      if (ms.regionCardId) {
        const regionCard = cardLibrary[ms.regionCardId];
        if (regionCard) {
          createCard({
            projectId: activeProjectId,
            columnId,
            title: `${regionCard.title}`,
            description: regionCard.cue,
            priority: 'high',
            tags: ['worldbuilding', 'region'],
            worldbuilding: {
              cardType: 'region',
              cues: [{ text: regionCard.cue }],
            },
          });
        }
      }

      // Import tucked cards
      for (const tucked of ms.tuckedCards) {
        const card = cardLibrary[tucked.cardId];
        if (card) {
          createCard({
            projectId: activeProjectId,
            columnId,
            title: card.title,
            description: card.cue,
            priority: 'medium',
            tags: ['worldbuilding', card.category],
            worldbuilding: {
              cardType: card.category,
              cues: [{ text: card.cue }],
            },
          });
        }
      }
    },
    [activeProjectId, microsettings, cardLibrary, createColumn, createCard]
  );

  return (
    <div
      className="fixed inset-y-0 right-0 w-80 bg-surface-900 border-l border-border shadow-xl z-50 flex flex-col"
      data-testid="sandbox-card-library-panel"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-text-primary">
            Sandbox Card Library
          </h3>
          <button
            className="w-6 h-6 rounded-full bg-surface-700 hover:bg-surface-600 text-text-muted text-xs flex items-center justify-center"
            onClick={onClose}
            data-testid="close-sandbox-library-btn"
          >
            ✕
          </button>
        </div>

        {/* Import mode toggle */}
        <div className="flex gap-1 mb-3">
          <button
            className={`text-xs px-3 py-1.5 rounded transition-colors flex-1 ${
              importMode === 'cards'
                ? 'bg-primary-500 text-white'
                : 'bg-surface-700 text-text-muted hover:bg-surface-600'
            }`}
            onClick={() => setImportMode('cards')}
          >
            Cards ({cardCount})
          </button>
          <button
            className={`text-xs px-3 py-1.5 rounded transition-colors flex-1 ${
              importMode === 'microsetting'
                ? 'bg-primary-500 text-white'
                : 'bg-surface-700 text-text-muted hover:bg-surface-600'
            }`}
            onClick={() => setImportMode('microsetting')}
          >
            Microsettings ({microsettingList.length})
          </button>
        </div>

        {cardCount === 0 && importMode === 'cards' && (
          <p className="text-xs text-text-muted">
            No cards in the library yet. Create cards in the Sandbox tab first.
          </p>
        )}
      </div>

      {importMode === 'cards' ? (
        <>
          {/* Search and filter */}
          {cardCount > 0 && (
            <div className="px-4 py-2 border-b border-border">
              <input
                type="text"
                className="input text-sm w-full mb-2"
                placeholder="Search cards..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="flex flex-wrap gap-1">
                <button
                  className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                    activeFilter === null
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface-700 text-text-muted hover:bg-surface-600'
                  }`}
                  onClick={() => setActiveFilter(null)}
                >
                  All
                </button>
                {WORLDBUILDING_CARD_TYPES.map((t) => (
                  <button
                    key={t.type}
                    className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                      activeFilter === t.type
                        ? 'text-white'
                        : 'bg-surface-700 text-text-muted hover:bg-surface-600'
                    }`}
                    style={activeFilter === t.type ? { backgroundColor: t.color } : undefined}
                    onClick={() => setActiveFilter(activeFilter === t.type ? null : t.type)}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Card list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredCards.length === 0 && cardCount > 0 && (
              <div className="text-center text-text-muted text-sm py-8">
                No cards match your search.
              </div>
            )}
            {filteredCards.map((card) => (
              <DraggableLibraryCard key={card.id} card={card} />
            ))}
          </div>
        </>
      ) : (
        /* Microsettings list */
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {microsettingList.length === 0 && (
            <div className="text-center text-text-muted text-sm py-8">
              No microsettings yet. Create them in the Sandbox tab.
            </div>
          )}
          {microsettingList.map((ms) => {
            const regionCard = ms.regionCardId ? cardLibrary[ms.regionCardId] : null;
            const tuckedCount = ms.tuckedCards.length;
            return (
              <div
                key={ms.id}
                className="p-3 bg-surface-800 rounded-lg border border-border"
              >
                <h4 className="text-sm font-semibold text-text-primary mb-1">{ms.name}</h4>
                <div className="text-xs text-text-muted space-y-0.5 mb-2">
                  {regionCard && (
                    <p>
                      <span className="text-text-secondary">Region:</span> {regionCard.title}
                    </p>
                  )}
                  <p>
                    <span className="text-text-secondary">Cards:</span>{' '}
                    {tuckedCount + (regionCard ? 1 : 0)} total
                  </p>
                </div>
                <button
                  className="w-full text-xs py-1.5 rounded bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                  onClick={() => handleImportMicrosetting(ms.id)}
                  data-testid={`import-microsetting-${ms.id}`}
                >
                  Import as New Column
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
