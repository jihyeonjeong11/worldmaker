

I'll start by exploring the codebase to understand the existing structure before implementing this feature.

🔧 Tool: Bash
Input: {
  "command": "find . -maxdepth 3 -type f | head -60",
  "description": "List top-level files"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*board*"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*card*"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\store\\boardStore.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\store\\slices\\cardsSlice.ts"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/**/*.{ts,tsx}"
}
I can see there's already a `sandboxSlice.ts` and `WorldbuildingSandbox.tsx`. Let me read the existing sandbox-related files and the main app structure.

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\store\\slices\\sandboxSlice.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\WorldbuildingSandbox.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\types\\sandbox.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\App.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\types\\index.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\KanbanBoard.tsx"
}
Now I have a clear picture. The app already has a "Sandbox" view mode for worldbuilding, but the requirement is to integrate a **Card Sandbox** feature into the **Board tab** itself — allowing users to test/preview/experiment with board cards in isolation before committing to the main board. Let me read the remaining key files and then implement.

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\store\\slices\\index.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\index.ts"
}
Now let me read the store utils for `generateId` and `getTimestamp`:

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\store\\utils.ts"
}
Now I have a complete understanding. Let me implement the Card Sandbox feature integrated into the Board tab. I'll create:

1. **`cardSandboxSlice.ts`** - Isolated state management for sandbox cards
2. **`CardSandboxPanel.tsx`** - The sandbox UI component integrated into the board
3. Update **`KanbanBoard.tsx`** - Add toggle to enter/exit sandbox mode
4. Update **store exports** and **component exports**

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create cardSandboxSlice.ts for isolated sandbox state",
      "status": "in_progress",
      "activeForm": "Creating card sandbox slice"
    },
    {
      "content": "Create CardSandboxPanel.tsx component",
      "status": "pending",
      "activeForm": "Creating sandbox panel component"
    },
    {
      "content": "Update store to include cardSandboxSlice",
      "status": "pending",
      "activeForm": "Updating store integration"
    },
    {
      "content": "Update KanbanBoard.tsx with sandbox toggle",
      "status": "pending",
      "activeForm": "Adding sandbox toggle to board"
    },
    {
      "content": "Update component and store exports",
      "status": "pending",
      "activeForm": "Updating exports"
    }
  ]
}

🔧 Tool: Write
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\store\\slices\\cardSandboxSlice.ts",
  "content": "/**\n * Card Sandbox Slice\n * Manages isolated sandbox state for testing/previewing cards\n * before committing changes to the main board.\n *\n * Cards in the sandbox are copies of real board cards (or new drafts).\n * Changes here do NOT affect the main board until explicitly committed.\n */\nimport type {\n  Card,\n  CardId,\n  ColumnId,\n  ProjectId,\n  CardPriority,\n  CardStatus,\n  WorldbuildingData,\n} from '@/types';\nimport { generateId, getTimestamp } from '../utils';\n\n// ============================================================================\n// Types\n// ============================================================================\n\n/** A sandbox draft card — a working copy isolated from the main board */\nexport interface SandboxDraftCard extends Card {\n  /** If this card was cloned from a main board card, the original ID */\n  originalCardId: CardId | null;\n  /** Whether this card has been modified from its original */\n  isDirty: boolean;\n  /** Whether this is a brand-new card (not cloned from main board) */\n  isNew: boolean;\n}\n\n/** State shape for the card sandbox */\nexport interface CardSandboxState {\n  /** Whether sandbox mode is active */\n  isSandboxActive: boolean;\n  /** Draft cards being edited in the sandbox */\n  sandboxDrafts: Record<CardId, SandboxDraftCard>;\n  /** IDs of cards marked for deletion when committed */\n  sandboxDeletions: CardId[];\n  /** The project ID the sandbox is operating on */\n  sandboxProjectId: ProjectId | null;\n  /** Snapshot of main board cards at the time sandbox was entered (for conflict detection) */\n  sandboxSnapshot: Record<CardId, string> | null; // cardId -> updatedAt\n}\n\n/** Payload for creating a new card in the sandbox */\nexport interface CreateSandboxDraftPayload {\n  columnId: ColumnId;\n  title: string;\n  description?: string;\n  priority?: CardPriority;\n  tags?: string[];\n  worldbuilding?: WorldbuildingData;\n}\n\n/** Payload for updating a sandbox draft card */\nexport interface UpdateSandboxDraftPayload {\n  id: CardId;\n  title?: string;\n  description?: string;\n  priority?: CardPriority;\n  status?: CardStatus;\n  tags?: string[];\n  worldbuilding?: WorldbuildingData;\n}\n\n/** Result of committing sandbox changes */\nexport interface CommitResult {\n  created: number;\n  updated: number;\n  deleted: number;\n  conflicts: CardId[];\n}\n\n// ============================================================================\n// Slice Interface\n// ============================================================================\n\nexport interface CardSandboxActions {\n  /** Enter sandbox mode — snapshots current board state */\n  enterCardSandbox: () => void;\n  /** Exit sandbox mode without committing (discards all changes) */\n  exitCardSandbox: () => void;\n  /** Clone a main board card into the sandbox for editing */\n  cloneCardToSandbox: (cardId: CardId) => CardId | null;\n  /** Clone all cards from a column into the sandbox */\n  cloneColumnToSandbox: (columnId: ColumnId) => void;\n  /** Create a new draft card in the sandbox */\n  createSandboxDraft: (payload: CreateSandboxDraftPayload) => CardId;\n  /** Update a draft card in the sandbox */\n  updateSandboxDraft: (payload: UpdateSandboxDraftPayload) => void;\n  /** Delete a draft card in the sandbox */\n  deleteSandboxDraft: (id: CardId) => void;\n  /** Mark a main board card for deletion on commit */\n  markForDeletion: (cardId: CardId) => void;\n  /** Unmark a card from deletion */\n  unmarkForDeletion: (cardId: CardId) => void;\n  /** Commit all sandbox changes to the main board */\n  commitSandboxChanges: () => CommitResult;\n  /** Get all sandbox drafts for a column */\n  getSandboxDraftsByColumn: (columnId: ColumnId) => SandboxDraftCard[];\n  /** Check if a main board card has been modified while sandbox was active */\n  detectConflicts: () => CardId[];\n  /** Get sandbox statistics */\n  getSandboxStats: () => { newCards: number; modifiedCards: number; deletedCards: number; totalDrafts: number };\n}\n\nexport interface CardSandboxSlice extends CardSandboxState, CardSandboxActions {}\n\n// ============================================================================\n// Slice Creator\n// ============================================================================\n\n/**\n * Create the card sandbox slice.\n * Requires access to the full store (get) for reading main board cards.\n */\nexport const createCardSandboxSlice = (\n  set: (fn: (state: CardSandboxSlice & { cards: Record<CardId, Card>; activeProjectId: ProjectId | null }) => void) => void,\n  get: () => CardSandboxSlice & {\n    cards: Record<CardId, Card>;\n    activeProjectId: ProjectId | null;\n    createCard: (payload: { projectId: ProjectId; columnId: ColumnId; title: string; description?: string; priority?: CardPriority; tags?: string[]; worldbuilding?: WorldbuildingData }) => CardId;\n    updateCard: (payload: { id: CardId; title?: string; description?: string; priority?: CardPriority; status?: CardStatus; tags?: string[]; worldbuilding?: WorldbuildingData }) => void;\n    deleteCard: (id: CardId) => void;\n  }\n): CardSandboxSlice => ({\n  // Initial state\n  isSandboxActive: false,\n  sandboxDrafts: {},\n  sandboxDeletions: [],\n  sandboxProjectId: null,\n  sandboxSnapshot: null,\n\n  // Actions\n  enterCardSandbox: () => {\n    const state = get();\n    const projectId = state.activeProjectId;\n    if (!projectId) return;\n\n    // Take a snapshot of current card updatedAt timestamps for conflict detection\n    const snapshot: Record<CardId, string> = {};\n    Object.values(state.cards)\n      .filter((c) => c.projectId === projectId)\n      .forEach((c) => {\n        snapshot[c.id] = c.updatedAt;\n      });\n\n    set((s) => {\n      s.isSandboxActive = true;\n      s.sandboxDrafts = {};\n      s.sandboxDeletions = [];\n      s.sandboxProjectId = projectId;\n      s.sandboxSnapshot = snapshot;\n    });\n  },\n\n  exitCardSandbox: () => {\n    set((s) => {\n      s.isSandboxActive = false;\n      s.sandboxDrafts = {};\n      s.sandboxDeletions = [];\n      s.sandboxProjectId = null;\n      s.sandboxSnapshot = null;\n    });\n  },\n\n  cloneCardToSandbox: (cardId) => {\n    const state = get();\n    const original = state.cards[cardId];\n    if (!original) return null;\n\n    const draftId = generateId();\n    const draft: SandboxDraftCard = {\n      ...original,\n      id: draftId,\n      originalCardId: cardId,\n      isDirty: false,\n      isNew: false,\n    };\n\n    set((s) => {\n      s.sandboxDrafts[draftId] = draft;\n    });\n\n    return draftId;\n  },\n\n  cloneColumnToSandbox: (columnId) => {\n    const state = get();\n    const projectId = state.sandboxProjectId;\n    if (!projectId) return;\n\n    const columnCards = Object.values(state.cards)\n      .filter((c) => c.columnId === columnId && c.projectId === projectId)\n      .sort((a, b) => a.position - b.position);\n\n    set((s) => {\n      for (const card of columnCards) {\n        // Skip if already cloned\n        const alreadyCloned = Object.values(s.sandboxDrafts).some(\n          (d) => d.originalCardId === card.id\n        );\n        if (alreadyCloned) continue;\n\n        const draftId = generateId();\n        s.sandboxDrafts[draftId] = {\n          ...card,\n          id: draftId,\n          originalCardId: card.id,\n          isDirty: false,\n          isNew: false,\n        };\n      }\n    });\n  },\n\n  createSandboxDraft: (payload) => {\n    const state = get();\n    const projectId = state.sandboxProjectId;\n    if (!projectId) return '';\n\n    const id = generateId();\n    const now = getTimestamp();\n\n    // Calculate position\n    const existingInColumn = Object.values(state.sandboxDrafts)\n      .filter((d) => d.columnId === payload.columnId)\n      .length;\n\n    // Also count main board cards in that column that haven't been cloned\n    const mainBoardInColumn = Object.values(state.cards)\n      .filter((c) => c.columnId === payload.columnId && c.projectId === projectId)\n      .length;\n\n    const position = Math.max(existingInColumn, mainBoardInColumn);\n\n    const draft: SandboxDraftCard = {\n      id,\n      projectId,\n      columnId: payload.columnId,\n      title: payload.title,\n      description: payload.description ?? '',\n      priority: payload.priority ?? 'medium',\n      status: 'active',\n      position,\n      tags: payload.tags ?? [],\n      ...(payload.worldbuilding ? { worldbuilding: payload.worldbuilding } : {}),\n      createdAt: now,\n      updatedAt: now,\n      originalCardId: null,\n      isDirty: true,\n      isNew: true,\n    };\n\n    set((s) => {\n      s.sandboxDrafts[id] = draft;\n    });\n\n    return id;\n  },\n\n  updateSandboxDraft: (payload) => {\n    set((s) => {\n      const draft = s.sandboxDrafts[payload.id];\n      if (!draft) return;\n      if (payload.title !== undefined) draft.title = payload.title;\n      if (payload.description !== undefined) draft.description = payload.description;\n      if (payload.priority !== undefined) draft.priority = payload.priority;\n      if (payload.status !== undefined) draft.status = payload.status;\n      if (payload.tags !== undefined) draft.tags = payload.tags;\n      if (payload.worldbuilding !== undefined) draft.worldbuilding = payload.worldbuilding;\n      draft.isDirty = true;\n      draft.updatedAt = getTimestamp();\n    });\n  },\n\n  deleteSandboxDraft: (id) => {\n    set((s) => {\n      const draft = s.sandboxDrafts[id];\n      if (!draft) return;\n      // If it was cloned from main board, mark original for deletion\n      if (draft.originalCardId && !draft.isNew) {\n        if (!s.sandboxDeletions.includes(draft.originalCardId)) {\n          s.sandboxDeletions.push(draft.originalCardId);\n        }\n      }\n      delete s.sandboxDrafts[id];\n    });\n  },\n\n  markForDeletion: (cardId) => {\n    set((s) => {\n      if (!s.sandboxDeletions.includes(cardId)) {\n        s.sandboxDeletions.push(cardId);\n      }\n    });\n  },\n\n  unmarkForDeletion: (cardId) => {\n    set((s) => {\n      s.sandboxDeletions = s.sandboxDeletions.filter((id) => id !== cardId);\n    });\n  },\n\n  commitSandboxChanges: () => {\n    const state = get();\n    const result: CommitResult = { created: 0, updated: 0, deleted: 0, conflicts: [] };\n\n    if (!state.sandboxProjectId) return result;\n\n    // Detect conflicts first\n    const conflicts = state.detectConflicts();\n    result.conflicts = conflicts;\n\n    // Process new cards\n    const newDrafts = Object.values(state.sandboxDrafts).filter((d) => d.isNew);\n    for (const draft of newDrafts) {\n      state.createCard({\n        projectId: draft.projectId,\n        columnId: draft.columnId,\n        title: draft.title,\n        description: draft.description,\n        priority: draft.priority,\n        tags: draft.tags,\n        ...(draft.worldbuilding ? { worldbuilding: draft.worldbuilding } : {}),\n      });\n      result.created++;\n    }\n\n    // Process modified cards (skip conflicted ones)\n    const modifiedDrafts = Object.values(state.sandboxDrafts).filter(\n      (d) => !d.isNew && d.isDirty && d.originalCardId && !conflicts.includes(d.originalCardId)\n    );\n    for (const draft of modifiedDrafts) {\n      state.updateCard({\n        id: draft.originalCardId!,\n        title: draft.title,\n        description: draft.description,\n        priority: draft.priority,\n        status: draft.status,\n        tags: draft.tags,\n        ...(draft.worldbuilding ? { worldbuilding: draft.worldbuilding } : {}),\n      });\n      result.updated++;\n    }\n\n    // Process deletions (skip conflicted ones)\n    for (const cardId of state.sandboxDeletions) {\n      if (!conflicts.includes(cardId)) {\n        state.deleteCard(cardId);\n        result.deleted++;\n      }\n    }\n\n    // Exit sandbox\n    set((s) => {\n      s.isSandboxActive = false;\n      s.sandboxDrafts = {};\n      s.sandboxDeletions = [];\n      s.sandboxProjectId = null;\n      s.sandboxSnapshot = null;\n    });\n\n    return result;\n  },\n\n  getSandboxDraftsByColumn: (columnId) => {\n    return Object.values(get().sandboxDrafts)\n      .filter((d) => d.columnId === columnId)\n      .sort((a, b) => a.position - b.position);\n  },\n\n  detectConflicts: () => {\n    const state = get();\n    if (!state.sandboxSnapshot) return [];\n\n    const conflicts: CardId[] = [];\n    for (const [cardId, snapshotTimestamp] of Object.entries(state.sandboxSnapshot)) {\n      const currentCard = state.cards[cardId];\n      if (currentCard && currentCard.updatedAt !== snapshotTimestamp) {\n        conflicts.push(cardId);\n      }\n      // Card was deleted from main board\n      if (!currentCard) {\n        conflicts.push(cardId);\n      }\n    }\n    return conflicts;\n  },\n\n  getSandboxStats: () => {\n    const state = get();\n    const drafts = Object.values(state.sandboxDrafts);\n    return {\n      newCards: drafts.filter((d) => d.isNew).length,\n      modifiedCards: drafts.filter((d) => !d.isNew && d.isDirty).length,\n      deletedCards: state.sandboxDeletions.length,\n      totalDrafts: drafts.length,\n    };\n  },\n});\n"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create cardSandboxSlice.ts for isolated sandbox state",
      "status": "completed",
      "activeForm": "Creating card sandbox slice"
    },
    {
      "content": "Create CardSandboxPanel.tsx component",
      "status": "in_progress",
      "activeForm": "Creating sandbox panel component"
    },
    {
      "content": "Update store to include cardSandboxSlice",
      "status": "pending",
      "activeForm": "Updating store integration"
    },
    {
      "content": "Update KanbanBoard.tsx with sandbox toggle",
      "status": "pending",
      "activeForm": "Adding sandbox toggle to board"
    },
    {
      "content": "Update component and store exports",
      "status": "pending",
      "activeForm": "Updating exports"
    }
  ]
}

🔧 Tool: Write
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\CardSandboxPanel.tsx",
  "content": "/**\n * CardSandboxPanel Component\n *\n * An overlay panel integrated into the board tab that provides a sandbox\n * environment for testing/previewing/experimenting with cards in isolation.\n *\n * Features:\n * - Visual sandbox mode indicator (distinct from main board)\n * - Create, edit, delete draft cards\n * - Clone existing board cards into sandbox\n * - Commit changes to main board or discard all\n * - Conflict detection when main board changes during sandbox session\n */\nimport { useState, useCallback, useMemo } from 'react';\nimport { useBoardStore } from '@/store';\nimport type { Card, ColumnId, CardPriority } from '@/types';\nimport type { SandboxDraftCard } from '@/store/slices/cardSandboxSlice';\n\nexport interface CardSandboxPanelProps {\n  /** Callback when sandbox is exited */\n  onExit?: () => void;\n}\n\n/**\n * Inline card editor for sandbox drafts\n */\nfunction SandboxCardEditor({\n  draft,\n  onUpdate,\n  onDelete,\n}: {\n  draft: SandboxDraftCard;\n  onUpdate: (id: string, updates: { title?: string; description?: string; priority?: CardPriority; tags?: string[] }) => void;\n  onDelete: (id: string) => void;\n}): JSX.Element {\n  const [isEditing, setIsEditing] = useState(false);\n  const [editTitle, setEditTitle] = useState(draft.title);\n  const [editDescription, setEditDescription] = useState(draft.description);\n  const [editPriority, setEditPriority] = useState(draft.priority);\n\n  const handleSave = () => {\n    onUpdate(draft.id, {\n      title: editTitle,\n      description: editDescription,\n      priority: editPriority,\n    });\n    setIsEditing(false);\n  };\n\n  const handleCancel = () => {\n    setEditTitle(draft.title);\n    setEditDescription(draft.description);\n    setEditPriority(draft.priority);\n    setIsEditing(false);\n  };\n\n  const priorityColors: Record<CardPriority, string> = {\n    low: '#22c55e',\n    medium: '#f59e0b',\n    high: '#f97316',\n    critical: '#ef4444',\n  };\n\n  return (\n    <div\n      className=\"rounded-lg border-2 p-3 mb-2 transition-all\"\n      style={{\n        borderColor: draft.isNew ? '#22c55e' : draft.isDirty ? '#f59e0b' : '#374151',\n        backgroundColor: draft.isNew ? 'rgba(34, 197, 94, 0.05)' : draft.isDirty ? 'rgba(245, 158, 11, 0.05)' : 'rgba(255,255,255,0.03)',\n      }}\n    >\n      {/* Status badges */}\n      <div className=\"flex items-center gap-1 mb-2\">\n        {draft.isNew && (\n          <span className=\"text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium\">\n            New\n          </span>\n        )}\n        {!draft.isNew && draft.isDirty && (\n          <span className=\"text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-medium\">\n            Modified\n          </span>\n        )}\n        {!draft.isNew && !draft.isDirty && (\n          <span className=\"text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 font-medium\">\n            Cloned\n          </span>\n        )}\n        <span\n          className=\"text-xs px-2 py-0.5 rounded-full font-medium\"\n          style={{\n            backgroundColor: `${priorityColors[draft.priority]}20`,\n            color: priorityColors[draft.priority],\n          }}\n        >\n          {draft.priority}\n        </span>\n      </div>\n\n      {isEditing ? (\n        <div className=\"space-y-2\">\n          <input\n            type=\"text\"\n            className=\"input text-sm w-full\"\n            value={editTitle}\n            onChange={(e) => setEditTitle(e.target.value)}\n            placeholder=\"Card title...\"\n            autoFocus\n          />\n          <textarea\n            className=\"input text-sm w-full\"\n            rows={3}\n            value={editDescription}\n            onChange={(e) => setEditDescription(e.target.value)}\n            placeholder=\"Description...\"\n          />\n          <select\n            className=\"input text-sm py-1\"\n            value={editPriority}\n            onChange={(e) => setEditPriority(e.target.value as CardPriority)}\n          >\n            <option value=\"low\">Low</option>\n            <option value=\"medium\">Medium</option>\n            <option value=\"high\">High</option>\n            <option value=\"critical\">Critical</option>\n          </select>\n          <div className=\"flex gap-2\">\n            <button className=\"btn-primary text-xs py-1 px-3\" onClick={handleSave}>Save</button>\n            <button className=\"btn-ghost text-xs py-1 px-3\" onClick={handleCancel}>Cancel</button>\n          </div>\n        </div>\n      ) : (\n        <div>\n          <h4\n            className=\"text-sm font-semibold text-text-primary cursor-pointer hover:text-primary-400\"\n            onClick={() => setIsEditing(true)}\n            title=\"Click to edit\"\n          >\n            {draft.title}\n          </h4>\n          {draft.description && (\n            <p className=\"text-xs text-text-muted mt-1 line-clamp-2\">{draft.description}</p>\n          )}\n          {draft.tags.length > 0 && (\n            <div className=\"flex flex-wrap gap-1 mt-2\">\n              {draft.tags.map((tag) => (\n                <span key={tag} className=\"text-xs px-1.5 py-0.5 rounded bg-surface-700 text-text-muted\">\n                  {tag}\n                </span>\n              ))}\n            </div>\n          )}\n          <div className=\"flex gap-1 mt-2\">\n            <button\n              className=\"text-xs text-primary-400 hover:text-primary-300\"\n              onClick={() => setIsEditing(true)}\n            >\n              Edit\n            </button>\n            <span className=\"text-text-muted text-xs\">·</span>\n            <button\n              className=\"text-xs text-error-400 hover:text-error-300\"\n              onClick={() => onDelete(draft.id)}\n            >\n              Remove\n            </button>\n          </div>\n        </div>\n      )}\n    </div>\n  );\n}\n\n/**\n * New card form within sandbox\n */\nfunction SandboxNewCardForm({\n  columnId,\n  onCreate,\n  onCancel,\n}: {\n  columnId: ColumnId;\n  onCreate: (columnId: ColumnId, title: string, description: string, priority: CardPriority) => void;\n  onCancel: () => void;\n}): JSX.Element {\n  const [title, setTitle] = useState('');\n  const [description, setDescription] = useState('');\n  const [priority, setPriority] = useState<CardPriority>('medium');\n\n  const handleSubmit = () => {\n    if (!title.trim()) return;\n    onCreate(columnId, title.trim(), description, priority);\n    setTitle('');\n    setDescription('');\n    setPriority('medium');\n  };\n\n  return (\n    <div className=\"border-2 border-dashed border-green-500/50 rounded-lg p-3 mb-2 bg-green-500/5\">\n      <h5 className=\"text-xs font-semibold text-green-400 mb-2\">New Sandbox Card</h5>\n      <input\n        type=\"text\"\n        className=\"input text-sm w-full mb-2\"\n        value={title}\n        onChange={(e) => setTitle(e.target.value)}\n        placeholder=\"Card title...\"\n        autoFocus\n        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}\n      />\n      <textarea\n        className=\"input text-sm w-full mb-2\"\n        rows={2}\n        value={description}\n        onChange={(e) => setDescription(e.target.value)}\n        placeholder=\"Description (optional)...\"\n      />\n      <select\n        className=\"input text-sm py-1 mb-2\"\n        value={priority}\n        onChange={(e) => setPriority(e.target.value as CardPriority)}\n      >\n        <option value=\"low\">Low</option>\n        <option value=\"medium\">Medium</option>\n        <option value=\"high\">High</option>\n        <option value=\"critical\">Critical</option>\n      </select>\n      <div className=\"flex gap-2\">\n        <button className=\"btn-primary text-xs py-1 px-3\" onClick={handleSubmit}>Add Card</button>\n        <button className=\"btn-ghost text-xs py-1 px-3\" onClick={onCancel}>Cancel</button>\n      </div>\n    </div>\n  );\n}\n\n/**\n * Main Card Sandbox Panel\n */\nexport function CardSandboxPanel({ onExit }: CardSandboxPanelProps): JSX.Element {\n  const [activeNewCardColumn, setActiveNewCardColumn] = useState<ColumnId | null>(null);\n  const [showCommitConfirm, setShowCommitConfirm] = useState(false);\n  const [commitResult, setCommitResult] = useState<{ created: number; updated: number; deleted: number; conflicts: string[] } | null>(null);\n\n  // Store state\n  const sandboxDrafts = useBoardStore((s) => s.sandboxDrafts);\n  const sandboxDeletions = useBoardStore((s) => s.sandboxDeletions);\n  const activeProjectId = useBoardStore((s) => s.activeProjectId);\n  const projects = useBoardStore((s) => s.projects);\n  const columnsStore = useBoardStore((s) => s.columns);\n  const cardsStore = useBoardStore((s) => s.cards);\n\n  // Store actions\n  const cloneCardToSandbox = useBoardStore((s) => s.cloneCardToSandbox);\n  const createSandboxDraft = useBoardStore((s) => s.createSandboxDraft);\n  const updateSandboxDraft = useBoardStore((s) => s.updateSandboxDraft);\n  const deleteSandboxDraft = useBoardStore((s) => s.deleteSandboxDraft);\n  const markForDeletion = useBoardStore((s) => s.markForDeletion);\n  const unmarkForDeletion = useBoardStore((s) => s.unmarkForDeletion);\n  const commitSandboxChanges = useBoardStore((s) => s.commitSandboxChanges);\n  const exitCardSandbox = useBoardStore((s) => s.exitCardSandbox);\n  const getSandboxStats = useBoardStore((s) => s.getSandboxStats);\n  const detectConflicts = useBoardStore((s) => s.detectConflicts);\n\n  const activeProject = activeProjectId ? projects[activeProjectId] : null;\n\n  // Get columns for this project\n  const columns = useMemo(() => {\n    if (!activeProjectId) return [];\n    return Object.values(columnsStore)\n      .filter((c) => c.projectId === activeProjectId)\n      .sort((a, b) => a.position - b.position);\n  }, [activeProjectId, columnsStore]);\n\n  // Get main board cards by column\n  const mainCardsByColumn = useMemo(() => {\n    if (!activeProjectId) return {} as Record<string, Card[]>;\n    const result: Record<string, Card[]> = {};\n    Object.values(cardsStore)\n      .filter((c) => c.projectId === activeProjectId)\n      .sort((a, b) => a.position - b.position)\n      .forEach((card) => {\n        if (!result[card.columnId]) result[card.columnId] = [];\n        result[card.columnId].push(card);\n      });\n    return result;\n  }, [activeProjectId, cardsStore]);\n\n  // Get sandbox drafts by column\n  const draftsByColumn = useMemo(() => {\n    const result: Record<string, SandboxDraftCard[]> = {};\n    Object.values(sandboxDrafts)\n      .sort((a, b) => a.position - b.position)\n      .forEach((draft) => {\n        if (!result[draft.columnId]) result[draft.columnId] = [];\n        result[draft.columnId].push(draft);\n      });\n    return result;\n  }, [sandboxDrafts]);\n\n  // IDs already cloned\n  const clonedOriginalIds = useMemo(() => {\n    return new Set(\n      Object.values(sandboxDrafts)\n        .filter((d) => d.originalCardId)\n        .map((d) => d.originalCardId!)\n    );\n  }, [sandboxDrafts]);\n\n  const stats = getSandboxStats();\n  const conflicts = detectConflicts();\n\n  const handleCreateCard = useCallback(\n    (columnId: ColumnId, title: string, description: string, priority: CardPriority) => {\n      createSandboxDraft({ columnId, title, description, priority });\n      setActiveNewCardColumn(null);\n    },\n    [createSandboxDraft]\n  );\n\n  const handleUpdateDraft = useCallback(\n    (id: string, updates: { title?: string; description?: string; priority?: CardPriority; tags?: string[] }) => {\n      updateSandboxDraft({ id, ...updates });\n    },\n    [updateSandboxDraft]\n  );\n\n  const handleCommit = useCallback(() => {\n    const result = commitSandboxChanges();\n    setCommitResult(result);\n    setShowCommitConfirm(false);\n    // Auto-close after showing result\n    setTimeout(() => {\n      setCommitResult(null);\n      onExit?.();\n    }, 3000);\n  }, [commitSandboxChanges, onExit]);\n\n  const handleDiscard = useCallback(() => {\n    exitCardSandbox();\n    onExit?.();\n  }, [exitCardSandbox, onExit]);\n\n  // Commit result overlay\n  if (commitResult) {\n    return (\n      <div className=\"flex-1 flex items-center justify-center\">\n        <div className=\"text-center p-8 rounded-xl border-2 border-green-500/30 bg-green-500/5 max-w-md\">\n          <p className=\"text-3xl mb-3\">&#10003;</p>\n          <h3 className=\"text-lg font-bold text-green-400 mb-3\">Changes Committed!</h3>\n          <div className=\"text-sm text-text-secondary space-y-1\">\n            {commitResult.created > 0 && <p>{commitResult.created} card(s) created</p>}\n            {commitResult.updated > 0 && <p>{commitResult.updated} card(s) updated</p>}\n            {commitResult.deleted > 0 && <p>{commitResult.deleted} card(s) deleted</p>}\n            {commitResult.conflicts.length > 0 && (\n              <p className=\"text-yellow-400\">{commitResult.conflicts.length} conflict(s) skipped</p>\n            )}\n          </div>\n        </div>\n      </div>\n    );\n  }\n\n  return (\n    <div className=\"flex-1 flex flex-col overflow-hidden\">\n      {/* Sandbox Header - distinct visual indicator */}\n      <div\n        className=\"flex items-center justify-between px-4 py-3 border-b-2\"\n        style={{\n          borderColor: '#f59e0b',\n          background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, transparent 100%)',\n        }}\n      >\n        <div className=\"flex items-center gap-3\">\n          <div className=\"flex items-center gap-2\">\n            <span\n              className=\"inline-block w-3 h-3 rounded-full animate-pulse\"\n              style={{ backgroundColor: '#f59e0b' }}\n            />\n            <h2 className=\"text-lg font-bold\" style={{ color: '#f59e0b' }}>\n              SANDBOX MODE\n            </h2>\n          </div>\n          {activeProject && (\n            <span className=\"text-sm text-text-muted\">\n              — {activeProject.name}\n            </span>\n          )}\n          <div className=\"flex items-center gap-2 ml-4 text-xs text-text-muted\">\n            <span className=\"px-2 py-0.5 rounded bg-green-500/10 text-green-400\">\n              +{stats.newCards} new\n            </span>\n            <span className=\"px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400\">\n              ~{stats.modifiedCards} modified\n            </span>\n            <span className=\"px-2 py-0.5 rounded bg-red-500/10 text-red-400\">\n              -{stats.deletedCards} deleted\n            </span>\n          </div>\n        </div>\n\n        <div className=\"flex items-center gap-2\">\n          {conflicts.length > 0 && (\n            <span className=\"text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-400\">\n              {conflicts.length} conflict(s) detected\n            </span>\n          )}\n          <button\n            className=\"text-sm font-medium px-4 py-1.5 rounded border transition-colors\"\n            style={{\n              borderColor: '#ef4444',\n              color: '#ef4444',\n              backgroundColor: 'transparent',\n            }}\n            onClick={handleDiscard}\n            onMouseEnter={(e) => {\n              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';\n            }}\n            onMouseLeave={(e) => {\n              e.currentTarget.style.backgroundColor = 'transparent';\n            }}\n          >\n            Discard All\n          </button>\n          <button\n            className=\"text-sm font-medium px-4 py-1.5 rounded transition-colors\"\n            style={{\n              backgroundColor: stats.newCards + stats.modifiedCards + stats.deletedCards > 0 ? '#22c55e' : '#374151',\n              color: 'white',\n              cursor: stats.newCards + stats.modifiedCards + stats.deletedCards > 0 ? 'pointer' : 'not-allowed',\n              opacity: stats.newCards + stats.modifiedCards + stats.deletedCards > 0 ? 1 : 0.5,\n            }}\n            disabled={stats.newCards + stats.modifiedCards + stats.deletedCards === 0}\n            onClick={() => setShowCommitConfirm(true)}\n          >\n            Commit Changes\n          </button>\n        </div>\n      </div>\n\n      {/* Commit confirmation dialog */}\n      {showCommitConfirm && (\n        <div className=\"px-4 py-3 border-b border-border bg-surface-800\">\n          <div className=\"flex items-center justify-between\">\n            <div>\n              <p className=\"text-sm text-text-primary font-medium\">Confirm commit?</p>\n              <p className=\"text-xs text-text-muted\">\n                This will apply {stats.newCards} new, {stats.modifiedCards} modified, and {stats.deletedCards} deleted card(s) to the main board.\n                {conflicts.length > 0 && ` ${conflicts.length} conflicted card(s) will be skipped.`}\n              </p>\n            </div>\n            <div className=\"flex gap-2\">\n              <button className=\"btn-ghost text-xs py-1 px-3\" onClick={() => setShowCommitConfirm(false)}>\n                Cancel\n              </button>\n              <button\n                className=\"text-xs font-medium py-1 px-3 rounded text-white\"\n                style={{ backgroundColor: '#22c55e' }}\n                onClick={handleCommit}\n              >\n                Yes, Commit\n              </button>\n            </div>\n          </div>\n        </div>\n      )}\n\n      {/* Sandbox workspace - column layout mirroring the main board */}\n      <div className=\"flex-1 overflow-x-auto overflow-y-hidden p-4\">\n        <div className=\"flex gap-4 h-full min-w-min\">\n          {columns.map((column) => {\n            const mainCards = mainCardsByColumn[column.id] ?? [];\n            const drafts = draftsByColumn[column.id] ?? [];\n            const deletedIds = new Set(sandboxDeletions);\n\n            return (\n              <div\n                key={column.id}\n                className=\"flex-shrink-0 w-[300px] flex flex-col rounded-lg border overflow-hidden\"\n                style={{\n                  borderColor: column.color ?? '#374151',\n                  backgroundColor: 'rgba(255,255,255,0.02)',\n                }}\n              >\n                {/* Column header */}\n                <div\n                  className=\"px-3 py-2 border-b flex items-center justify-between\"\n                  style={{\n                    borderColor: column.color ?? '#374151',\n                    backgroundColor: column.color ? `${column.color}15` : 'transparent',\n                  }}\n                >\n                  <div className=\"flex items-center gap-2\">\n                    {column.color && (\n                      <span\n                        className=\"w-2.5 h-2.5 rounded-full\"\n                        style={{ backgroundColor: column.color }}\n                      />\n                    )}\n                    <h3 className=\"text-sm font-semibold text-text-primary\">{column.title}</h3>\n                  </div>\n                  <span className=\"text-xs text-text-muted\">\n                    {mainCards.length} board · {drafts.length} draft\n                  </span>\n                </div>\n\n                {/* Cards area */}\n                <div className=\"flex-1 overflow-y-auto p-2 space-y-1\">\n                  {/* Main board cards (read-only with clone/delete actions) */}\n                  {mainCards.map((card) => {\n                    const isCloned = clonedOriginalIds.has(card.id);\n                    const isMarkedDeleted = deletedIds.has(card.id);\n\n                    return (\n                      <div\n                        key={card.id}\n                        className=\"rounded-lg border p-2.5 text-sm transition-all\"\n                        style={{\n                          borderColor: isMarkedDeleted ? '#ef4444' : '#374151',\n                          backgroundColor: isMarkedDeleted ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.03)',\n                          opacity: isMarkedDeleted ? 0.5 : 1,\n                          textDecoration: isMarkedDeleted ? 'line-through' : 'none',\n                        }}\n                      >\n                        <div className=\"flex items-start justify-between gap-2\">\n                          <div className=\"flex-1 min-w-0\">\n                            <p className=\"font-medium text-text-primary text-xs truncate\">{card.title}</p>\n                            {card.description && (\n                              <p className=\"text-xs text-text-muted mt-0.5 line-clamp-1\">{card.description}</p>\n                            )}\n                          </div>\n                          <span className=\"text-xs px-1.5 py-0.5 rounded bg-surface-700 text-text-muted whitespace-nowrap\">\n                            Board\n                          </span>\n                        </div>\n                        <div className=\"flex gap-1 mt-1.5\">\n                          {!isCloned && !isMarkedDeleted && (\n                            <button\n                              className=\"text-xs text-primary-400 hover:text-primary-300\"\n                              onClick={() => cloneCardToSandbox(card.id)}\n                            >\n                              Clone to Sandbox\n                            </button>\n                          )}\n                          {isCloned && !isMarkedDeleted && (\n                            <span className=\"text-xs text-green-400\">Cloned</span>\n                          )}\n                          {!isMarkedDeleted ? (\n                            <>\n                              <span className=\"text-text-muted text-xs\">·</span>\n                              <button\n                                className=\"text-xs text-error-400 hover:text-error-300\"\n                                onClick={() => markForDeletion(card.id)}\n                              >\n                                Mark Delete\n                              </button>\n                            </>\n                          ) : (\n                            <button\n                              className=\"text-xs text-green-400 hover:text-green-300\"\n                              onClick={() => unmarkForDeletion(card.id)}\n                            >\n                              Restore\n                            </button>\n                          )}\n                        </div>\n                      </div>\n                    );\n                  })}\n\n                  {/* Separator if both sections have content */}\n                  {mainCards.length > 0 && drafts.length > 0 && (\n                    <div className=\"flex items-center gap-2 py-2\">\n                      <div className=\"flex-1 border-t\" style={{ borderColor: '#f59e0b50' }} />\n                      <span className=\"text-xs font-medium\" style={{ color: '#f59e0b' }}>Sandbox Drafts</span>\n                      <div className=\"flex-1 border-t\" style={{ borderColor: '#f59e0b50' }} />\n                    </div>\n                  )}\n\n                  {/* Sandbox draft cards (editable) */}\n                  {drafts.map((draft) => (\n                    <SandboxCardEditor\n                      key={draft.id}\n                      draft={draft}\n                      onUpdate={handleUpdateDraft}\n                      onDelete={deleteSandboxDraft}\n                    />\n                  ))}\n\n                  {/* New card form */}\n                  {activeNewCardColumn === column.id ? (\n                    <SandboxNewCardForm\n                      columnId={column.id}\n                      onCreate={handleCreateCard}\n                      onCancel={() => setActiveNewCardColumn(null)}\n                    />\n                  ) : (\n                    <button\n                      className=\"w-full py-2 text-xs text-text-muted hover:text-green-400 border-2 border-dashed border-border hover:border-green-500/50 rounded-lg transition-colors\"\n                      onClick={() => setActiveNewCardColumn(column.id)}\n                    >\n                      + Add Sandbox Card\n                    </button>\n                  )}\n                </div>\n              </div>\n            );\n          })}\n        </div>\n      </div>\n\n      {/* Footer info bar */}\n      <div\n        className=\"px-4 py-2 border-t text-xs text-text-muted flex items-center justify-between\"\n        style={{ borderColor: '#f59e0b30', backgroundColor: 'rgba(245, 158, 11, 0.03)' }}\n      >\n        <span>\n          Sandbox changes are isolated — they won't affect the main board until committed.\n        </span>\n        <span>\n          {stats.totalDrafts} draft(s) in sandbox\n        </span>\n      </div>\n    </div>\n  );\n}\n\nexport default CardSandboxPanel;\n"
}
Now update the store to integrate the card sandbox slice:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create cardSandboxSlice.ts for isolated sandbox state",
      "status": "completed",
      "activeForm": "Creating card sandbox slice"
    },
    {
      "content": "Create CardSandboxPanel.tsx component",
      "status": "completed",
      "activeForm": "Creating sandbox panel component"
    },
    {
      "content": "Update store to include cardSandboxSlice",
      "status": "in_progress",
      "activeForm": "Updating store integration"
    },
    {
      "content": "Update KanbanBoard.tsx with sandbox toggle",
      "status": "pending",
      "activeForm": "Adding sandbox toggle to board"
    },
    {
      "content": "Update component and store exports",
      "status": "pending",
      "activeForm": "Updating exports"
    }
  ]
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\store\\slices\\index.ts",
  "old_string": "export { createSandboxSlice } from './sandboxSlice';\nexport type { SandboxSlice, SandboxActions } from './sandboxSlice';",
  "new_string": "export { createSandboxSlice } from './sandboxSlice';\nexport type { SandboxSlice, SandboxActions } from './sandboxSlice';\n\nexport { createCardSandboxSlice } from './cardSandboxSlice';\nexport type { CardSandboxSlice, CardSandboxActions } from './cardSandboxSlice';\nexport type { SandboxDraftCard, CommitResult } from './cardSandboxSlice';"
}
I already read it. Let me try again:

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\store\\slices\\index.ts"
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\store\\slices\\index.ts",
  "old_string": "export { createSandboxSlice } from './sandboxSlice';\nexport type { SandboxSlice, SandboxActions } from './sandboxSlice';",
  "new_string": "export { createSandboxSlice } from './sandboxSlice';\nexport type { SandboxSlice, SandboxActions } from './sandboxSlice';\n\nexport { createCardSandboxSlice } from './cardSandboxSlice';\nexport type { CardSandboxSlice, CardSandboxActions } from './cardSandboxSlice';\nexport type { SandboxDraftCard, CommitResult } from './cardSandboxSlice';"
}
Now update `boardStore.ts` to include the card sandbox slice:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\store\\boardStore.ts",
  "old_string": "import {\n  createProjectsSlice,\n  createColumnsSlice,\n  createCardsSlice,\n  createTemplatesSlice,\n  createSandboxSlice,\n  type ProjectsSlice,\n  type ColumnsSlice,\n  type CardsSlice,\n  type TemplatesSlice,\n  type SandboxSlice,\n} from './slices';",
  "new_string": "import {\n  createProjectsSlice,\n  createColumnsSlice,\n  createCardsSlice,\n  createTemplatesSlice,\n  createSandboxSlice,\n  createCardSandboxSlice,\n  type ProjectsSlice,\n  type ColumnsSlice,\n  type CardsSlice,\n  type TemplatesSlice,\n  type SandboxSlice,\n  type CardSandboxSlice,\n} from './slices';"
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\store\\boardStore.ts",
  "old_string": "export interface BoardStore extends ProjectsSlice, ColumnsSlice, CardsSlice, TemplatesSlice, SandboxSlice {",
  "new_string": "export interface BoardStore extends ProjectsSlice, ColumnsSlice, CardsSlice, TemplatesSlice, SandboxSlice, CardSandboxSlice {"
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\store\\boardStore.ts",
  "old_string": "  // Sandbox\n  cardLibrary: {},\n  microsettings: {},\n  activeMicrosettingId: null,\n};",
  "new_string": "  // Sandbox (Worldbuilding)\n  cardLibrary: {},\n  microsettings: {},\n  activeMicrosettingId: null,\n  // Card Sandbox\n  isSandboxActive: false,\n  sandboxDrafts: {},\n  sandboxDeletions: [],\n  sandboxProjectId: null,\n  sandboxSnapshot: null,\n};"
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\store\\boardStore.ts",
  "old_string": "        ...createSandboxSlice(immerSet, storeGet),\n\n        // Combined actions that span multiple slices",
  "new_string": "        ...createSandboxSlice(immerSet, storeGet),\n        ...createCardSandboxSlice(immerSet, storeGet),\n\n        // Combined actions that span multiple slices"
}
Now update KanbanBoard.tsx to add the sandbox toggle:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create cardSandboxSlice.ts for isolated sandbox state",
      "status": "completed",
      "activeForm": "Creating card sandbox slice"
    },
    {
      "content": "Create CardSandboxPanel.tsx component",
      "status": "completed",
      "activeForm": "Creating sandbox panel component"
    },
    {
      "content": "Update store to include cardSandboxSlice",
      "status": "completed",
      "activeForm": "Updating store integration"
    },
    {
      "content": "Update KanbanBoard.tsx with sandbox toggle",
      "status": "in_progress",
      "activeForm": "Adding sandbox toggle to board"
    },
    {
      "content": "Update component and store exports",
      "status": "pending",
      "activeForm": "Updating exports"
    }
  ]
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\KanbanBoard.tsx",
  "old_string": "import { useMemo, useCallback, useState } from 'react';\nimport type { DragEndEvent, DragOverEvent, DragStartEvent, UniqueIdentifier } from '@dnd-kit/core';\nimport { useBoardStore } from '@/store';\nimport { DragDropProvider } from './DragDropContext';\nimport { DroppableColumn } from './DroppableColumn';\nimport { AddColumnDialog } from './AddColumnDialog';\nimport { CardFormDialog, type CardFormData } from './CardFormDialog';\nimport { CardDeleteConfirmation } from './CardDeleteConfirmation';\nimport { SaveAsTemplateDialog } from './SaveAsTemplateDialog';\nimport { KeywordFilterBar } from './KeywordFilterBar';\nimport { useKeywordFilter } from '@/hooks/useKeywordFilter';\nimport type { ColumnId, Column, Card, CardId, TemplateCategory } from '@/types';",
  "new_string": "import { useMemo, useCallback, useState } from 'react';\nimport type { DragEndEvent, DragOverEvent, DragStartEvent, UniqueIdentifier } from '@dnd-kit/core';\nimport { useBoardStore } from '@/store';\nimport { DragDropProvider } from './DragDropContext';\nimport { DroppableColumn } from './DroppableColumn';\nimport { AddColumnDialog } from './AddColumnDialog';\nimport { CardFormDialog, type CardFormData } from './CardFormDialog';\nimport { CardDeleteConfirmation } from './CardDeleteConfirmation';\nimport { SaveAsTemplateDialog } from './SaveAsTemplateDialog';\nimport { KeywordFilterBar } from './KeywordFilterBar';\nimport { CardSandboxPanel } from './CardSandboxPanel';\nimport { useKeywordFilter } from '@/hooks/useKeywordFilter';\nimport type { ColumnId, Column, Card, CardId, TemplateCategory } from '@/types';"
}
Now add the sandbox state and toggle button in the component. I need to add sandbox-related store selectors and the toggle logic:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\KanbanBoard.tsx",
  "old_string": "  // Drag state for dnd-kit\n  const [activeCardId, setActiveCardId] = useState<UniqueIdentifier | null>(null);\n  const [overColumnId, setOverColumnId] = useState<ColumnId | null>(null);",
  "new_string": "  // Drag state for dnd-kit\n  const [activeCardId, setActiveCardId] = useState<UniqueIdentifier | null>(null);\n  const [overColumnId, setOverColumnId] = useState<ColumnId | null>(null);\n\n  // Card Sandbox state\n  const isSandboxActive = useBoardStore((state) => state.isSandboxActive);\n  const enterCardSandbox = useBoardStore((state) => state.enterCardSandbox);\n  const exitCardSandbox = useBoardStore((state) => state.exitCardSandbox);"
}
Now add the sandbox toggle button to the board header and render the sandbox panel when active. I'll add the toggle button next to the "+ Add Column" button:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\KanbanBoard.tsx",
  "old_string": "          {/* Board actions */}\n          <div className=\"flex items-center gap-2\">\n            <button\n              className=\"btn-ghost text-sm\"\n              data-testid=\"add-column-btn\"\n              onClick={handleOpenAddColumnDialog}\n            >\n              + Add Column\n            </button>\n          </div>",
  "new_string": "          {/* Board actions */}\n          <div className=\"flex items-center gap-2\">\n            <button\n              className=\"text-sm font-medium px-3 py-1.5 rounded border transition-colors\"\n              data-testid=\"toggle-card-sandbox-btn\"\n              style={{\n                borderColor: isSandboxActive ? '#f59e0b' : '#374151',\n                color: isSandboxActive ? '#f59e0b' : '#9ca3af',\n                backgroundColor: isSandboxActive ? 'rgba(245, 158, 11, 0.1)' : 'transparent',\n              }}\n              onClick={() => {\n                if (isSandboxActive) {\n                  exitCardSandbox();\n                } else {\n                  enterCardSandbox();\n                }\n              }}\n              title={isSandboxActive ? 'Exit sandbox mode' : 'Enter sandbox mode to experiment with cards'}\n            >\n              {isSandboxActive ? 'Exit Sandbox' : 'Enter Sandbox'}\n            </button>\n            <button\n              className=\"btn-ghost text-sm\"\n              data-testid=\"add-column-btn\"\n              onClick={handleOpenAddColumnDialog}\n            >\n              + Add Column\n            </button>\n          </div>"
}
Now add the sandbox panel rendering when sandbox is active. I'll add it right after the board header and before the columns container, replacing the columns when active:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\KanbanBoard.tsx",
  "old_string": "        {/* Keyword Filter Bar */}\n        {allProjectCards.length > 0 && (",
  "new_string": "        {/* Card Sandbox Panel - replaces main board content when active */}\n        {isSandboxActive && (\n          <CardSandboxPanel\n            onExit={() => exitCardSandbox()}\n          />\n        )}\n\n        {/* Keyword Filter Bar */}\n        {!isSandboxActive && allProjectCards.length > 0 && ("
}
Now wrap the main columns container and dialogs in a `!isSandboxActive` check:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\KanbanBoard.tsx",
  "old_string": "        {/* Columns Container - Responsive Flexbox Layout with dnd-kit */}\n        <div",
  "new_string": "        {/* Columns Container - Responsive Flexbox Layout with dnd-kit */}\n        {!isSandboxActive && <div"
}
I need to see the exact structure around the columns container end to properly close the conditional. Let me read that section:

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\KanbanBoard.tsx",
  "offset": 530,
  "limit": 100
}
I need to close the `{!isSandboxActive &&` properly. The columns container `<div>` ends at line 616. Let me fix this:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\KanbanBoard.tsx",
  "old_string": "          </div>\n        </div>\n\n        {/* Add Column Dialog */}",
  "new_string": "          </div>\n        </div>}\n\n        {/* Add Column Dialog */}"
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\KanbanBoard.tsx",
  "old_string": "                <p className=\"text-sm\">Add Column</p>\n              </div>\n            </div>\n          </div>\n        </div>\n\n        {/* Add Column Dialog */}",
  "new_string": "                <p className=\"text-sm\">Add Column</p>\n              </div>\n            </div>\n          </div>\n        </div>}\n\n        {/* Add Column Dialog */}"
}
Now update the component exports:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create cardSandboxSlice.ts for isolated sandbox state",
      "status": "completed",
      "activeForm": "Creating card sandbox slice"
    },
    {
      "content": "Create CardSandboxPanel.tsx component",
      "status": "completed",
      "activeForm": "Creating sandbox panel component"
    },
    {
      "content": "Update store to include cardSandboxSlice",
      "status": "completed",
      "activeForm": "Updating store integration"
    },
    {
      "content": "Update KanbanBoard.tsx with sandbox toggle",
      "status": "completed",
      "activeForm": "Adding sandbox toggle to board"
    },
    {
      "content": "Update component and store exports",
      "status": "in_progress",
      "activeForm": "Updating exports"
    }
  ]
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\index.ts",
  "old_string": "// Worldbuilding Sandbox Components",
  "new_string": "// Card Sandbox Components\nexport { CardSandboxPanel } from './CardSandboxPanel';\nexport type { CardSandboxPanelProps } from './CardSandboxPanel';\n\n// Worldbuilding Sandbox Components"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\index.ts"
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\index.ts",
  "old_string": "// Worldbuilding Sandbox Components",
  "new_string": "// Card Sandbox Components\nexport { CardSandboxPanel } from './CardSandboxPanel';\nexport type { CardSandboxPanelProps } from './CardSandboxPanel';\n\n// Worldbuilding Sandbox Components"
}
Now let me verify the build compiles:

🔧 Tool: Bash
Input: {
  "command": "cd /c/automaker/storymaker && npx tsc --noEmit 2>&1 | head -60",
  "description": "TypeScript type check",
  "timeout": 60000
}
The first two errors are pre-existing. The third is because `initialState` now includes more fields and the cast complains. Let me fix it the same way it was done before — the original code already had `as BoardStore`:

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\store\\boardStore.ts",
  "offset": 85,
  "limit": 5
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\store\\boardStore.ts",
  "old_string": "          set(() => initialState as BoardStore);",
  "new_string": "          set(() => initialState as unknown as BoardStore);"
}

🔧 Tool: Bash
Input: {
  "command": "cd /c/automaker/storymaker && npx tsc --noEmit 2>&1 | grep -v \"CardLibraryDrawer\\|DroppableColumn\" | head -30",
  "description": "TypeScript check excluding pre-existing errors",
  "timeout": 60000
}
No new TypeScript errors. Let me finalize:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create cardSandboxSlice.ts for isolated sandbox state",
      "status": "completed",
      "activeForm": "Creating card sandbox slice"
    },
    {
      "content": "Create CardSandboxPanel.tsx component",
      "status": "completed",
      "activeForm": "Creating sandbox panel component"
    },
    {
      "content": "Update store to include cardSandboxSlice",
      "status": "completed",
      "activeForm": "Updating store integration"
    },
    {
      "content": "Update KanbanBoard.tsx with sandbox toggle",
      "status": "completed",
      "activeForm": "Adding sandbox toggle to board"
    },
    {
      "content": "Update component and store exports",
      "status": "completed",
      "activeForm": "Updating exports"
    }
  ]
}
<summary>
## Summary: Integrate Card Sandbox Feature into Existing Board Tab

### Changes Implemented
- **Card Sandbox Slice** (`cardSandboxSlice.ts`): Full isolated state management for sandbox mode including:
  - Enter/exit sandbox with snapshot-based conflict detection
  - Clone existing board cards into sandbox for editing
  - Create, update, delete draft cards in isolation
  - Mark/unmark board cards for deletion on commit
  - Commit changes to main board (creates new cards, updates modified, deletes marked)
  - Conflict detection comparing card timestamps against snapshot taken at sandbox entry
  - Statistics tracking (new/modified/deleted counts)

- **Card Sandbox Panel** (`CardSandboxPanel.tsx`): Complete sandbox UI with:
  - Distinct amber/yellow visual indicators showing sandbox mode is active (pulsing dot, gradient header)
  - Column-mirrored layout showing both main board cards (read-only) and sandbox drafts (editable)
  - Inline card editor with status badges (New/Modified/Cloned)
  - Clone board cards to sandbox, mark for deletion, restore
  - Create new sandbox draft cards per column
  - Commit confirmation dialog with change summary
  - Conflict warning display
  - Discard all changes button
  - Footer info bar explaining sandbox isolation

- **KanbanBoard Integration**: Added "Enter Sandbox" / "Exit Sandbox" toggle button in the board header. When sandbox is active, the main board columns and filters are hidden and replaced with the sandbox panel.

- **Store Integration**: Card sandbox slice wired into the main Zustand board store with all state and actions available globally.

### Files Modified
- `src/store/slices/cardSandboxSlice.ts` (NEW) - Sandbox state management slice
- `src/components/CardSandboxPanel.tsx` (NEW) - Sandbox UI panel component
- `src/store/slices/index.ts` - Added cardSandboxSlice exports
- `src/store/boardStore.ts` - Integrated CardSandboxSlice into BoardStore
- `src/components/KanbanBoard.tsx` - Added sandbox toggle and panel rendering
- `src/components/index.ts` - Added CardSandboxPanel export

### Notes for Developer
- Pre-existing TypeScript errors in `CardLibraryDrawer.tsx` and `DroppableColumn.tsx` are unrelated to this feature
- Conflict detection compares `updatedAt` timestamps; conflicted cards are skipped during commit
- Navigation away while in sandbox mode preserves sandbox state in the store (persisted via existing auto-save)
- The sandbox panel uses the same column structure as the main board for visual consistency
- The `resetStore()` action properly clears sandbox state along with everything else
</summary>