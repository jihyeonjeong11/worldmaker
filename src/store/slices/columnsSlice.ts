/**
 * Columns Slice
 * Manages column state and actions
 */
import type {
  Column,
  ColumnId,
  ProjectId,
  ColumnsState,
  CreateColumnPayload,
  UpdateColumnPayload,
} from '@/types';
import { generateId, getTimestamp } from '../utils';

/**
 * Columns slice actions
 */
export interface ColumnsActions {
  /** Create a new column */
  createColumn: (payload: CreateColumnPayload) => ColumnId;
  /** Update an existing column */
  updateColumn: (payload: UpdateColumnPayload) => void;
  /** Delete a column */
  deleteColumn: (id: ColumnId) => void;
  /** Reorder columns within a project */
  reorderColumns: (projectId: ProjectId, columnIds: ColumnId[]) => void;
  /** Toggle column collapse state */
  toggleColumnCollapse: (id: ColumnId) => void;
  /** Get a column by ID */
  getColumn: (id: ColumnId) => Column | undefined;
  /** Get all columns for a project */
  getColumnsByProject: (projectId: ProjectId) => Column[];
  /** Delete all columns for a project */
  deleteColumnsByProject: (projectId: ProjectId) => void;
}

/**
 * Combined columns state and actions
 */
export interface ColumnsSlice extends ColumnsState, ColumnsActions {}

/**
 * Create the columns slice
 * @param set - Zustand set function
 * @param get - Zustand get function
 */
export const createColumnsSlice = (
  set: (fn: (state: ColumnsSlice) => void) => void,
  get: () => ColumnsSlice
): ColumnsSlice => ({
  // Initial state
  columns: {},

  // Actions
  createColumn: (payload) => {
    const id = generateId();
    const now = getTimestamp();

    // Calculate position if not provided
    const existingColumns = get().getColumnsByProject(payload.projectId);
    const position = payload.position ?? existingColumns.length;

    const newColumn: Column = {
      id,
      projectId: payload.projectId,
      title: payload.title,
      position,
      color: payload.color,
      isCollapsed: false,
      createdAt: now,
      updatedAt: now,
    };

    set((state) => {
      state.columns[id] = newColumn;
    });

    return id;
  },

  updateColumn: (payload) => {
    set((state) => {
      const column = state.columns[payload.id];
      if (column) {
        if (payload.title !== undefined) column.title = payload.title;
        if (payload.color !== undefined) column.color = payload.color;
        if (payload.position !== undefined) column.position = payload.position;
        if (payload.maxCards !== undefined) column.maxCards = payload.maxCards;
        if (payload.isCollapsed !== undefined) column.isCollapsed = payload.isCollapsed;
        column.updatedAt = getTimestamp();
      }
    });
  },

  deleteColumn: (id) => {
    set((state) => {
      delete state.columns[id];
    });
  },

  reorderColumns: (projectId, columnIds) => {
    set((state) => {
      columnIds.forEach((id, index) => {
        const column = state.columns[id];
        if (column && column.projectId === projectId) {
          column.position = index;
          column.updatedAt = getTimestamp();
        }
      });
    });
  },

  toggleColumnCollapse: (id) => {
    set((state) => {
      const column = state.columns[id];
      if (column) {
        column.isCollapsed = !column.isCollapsed;
        column.updatedAt = getTimestamp();
      }
    });
  },

  getColumn: (id) => {
    return get().columns[id];
  },

  getColumnsByProject: (projectId) => {
    return Object.values(get().columns)
      .filter((column) => column.projectId === projectId)
      .sort((a, b) => a.position - b.position);
  },

  deleteColumnsByProject: (projectId) => {
    set((state) => {
      const columnIds = Object.values(state.columns)
        .filter((column) => column.projectId === projectId)
        .map((column) => column.id);

      columnIds.forEach((id) => {
        delete state.columns[id];
      });
    });
  },
});
