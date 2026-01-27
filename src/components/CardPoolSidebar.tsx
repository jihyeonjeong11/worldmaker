/**
 * CardPoolSidebar Component
 * Searchable library of all sandbox cards, categorized by type.
 * Includes inline card creation form.
 */
import { useState, useMemo, useCallback } from 'react';
import { WorldbuildingCard } from './WorldbuildingCard';
import type { SandboxCard, CreateSandboxCardPayload } from '@/types/sandbox';
import { WORLDBUILDING_CARD_TYPES, type WorldbuildingCardType } from '@/types';

export interface CardPoolSidebarProps {
  /** All cards in the library */
  cards: Record<string, SandboxCard>;
  /** Currently active category filter */
  filterCategory?: WorldbuildingCardType | null;
  /** Called when user wants to add a card to a tuck zone */
  onCardSelect?: (card: SandboxCard) => void;
  /** Called to create a new card */
  onCreateCard?: (payload: CreateSandboxCardPayload) => void;
  /** Called to delete a card from the library */
  onDeleteCard?: (id: string) => void;
}

export function CardPoolSidebar({
  cards,
  filterCategory = null,
  onCardSelect,
  onCreateCard,
  onDeleteCard,
}: CardPoolSidebarProps): JSX.Element {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<WorldbuildingCardType | null>(filterCategory);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCategory, setNewCategory] = useState<WorldbuildingCardType>('region');
  const [newTitle, setNewTitle] = useState('');
  const [newCue, setNewCue] = useState('');

  const filteredCards = useMemo(() => {
    let list = Object.values(cards);
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
  }, [cards, activeFilter, search]);

  const handleCreate = useCallback(() => {
    if (!newTitle.trim() || !newCue.trim()) return;
    onCreateCard?.({
      category: newCategory,
      title: newTitle.trim(),
      cue: newCue.trim(),
    });
    setNewTitle('');
    setNewCue('');
    setShowCreateForm(false);
  }, [newCategory, newTitle, newCue, onCreateCard]);

  return (
    <div className="flex flex-col h-full bg-surface-800/80 rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <h3 className="text-sm font-bold text-text-primary mb-2">Card Library</h3>
        {/* Search */}
        <input
          type="text"
          className="input text-sm"
          placeholder="Search cards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* Category filters */}
        <div className="flex flex-wrap gap-1 mt-2">
          <button
            className={`text-xs px-2 py-1 rounded-full transition-colors ${
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
              className={`text-xs px-2 py-1 rounded-full transition-colors ${
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

      {/* Card list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredCards.length === 0 && (
          <div className="text-center text-text-muted text-sm py-8">
            {Object.keys(cards).length === 0
              ? 'No cards yet. Create your first card!'
              : 'No cards match your search.'}
          </div>
        )}
        {filteredCards.map((card) => (
          <div key={card.id} className="group relative">
            <WorldbuildingCard
              card={card}
              compact
              onClick={() => onCardSelect?.(card)}
            />
            {onDeleteCard && (
              <button
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-error-500/80 hover:bg-error-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCard(card.id);
                }}
                title="Delete from library"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Create card form */}
      <div className="border-t border-border p-3">
        {showCreateForm ? (
          <div className="space-y-2">
            <select
              className="input text-sm"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as WorldbuildingCardType)}
            >
              {WORLDBUILDING_CARD_TYPES.map((t) => (
                <option key={t.type} value={t.type}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              className="input text-sm"
              placeholder="Card title (e.g., Swamp)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <input
              type="text"
              className="input text-sm"
              placeholder="Cue (e.g., Where no bird sings)"
              value={newCue}
              onChange={(e) => setNewCue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <div className="flex gap-2">
              <button className="btn-primary text-xs flex-1 py-1.5" onClick={handleCreate}>
                Add to Library
              </button>
              <button
                className="btn-ghost text-xs py-1.5"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn-secondary w-full text-sm"
            onClick={() => setShowCreateForm(true)}
          >
            + New Card
          </button>
        )}
      </div>
    </div>
  );
}
