/**
 * Board Store
 * Main Zustand store combining all slices with Immer middleware
 */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';

import {
  createProjectsSlice,
  createColumnsSlice,
  createCardsSlice,
  createTemplatesSlice,
  createSandboxSlice,
  createCardSandboxSlice,
  type ProjectsSlice,
  type ColumnsSlice,
  type CardsSlice,
  type TemplatesSlice,
  type SandboxSlice,
  type CardSandboxSlice,
} from './slices';

import type { ProjectId, Template } from '@/types';

/**
 * Combined store type including all slices
 */
export interface BoardStore extends ProjectsSlice, ColumnsSlice, CardsSlice, TemplatesSlice, SandboxSlice, CardSandboxSlice {
  /** Reset the entire store to initial state */
  resetStore: () => void;
  /** Delete a project and all its associated columns and cards */
  deleteProjectWithChildren: (projectId: ProjectId) => void;
  /** Apply a project template to create a new project with pre-configured columns and cards */
  applyProjectTemplate: (template: Template, projectName: string, projectDescription?: string) => ProjectId;
}

/**
 * Initial state for the store
 */
const initialState = {
  // Projects
  projects: {},
  activeProjectId: null,
  // Columns
  columns: {},
  // Cards
  cards: {},
  // Templates
  templates: {},
  selectedTemplateId: null,
  // Sandbox (Worldbuilding)
  cardLibrary: {},
  microsettings: {},
  activeMicrosettingId: null,
  // Card Sandbox
  isSandboxActive: false,
  sandboxDrafts: {},
  sandboxDeletions: [],
  sandboxProjectId: null,
  sandboxSnapshot: null,
};

/**
 * The main board store
 * Combines all slices with Immer middleware for immutable updates
 */
export const useBoardStore = create<BoardStore>()(
  devtools(
    immer((set, get) => {
      // Type-safe set function that works with all slices
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const immerSet = set as (fn: (state: any) => void) => void;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const storeGet = get as () => any;

      return {
        // Spread in all slices with proper typing
        ...createProjectsSlice(immerSet, storeGet),
        ...createColumnsSlice(immerSet, storeGet),
        ...createCardsSlice(immerSet, storeGet),
        ...createTemplatesSlice(immerSet, storeGet),
        ...createSandboxSlice(immerSet, storeGet),
        ...createCardSandboxSlice(immerSet, storeGet),

        // Combined actions that span multiple slices
        resetStore: () => {
          set(() => initialState as unknown as BoardStore);
        },

        applyProjectTemplate: (template: Template, projectName: string, projectDescription?: string) => {
          const store = get();
          // Create the project
          const projectId = store.createProject({
            name: projectName,
            description: projectDescription || template.description,
            color: template.columns[0]?.color,
          });

          // Create columns from template
          for (const templateCol of template.columns) {
            const columnId = store.createColumn({
              projectId,
              title: templateCol.title,
              color: templateCol.color,
              position: templateCol.position,
            });

            // Create cards from template column
            if (templateCol.cards) {
              for (const templateCard of templateCol.cards) {
                store.createCard({
                  projectId,
                  columnId,
                  title: templateCard.title,
                  description: templateCard.description,
                  priority: templateCard.priority,
                  tags: templateCard.tags,
                });
              }
            }
          }

          // Set as active project
          store.setActiveProject(projectId);
          return projectId;
        },

        deleteProjectWithChildren: (projectId: ProjectId) => {
          // Delete all cards for this project
          get().deleteCardsByProject(projectId);
          // Delete all columns for this project
          get().deleteColumnsByProject(projectId);
          // Delete the project itself
          get().deleteProject(projectId);
        },
      };
    }),
    {
      name: 'board-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Export store selectors for convenience
 */
export const selectProjects = (state: BoardStore) => state.projects;
export const selectActiveProjectId = (state: BoardStore) => state.activeProjectId;
export const selectActiveProject = (state: BoardStore) => {
  const id = state.activeProjectId;
  return id ? state.projects[id] : null;
};
export const selectColumns = (state: BoardStore) => state.columns;
export const selectCards = (state: BoardStore) => state.cards;
export const selectTemplates = (state: BoardStore) => state.templates;
export const selectSelectedTemplateId = (state: BoardStore) => state.selectedTemplateId;
export const selectCardTemplates = (state: BoardStore) =>
  Object.values(state.templates).filter((t) => t.type === 'card');

/**
 * Selector to get all columns for the active project
 */
export const selectActiveProjectColumns = (state: BoardStore) => {
  const projectId = state.activeProjectId;
  if (!projectId) return [];
  return Object.values(state.columns)
    .filter((column) => column.projectId === projectId)
    .sort((a, b) => a.position - b.position);
};

/**
 * Selector to get all cards grouped by column for the active project
 */
export const selectActiveProjectCardsByColumn = (state: BoardStore) => {
  const projectId = state.activeProjectId;
  if (!projectId) return {};

  const cardsByColumn: Record<string, typeof state.cards[string][]> = {};

  Object.values(state.cards)
    .filter((card) => card.projectId === projectId)
    .sort((a, b) => a.position - b.position)
    .forEach((card) => {
      if (!cardsByColumn[card.columnId]) {
        cardsByColumn[card.columnId] = [];
      }
      cardsByColumn[card.columnId].push(card);
    });

  return cardsByColumn;
};
