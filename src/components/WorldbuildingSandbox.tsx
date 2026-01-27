/**
 * WorldbuildingSandbox Component
 * The main interactive workspace for creating Microsettings using the
 * Deck of Worlds card-tucking mechanic.
 *
 * Layout:
 * - Left: Card Pool Sidebar (searchable card library)
 * - Center: Card Stack canvas with tuck zones
 * - Bottom: Setting Summary (narrative synthesis)
 */
import { useState, useCallback, useMemo } from 'react';
import { useBoardStore } from '@/store';
import { CardStack } from './CardStack';
import { CardPoolSidebar } from './CardPoolSidebar';
import type { SandboxCard, TuckPosition, CreateSandboxCardPayload } from '@/types/sandbox';

export interface WorldbuildingSandboxProps {
  /** Optional callback when sandbox is closed */
  onClose?: () => void;
}

export function WorldbuildingSandbox({ onClose }: WorldbuildingSandboxProps): JSX.Element {
  // Store selectors
  const cardLibrary = useBoardStore((s) => s.cardLibrary);
  const microsettings = useBoardStore((s) => s.microsettings);
  const activeMicrosettingId = useBoardStore((s) => s.activeMicrosettingId);

  // Store actions
  const createSandboxCard = useBoardStore((s) => s.createSandboxCard);
  const deleteSandboxCard = useBoardStore((s) => s.deleteSandboxCard);
  const createMicrosetting = useBoardStore((s) => s.createMicrosetting);
  const deleteMicrosetting = useBoardStore((s) => s.deleteMicrosetting);
  const setActiveMicrosetting = useBoardStore((s) => s.setActiveMicrosetting);
  const setRegionCard = useBoardStore((s) => s.setRegionCard);
  const tuckCard = useBoardStore((s) => s.tuckCard);
  const untuckCard = useBoardStore((s) => s.untuckCard);
  const getMicrosettingSummary = useBoardStore((s) => s.getMicrosettingSummary);

  // Local UI state
  const [pendingTuckPosition, setPendingTuckPosition] = useState<TuckPosition | 'region' | null>(null);
  const [showNewMsForm, setShowNewMsForm] = useState(false);
  const [newMsName, setNewMsName] = useState('');
  const [sidebarFilterCategory, setSidebarFilterCategory] = useState<string | null>(null);

  const activeMicrosetting = activeMicrosettingId ? microsettings[activeMicrosettingId] : null;
  const regionCard = activeMicrosetting?.regionCardId ? cardLibrary[activeMicrosetting.regionCardId] : null;

  const summary = useMemo(
    () => (activeMicrosettingId ? getMicrosettingSummary(activeMicrosettingId) : ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeMicrosettingId, activeMicrosetting?.tuckedCards, activeMicrosetting?.regionCardId, cardLibrary]
  );

  const microsettingList = useMemo(
    () => Object.values(microsettings).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [microsettings]
  );

  const handleCreateMicrosetting = useCallback(() => {
    if (!newMsName.trim()) return;
    createMicrosetting({ name: newMsName.trim() });
    setNewMsName('');
    setShowNewMsForm(false);
  }, [newMsName, createMicrosetting]);

  const handleTuckZoneClick = useCallback((position: TuckPosition) => {
    setPendingTuckPosition(position);
    if (position === 'left' || position === 'right') {
      setSidebarFilterCategory('landmark');
    } else {
      setSidebarFilterCategory(null);
    }
  }, []);

  const handleRegionZoneClick = useCallback(() => {
    setPendingTuckPosition('region');
    setSidebarFilterCategory('region');
  }, []);

  const handleCardSelect = useCallback(
    (card: SandboxCard) => {
      if (!activeMicrosettingId) return;

      if (pendingTuckPosition === 'region') {
        if (card.category === 'region') {
          setRegionCard(activeMicrosettingId, card.id);
        }
        setPendingTuckPosition(null);
        setSidebarFilterCategory(null);
        return;
      }

      if (pendingTuckPosition) {
        const pos = pendingTuckPosition as TuckPosition;
        if ((pos === 'left' || pos === 'right') && card.category !== 'landmark') {
          return;
        }
        tuckCard(activeMicrosettingId, { cardId: card.id, position: pos });
        setPendingTuckPosition(null);
        setSidebarFilterCategory(null);
        return;
      }

      // Auto-assign based on category
      if (card.category === 'region') {
        setRegionCard(activeMicrosettingId, card.id);
      } else if (card.category === 'landmark') {
        tuckCard(activeMicrosettingId, { cardId: card.id, position: 'left' });
      } else {
        tuckCard(activeMicrosettingId, { cardId: card.id, position: 'bottom' });
      }
    },
    [activeMicrosettingId, pendingTuckPosition, setRegionCard, tuckCard]
  );

  const handleCreateCard = useCallback(
    (payload: CreateSandboxCardPayload) => {
      createSandboxCard(payload);
    },
    [createSandboxCard]
  );

  const handleRemoveCard = useCallback(
    (cardId: string) => {
      if (activeMicrosettingId) {
        untuckCard(activeMicrosettingId, cardId);
      }
    },
    [activeMicrosettingId, untuckCard]
  );

  const handleRemoveRegion = useCallback(() => {
    if (activeMicrosettingId) {
      setRegionCard(activeMicrosettingId, null);
    }
  }, [activeMicrosettingId, setRegionCard]);

  return (
    <div className="flex flex-col h-full min-h-[600px]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-text-primary">Worldbuilding Sandbox</h2>
          <div className="flex items-center gap-2">
            <select
              className="input text-sm py-1"
              style={{ width: 'auto', minWidth: 160 }}
              value={activeMicrosettingId ?? ''}
              onChange={(e) => setActiveMicrosetting(e.target.value || null)}
            >
              <option value="">Select microsetting...</option>
              {microsettingList.map((ms) => (
                <option key={ms.id} value={ms.id}>
                  {ms.name}
                </option>
              ))}
            </select>
            {!showNewMsForm ? (
              <button
                className="btn-primary text-xs py-1 px-3"
                onClick={() => setShowNewMsForm(true)}
              >
                + New
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  className="input text-sm py-1"
                  placeholder="Microsetting name..."
                  value={newMsName}
                  onChange={(e) => setNewMsName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateMicrosetting()}
                  autoFocus
                  style={{ width: 160 }}
                />
                <button className="btn-primary text-xs py-1 px-2" onClick={handleCreateMicrosetting}>
                  Create
                </button>
                <button className="btn-ghost text-xs py-1 px-2" onClick={() => setShowNewMsForm(false)}>
                  Cancel
                </button>
              </div>
            )}
            {activeMicrosettingId && (
              <button
                className="btn-ghost text-xs py-1 px-2 text-error-400 hover:text-error-300"
                onClick={() => deleteMicrosetting(activeMicrosettingId)}
                title="Delete this microsetting"
              >
                Delete
              </button>
            )}
          </div>
        </div>
        {onClose && (
          <button className="btn-ghost text-sm" onClick={onClose}>
            Close
          </button>
        )}
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Card Pool Sidebar */}
        <div className="w-72 flex-shrink-0 border-r border-border overflow-hidden">
          <CardPoolSidebar
            cards={cardLibrary}
            filterCategory={sidebarFilterCategory as never}
            onCardSelect={handleCardSelect}
            onCreateCard={handleCreateCard}
            onDeleteCard={deleteSandboxCard}
          />
        </div>

        {/* Canvas workspace */}
        <div className="flex-1 flex flex-col overflow-auto">
          {activeMicrosetting ? (
            <>
              {pendingTuckPosition && (
                <div className="px-4 py-2 bg-primary-500/10 border-b border-primary-500/30 text-primary-300 text-sm text-center">
                  Select a{' '}
                  {pendingTuckPosition === 'region'
                    ? 'Region'
                    : pendingTuckPosition === 'left' || pendingTuckPosition === 'right'
                    ? 'Landmark'
                    : ''}{' '}
                  card from the library to place{' '}
                  {pendingTuckPosition === 'region' ? 'as the base' : `on the ${pendingTuckPosition}`}.
                  <button
                    className="ml-2 text-primary-400 hover:text-primary-300 underline"
                    onClick={() => {
                      setPendingTuckPosition(null);
                      setSidebarFilterCategory(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="flex-1 flex items-center justify-center p-8">
                <CardStack
                  regionCard={regionCard}
                  tuckedCards={activeMicrosetting.tuckedCards}
                  cardLibrary={cardLibrary}
                  onTuckZoneClick={handleTuckZoneClick}
                  onRegionZoneClick={handleRegionZoneClick}
                  onRemoveCard={handleRemoveCard}
                  onRemoveRegion={handleRemoveRegion}
                />
              </div>

              {summary && (
                <div className="px-6 py-4 border-t border-border bg-surface-800/50">
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                    Setting Summary
                  </h4>
                  <p className="text-sm text-text-secondary italic">{summary}</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-text-muted">
                <p className="text-4xl mb-4">🌍</p>
                <h3 className="text-lg font-semibold text-text-secondary mb-2">
                  Worldbuilding Sandbox
                </h3>
                <p className="text-sm mb-4 max-w-md">
                  Create a microsetting by stacking worldbuilding cards. Start by selecting or creating a
                  microsetting above, then place a Region card and tuck other cards around it.
                </p>
                <button
                  className="btn-primary"
                  onClick={() => setShowNewMsForm(true)}
                >
                  Create Your First Microsetting
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
