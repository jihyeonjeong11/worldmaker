/**
 * KanbanBoard Component
 *
 * Main Kanban board component that renders columns in a responsive
 * flexbox layout. Supports column CRUD operations, card CRUD operations,
 * and drag-and-drop reordering using dnd-kit.
 */
import { useMemo, useCallback, useState } from 'react';
import type { DragEndEvent, DragOverEvent, DragStartEvent, UniqueIdentifier } from '@dnd-kit/core';
import { useBoardStore } from '@/store';
import { DragDropProvider } from './DragDropContext';
import { DroppableColumn } from './DroppableColumn';
import { AddColumnDialog } from './AddColumnDialog';
import { CardFormDialog, type CardFormData } from './CardFormDialog';
import { CardDeleteConfirmation } from './CardDeleteConfirmation';
import { SaveAsTemplateDialog } from './SaveAsTemplateDialog';
import { KeywordFilterBar } from './KeywordFilterBar';
import { CardSandboxPanel } from './CardSandboxPanel';
import { SandboxCardLibraryPanel } from './SandboxCardLibraryPanel';
import { useKeywordFilter } from '@/hooks/useKeywordFilter';
import type { ColumnId, Column, Card, CardId, TemplateCategory } from '@/types';
import type { SandboxCard } from '@/types/sandbox';

interface KanbanBoardProps {
  /** Optional CSS class name */
  className?: string;
}

/**
 * KanbanBoard - Main board container with columns
 */
export function KanbanBoard({ className = '' }: KanbanBoardProps): JSX.Element {
  // Column dialog state
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);

  // Card dialog state
  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [cardFormMode, setCardFormMode] = useState<'create' | 'edit'>('create');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<ColumnId | null>(null);

  // Card delete confirmation state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null);

  // Save as template dialog state
  const [isSaveTemplateDialogOpen, setIsSaveTemplateDialogOpen] = useState(false);
  const [cardForTemplate, setCardForTemplate] = useState<Card | null>(null);

  // Drag state for dnd-kit
  const [activeCardId, setActiveCardId] = useState<UniqueIdentifier | null>(null);
  const [overColumnId, setOverColumnId] = useState<ColumnId | null>(null);
  const [activeSandboxCard, setActiveSandboxCard] = useState<SandboxCard | null>(null);

  // Sandbox card library panel state
  const [showSandboxLibrary, setShowSandboxLibrary] = useState(false);
  const cardLibraryCount = useBoardStore((state) => Object.keys(state.cardLibrary).length);

  // Card Sandbox state
  const isSandboxActive = useBoardStore((state) => state.isSandboxActive);
  const enterCardSandbox = useBoardStore((state) => state.enterCardSandbox);
  const exitCardSandbox = useBoardStore((state) => state.exitCardSandbox);

  // Keyword filter state
  const {
    activeKeywords,
    toggleKeyword,
    clearKeywords,
    filterCards,
    hasActiveFilters,
  } = useKeywordFilter();

  // Get store state using individual selectors for stability
  const activeProjectId = useBoardStore((state) => state.activeProjectId);
  const projects = useBoardStore((state) => state.projects);
  const columnsStore = useBoardStore((state) => state.columns);
  const cardsStore = useBoardStore((state) => state.cards);

  // Store actions - Columns
  const toggleColumnCollapse = useBoardStore((state) => state.toggleColumnCollapse);
  const createColumn = useBoardStore((state) => state.createColumn);
  const updateColumn = useBoardStore((state) => state.updateColumn);
  const deleteColumn = useBoardStore((state) => state.deleteColumn);

  // Store actions - Cards
  const createCard = useBoardStore((state) => state.createCard);
  const updateCard = useBoardStore((state) => state.updateCard);
  const deleteCard = useBoardStore((state) => state.deleteCard);
  const moveCard = useBoardStore((state) => state.moveCard);
  const getCard = useBoardStore((state) => state.getCard);

  // Store actions - Templates
  const duplicateCard = useBoardStore((state) => state.duplicateCard);
  const saveCardAsTemplate = useBoardStore((state) => state.saveCardAsTemplate);

  // Memoize derived data to prevent infinite loops
  const activeProject = useMemo(() => {
    return activeProjectId ? projects[activeProjectId] : null;
  }, [activeProjectId, projects]);

  const columns = useMemo<Column[]>(() => {
    if (!activeProjectId) return [];
    return Object.values(columnsStore)
      .filter((column) => column.projectId === activeProjectId)
      .sort((a, b) => a.position - b.position);
  }, [activeProjectId, columnsStore]);

  // All cards for the project (unfiltered) - used for keyword extraction
  const allProjectCards = useMemo<Card[]>(() => {
    if (!activeProjectId) return [];
    return Object.values(cardsStore)
      .filter((card) => card.projectId === activeProjectId)
      .sort((a, b) => a.position - b.position);
  }, [activeProjectId, cardsStore]);

  // Filtered cards based on active keywords
  const filteredCards = useMemo<Card[]>(() => {
    return filterCards(allProjectCards);
  }, [allProjectCards, filterCards]);

  const cardsByColumn = useMemo<Record<ColumnId, Card[]>>(() => {
    if (!activeProjectId) return {};
    const result: Record<ColumnId, Card[]> = {};

    filteredCards.forEach((card) => {
      if (!result[card.columnId]) {
        result[card.columnId] = [];
      }
      result[card.columnId].push(card);
    });

    return result;
  }, [activeProjectId, filteredCards]);

  // Memoize card IDs for each column (for dnd-kit sortable context)
  const cardIdsByColumn = useMemo<Record<ColumnId, CardId[]>>(() => {
    const result: Record<ColumnId, CardId[]> = {};
    for (const [columnId, cards] of Object.entries(cardsByColumn)) {
      result[columnId] = cards.map((card) => card.id);
    }
    return result;
  }, [cardsByColumn]);

  // All cards as a flat array for the drag overlay
  const allCards = useMemo<Card[]>(() => {
    return Object.values(cardsByColumn).flat();
  }, [cardsByColumn]);

  // Handle column header click to toggle collapse
  const handleColumnHeaderClick = useCallback((columnId: ColumnId): void => {
    toggleColumnCollapse(columnId);
  }, [toggleColumnCollapse]);

  // Handle adding a new column
  const handleAddColumn = useCallback((title: string, color?: string): void => {
    if (!activeProjectId) return;
    createColumn({
      projectId: activeProjectId,
      title,
      color,
    });
  }, [activeProjectId, createColumn]);

  // Handle renaming a column
  const handleRenameColumn = useCallback((columnId: ColumnId, newTitle: string): void => {
    updateColumn({ id: columnId, title: newTitle });
  }, [updateColumn]);

  // Handle changing column color
  const handleColorChange = useCallback((columnId: ColumnId, newColor: string): void => {
    updateColumn({ id: columnId, color: newColor });
  }, [updateColumn]);

  // Handle deleting a column
  const handleDeleteColumn = useCallback((columnId: ColumnId): void => {
    deleteColumn(columnId);
  }, [deleteColumn]);

  // ===== Drag and Drop Handlers (dnd-kit) =====

  const handleDragStart = useCallback((event: DragStartEvent): void => {
    const { active } = event;
    const data = active.data.current;
    if (data?.type === 'sandbox-card') {
      setActiveSandboxCard(data.sandboxCard as SandboxCard);
      setActiveCardId(null);
    } else {
      setActiveCardId(active.id);
      setActiveSandboxCard(null);
    }
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent): void => {
    const { over } = event;

    if (!over) {
      setOverColumnId(null);
      return;
    }

    // Determine which column we're over
    const overData = over.data.current;
    if (overData?.type === 'column') {
      setOverColumnId(over.id as ColumnId);
    } else if (overData?.type === 'card') {
      setOverColumnId(overData.columnId as ColumnId);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent): void => {
    const { active, over } = event;

    setActiveCardId(null);
    setOverColumnId(null);
    setActiveSandboxCard(null);

    if (!over || !activeProjectId) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Handle sandbox card dropped onto a column
    if (activeData?.type === 'sandbox-card') {
      const sandboxCard = activeData.sandboxCard;
      let targetColumnId: ColumnId | null = null;

      if (overData?.type === 'column') {
        targetColumnId = over.id as ColumnId;
      } else if (overData?.type === 'card') {
        targetColumnId = overData.columnId as ColumnId;
      }

      if (targetColumnId && sandboxCard) {
        createCard({
          projectId: activeProjectId,
          columnId: targetColumnId,
          title: sandboxCard.title,
          description: sandboxCard.cue,
          priority: 'medium',
          tags: ['worldbuilding', sandboxCard.category],
          worldbuilding: {
            cardType: sandboxCard.category,
            cues: [{ text: sandboxCard.cue }],
          },
        });
      }
      return;
    }

    // Only handle card moves
    if (activeData?.type !== 'card') return;

    const activeId = active.id as CardId;

    const sourceColumnId = activeData.columnId as ColumnId;
    let targetColumnId: ColumnId;
    let targetPosition: number;

    if (overData?.type === 'column') {
      // Dropped directly on a column - add to end
      targetColumnId = over.id as ColumnId;
      const targetCards = cardsByColumn[targetColumnId] ?? [];
      targetPosition = targetCards.length;
    } else if (overData?.type === 'card') {
      // Dropped on another card - insert at that position
      targetColumnId = overData.columnId as ColumnId;
      const overId = over.id as CardId;
      const targetCards = cardsByColumn[targetColumnId] ?? [];
      const overIndex = targetCards.findIndex((c) => c.id === overId);

      if (sourceColumnId === targetColumnId) {
        // Same column - reorder
        const activeIndex = targetCards.findIndex((c) => c.id === activeId);
        if (activeIndex === overIndex) return; // No change
        targetPosition = overIndex;
      } else {
        // Different column - insert at over position
        targetPosition = overIndex >= 0 ? overIndex : targetCards.length;
      }
    } else {
      return;
    }

    // Only move if there's an actual change
    const activeCard = allCards.find((c) => c.id === activeId);
    if (!activeCard) return;

    if (activeCard.columnId === targetColumnId && activeCard.position === targetPosition) {
      return; // No change needed
    }

    // Move the card
    moveCard({
      cardId: activeId,
      targetColumnId,
      targetPosition,
    });
  }, [activeProjectId, cardsByColumn, allCards, moveCard]);

  const handleDragCancel = useCallback((): void => {
    setActiveCardId(null);
    setOverColumnId(null);
    setActiveSandboxCard(null);
  }, []);

  // Handle click on add column placeholder or button
  const handleOpenAddColumnDialog = useCallback((): void => {
    setIsAddColumnDialogOpen(true);
  }, []);

  // ===== Card CRUD Handlers =====

  // Handle opening card form for creating a new card
  const handleOpenCreateCard = useCallback((columnId: ColumnId): void => {
    setSelectedColumnId(columnId);
    setSelectedCard(null);
    setCardFormMode('create');
    setIsCardFormOpen(true);
  }, []);

  // Handle opening card form for editing an existing card
  const handleOpenEditCard = useCallback((card: Card): void => {
    setSelectedCard(card);
    setSelectedColumnId(card.columnId);
    setCardFormMode('edit');
    setIsCardFormOpen(true);
  }, []);

  // Handle closing card form
  const handleCloseCardForm = useCallback((): void => {
    setIsCardFormOpen(false);
    setSelectedCard(null);
    setSelectedColumnId(null);
  }, []);

  // Handle creating a new card
  const handleCreateCard = useCallback(
    (data: CardFormData, columnId: ColumnId, projectId: string): void => {
      createCard({
        projectId,
        columnId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        tags: data.tags,
        ...(data.worldbuilding ? { worldbuilding: data.worldbuilding } : {}),
      });
    },
    [createCard]
  );

  // Handle updating an existing card
  const handleUpdateCard = useCallback(
    (cardId: string, data: Partial<CardFormData>): void => {
      updateCard({
        id: cardId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        tags: data.tags,
        ...(data.worldbuilding ? { worldbuilding: data.worldbuilding } : {}),
      });
    },
    [updateCard]
  );

  // Handle opening delete confirmation
  const handleOpenDeleteConfirm = useCallback((cardId: CardId): void => {
    const card = getCard(cardId);
    if (card) {
      setCardToDelete(card);
      setIsDeleteConfirmOpen(true);
    }
  }, [getCard]);

  // Handle closing delete confirmation
  const handleCloseDeleteConfirm = useCallback((): void => {
    setIsDeleteConfirmOpen(false);
    setCardToDelete(null);
  }, []);

  // Handle confirming card deletion
  const handleConfirmDelete = useCallback(
    (cardId: string): void => {
      deleteCard(cardId);
    },
    [deleteCard]
  );

  // ===== Card Template Handlers =====

  // Handle duplicating a card
  const handleDuplicateCard = useCallback(
    (cardId: CardId): void => {
      duplicateCard({ cardId });
    },
    [duplicateCard]
  );

  // Handle opening save as template dialog
  const handleOpenSaveAsTemplate = useCallback(
    (card: Card): void => {
      setCardForTemplate(card);
      setIsSaveTemplateDialogOpen(true);
    },
    []
  );

  // Handle closing save as template dialog
  const handleCloseSaveAsTemplate = useCallback((): void => {
    setIsSaveTemplateDialogOpen(false);
    setCardForTemplate(null);
  }, []);

  // Handle saving card as template
  const handleSaveAsTemplate = useCallback(
    (data: { name: string; description: string; category: TemplateCategory; tags: string[] }): void => {
      if (cardForTemplate) {
        saveCardAsTemplate({
          card: cardForTemplate,
          name: data.name,
          description: data.description,
          category: data.category,
          tags: data.tags,
        });
      }
    },
    [cardForTemplate, saveCardAsTemplate]
  );

  // Show empty state if no active project
  if (!activeProject) {
    return (
      <div
        className={`flex-1 flex items-center justify-center ${className}`}
        data-testid="kanban-board-empty"
      >
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-800 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            No Project Selected
          </h2>
          <p className="text-text-muted">
            Create or select a project to start organizing your story with the
            Kanban board.
          </p>
        </div>
      </div>
    );
  }

  // Show empty columns state if project has no columns
  if (columns.length === 0) {
    return (
      <>
        <div
          className={`flex-1 flex items-center justify-center ${className}`}
          data-testid="kanban-board-no-columns"
        >
          <div className="text-center p-8 max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-800 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              No Columns Yet
            </h2>
            <p className="text-text-muted mb-4">
              Add columns to organize your story workflow.
            </p>
            <button
              className="btn-primary"
              data-testid="add-first-column-btn"
              onClick={handleOpenAddColumnDialog}
            >
              Add Column
            </button>
          </div>
        </div>

        {/* Add Column Dialog */}
        <AddColumnDialog
          isOpen={isAddColumnDialogOpen}
          onClose={() => setIsAddColumnDialogOpen(false)}
          onCreate={handleAddColumn}
        />
      </>
    );
  }

  return (
    <DragDropProvider
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      activeId={activeCardId}
      cards={allCards}
      activeSandboxCard={activeSandboxCard}
    >
      <div
        className={`flex-1 flex flex-col overflow-hidden ${className}`}
        data-testid="kanban-board"
      >
        {/* Board Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <h2
              className="text-lg font-semibold text-text-primary"
              data-testid="board-project-name"
            >
              {activeProject.name}
            </h2>
            <span className="badge badge-primary">
              {columns.length} {columns.length === 1 ? 'column' : 'columns'}
            </span>
            {hasActiveFilters && (
              <span className="badge badge-secondary">
                {filteredCards.length} / {allProjectCards.length} cards
              </span>
            )}
          </div>

          {/* Board actions */}
          <div className="flex items-center gap-2">
            <button
              className="text-sm font-medium px-3 py-1.5 rounded border transition-colors"
              data-testid="toggle-card-sandbox-btn"
              style={{
                borderColor: isSandboxActive ? '#f59e0b' : '#374151',
                color: isSandboxActive ? '#f59e0b' : '#9ca3af',
                backgroundColor: isSandboxActive ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
              }}
              onClick={() => {
                if (isSandboxActive) {
                  exitCardSandbox();
                } else {
                  enterCardSandbox();
                }
              }}
              title={isSandboxActive ? 'Exit sandbox mode' : 'Enter sandbox mode to experiment with cards'}
            >
              {isSandboxActive ? 'Exit Sandbox' : 'Enter Sandbox'}
            </button>
            <button
              className="text-sm font-medium px-3 py-1.5 rounded border transition-colors"
              data-testid="toggle-sandbox-library-btn"
              style={{
                borderColor: showSandboxLibrary ? '#8b5cf6' : '#374151',
                color: showSandboxLibrary ? '#8b5cf6' : '#9ca3af',
                backgroundColor: showSandboxLibrary ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
              }}
              onClick={() => setShowSandboxLibrary(!showSandboxLibrary)}
              title="Open sandbox card library to import worldbuilding cards"
            >
              Card Library {cardLibraryCount > 0 && `(${cardLibraryCount})`}
            </button>
            <button
              className="btn-ghost text-sm"
              data-testid="add-column-btn"
              onClick={handleOpenAddColumnDialog}
            >
              + Add Column
            </button>
          </div>
        </div>

        {/* Card Sandbox Panel - replaces main board content when active */}
        {isSandboxActive && (
          <CardSandboxPanel
            onExit={() => exitCardSandbox()}
          />
        )}

        {/* Keyword Filter Bar */}
        {!isSandboxActive && allProjectCards.length > 0 && (
          <div className="px-4 py-2 border-b border-border bg-surface-900/50">
            <KeywordFilterBar
              cards={allProjectCards}
              activeKeywords={activeKeywords}
              onKeywordToggle={toggleKeyword}
              onClearAll={clearKeywords}
              maxKeywords={15}
              size="sm"
              label="Filter by tags:"
            />
          </div>
        )}

        {/* Columns Container - Responsive Flexbox Layout with dnd-kit */}
        {!isSandboxActive && <div
          className="flex-1 overflow-x-auto overflow-y-hidden p-4"
          data-testid="kanban-columns-container"
        >
          <div
            className="flex gap-4 h-full min-w-min"
            data-testid="kanban-columns"
          >
            {columns.map((column) => (
              <DroppableColumn
                key={column.id}
                column={column}
                cards={cardsByColumn[column.id] ?? []}
                cardIds={cardIdsByColumn[column.id] ?? []}
                onHeaderClick={() => handleColumnHeaderClick(column.id)}
                onRename={handleRenameColumn}
                onColorChange={handleColorChange}
                onDelete={handleDeleteColumn}
                onAddCard={handleOpenCreateCard}
                onCardClick={handleOpenEditCard}
                onCardDelete={handleOpenDeleteConfirm}
                onCardDuplicate={handleDuplicateCard}
                onCardSaveAsTemplate={handleOpenSaveAsTemplate}
                isActiveDropZone={overColumnId === column.id}
              />
            ))}

            {/* Add Column Placeholder */}
            <div
              className="flex-shrink-0 w-[280px] min-h-[200px] border-2 border-dashed border-border rounded-card flex items-center justify-center hover:border-primary-500 hover:bg-background-hover transition-colors cursor-pointer"
              data-testid="add-column-placeholder"
              onClick={handleOpenAddColumnDialog}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleOpenAddColumnDialog();
                }
              }}
            >
              <div className="text-center text-text-muted">
                <svg
                  className="w-8 h-8 mx-auto mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <p className="text-sm">Add Column</p>
              </div>
            </div>
          </div>
        </div>}

        {/* Add Column Dialog */}
        <AddColumnDialog
          isOpen={isAddColumnDialogOpen}
          onClose={() => setIsAddColumnDialogOpen(false)}
          onCreate={handleAddColumn}
        />

        {/* Card Form Dialog (Create/Edit) */}
        <CardFormDialog
          isOpen={isCardFormOpen}
          onClose={handleCloseCardForm}
          mode={cardFormMode}
          card={selectedCard ?? undefined}
          columnId={selectedColumnId ?? undefined}
          projectId={activeProjectId ?? undefined}
          onCreate={handleCreateCard}
          onUpdate={handleUpdateCard}
        />

        {/* Card Delete Confirmation */}
        <CardDeleteConfirmation
          isOpen={isDeleteConfirmOpen}
          onClose={handleCloseDeleteConfirm}
          onConfirm={handleConfirmDelete}
          card={cardToDelete}
        />

        {/* Save As Template Dialog */}
        {cardForTemplate && (
          <SaveAsTemplateDialog
            isOpen={isSaveTemplateDialogOpen}
            onClose={handleCloseSaveAsTemplate}
            card={cardForTemplate}
            onSave={handleSaveAsTemplate}
          />
        )}

        {/* Sandbox Card Library Panel */}
        {showSandboxLibrary && (
          <SandboxCardLibraryPanel
            onClose={() => setShowSandboxLibrary(false)}
          />
        )}
      </div>
    </DragDropProvider>
  );
}

export default KanbanBoard;
