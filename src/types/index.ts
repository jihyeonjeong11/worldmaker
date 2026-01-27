/**
 * Core type definitions for StoryMaker state management
 * These types define the structure for projects, cards, and board columns
 */

// ============================================================================
// ID Types (for type safety)
// ============================================================================

/** Unique identifier for a project */
export type ProjectId = string;

/** Unique identifier for a card */
export type CardId = string;

/** Unique identifier for a column */
export type ColumnId = string;

/** Unique identifier for a template */
export type TemplateId = string;

// ============================================================================
// Card Types (Priority and Status - needed by Template types)
// ============================================================================

/** Priority levels for story cards */
export type CardPriority = 'low' | 'medium' | 'high' | 'critical';

/** Status of a card (separate from column for workflow tracking) */
export type CardStatus = 'draft' | 'active' | 'completed' | 'archived';

// ============================================================================
// Worldbuilding Card Types
// ============================================================================

/** The six types of worldbuilding cards */
export type WorldbuildingCardType =
  | 'region'      // 🏔️ Main terrain type base
  | 'landmark'    // 🏰 POI or geographical sites
  | 'namesake'    // 🏷️ In-world nicknames for regions/landmarks
  | 'origin'      // 🌱 Significant events of the area's past
  | 'attribute'   // 🎭 Present-day features of the area and its people
  | 'advent';     // 🔮 Events that may change the area's future

/** A cue is an optional worldbuilding element to combine */
export interface WorldbuildingCue {
  /** The cue text (e.g., "Dense canopy forest") */
  text: string;
  /** Optional smaller interpretation suggestion */
  suggestion?: string;
}

/** Worldbuilding-specific metadata on a card */
export interface WorldbuildingData {
  /** The worldbuilding card type */
  cardType: WorldbuildingCardType;
  /** One or more cues associated with this card */
  cues: WorldbuildingCue[];
}

/** Metadata for each worldbuilding card type */
export interface WorldbuildingCardTypeMeta {
  type: WorldbuildingCardType;
  label: string;
  icon: string;
  color: string;
  description: string;
}

/** All worldbuilding card type metadata */
export const WORLDBUILDING_CARD_TYPES: WorldbuildingCardTypeMeta[] = [
  { type: 'region',    label: 'Region',     icon: '🏔️', color: '#6366f1', description: 'Main terrain type base for the area' },
  { type: 'landmark',  label: 'Landmark',   icon: '🏰', color: '#f59e0b', description: 'POI or geographical sites for the region' },
  { type: 'namesake',  label: 'Namesake',   icon: '🏷️', color: '#8b5cf6', description: 'Combine with regions or landmarks to create in-world nicknames' },
  { type: 'origin',    label: 'Origin',     icon: '🌱', color: '#22c55e', description: 'Record significant events of the area\'s past' },
  { type: 'attribute', label: 'Attribute',  icon: '🎭', color: '#ec4899', description: 'Highlight present-day features of the area and its people' },
  { type: 'advent',    label: 'Advent',     icon: '🔮', color: '#06b6d4', description: 'Introduce events that may change the area\'s future' },
];

// ============================================================================
// Template Types
// ============================================================================

/** Type of template - what kind of structure it creates */
export type TemplateType = 'project' | 'column' | 'card';

/** Category for organizing templates */
export type TemplateCategory =
  | 'story-structure'    // Templates for story organization (e.g., Three Act Structure)
  | 'character'          // Character development templates
  | 'worldbuilding'      // World and setting templates
  | 'plot'               // Plot and narrative templates
  | 'workflow'           // Writing workflow templates
  | 'custom';            // User-created custom templates

/**
 * Template for a story card (used within column templates)
 * Contains the blueprint for creating cards when template is applied
 */
export interface TemplateCard {
  /** Title of the card when created from template */
  title: string;
  /** Default description or content prompt */
  description: string;
  /** Default priority level */
  priority: CardPriority;
  /** Default tags to apply */
  tags: string[];
  /** Position within the column */
  position: number;
  /** Optional worldbuilding data for worldbuilding card templates */
  worldbuilding?: WorldbuildingData;
}

/**
 * Template for a Kanban column (used within project templates)
 * Contains the blueprint for columns and their cards
 */
export interface TemplateColumn {
  /** Title of the column when created from template */
  title: string;
  /** Optional color for the column */
  color?: string;
  /** Position on the board */
  position: number;
  /** Maximum cards allowed (WIP limit) */
  maxCards?: number;
  /** Card templates to create within this column */
  cards: TemplateCard[];
}

/**
 * A reusable template for creating pre-configured boards, columns, or cards
 * Templates can be built-in (system) or user-created (custom)
 */
export interface Template {
  /** Unique identifier for the template */
  id: TemplateId;
  /** Display name of the template */
  name: string;
  /** Detailed description of what this template provides */
  description: string;
  /** Type of structure this template creates */
  type: TemplateType;
  /** Category for organizing and filtering templates */
  category: TemplateCategory;
  /** Whether this is a built-in system template (cannot be deleted/modified) */
  isBuiltIn: boolean;
  /** Column templates (for project templates) */
  columns: TemplateColumn[];
  /** Card templates (for standalone card templates) */
  cards: TemplateCard[];
  /** Tags for searching and filtering templates */
  tags: string[];
  /** Template version for tracking updates */
  version: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

// ============================================================================
// Card Types (Card Interface)
// ============================================================================

/**
 * A story card representing a scene, chapter, or story element
 */
export interface Card {
  /** Unique identifier for the card */
  id: CardId;
  /** ID of the project this card belongs to */
  projectId: ProjectId;
  /** ID of the column this card is currently in */
  columnId: ColumnId;
  /** Title of the card */
  title: string;
  /** Detailed description or content */
  description: string;
  /** Priority level */
  priority: CardPriority;
  /** Current status */
  status: CardStatus;
  /** Position within the column (for ordering) */
  position: number;
  /** Optional tags for categorization */
  tags: string[];
  /** Optional worldbuilding data (present when card is a worldbuilding card) */
  worldbuilding?: WorldbuildingData;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

// ============================================================================
// Column Types
// ============================================================================

/**
 * A board column representing a stage in the story workflow
 * (e.g., "Ideas", "In Progress", "Review", "Complete")
 */
export interface Column {
  /** Unique identifier for the column */
  id: ColumnId;
  /** ID of the project this column belongs to */
  projectId: ProjectId;
  /** Display title of the column */
  title: string;
  /** Position of the column on the board (for ordering) */
  position: number;
  /** Optional color for visual distinction */
  color?: string;
  /** Maximum number of cards allowed (optional, for WIP limits) */
  maxCards?: number;
  /** Whether the column is collapsed in the UI */
  isCollapsed: boolean;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

// ============================================================================
// Project Types
// ============================================================================

/** Project status */
export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';

/**
 * A project containing a kanban board with columns and cards
 */
export interface Project {
  /** Unique identifier for the project */
  id: ProjectId;
  /** Project name */
  name: string;
  /** Project description */
  description: string;
  /** Current project status */
  status: ProjectStatus;
  /** Optional color for visual distinction in project list */
  color?: string;
  /** Whether this project is starred/favorited */
  isStarred: boolean;
  /** Last time this project was accessed */
  lastAccessedAt: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

// ============================================================================
// State Types (for Zustand store)
// ============================================================================

/**
 * Projects slice state
 */
export interface ProjectsState {
  /** Map of project IDs to projects */
  projects: Record<ProjectId, Project>;
  /** Currently active/selected project ID */
  activeProjectId: ProjectId | null;
}

/**
 * Cards slice state
 */
export interface CardsState {
  /** Map of card IDs to cards */
  cards: Record<CardId, Card>;
}

/**
 * Columns slice state
 */
export interface ColumnsState {
  /** Map of column IDs to columns */
  columns: Record<ColumnId, Column>;
}

/**
 * Templates slice state
 */
export interface TemplatesState {
  /** Map of template IDs to templates */
  templates: Record<TemplateId, Template>;
  /** Currently selected template ID (for preview/application) */
  selectedTemplateId: TemplateId | null;
}

/**
 * Combined board state
 */
export interface BoardState extends ProjectsState, CardsState, ColumnsState, TemplatesState {}

// ============================================================================
// Action Payload Types
// ============================================================================

/** Payload for creating a new project */
export interface CreateProjectPayload {
  name: string;
  description?: string;
  color?: string;
}

/** Payload for updating a project */
export interface UpdateProjectPayload {
  id: ProjectId;
  name?: string;
  description?: string;
  status?: ProjectStatus;
  color?: string;
  isStarred?: boolean;
}

/** Payload for creating a new column */
export interface CreateColumnPayload {
  projectId: ProjectId;
  title: string;
  color?: string;
  position?: number;
}

/** Payload for updating a column */
export interface UpdateColumnPayload {
  id: ColumnId;
  title?: string;
  color?: string;
  position?: number;
  maxCards?: number;
  isCollapsed?: boolean;
}

/** Payload for creating a new card */
export interface CreateCardPayload {
  projectId: ProjectId;
  columnId: ColumnId;
  title: string;
  description?: string;
  priority?: CardPriority;
  tags?: string[];
  /** Optional worldbuilding data for worldbuilding cards */
  worldbuilding?: WorldbuildingData;
}

/** Payload for updating a card */
export interface UpdateCardPayload {
  id: CardId;
  title?: string;
  description?: string;
  priority?: CardPriority;
  status?: CardStatus;
  tags?: string[];
  /** Optional worldbuilding data update */
  worldbuilding?: WorldbuildingData;
}

/** Payload for moving a card to a different column or position */
export interface MoveCardPayload {
  cardId: CardId;
  targetColumnId: ColumnId;
  targetPosition: number;
}

/** Payload for creating a new template */
export interface CreateTemplatePayload {
  name: string;
  description?: string;
  type: TemplateType;
  category?: TemplateCategory;
  columns?: Omit<TemplateColumn, 'position'>[];
  cards?: Omit<TemplateCard, 'position'>[];
  tags?: string[];
}

/** Payload for updating a template */
export interface UpdateTemplatePayload {
  id: TemplateId;
  name?: string;
  description?: string;
  category?: TemplateCategory;
  columns?: TemplateColumn[];
  cards?: TemplateCard[];
  tags?: string[];
}

/** Payload for applying a template to create a new project */
export interface ApplyTemplatePayload {
  templateId: TemplateId;
  projectName: string;
  projectDescription?: string;
}

/** Payload for applying a column template to an existing project */
export interface ApplyColumnTemplatePayload {
  templateId: TemplateId;
  projectId: ProjectId;
  startPosition?: number;
}

/** Payload for applying a card template to an existing column */
export interface ApplyCardTemplatePayload {
  templateId: TemplateId;
  projectId: ProjectId;
  columnId: ColumnId;
  startPosition?: number;
}

// ============================================================================
// Utility Types
// ============================================================================

/** Helper type for getting cards by column */
export type CardsByColumn = Record<ColumnId, Card[]>;

/** Helper type for getting columns by project */
export type ColumnsByProject = Record<ProjectId, Column[]>;

/** Helper type for getting templates by type */
export type TemplatesByType = Record<TemplateType, Template[]>;

/** Helper type for getting templates by category */
export type TemplatesByCategory = Record<TemplateCategory, Template[]>;

/** Helper type for filtering templates */
export interface TemplateFilter {
  type?: TemplateType;
  category?: TemplateCategory;
  isBuiltIn?: boolean;
  searchQuery?: string;
}

// ============================================================================
// Search Types
// ============================================================================

/**
 * Search match information for highlighting results
 */
export interface SearchMatch {
  /** The field that matched (title, description, tag) */
  field: 'title' | 'description' | 'tag';
  /** Start index of the match in the original text */
  startIndex: number;
  /** End index of the match in the original text */
  endIndex: number;
  /** The matched text */
  matchedText: string;
}

/**
 * A search result containing the matched item and match information
 */
export interface SearchResult<T> {
  /** The matched item */
  item: T;
  /** Array of matches found in the item */
  matches: SearchMatch[];
  /** Search relevance score (higher is better) */
  score: number;
}

/**
 * Options for configuring search behavior
 */
export interface SearchOptions {
  /** Whether the search should be case sensitive (default: false) */
  caseSensitive?: boolean;
  /** Minimum characters required to trigger search (default: 1) */
  minSearchLength?: number;
  /** Fields to search in (default: all) */
  searchFields?: ('title' | 'description' | 'tags')[];
  /** Maximum number of results to return (default: unlimited) */
  maxResults?: number;
}

/**
 * Search state for tracking search progress and results
 */
export interface SearchState<T> {
  /** Current search query */
  query: string;
  /** Whether a search is currently in progress */
  isSearching: boolean;
  /** Search results */
  results: SearchResult<T>[];
  /** Total number of items before filtering */
  totalItems: number;
  /** Number of items after filtering */
  filteredCount: number;
}
