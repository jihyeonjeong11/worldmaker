/**
 * Store exports
 * Central export point for all store-related functionality
 */

// Main store and selectors
export {
  useBoardStore,
  selectProjects,
  selectActiveProjectId,
  selectActiveProject,
  selectColumns,
  selectCards,
  selectActiveProjectColumns,
  selectActiveProjectCardsByColumn,
  type BoardStore,
} from './boardStore';

// Slice types (for type-only imports)
export type { ProjectsSlice, ProjectsActions } from './slices/projectsSlice';
export type { ColumnsSlice, ColumnsActions } from './slices/columnsSlice';
export type { CardsSlice, CardsActions } from './slices/cardsSlice';
export type { SandboxSlice, SandboxActions } from './slices/sandboxSlice';

// Utilities
export { generateId, getTimestamp } from './utils';
