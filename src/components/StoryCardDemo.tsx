/**
 * StoryCard Demo Component
 *
 * A demonstration page for the StoryCard component showcasing all its features
 * and interactive states. Used for development and Playwright testing.
 */
import { useState, useCallback } from 'react';
import { StoryCard, type StoryCategory } from './StoryCard';
import type { CardPriority, CardStatus } from '@/types';

interface DemoCard {
  id: string;
  title: string;
  description?: string;
  category?: StoryCategory;
  tags?: string[];
  priority?: CardPriority;
  status?: CardStatus;
}

const DEMO_CARDS: DemoCard[] = [
  {
    id: 'demo-1',
    title: 'Opening Scene',
    description: 'The protagonist wakes up in an unfamiliar room with no memory of how they got there.',
    category: 'scene',
    tags: ['mystery', 'opening', 'protagonist'],
    priority: 'high',
    status: 'active',
  },
  {
    id: 'demo-2',
    title: 'Chapter 1: The Beginning',
    description: 'Introduction to the world and main characters.',
    category: 'chapter',
    tags: ['introduction', 'world-building'],
    priority: 'medium',
    status: 'draft',
  },
  {
    id: 'demo-3',
    title: 'Detective Sarah Blake',
    description: 'The main investigator - sharp mind, troubled past.',
    category: 'character',
    tags: ['protagonist', 'detective', 'complex'],
    priority: 'critical',
    status: 'active',
  },
  {
    id: 'demo-4',
    title: 'Victorian London',
    description: 'Foggy streets, gas lamps, and hidden dangers.',
    category: 'setting',
    tags: ['historical', 'atmosphere'],
    priority: 'low',
    status: 'completed',
  },
  {
    id: 'demo-5',
    title: 'The Hidden Conspiracy',
    description: 'A secret society manipulating events from the shadows.',
    category: 'plot',
    tags: ['twist', 'antagonist', 'secret', 'society', 'danger'],
    priority: 'high',
    status: 'active',
  },
  {
    id: 'demo-6',
    title: 'Research Notes',
    description: 'Remember to fact-check the timeline.',
    category: 'note',
    tags: ['research'],
    priority: 'low',
    status: 'archived',
  },
];

/**
 * StoryCardDemo - Demonstrates StoryCard component features
 */
export function StoryCardDemo(): JSX.Element {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [clickLog, setClickLog] = useState<string[]>([]);

  const handleCardClick = useCallback((id: string) => {
    setSelectedCardId((prev) => (prev === id ? null : id));
    setClickLog((prev) => [...prev.slice(-4), `Clicked: ${id}`]);
  }, []);

  const handleCardDoubleClick = useCallback((id: string) => {
    setClickLog((prev) => [...prev.slice(-4), `Double-clicked: ${id}`]);
  }, []);

  const handleDragStart = useCallback((id: string) => {
    setDraggingCardId(id);
    setClickLog((prev) => [...prev.slice(-4), `Drag started: ${id}`]);
  }, []);

  const handleDragEnd = useCallback((id: string) => {
    setDraggingCardId(null);
    setDropTargetId(null);
    setClickLog((prev) => [...prev.slice(-4), `Drag ended: ${id}`]);
  }, []);

  const toggleDropTarget = useCallback(() => {
    setDropTargetId((prev) => (prev ? null : 'demo-1'));
  }, []);

  return (
    <div
      className="p-6 bg-background min-h-screen"
      data-testid="story-card-demo"
    >
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          StoryCard Component Demo
        </h1>
        <p className="text-text-muted">
          Interactive demonstration of the StoryCard component with all states and variations.
        </p>
      </header>

      {/* Controls */}
      <section className="mb-8 p-4 bg-surface-800/50 rounded-card" data-testid="demo-controls">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Controls</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCardId(null)}
            className="btn btn-secondary"
            data-testid="clear-selection-btn"
          >
            Clear Selection
          </button>
          <button
            onClick={toggleDropTarget}
            className="btn btn-secondary"
            data-testid="toggle-drop-target-btn"
          >
            Toggle Drop Target
          </button>
        </div>

        {/* Interaction Log */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-text-secondary mb-2">Interaction Log:</h3>
          <div
            className="bg-surface-900 rounded p-2 text-xs font-mono text-text-muted min-h-[60px]"
            data-testid="interaction-log"
          >
            {clickLog.length > 0 ? (
              clickLog.map((log, i) => <div key={i}>{log}</div>)
            ) : (
              <span>Click or drag cards to see interactions...</span>
            )}
          </div>
        </div>
      </section>

      {/* Demo Cards Grid */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Story Cards</h2>
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          data-testid="demo-cards-grid"
        >
          {DEMO_CARDS.map((card) => (
            <StoryCard
              key={card.id}
              id={card.id}
              title={card.title}
              description={card.description}
              category={card.category}
              tags={card.tags}
              priority={card.priority}
              status={card.status}
              isSelected={selectedCardId === card.id}
              isDragging={draggingCardId === card.id}
              isDropTarget={dropTargetId === card.id}
              onClick={handleCardClick}
              onDoubleClick={handleCardDoubleClick}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      </section>

      {/* State Variations */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-4">State Variations</h2>
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          data-testid="state-variations"
        >
          {/* Normal State */}
          <div>
            <h3 className="text-sm text-text-muted mb-2">Normal</h3>
            <StoryCard
              id="state-normal"
              title="Normal State"
              description="Default card appearance"
              category="scene"
              tags={['demo']}
            />
          </div>

          {/* Selected State */}
          <div>
            <h3 className="text-sm text-text-muted mb-2">Selected</h3>
            <StoryCard
              id="state-selected"
              title="Selected State"
              description="Card with selection ring"
              category="chapter"
              tags={['demo']}
              isSelected={true}
            />
          </div>

          {/* Dragging State */}
          <div>
            <h3 className="text-sm text-text-muted mb-2">Dragging</h3>
            <StoryCard
              id="state-dragging"
              title="Dragging State"
              description="Semi-transparent when dragging"
              category="character"
              tags={['demo']}
              isDragging={true}
            />
          </div>

          {/* Disabled State */}
          <div>
            <h3 className="text-sm text-text-muted mb-2">Disabled</h3>
            <StoryCard
              id="state-disabled"
              title="Disabled State"
              description="Cannot be interacted with"
              category="note"
              tags={['demo']}
              isDisabled={true}
            />
          </div>
        </div>
      </section>

      {/* Priority Variations */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Priority Levels</h2>
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          data-testid="priority-variations"
        >
          <StoryCard
            id="priority-low"
            title="Low Priority"
            description="No priority badge shown"
            priority="low"
          />
          <StoryCard
            id="priority-medium"
            title="Medium Priority"
            description="Blue priority badge"
            priority="medium"
          />
          <StoryCard
            id="priority-high"
            title="High Priority"
            description="Orange priority badge"
            priority="high"
          />
          <StoryCard
            id="priority-critical"
            title="Critical Priority"
            description="Red priority badge"
            priority="critical"
          />
        </div>
      </section>

      {/* Category Variations */}
      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Categories</h2>
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          data-testid="category-variations"
        >
          <StoryCard id="cat-scene" title="Scene" category="scene" />
          <StoryCard id="cat-chapter" title="Chapter" category="chapter" />
          <StoryCard id="cat-character" title="Character" category="character" />
          <StoryCard id="cat-setting" title="Setting" category="setting" />
          <StoryCard id="cat-plot" title="Plot" category="plot" />
          <StoryCard id="cat-note" title="Note" category="note" />
        </div>
      </section>
    </div>
  );
}

export default StoryCardDemo;
