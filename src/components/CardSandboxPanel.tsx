/**
 * CardSandboxPanel Component
 *
 * An overlay panel integrated into the board tab that provides a sandbox
 * environment for testing/previewing/experimenting with cards in isolation.
 *
 * Features:
 * - Visual sandbox mode indicator (distinct from main board)
 * - Create, edit, delete draft cards
 * - Clone existing board cards into sandbox
 * - Commit changes to main board or discard all
 * - Conflict detection when main board changes during sandbox session
 */
import { useState, useCallback, useMemo } from 'react';
import { useBoardStore } from '@/store';
import type { Card, ColumnId, CardPriority } from '@/types';
import type { SandboxDraftCard } from '@/store/slices/cardSandboxSlice';

export interface CardSandboxPanelProps {
  /** Callback when sandbox is exited */
  onExit?: () => void;
}

/**
 * Inline card editor for sandbox drafts
 */
function SandboxCardEditor({
  draft,
  onUpdate,
  onDelete,
}: {
  draft: SandboxDraftCard;
  onUpdate: (id: string, updates: { title?: string; description?: string; priority?: CardPriority; tags?: string[] }) => void;
  onDelete: (id: string) => void;
}): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(draft.title);
  const [editDescription, setEditDescription] = useState(draft.description);
  const [editPriority, setEditPriority] = useState(draft.priority);

  const handleSave = () => {
    onUpdate(draft.id, {
      title: editTitle,
      description: editDescription,
      priority: editPriority,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(draft.title);
    setEditDescription(draft.description);
    setEditPriority(draft.priority);
    setIsEditing(false);
  };

  const priorityColors: Record<CardPriority, string> = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444',
  };

  return (
    <div
      className="rounded-lg border-2 p-3 mb-2 transition-all"
      style={{
        borderColor: draft.isNew ? '#22c55e' : draft.isDirty ? '#f59e0b' : '#374151',
        backgroundColor: draft.isNew ? 'rgba(34, 197, 94, 0.05)' : draft.isDirty ? 'rgba(245, 158, 11, 0.05)' : 'rgba(255,255,255,0.03)',
      }}
    >
      {/* Status badges */}
      <div className="flex items-center gap-1 mb-2">
        {draft.isNew && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">
            New
          </span>
        )}
        {!draft.isNew && draft.isDirty && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-medium">
            Modified
          </span>
        )}
        {!draft.isNew && !draft.isDirty && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 font-medium">
            Cloned
          </span>
        )}
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{
            backgroundColor: `${priorityColors[draft.priority]}20`,
            color: priorityColors[draft.priority],
          }}
        >
          {draft.priority}
        </span>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            className="input text-sm w-full"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Card title..."
            autoFocus
          />
          <textarea
            className="input text-sm w-full"
            rows={3}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description..."
          />
          <select
            className="input text-sm py-1"
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value as CardPriority)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <div className="flex gap-2">
            <button className="btn-primary text-xs py-1 px-3" onClick={handleSave}>Save</button>
            <button className="btn-ghost text-xs py-1 px-3" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      ) : (
        <div>
          <h4
            className="text-sm font-semibold text-text-primary cursor-pointer hover:text-primary-400"
            onClick={() => setIsEditing(true)}
            title="Click to edit"
          >
            {draft.title}
          </h4>
          {draft.description && (
            <p className="text-xs text-text-muted mt-1 line-clamp-2">{draft.description}</p>
          )}
          {draft.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {draft.tags.map((tag) => (
                <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-surface-700 text-text-muted">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-1 mt-2">
            <button
              className="text-xs text-primary-400 hover:text-primary-300"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
            <span className="text-text-muted text-xs">·</span>
            <button
              className="text-xs text-error-400 hover:text-error-300"
              onClick={() => onDelete(draft.id)}
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * New card form within sandbox
 */
function SandboxNewCardForm({
  columnId,
  onCreate,
  onCancel,
}: {
  columnId: ColumnId;
  onCreate: (columnId: ColumnId, title: string, description: string, priority: CardPriority) => void;
  onCancel: () => void;
}): JSX.Element {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<CardPriority>('medium');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onCreate(columnId, title.trim(), description, priority);
    setTitle('');
    setDescription('');
    setPriority('medium');
  };

  return (
    <div className="border-2 border-dashed border-green-500/50 rounded-lg p-3 mb-2 bg-green-500/5">
      <h5 className="text-xs font-semibold text-green-400 mb-2">New Sandbox Card</h5>
      <input
        type="text"
        className="input text-sm w-full mb-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Card title..."
        autoFocus
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
      />
      <textarea
        className="input text-sm w-full mb-2"
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)..."
      />
      <select
        className="input text-sm py-1 mb-2"
        value={priority}
        onChange={(e) => setPriority(e.target.value as CardPriority)}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>
      <div className="flex gap-2">
        <button className="btn-primary text-xs py-1 px-3" onClick={handleSubmit}>Add Card</button>
        <button className="btn-ghost text-xs py-1 px-3" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

/**
 * Main Card Sandbox Panel
 */
export function CardSandboxPanel({ onExit }: CardSandboxPanelProps): JSX.Element {
  const [activeNewCardColumn, setActiveNewCardColumn] = useState<ColumnId | null>(null);
  const [showCommitConfirm, setShowCommitConfirm] = useState(false);
  const [commitResult, setCommitResult] = useState<{ created: number; updated: number; deleted: number; conflicts: string[] } | null>(null);

  // Store state
  const sandboxDrafts = useBoardStore((s) => s.sandboxDrafts);
  const sandboxDeletions = useBoardStore((s) => s.sandboxDeletions);
  const activeProjectId = useBoardStore((s) => s.activeProjectId);
  const projects = useBoardStore((s) => s.projects);
  const columnsStore = useBoardStore((s) => s.columns);
  const cardsStore = useBoardStore((s) => s.cards);

  // Store actions
  const cloneCardToSandbox = useBoardStore((s) => s.cloneCardToSandbox);
  const createSandboxDraft = useBoardStore((s) => s.createSandboxDraft);
  const updateSandboxDraft = useBoardStore((s) => s.updateSandboxDraft);
  const deleteSandboxDraft = useBoardStore((s) => s.deleteSandboxDraft);
  const markForDeletion = useBoardStore((s) => s.markForDeletion);
  const unmarkForDeletion = useBoardStore((s) => s.unmarkForDeletion);
  const commitSandboxChanges = useBoardStore((s) => s.commitSandboxChanges);
  const exitCardSandbox = useBoardStore((s) => s.exitCardSandbox);
  const getSandboxStats = useBoardStore((s) => s.getSandboxStats);
  const detectConflicts = useBoardStore((s) => s.detectConflicts);

  const activeProject = activeProjectId ? projects[activeProjectId] : null;

  // Get columns for this project
  const columns = useMemo(() => {
    if (!activeProjectId) return [];
    return Object.values(columnsStore)
      .filter((c) => c.projectId === activeProjectId)
      .sort((a, b) => a.position - b.position);
  }, [activeProjectId, columnsStore]);

  // Get main board cards by column
  const mainCardsByColumn = useMemo(() => {
    if (!activeProjectId) return {} as Record<string, Card[]>;
    const result: Record<string, Card[]> = {};
    Object.values(cardsStore)
      .filter((c) => c.projectId === activeProjectId)
      .sort((a, b) => a.position - b.position)
      .forEach((card) => {
        if (!result[card.columnId]) result[card.columnId] = [];
        result[card.columnId].push(card);
      });
    return result;
  }, [activeProjectId, cardsStore]);

  // Get sandbox drafts by column
  const draftsByColumn = useMemo(() => {
    const result: Record<string, SandboxDraftCard[]> = {};
    Object.values(sandboxDrafts)
      .sort((a, b) => a.position - b.position)
      .forEach((draft) => {
        if (!result[draft.columnId]) result[draft.columnId] = [];
        result[draft.columnId].push(draft);
      });
    return result;
  }, [sandboxDrafts]);

  // IDs already cloned
  const clonedOriginalIds = useMemo(() => {
    return new Set(
      Object.values(sandboxDrafts)
        .filter((d) => d.originalCardId)
        .map((d) => d.originalCardId!)
    );
  }, [sandboxDrafts]);

  const stats = getSandboxStats();
  const conflicts = detectConflicts();

  const handleCreateCard = useCallback(
    (columnId: ColumnId, title: string, description: string, priority: CardPriority) => {
      createSandboxDraft({ columnId, title, description, priority });
      setActiveNewCardColumn(null);
    },
    [createSandboxDraft]
  );

  const handleUpdateDraft = useCallback(
    (id: string, updates: { title?: string; description?: string; priority?: CardPriority; tags?: string[] }) => {
      updateSandboxDraft({ id, ...updates });
    },
    [updateSandboxDraft]
  );

  const handleCommit = useCallback(() => {
    const result = commitSandboxChanges();
    setCommitResult(result);
    setShowCommitConfirm(false);
    // Auto-close after showing result
    setTimeout(() => {
      setCommitResult(null);
      onExit?.();
    }, 3000);
  }, [commitSandboxChanges, onExit]);

  const handleDiscard = useCallback(() => {
    exitCardSandbox();
    onExit?.();
  }, [exitCardSandbox, onExit]);

  // Commit result overlay
  if (commitResult) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-8 rounded-xl border-2 border-green-500/30 bg-green-500/5 max-w-md">
          <p className="text-3xl mb-3">&#10003;</p>
          <h3 className="text-lg font-bold text-green-400 mb-3">Changes Committed!</h3>
          <div className="text-sm text-text-secondary space-y-1">
            {commitResult.created > 0 && <p>{commitResult.created} card(s) created</p>}
            {commitResult.updated > 0 && <p>{commitResult.updated} card(s) updated</p>}
            {commitResult.deleted > 0 && <p>{commitResult.deleted} card(s) deleted</p>}
            {commitResult.conflicts.length > 0 && (
              <p className="text-yellow-400">{commitResult.conflicts.length} conflict(s) skipped</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Sandbox Header - distinct visual indicator */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b-2"
        style={{
          borderColor: '#f59e0b',
          background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, transparent 100%)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: '#f59e0b' }}
            />
            <h2 className="text-lg font-bold" style={{ color: '#f59e0b' }}>
              SANDBOX MODE
            </h2>
          </div>
          {activeProject && (
            <span className="text-sm text-text-muted">
              — {activeProject.name}
            </span>
          )}
          <div className="flex items-center gap-2 ml-4 text-xs text-text-muted">
            <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400">
              +{stats.newCards} new
            </span>
            <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400">
              ~{stats.modifiedCards} modified
            </span>
            <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400">
              -{stats.deletedCards} deleted
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {conflicts.length > 0 && (
            <span className="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-400">
              {conflicts.length} conflict(s) detected
            </span>
          )}
          <button
            className="text-sm font-medium px-4 py-1.5 rounded border transition-colors"
            style={{
              borderColor: '#ef4444',
              color: '#ef4444',
              backgroundColor: 'transparent',
            }}
            onClick={handleDiscard}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Discard All
          </button>
          <button
            className="text-sm font-medium px-4 py-1.5 rounded transition-colors"
            style={{
              backgroundColor: stats.newCards + stats.modifiedCards + stats.deletedCards > 0 ? '#22c55e' : '#374151',
              color: 'white',
              cursor: stats.newCards + stats.modifiedCards + stats.deletedCards > 0 ? 'pointer' : 'not-allowed',
              opacity: stats.newCards + stats.modifiedCards + stats.deletedCards > 0 ? 1 : 0.5,
            }}
            disabled={stats.newCards + stats.modifiedCards + stats.deletedCards === 0}
            onClick={() => setShowCommitConfirm(true)}
          >
            Commit Changes
          </button>
        </div>
      </div>

      {/* Commit confirmation dialog */}
      {showCommitConfirm && (
        <div className="px-4 py-3 border-b border-border bg-surface-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-primary font-medium">Confirm commit?</p>
              <p className="text-xs text-text-muted">
                This will apply {stats.newCards} new, {stats.modifiedCards} modified, and {stats.deletedCards} deleted card(s) to the main board.
                {conflicts.length > 0 && ` ${conflicts.length} conflicted card(s) will be skipped.`}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="btn-ghost text-xs py-1 px-3" onClick={() => setShowCommitConfirm(false)}>
                Cancel
              </button>
              <button
                className="text-xs font-medium py-1 px-3 rounded text-white"
                style={{ backgroundColor: '#22c55e' }}
                onClick={handleCommit}
              >
                Yes, Commit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sandbox workspace - column layout mirroring the main board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <div className="flex gap-4 h-full min-w-min">
          {columns.map((column) => {
            const mainCards = mainCardsByColumn[column.id] ?? [];
            const drafts = draftsByColumn[column.id] ?? [];
            const deletedIds = new Set(sandboxDeletions);

            return (
              <div
                key={column.id}
                className="flex-shrink-0 w-[300px] flex flex-col rounded-lg border overflow-hidden"
                style={{
                  borderColor: column.color ?? '#374151',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                }}
              >
                {/* Column header */}
                <div
                  className="px-3 py-2 border-b flex items-center justify-between"
                  style={{
                    borderColor: column.color ?? '#374151',
                    backgroundColor: column.color ? `${column.color}15` : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-2">
                    {column.color && (
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: column.color }}
                      />
                    )}
                    <h3 className="text-sm font-semibold text-text-primary">{column.title}</h3>
                  </div>
                  <span className="text-xs text-text-muted">
                    {mainCards.length} board · {drafts.length} draft
                  </span>
                </div>

                {/* Cards area */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {/* Main board cards (read-only with clone/delete actions) */}
                  {mainCards.map((card) => {
                    const isCloned = clonedOriginalIds.has(card.id);
                    const isMarkedDeleted = deletedIds.has(card.id);

                    return (
                      <div
                        key={card.id}
                        className="rounded-lg border p-2.5 text-sm transition-all"
                        style={{
                          borderColor: isMarkedDeleted ? '#ef4444' : '#374151',
                          backgroundColor: isMarkedDeleted ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.03)',
                          opacity: isMarkedDeleted ? 0.5 : 1,
                          textDecoration: isMarkedDeleted ? 'line-through' : 'none',
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-text-primary text-xs truncate">{card.title}</p>
                            {card.description && (
                              <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{card.description}</p>
                            )}
                          </div>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-surface-700 text-text-muted whitespace-nowrap">
                            Board
                          </span>
                        </div>
                        <div className="flex gap-1 mt-1.5">
                          {!isCloned && !isMarkedDeleted && (
                            <button
                              className="text-xs text-primary-400 hover:text-primary-300"
                              onClick={() => cloneCardToSandbox(card.id)}
                            >
                              Clone to Sandbox
                            </button>
                          )}
                          {isCloned && !isMarkedDeleted && (
                            <span className="text-xs text-green-400">Cloned</span>
                          )}
                          {!isMarkedDeleted ? (
                            <>
                              <span className="text-text-muted text-xs">·</span>
                              <button
                                className="text-xs text-error-400 hover:text-error-300"
                                onClick={() => markForDeletion(card.id)}
                              >
                                Mark Delete
                              </button>
                            </>
                          ) : (
                            <button
                              className="text-xs text-green-400 hover:text-green-300"
                              onClick={() => unmarkForDeletion(card.id)}
                            >
                              Restore
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Separator if both sections have content */}
                  {mainCards.length > 0 && drafts.length > 0 && (
                    <div className="flex items-center gap-2 py-2">
                      <div className="flex-1 border-t" style={{ borderColor: '#f59e0b50' }} />
                      <span className="text-xs font-medium" style={{ color: '#f59e0b' }}>Sandbox Drafts</span>
                      <div className="flex-1 border-t" style={{ borderColor: '#f59e0b50' }} />
                    </div>
                  )}

                  {/* Sandbox draft cards (editable) */}
                  {drafts.map((draft) => (
                    <SandboxCardEditor
                      key={draft.id}
                      draft={draft}
                      onUpdate={handleUpdateDraft}
                      onDelete={deleteSandboxDraft}
                    />
                  ))}

                  {/* New card form */}
                  {activeNewCardColumn === column.id ? (
                    <SandboxNewCardForm
                      columnId={column.id}
                      onCreate={handleCreateCard}
                      onCancel={() => setActiveNewCardColumn(null)}
                    />
                  ) : (
                    <button
                      className="w-full py-2 text-xs text-text-muted hover:text-green-400 border-2 border-dashed border-border hover:border-green-500/50 rounded-lg transition-colors"
                      onClick={() => setActiveNewCardColumn(column.id)}
                    >
                      + Add Sandbox Card
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer info bar */}
      <div
        className="px-4 py-2 border-t text-xs text-text-muted flex items-center justify-between"
        style={{ borderColor: '#f59e0b30', backgroundColor: 'rgba(245, 158, 11, 0.03)' }}
      >
        <span>
          Sandbox changes are isolated — they won't affect the main board until committed.
        </span>
        <span>
          {stats.totalDrafts} draft(s) in sandbox
        </span>
      </div>
    </div>
  );
}

export default CardSandboxPanel;
