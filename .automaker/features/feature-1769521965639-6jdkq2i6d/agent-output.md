

I'll start by exploring the codebase to understand the existing structure.

🔧 Tool: Bash
Input: {
  "command": "find /home/user -type f -name \"*.ts\" -o -name \"*.tsx\" -o -name \"*.js\" -o -name \"*.jsx\" | head -80",
  "description": "List project files"
}

🔧 Tool: Bash
Input: {
  "command": "ls /home/user/",
  "description": "List home directory"
}

🔧 Tool: Bash
Input: {
  "command": "pwd && ls",
  "description": "Find current directory"
}

🔧 Tool: Bash
Input: {
  "command": "ls src/",
  "description": "List src directory"
}

🔧 Tool: Task
Input: {
  "subagent_type": "Explore",
  "description": "Explore codebase structure",
  "prompt": "Thoroughly explore this codebase to understand:\n1. The full directory structure under src/\n2. What \"Board tab\" and \"Sandbox tab\" are - find their components\n3. What \"card library\" means in this context\n4. How data flows between tabs (store, services, types)\n5. Read all key files: App.tsx, store files, type files, and any components related to Board, Sandbox, Card\n\nBe very thorough - read all relevant files completely. I need to understand how to wire data from the Sandbox tab's card library to the Board tab."
}

🔧 Tool: Bash
Input: {
  "command": "find \"C:\\automaker\\storymaker\\src\" -type f -name \"*.ts\" -o -name \"*.tsx\" -o -name \"*.json\" | head -50",
  "description": "Find all TypeScript and JSON files in src/"
}

🔧 Tool: Glob
Input: {
  "pattern": "C:\\automaker\\storymaker\\src\\**\\*"
}

🔧 Tool: Bash
Input: {
  "command": "find \"C:\\automaker\\storymaker\\src\" -type f \\( -name \"*.ts\" -o -name \"*.tsx\" \\) | sort",
  "description": "List all TypeScript files in src/"
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
  "file_path": "C:\\automaker\\storymaker\\src\\store\\index.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\store\\boardStore.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\store\\slices\\cardSandboxSlice.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\store\\slices\\sandboxSlice.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\types\\sandbox.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\WorldbuildingSandbox.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\CardLibraryDrawer.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\store\\slices\\cardsSlice.ts",
  "limit": 150
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\KanbanBoard.tsx",
  "limit": 100
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\CardPoolSidebar.tsx",
  "limit": 100
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\CardSandboxPanel.tsx"
}
Now let me read the key files to implement the wiring:

🔧 Tool: Read
Input: {
  "file_path": "/c/automaker/storymaker/src/components/KanbanBoard.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/c/automaker/storymaker/src/components/CardLibraryDrawer.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/c/automaker/storymaker/src/store/slices/sandboxSlice.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/c/automaker/storymaker/src/types/sandbox.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/c/automaker/storymaker/src/App.tsx"
}
The paths use Windows format. Let me find the correct paths:

🔧 Tool: Glob
Input: {
  "pattern": "src/**/*.tsx"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/**/*.ts"
}
Now let me read the key files:

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\App.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\KanbanBoard.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\store\\slices\\sandboxSlice.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\types\\sandbox.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\types\\index.ts"
}
Now let me read the remaining key files:

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\CardPoolSidebar.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\WorldbuildingSandbox.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\store\\boardStore.ts"
}
Now I understand the full picture. The Board tab needs to show the sandbox card library. I need to:

1. Add a "Card Library" section/panel to the KanbanBoard that shows sandbox cards created in the Sandbox tab
2. Allow exporting sandbox cards/microsettings to the board as regular cards

Let me also check the component index to understand exports:

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\index.ts"
}
Now I have a clear understanding. The feature request is: "Board tab should have 'card library' that created from sandbox tab." This means the Board tab needs to display the sandbox card library (cards created in the Sandbox tab) so users can import/use them on the board.

I'll implement:
1. A new `SandboxCardLibraryPanel` component that shows sandbox cards in the Board tab
2. Ability to import sandbox cards as board cards into a column
3. Wire it into the KanbanBoard

🔧 Tool: Write
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\SandboxCardLibraryPanel.tsx",
  "content": "/**\n * SandboxCardLibraryPanel Component\n * Displays the sandbox card library within the Board tab,\n * allowing users to import worldbuilding cards created in the Sandbox\n * as regular board cards into a selected column.\n */\nimport { useState, useMemo, useCallback } from 'react';\nimport { useBoardStore } from '@/store';\nimport { WorldbuildingCard } from './WorldbuildingCard';\nimport { WORLDBUILDING_CARD_TYPES, type WorldbuildingCardType, type ColumnId } from '@/types';\nimport type { SandboxCard } from '@/types/sandbox';\n\nexport interface SandboxCardLibraryPanelProps {\n  /** Called when panel is closed */\n  onClose: () => void;\n}\n\nexport function SandboxCardLibraryPanel({ onClose }: SandboxCardLibraryPanelProps): JSX.Element {\n  const cardLibrary = useBoardStore((s) => s.cardLibrary);\n  const columns = useBoardStore((s) => s.columns);\n  const activeProjectId = useBoardStore((s) => s.activeProjectId);\n  const createCard = useBoardStore((s) => s.createCard);\n  const microsettings = useBoardStore((s) => s.microsettings);\n  const createColumn = useBoardStore((s) => s.createColumn);\n\n  const [search, setSearch] = useState('');\n  const [activeFilter, setActiveFilter] = useState<WorldbuildingCardType | null>(null);\n  const [targetColumnId, setTargetColumnId] = useState<ColumnId | ''>('');\n  const [importedCardIds, setImportedCardIds] = useState<Set<string>>(new Set());\n  const [importMode, setImportMode] = useState<'cards' | 'microsetting'>('cards');\n\n  // Get columns for the active project\n  const projectColumns = useMemo(() => {\n    if (!activeProjectId) return [];\n    return Object.values(columns)\n      .filter((col) => col.projectId === activeProjectId)\n      .sort((a, b) => a.position - b.position);\n  }, [activeProjectId, columns]);\n\n  // Filter cards\n  const filteredCards = useMemo(() => {\n    let list = Object.values(cardLibrary);\n    if (activeFilter) {\n      list = list.filter((c) => c.category === activeFilter);\n    }\n    if (search.trim()) {\n      const q = search.toLowerCase();\n      list = list.filter(\n        (c) =>\n          c.title.toLowerCase().includes(q) || c.cue.toLowerCase().includes(q)\n      );\n    }\n    return list.sort((a, b) => a.title.localeCompare(b.title));\n  }, [cardLibrary, activeFilter, search]);\n\n  const microsettingList = useMemo(\n    () => Object.values(microsettings).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),\n    [microsettings]\n  );\n\n  const cardCount = Object.keys(cardLibrary).length;\n\n  // Import a single sandbox card to the board\n  const handleImportCard = useCallback(\n    (card: SandboxCard) => {\n      if (!activeProjectId || !targetColumnId) return;\n\n      const typeMeta = WORLDBUILDING_CARD_TYPES.find((t) => t.type === card.category);\n\n      createCard({\n        projectId: activeProjectId,\n        columnId: targetColumnId,\n        title: card.title,\n        description: card.cue,\n        priority: 'medium',\n        tags: ['worldbuilding', card.category],\n        worldbuilding: {\n          cardType: card.category,\n          cues: [{ text: card.cue }],\n        },\n      });\n\n      setImportedCardIds((prev) => new Set(prev).add(card.id));\n    },\n    [activeProjectId, targetColumnId, createCard]\n  );\n\n  // Import an entire microsetting as a new column with cards\n  const handleImportMicrosetting = useCallback(\n    (microsettingId: string) => {\n      if (!activeProjectId) return;\n\n      const ms = microsettings[microsettingId];\n      if (!ms) return;\n\n      // Create a new column for the microsetting\n      const columnId = createColumn({\n        projectId: activeProjectId,\n        title: ms.name,\n        color: '#8b5cf6',\n      });\n\n      // Import region card\n      if (ms.regionCardId) {\n        const regionCard = cardLibrary[ms.regionCardId];\n        if (regionCard) {\n          createCard({\n            projectId: activeProjectId,\n            columnId,\n            title: `${regionCard.title}`,\n            description: regionCard.cue,\n            priority: 'high',\n            tags: ['worldbuilding', 'region'],\n            worldbuilding: {\n              cardType: 'region',\n              cues: [{ text: regionCard.cue }],\n            },\n          });\n        }\n      }\n\n      // Import tucked cards\n      for (const tucked of ms.tuckedCards) {\n        const card = cardLibrary[tucked.cardId];\n        if (card) {\n          createCard({\n            projectId: activeProjectId,\n            columnId,\n            title: card.title,\n            description: card.cue,\n            priority: 'medium',\n            tags: ['worldbuilding', card.category],\n            worldbuilding: {\n              cardType: card.category,\n              cues: [{ text: card.cue }],\n            },\n          });\n        }\n      }\n    },\n    [activeProjectId, microsettings, cardLibrary, createColumn, createCard]\n  );\n\n  return (\n    <div\n      className=\"fixed inset-y-0 right-0 w-80 bg-surface-900 border-l border-border shadow-xl z-50 flex flex-col\"\n      data-testid=\"sandbox-card-library-panel\"\n    >\n      {/* Header */}\n      <div className=\"p-4 border-b border-border\">\n        <div className=\"flex items-center justify-between mb-3\">\n          <h3 className=\"text-sm font-bold text-text-primary\">\n            Sandbox Card Library\n          </h3>\n          <button\n            className=\"w-6 h-6 rounded-full bg-surface-700 hover:bg-surface-600 text-text-muted text-xs flex items-center justify-center\"\n            onClick={onClose}\n            data-testid=\"close-sandbox-library-btn\"\n          >\n            ✕\n          </button>\n        </div>\n\n        {/* Import mode toggle */}\n        <div className=\"flex gap-1 mb-3\">\n          <button\n            className={`text-xs px-3 py-1.5 rounded transition-colors flex-1 ${\n              importMode === 'cards'\n                ? 'bg-primary-500 text-white'\n                : 'bg-surface-700 text-text-muted hover:bg-surface-600'\n            }`}\n            onClick={() => setImportMode('cards')}\n          >\n            Cards ({cardCount})\n          </button>\n          <button\n            className={`text-xs px-3 py-1.5 rounded transition-colors flex-1 ${\n              importMode === 'microsetting'\n                ? 'bg-primary-500 text-white'\n                : 'bg-surface-700 text-text-muted hover:bg-surface-600'\n            }`}\n            onClick={() => setImportMode('microsetting')}\n          >\n            Microsettings ({microsettingList.length})\n          </button>\n        </div>\n\n        {cardCount === 0 && importMode === 'cards' && (\n          <p className=\"text-xs text-text-muted\">\n            No cards in the library yet. Create cards in the Sandbox tab first.\n          </p>\n        )}\n      </div>\n\n      {importMode === 'cards' ? (\n        <>\n          {/* Target column selector */}\n          {cardCount > 0 && (\n            <div className=\"px-4 py-2 border-b border-border\">\n              <label className=\"text-xs text-text-muted block mb-1\">\n                Import to column:\n              </label>\n              <select\n                className=\"input text-sm w-full\"\n                value={targetColumnId}\n                onChange={(e) => setTargetColumnId(e.target.value)}\n                data-testid=\"import-target-column\"\n              >\n                <option value=\"\">Select column...</option>\n                {projectColumns.map((col) => (\n                  <option key={col.id} value={col.id}>\n                    {col.title}\n                  </option>\n                ))}\n              </select>\n            </div>\n          )}\n\n          {/* Search and filter */}\n          {cardCount > 0 && (\n            <div className=\"px-4 py-2 border-b border-border\">\n              <input\n                type=\"text\"\n                className=\"input text-sm w-full mb-2\"\n                placeholder=\"Search cards...\"\n                value={search}\n                onChange={(e) => setSearch(e.target.value)}\n              />\n              <div className=\"flex flex-wrap gap-1\">\n                <button\n                  className={`text-xs px-2 py-0.5 rounded-full transition-colors ${\n                    activeFilter === null\n                      ? 'bg-primary-500 text-white'\n                      : 'bg-surface-700 text-text-muted hover:bg-surface-600'\n                  }`}\n                  onClick={() => setActiveFilter(null)}\n                >\n                  All\n                </button>\n                {WORLDBUILDING_CARD_TYPES.map((t) => (\n                  <button\n                    key={t.type}\n                    className={`text-xs px-2 py-0.5 rounded-full transition-colors ${\n                      activeFilter === t.type\n                        ? 'text-white'\n                        : 'bg-surface-700 text-text-muted hover:bg-surface-600'\n                    }`}\n                    style={activeFilter === t.type ? { backgroundColor: t.color } : undefined}\n                    onClick={() => setActiveFilter(activeFilter === t.type ? null : t.type)}\n                  >\n                    {t.icon} {t.label}\n                  </button>\n                ))}\n              </div>\n            </div>\n          )}\n\n          {/* Card list */}\n          <div className=\"flex-1 overflow-y-auto p-3 space-y-2\">\n            {filteredCards.length === 0 && cardCount > 0 && (\n              <div className=\"text-center text-text-muted text-sm py-8\">\n                No cards match your search.\n              </div>\n            )}\n            {filteredCards.map((card) => (\n              <div key={card.id} className=\"group relative\">\n                <WorldbuildingCard card={card} compact />\n                <div className=\"mt-1\">\n                  <button\n                    className={`w-full text-xs py-1 rounded transition-colors ${\n                      importedCardIds.has(card.id)\n                        ? 'bg-success-500/20 text-success-400 cursor-default'\n                        : !targetColumnId\n                        ? 'bg-surface-700 text-text-muted cursor-not-allowed'\n                        : 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 cursor-pointer'\n                    }`}\n                    onClick={() => handleImportCard(card)}\n                    disabled={!targetColumnId || importedCardIds.has(card.id)}\n                    data-testid={`import-card-${card.id}`}\n                  >\n                    {importedCardIds.has(card.id)\n                      ? '✓ Imported'\n                      : !targetColumnId\n                      ? 'Select a column first'\n                      : 'Import to Board'}\n                  </button>\n                </div>\n              </div>\n            ))}\n          </div>\n        </>\n      ) : (\n        /* Microsettings list */\n        <div className=\"flex-1 overflow-y-auto p-3 space-y-3\">\n          {microsettingList.length === 0 && (\n            <div className=\"text-center text-text-muted text-sm py-8\">\n              No microsettings yet. Create them in the Sandbox tab.\n            </div>\n          )}\n          {microsettingList.map((ms) => {\n            const regionCard = ms.regionCardId ? cardLibrary[ms.regionCardId] : null;\n            const tuckedCount = ms.tuckedCards.length;\n            return (\n              <div\n                key={ms.id}\n                className=\"p-3 bg-surface-800 rounded-lg border border-border\"\n              >\n                <h4 className=\"text-sm font-semibold text-text-primary mb-1\">{ms.name}</h4>\n                <div className=\"text-xs text-text-muted space-y-0.5 mb-2\">\n                  {regionCard && (\n                    <p>\n                      <span className=\"text-text-secondary\">Region:</span> {regionCard.title}\n                    </p>\n                  )}\n                  <p>\n                    <span className=\"text-text-secondary\">Cards:</span>{' '}\n                    {tuckedCount + (regionCard ? 1 : 0)} total\n                  </p>\n                </div>\n                <button\n                  className=\"w-full text-xs py-1.5 rounded bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors\"\n                  onClick={() => handleImportMicrosetting(ms.id)}\n                  data-testid={`import-microsetting-${ms.id}`}\n                >\n                  Import as New Column\n                </button>\n              </div>\n            );\n          })}\n        </div>\n      )}\n    </div>\n  );\n}\n"
}
Now wire it into the KanbanBoard component:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\KanbanBoard.tsx",
  "old_string": "import { CardSandboxPanel } from './CardSandboxPanel';\nimport { useKeywordFilter } from '@/hooks/useKeywordFilter';",
  "new_string": "import { CardSandboxPanel } from './CardSandboxPanel';\nimport { SandboxCardLibraryPanel } from './SandboxCardLibraryPanel';\nimport { useKeywordFilter } from '@/hooks/useKeywordFilter';"
}
Add state for the sandbox card library panel:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\KanbanBoard.tsx",
  "old_string": "  // Card Sandbox state\n  const isSandboxActive = useBoardStore((state) => state.isSandboxActive);",
  "new_string": "  // Sandbox card library panel state\n  const [showSandboxLibrary, setShowSandboxLibrary] = useState(false);\n  const cardLibraryCount = useBoardStore((state) => Object.keys(state.cardLibrary).length);\n\n  // Card Sandbox state\n  const isSandboxActive = useBoardStore((state) => state.isSandboxActive);"
}
Add the button in the board header and the panel in the render:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\KanbanBoard.tsx",
  "old_string": "            <button\n              className=\"btn-ghost text-sm\"\n              data-testid=\"add-column-btn\"\n              onClick={handleOpenAddColumnDialog}\n            >\n              + Add Column\n            </button>",
  "new_string": "            <button\n              className=\"text-sm font-medium px-3 py-1.5 rounded border transition-colors\"\n              data-testid=\"toggle-sandbox-library-btn\"\n              style={{\n                borderColor: showSandboxLibrary ? '#8b5cf6' : '#374151',\n                color: showSandboxLibrary ? '#8b5cf6' : '#9ca3af',\n                backgroundColor: showSandboxLibrary ? 'rgba(139, 92, 246, 0.1)' : 'transparent',\n              }}\n              onClick={() => setShowSandboxLibrary(!showSandboxLibrary)}\n              title=\"Open sandbox card library to import worldbuilding cards\"\n            >\n              Card Library {cardLibraryCount > 0 && `(${cardLibraryCount})`}\n            </button>\n            <button\n              className=\"btn-ghost text-sm\"\n              data-testid=\"add-column-btn\"\n              onClick={handleOpenAddColumnDialog}\n            >\n              + Add Column\n            </button>"
}
Now add the panel rendering before the closing `</div>` of the DragDropProvider:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\KanbanBoard.tsx",
  "old_string": "        {/* Save As Template Dialog */}\n        {cardForTemplate && (\n          <SaveAsTemplateDialog\n            isOpen={isSaveTemplateDialogOpen}\n            onClose={handleCloseSaveAsTemplate}\n            card={cardForTemplate}\n            onSave={handleSaveAsTemplate}\n          />\n        )}\n      </div>\n    </DragDropProvider>",
  "new_string": "        {/* Save As Template Dialog */}\n        {cardForTemplate && (\n          <SaveAsTemplateDialog\n            isOpen={isSaveTemplateDialogOpen}\n            onClose={handleCloseSaveAsTemplate}\n            card={cardForTemplate}\n            onSave={handleSaveAsTemplate}\n          />\n        )}\n\n        {/* Sandbox Card Library Panel */}\n        {showSandboxLibrary && (\n          <SandboxCardLibraryPanel\n            onClose={() => setShowSandboxLibrary(false)}\n          />\n        )}\n      </div>\n    </DragDropProvider>"
}
Now add the export to the components index:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\index.ts",
  "old_string": "// Worldbuilding Sandbox Components",
  "new_string": "// Sandbox Card Library (Board integration)\nexport { SandboxCardLibraryPanel } from './SandboxCardLibraryPanel';\nexport type { SandboxCardLibraryPanelProps } from './SandboxCardLibraryPanel';\n\n// Worldbuilding Sandbox Components"
}
Now let's verify the build compiles:

🔧 Tool: Bash
Input: {
  "command": "cd /c/automaker/storymaker && npx tsc --noEmit 2>&1 | head -40",
  "description": "Type check the project",
  "timeout": 60000
}
The first two errors are pre-existing. Let me fix my error:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\SandboxCardLibraryPanel.tsx",
  "old_string": "      const typeMeta = WORLDBUILDING_CARD_TYPES.find((t) => t.type === card.category);\n\n      createCard({",
  "new_string": "      createCard({"
}

🔧 Tool: Bash
Input: {
  "command": "cd /c/automaker/storymaker && npx tsc --noEmit 2>&1 | grep SandboxCardLibrary",
  "description": "Check for remaining errors",
  "timeout": 60000
}
No errors in my new code. The build is clean for our changes.

<summary>
## Summary: Data Wiring - Board Tab Card Library from Sandbox

### Changes Implemented
- Created `SandboxCardLibraryPanel` component that displays the sandbox card library within the Board tab
- The panel shows all worldbuilding cards created in the Sandbox tab, with search and category filtering
- Users can import individual sandbox cards into any board column as regular story cards (with worldbuilding metadata preserved)
- Users can import entire microsettings as new columns with all their cards (region + tucked cards)
- Added "Card Library" button to the Board header toolbar showing the count of available sandbox cards
- Panel has two modes: "Cards" (individual card import) and "Microsettings" (import whole microsetting as column)

### Files Modified
- `src/components/SandboxCardLibraryPanel.tsx` — **NEW** - Slide-out panel showing sandbox card library with import functionality
- `src/components/KanbanBoard.tsx` — Added Card Library button to board header, integrated SandboxCardLibraryPanel, added state for panel visibility
- `src/components/index.ts` — Added export for new SandboxCardLibraryPanel component

### Notes for Developer
- The Card Library button appears in the Board tab's header toolbar, next to the "Enter Sandbox" and "+ Add Column" buttons
- When importing individual cards, users must first select a target column from the dropdown
- When importing a microsetting, a new column is automatically created with the microsetting's name
- Imported cards include worldbuilding metadata (`worldbuilding` field) with the card type and cue, plus tags for filtering
- Cards that have already been imported show a "✓ Imported" state to prevent accidental duplicates (per session)
- Pre-existing TypeScript errors in `CardLibraryDrawer.tsx` and `DroppableColumn.tsx` are unrelated to this change
</summary>

---

## Follow-up Session



Let me start by understanding the current state of the code.

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\SandboxCardLibraryPanel.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\KanbanBoard.tsx"
}
Now let me check the drag-and-drop system to understand how it works:

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\DragDropContext.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\DroppableColumn.tsx"
}
Now let me check the SortableCard and WorldbuildingCard components:

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\SortableCard.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\WorldbuildingCard.tsx",
  "limit": 30
}
Now I understand the architecture. The current `SandboxCardLibraryPanel` uses button-click import. The request is to enable **drag from card library and drop into columns**. 

The challenge: the `DragDropProvider` wraps the board with a `DndContext`, and the card library panel is inside it. I need to make library cards draggable with a special data type, and handle them in `handleDragEnd` to create new board cards on drop.

Let me implement this:

1. Make library cards draggable in `SandboxCardLibraryPanel` 
2. Update `handleDragEnd` in `KanbanBoard` to handle sandbox card drops
3. Show drag overlay for sandbox cards too

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\types\\sandbox.ts"
}
Now I have the full picture. Let me implement drag-and-drop from the card library to the board columns.

**Plan:**
1. Create a `DraggableLibraryCard` component that uses `useDraggable` from dnd-kit with `type: 'sandbox-card'` data
2. Update `SandboxCardLibraryPanel` to use draggable cards (remove the button-click import for cards, replace with drag)
3. Update `KanbanBoard.handleDragEnd` to handle `sandbox-card` type drops
4. Update `DragDropContext` to also show overlay for sandbox cards

🔧 Tool: Write
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\DraggableLibraryCard.tsx",
  "content": "/**\n * DraggableLibraryCard Component\n * A card from the sandbox card library that can be dragged onto board columns.\n * Uses dnd-kit's useDraggable hook.\n */\nimport { useDraggable } from '@dnd-kit/core';\nimport { CSS } from '@dnd-kit/utilities';\nimport { WorldbuildingCard } from './WorldbuildingCard';\nimport type { SandboxCard } from '@/types/sandbox';\n\ninterface DraggableLibraryCardProps {\n  card: SandboxCard;\n}\n\nexport function DraggableLibraryCard({ card }: DraggableLibraryCardProps): JSX.Element {\n  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({\n    id: `library-${card.id}`,\n    data: {\n      type: 'sandbox-card',\n      sandboxCard: card,\n    },\n  });\n\n  const style = {\n    transform: CSS.Translate.toString(transform),\n    opacity: isDragging ? 0.4 : 1,\n    cursor: isDragging ? 'grabbing' : 'grab',\n  };\n\n  return (\n    <div\n      ref={setNodeRef}\n      style={style}\n      {...attributes}\n      {...listeners}\n      data-testid={`draggable-library-card-${card.id}`}\n    >\n      <WorldbuildingCard card={card} compact />\n      {!isDragging && (\n        <p className=\"text-[10px] text-text-muted mt-0.5 text-center opacity-60\">\n          Drag to a column\n        </p>\n      )}\n    </div>\n  );\n}\n"
}
Now update `SandboxCardLibraryPanel` to use draggable cards instead of import buttons:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\SandboxCardLibraryPanel.tsx",
  "old_string": "import { useState, useMemo, useCallback } from 'react';\nimport { useBoardStore } from '@/store';\nimport { WorldbuildingCard } from './WorldbuildingCard';\nimport { WORLDBUILDING_CARD_TYPES, type WorldbuildingCardType, type ColumnId } from '@/types';\nimport type { SandboxCard } from '@/types/sandbox';",
  "new_string": "import { useState, useMemo, useCallback } from 'react';\nimport { useBoardStore } from '@/store';\nimport { WorldbuildingCard } from './WorldbuildingCard';\nimport { DraggableLibraryCard } from './DraggableLibraryCard';\nimport { WORLDBUILDING_CARD_TYPES, type WorldbuildingCardType, type ColumnId } from '@/types';\nimport type { SandboxCard } from '@/types/sandbox';"
}
Now remove the target column selector and replace the card list items with draggable cards:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\SandboxCardLibraryPanel.tsx",
  "old_string": "  const [search, setSearch] = useState('');\n  const [activeFilter, setActiveFilter] = useState<WorldbuildingCardType | null>(null);\n  const [targetColumnId, setTargetColumnId] = useState<ColumnId | ''>('');\n  const [importedCardIds, setImportedCardIds] = useState<Set<string>>(new Set());\n  const [importMode, setImportMode] = useState<'cards' | 'microsetting'>('cards');",
  "new_string": "  const [search, setSearch] = useState('');\n  const [activeFilter, setActiveFilter] = useState<WorldbuildingCardType | null>(null);\n  const [importMode, setImportMode] = useState<'cards' | 'microsetting'>('cards');"
}
Remove the `handleImportCard` callback and the `projectColumns` memo since we no longer need button-based import:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\SandboxCardLibraryPanel.tsx",
  "old_string": "  // Get columns for the active project\n  const projectColumns = useMemo(() => {\n    if (!activeProjectId) return [];\n    return Object.values(columns)\n      .filter((col) => col.projectId === activeProjectId)\n      .sort((a, b) => a.position - b.position);\n  }, [activeProjectId, columns]);\n\n  // Filter cards",
  "new_string": "  // Filter cards"
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\SandboxCardLibraryPanel.tsx",
  "old_string": "  // Import a single sandbox card to the board\n  const handleImportCard = useCallback(\n    (card: SandboxCard) => {\n      if (!activeProjectId || !targetColumnId) return;\n\n      createCard({\n        projectId: activeProjectId,\n        columnId: targetColumnId,\n        title: card.title,\n        description: card.cue,\n        priority: 'medium',\n        tags: ['worldbuilding', card.category],\n        worldbuilding: {\n          cardType: card.category,\n          cues: [{ text: card.cue }],\n        },\n      });\n\n      setImportedCardIds((prev) => new Set(prev).add(card.id));\n    },\n    [activeProjectId, targetColumnId, createCard]\n  );\n\n  // Import an entire microsetting",
  "new_string": "  // Import an entire microsetting"
}
Now replace the target column selector and card list rendering with draggable cards:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\SandboxCardLibraryPanel.tsx",
  "old_string": "      {importMode === 'cards' ? (\n        <>\n          {/* Target column selector */}\n          {cardCount > 0 && (\n            <div className=\"px-4 py-2 border-b border-border\">\n              <label className=\"text-xs text-text-muted block mb-1\">\n                Import to column:\n              </label>\n              <select\n                className=\"input text-sm w-full\"\n                value={targetColumnId}\n                onChange={(e) => setTargetColumnId(e.target.value)}\n                data-testid=\"import-target-column\"\n              >\n                <option value=\"\">Select column...</option>\n                {projectColumns.map((col) => (\n                  <option key={col.id} value={col.id}>\n                    {col.title}\n                  </option>\n                ))}\n              </select>\n            </div>\n          )}\n\n          {/* Search and filter */}",
  "new_string": "      {importMode === 'cards' ? (\n        <>\n          {/* Search and filter */}"
}
Now replace the card list items (WorldbuildingCard + import button) with DraggableLibraryCard:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\SandboxCardLibraryPanel.tsx",
  "old_string": "            {filteredCards.map((card) => (\n              <div key={card.id} className=\"group relative\">\n                <WorldbuildingCard card={card} compact />\n                <div className=\"mt-1\">\n                  <button\n                    className={`w-full text-xs py-1 rounded transition-colors ${\n                      importedCardIds.has(card.id)\n                        ? 'bg-success-500/20 text-success-400 cursor-default'\n                        : !targetColumnId\n                        ? 'bg-surface-700 text-text-muted cursor-not-allowed'\n                        : 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 cursor-pointer'\n                    }`}\n                    onClick={() => handleImportCard(card)}\n                    disabled={!targetColumnId || importedCardIds.has(card.id)}\n                    data-testid={`import-card-${card.id}`}\n                  >\n                    {importedCardIds.has(card.id)\n                      ? '✓ Imported'\n                      : !targetColumnId\n                      ? 'Select a column first'\n                      : 'Import to Board'}\n                  </button>\n                </div>\n              </div>\n            ))}",
  "new_string": "            {filteredCards.map((card) => (\n              <DraggableLibraryCard key={card.id} card={card} />\n            ))}"
}
Now remove unused imports from SandboxCardLibraryPanel. Let me check what's still used:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\SandboxCardLibraryPanel.tsx",
  "old_string": "import { useState, useMemo, useCallback } from 'react';\nimport { useBoardStore } from '@/store';\nimport { WorldbuildingCard } from './WorldbuildingCard';\nimport { DraggableLibraryCard } from './DraggableLibraryCard';\nimport { WORLDBUILDING_CARD_TYPES, type WorldbuildingCardType, type ColumnId } from '@/types';\nimport type { SandboxCard } from '@/types/sandbox';",
  "new_string": "import { useState, useMemo, useCallback } from 'react';\nimport { useBoardStore } from '@/store';\nimport { DraggableLibraryCard } from './DraggableLibraryCard';\nimport { WORLDBUILDING_CARD_TYPES, type WorldbuildingCardType } from '@/types';"
}
Now update `KanbanBoard.tsx` to handle sandbox-card drag-end events. I need to modify `handleDragEnd`:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\KanbanBoard.tsx",
  "old_string": "  const handleDragEnd = useCallback((event: DragEndEvent): void => {\n    const { active, over } = event;\n\n    setActiveCardId(null);\n    setOverColumnId(null);\n\n    if (!over || !activeProjectId) return;\n\n    const activeId = active.id as CardId;\n    const activeData = active.data.current;\n    const overData = over.data.current;\n\n    // Only handle card moves\n    if (activeData?.type !== 'card') return;",
  "new_string": "  const handleDragEnd = useCallback((event: DragEndEvent): void => {\n    const { active, over } = event;\n\n    setActiveCardId(null);\n    setOverColumnId(null);\n\n    if (!over || !activeProjectId) return;\n\n    const activeData = active.data.current;\n    const overData = over.data.current;\n\n    // Handle sandbox card dropped onto a column\n    if (activeData?.type === 'sandbox-card') {\n      const sandboxCard = activeData.sandboxCard;\n      let targetColumnId: ColumnId | null = null;\n\n      if (overData?.type === 'column') {\n        targetColumnId = over.id as ColumnId;\n      } else if (overData?.type === 'card') {\n        targetColumnId = overData.columnId as ColumnId;\n      }\n\n      if (targetColumnId && sandboxCard) {\n        createCard({\n          projectId: activeProjectId,\n          columnId: targetColumnId,\n          title: sandboxCard.title,\n          description: sandboxCard.cue,\n          priority: 'medium',\n          tags: ['worldbuilding', sandboxCard.category],\n          worldbuilding: {\n            cardType: sandboxCard.category,\n            cues: [{ text: sandboxCard.cue }],\n          },\n        });\n      }\n      return;\n    }\n\n    // Only handle card moves\n    if (activeData?.type !== 'card') return;\n\n    const activeId = active.id as CardId;"
}
Now update the `DragDropContext` to also show an overlay for sandbox cards being dragged. I need to update it to accept sandbox card data:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\DragDropContext.tsx",
  "old_string": "import type { Card } from '@/types';\n\ninterface DragDropProviderProps {\n  /** Child components to wrap */\n  children: ReactNode;\n  /** Callback when drag starts */\n  onDragStart?: (event: DragStartEvent) => void;\n  /** Callback when drag is over an element */\n  onDragOver?: (event: DragOverEvent) => void;\n  /** Callback when drag ends */\n  onDragEnd: (event: DragEndEvent) => void;\n  /** Callback when drag is cancelled */\n  onDragCancel?: () => void;\n  /** Currently active drag item ID */\n  activeId: UniqueIdentifier | null;\n  /** Card data for overlay rendering */\n  cards: Card[];\n}",
  "new_string": "import type { Card } from '@/types';\nimport type { SandboxCard } from '@/types/sandbox';\n\ninterface DragDropProviderProps {\n  /** Child components to wrap */\n  children: ReactNode;\n  /** Callback when drag starts */\n  onDragStart?: (event: DragStartEvent) => void;\n  /** Callback when drag is over an element */\n  onDragOver?: (event: DragOverEvent) => void;\n  /** Callback when drag ends */\n  onDragEnd: (event: DragEndEvent) => void;\n  /** Callback when drag is cancelled */\n  onDragCancel?: () => void;\n  /** Currently active drag item ID */\n  activeId: UniqueIdentifier | null;\n  /** Card data for overlay rendering */\n  cards: Card[];\n  /** Currently dragged sandbox card (from library) */\n  activeSandboxCard?: SandboxCard | null;\n}"
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\DragDropContext.tsx",
  "old_string": "export function DragDropProvider({\n  children,\n  onDragStart,\n  onDragOver,\n  onDragEnd,\n  onDragCancel,\n  activeId,\n  cards,\n}: DragDropProviderProps): JSX.Element {",
  "new_string": "export function DragDropProvider({\n  children,\n  onDragStart,\n  onDragOver,\n  onDragEnd,\n  onDragCancel,\n  activeId,\n  cards,\n  activeSandboxCard,\n}: DragDropProviderProps): JSX.Element {"
}
Now update the DragOverlay to also handle sandbox cards:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\DragDropContext.tsx",
  "old_string": "      <DragOverlay\n        dropAnimation={{\n          duration: 250,\n          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',\n        }}\n      >\n        {activeCard ? (\n          <DragOverlayCard card={activeCard} />\n        ) : null}\n      </DragOverlay>",
  "new_string": "      <DragOverlay\n        dropAnimation={{\n          duration: 250,\n          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',\n        }}\n      >\n        {activeCard ? (\n          <DragOverlayCard card={activeCard} />\n        ) : activeSandboxCard ? (\n          <SandboxCardOverlay card={activeSandboxCard} />\n        ) : null}\n      </DragOverlay>"
}
Now add the `SandboxCardOverlay` component at the bottom of the file:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\DragDropContext.tsx",
  "old_string": "export default DragDropProvider;",
  "new_string": "/**\n * SandboxCardOverlay - Renders a sandbox card preview during drag from library\n */\nfunction SandboxCardOverlay({ card }: { card: SandboxCard }): JSX.Element {\n  return (\n    <div\n      className=\"p-3 rounded-card shadow-lg ring-2 ring-purple-500 opacity-95 cursor-grabbing\"\n      style={{\n        width: '252px',\n        transform: 'rotate(3deg)',\n        backgroundColor: '#1e1b2e',\n        border: '1px solid #8b5cf6',\n      }}\n    >\n      <div className=\"flex items-start justify-between gap-2 mb-1\">\n        <h4 className=\"font-medium text-white text-sm line-clamp-2 flex-1\">\n          {card.title}\n        </h4>\n        <span\n          className=\"px-1.5 py-0.5 rounded text-xs text-white capitalize flex-shrink-0\"\n          style={{ backgroundColor: '#8b5cf6' }}\n        >\n          {card.category}\n        </span>\n      </div>\n      {card.cue && (\n        <p className=\"text-gray-300 text-xs line-clamp-2\">{card.cue}</p>\n      )}\n    </div>\n  );\n}\n\nexport default DragDropProvider;"
}
Now update `KanbanBoard` to track the active sandbox card and pass it to `DragDropProvider`:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\KanbanBoard.tsx",
  "old_string": "import type { ColumnId, Column, Card, CardId, TemplateCategory } from '@/types';",
  "new_string": "import type { ColumnId, Column, Card, CardId, TemplateCategory } from '@/types';\nimport type { SandboxCard } from '@/types/sandbox';"
}
Add state for the active sandbox card:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\KanbanBoard.tsx",
  "old_string": "  // Drag state for dnd-kit\n  const [activeCardId, setActiveCardId] = useState<UniqueIdentifier | null>(null);\n  const [overColumnId, setOverColumnId] = useState<ColumnId | null>(null);",
  "new_string": "  // Drag state for dnd-kit\n  const [activeCardId, setActiveCardId] = useState<UniqueIdentifier | null>(null);\n  const [overColumnId, setOverColumnId] = useState<ColumnId | null>(null);\n  const [activeSandboxCard, setActiveSandboxCard] = useState<SandboxCard | null>(null);"
}
Update `handleDragStart` to track sandbox cards:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\KanbanBoard.tsx",
  "old_string": "  const handleDragStart = useCallback((event: DragStartEvent): void => {\n    const { active } = event;\n    setActiveCardId(active.id);\n  }, []);",
  "new_string": "  const handleDragStart = useCallback((event: DragStartEvent): void => {\n    const { active } = event;\n    const data = active.data.current;\n    if (data?.type === 'sandbox-card') {\n      setActiveSandboxCard(data.sandboxCard as SandboxCard);\n      setActiveCardId(null);\n    } else {\n      setActiveCardId(active.id);\n      setActiveSandboxCard(null);\n    }\n  }, []);"
}
Update `handleDragEnd` to clear sandbox card state:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\KanbanBoard.tsx",
  "old_string": "    setActiveCardId(null);\n    setOverColumnId(null);\n\n    if (!over || !activeProjectId) return;",
  "new_string": "    setActiveCardId(null);\n    setOverColumnId(null);\n    setActiveSandboxCard(null);\n\n    if (!over || !activeProjectId) return;"
}
Update `handleDragCancel`:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\KanbanBoard.tsx",
  "old_string": "  const handleDragCancel = useCallback((): void => {\n    setActiveCardId(null);\n    setOverColumnId(null);\n  }, []);",
  "new_string": "  const handleDragCancel = useCallback((): void => {\n    setActiveCardId(null);\n    setOverColumnId(null);\n    setActiveSandboxCard(null);\n  }, []);"
}
Now pass `activeSandboxCard` to the `DragDropProvider`:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\KanbanBoard.tsx",
  "old_string": "      activeId={activeCardId}\n      cards={allCards}\n    >",
  "new_string": "      activeId={activeCardId}\n      cards={allCards}\n      activeSandboxCard={activeSandboxCard}\n    >"
}
Now let's type-check:

🔧 Tool: Bash
Input: {
  "command": "cd /c/automaker/storymaker && npx tsc --noEmit 2>&1 | head -50",
  "description": "Type check the project",
  "timeout": 60000
}
First two are pre-existing. Fix the unused `columns` import:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\SandboxCardLibraryPanel.tsx",
  "old_string": "  const columns = useBoardStore((s) => s.columns);\n  const activeProjectId = useBoardStore((s) => s.activeProjectId);\n  const createCard = useBoardStore((s) => s.createCard);",
  "new_string": "  const activeProjectId = useBoardStore((s) => s.activeProjectId);"
}
Check if `createCard` is still used in the microsetting import:

🔧 Tool: Grep
Input: {
  "pattern": "createCard|useCallback",
  "path": "C:\\automaker\\storymaker\\src\\components\\SandboxCardLibraryPanel.tsx",
  "output_mode": "content"
}
`createCard` is still used but I removed it. Let me re-add it:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\SandboxCardLibraryPanel.tsx",
  "old_string": "  const activeProjectId = useBoardStore((s) => s.activeProjectId);\n  const microsettings = useBoardStore((s) => s.microsettings);",
  "new_string": "  const activeProjectId = useBoardStore((s) => s.activeProjectId);\n  const createCard = useBoardStore((s) => s.createCard);\n  const microsettings = useBoardStore((s) => s.microsettings);"
}

🔧 Tool: Bash
Input: {
  "command": "cd /c/automaker/storymaker && npx tsc --noEmit 2>&1 | grep -v \"CardLibraryDrawer\\|DroppableColumn.tsx(295\"",
  "description": "Type check excluding pre-existing errors",
  "timeout": 60000
}
Clean build (no new errors). Let me also add the export for `DraggableLibraryCard` to the components index:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\index.ts",
  "old_string": "// Sandbox Card Library (Board integration)\nexport { SandboxCardLibraryPanel } from './SandboxCardLibraryPanel';\nexport type { SandboxCardLibraryPanelProps } from './SandboxCardLibraryPanel';",
  "new_string": "// Sandbox Card Library (Board integration)\nexport { SandboxCardLibraryPanel } from './SandboxCardLibraryPanel';\nexport type { SandboxCardLibraryPanelProps } from './SandboxCardLibraryPanel';\nexport { DraggableLibraryCard } from './DraggableLibraryCard';"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\index.ts",
  "limit": 20
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\automaker\\storymaker\\src\\components\\index.ts",
  "old_string": "// Sandbox Card Library (Board integration)\nexport { SandboxCardLibraryPanel } from './SandboxCardLibraryPanel';\nexport type { SandboxCardLibraryPanelProps } from './SandboxCardLibraryPanel';",
  "new_string": "// Sandbox Card Library (Board integration)\nexport { SandboxCardLibraryPanel } from './SandboxCardLibraryPanel';\nexport type { SandboxCardLibraryPanelProps } from './SandboxCardLibraryPanel';\nexport { DraggableLibraryCard } from './DraggableLibraryCard';"
}
<summary>
## Summary: Drag and Drop from Card Library to Board Columns

### Changes Implemented
- Created `DraggableLibraryCard` component using dnd-kit's `useDraggable` hook with `type: 'sandbox-card'` data, enabling cards in the library panel to be dragged
- Updated `SandboxCardLibraryPanel` to use `DraggableLibraryCard` instead of button-based import (removed target column selector and import buttons; cards now show "Drag to a column" hint)
- Updated `KanbanBoard.handleDragStart` to detect sandbox card drags and track the active sandbox card state
- Updated `KanbanBoard.handleDragEnd` to handle `sandbox-card` type drops — when a library card is dropped on a column (or on a card within a column), it creates a new board card with the sandbox card's data (title, cue, category, worldbuilding metadata)
- Updated `DragDropContext` to accept an `activeSandboxCard` prop and render a `SandboxCardOverlay` during sandbox card drags (purple-themed overlay distinct from regular card drags)
- Cleared sandbox card drag state on drag end and cancel

### Files Modified
- `src/components/DraggableLibraryCard.tsx` — **NEW** — Draggable wrapper for library cards
- `src/components/SandboxCardLibraryPanel.tsx` — Replaced button-based import with drag-based interaction
- `src/components/KanbanBoard.tsx` — Added sandbox card drag handling in drag start/end/cancel, pass `activeSandboxCard` to DragDropProvider
- `src/components/DragDropContext.tsx` — Added `activeSandboxCard` prop, `SandboxCardOverlay` component for drag preview
- `src/components/index.ts` — Added `DraggableLibraryCard` export

### Notes for Developer
- Drag a card from the Card Library panel (right side) and drop it onto any board column to create a new board card
- The microsetting "Import as New Column" button-based flow is preserved (only individual card import changed to drag)
- The drag overlay for sandbox cards uses a purple theme to visually distinguish from regular board card drags
- Pre-existing TypeScript errors in `CardLibraryDrawer.tsx` and `DroppableColumn.tsx` are unrelated to these changes
</summary>