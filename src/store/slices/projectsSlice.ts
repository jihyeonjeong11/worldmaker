/**
 * Projects Slice
 * Manages project state and actions
 */
import type {
  Project,
  ProjectId,
  ProjectsState,
  CreateProjectPayload,
  UpdateProjectPayload,
} from '@/types';
import { generateId, getTimestamp } from '../utils';

/**
 * Projects slice actions
 */
export interface ProjectsActions {
  /** Create a new project */
  createProject: (payload: CreateProjectPayload) => ProjectId;
  /** Update an existing project */
  updateProject: (payload: UpdateProjectPayload) => void;
  /** Delete a project and all its columns and cards */
  deleteProject: (id: ProjectId) => void;
  /** Set the active project */
  setActiveProject: (id: ProjectId | null) => void;
  /** Get a project by ID */
  getProject: (id: ProjectId) => Project | undefined;
  /** Get all projects as an array */
  getAllProjects: () => Project[];
  /** Toggle the starred status of a project */
  toggleProjectStar: (id: ProjectId) => void;
  /** Update the last accessed time for a project */
  updateProjectAccessTime: (id: ProjectId) => void;
  /** Get all starred projects */
  getStarredProjects: () => Project[];
  /** Get recent projects (sorted by last accessed) */
  getRecentProjects: (limit?: number) => Project[];
}

/**
 * Combined projects state and actions
 */
export interface ProjectsSlice extends ProjectsState, ProjectsActions {}

/**
 * Create the projects slice
 * @param set - Zustand set function
 * @param get - Zustand get function
 */
export const createProjectsSlice = (
  set: (fn: (state: ProjectsSlice) => void) => void,
  get: () => ProjectsSlice
): ProjectsSlice => ({
  // Initial state
  projects: {},
  activeProjectId: null,

  // Actions
  createProject: (payload) => {
    const id = generateId();
    const now = getTimestamp();

    const newProject: Project = {
      id,
      name: payload.name,
      description: payload.description ?? '',
      status: 'active',
      color: payload.color,
      isStarred: false,
      lastAccessedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    set((state) => {
      state.projects[id] = newProject;
      // Auto-set as active if it's the first project
      if (state.activeProjectId === null) {
        state.activeProjectId = id;
      }
    });

    return id;
  },

  updateProject: (payload) => {
    set((state) => {
      const project = state.projects[payload.id];
      if (project) {
        if (payload.name !== undefined) project.name = payload.name;
        if (payload.description !== undefined) project.description = payload.description;
        if (payload.status !== undefined) project.status = payload.status;
        if (payload.color !== undefined) project.color = payload.color;
        if (payload.isStarred !== undefined) project.isStarred = payload.isStarred;
        project.updatedAt = getTimestamp();
      }
    });
  },

  deleteProject: (id) => {
    set((state) => {
      delete state.projects[id];
      // Clear active project if it was deleted
      if (state.activeProjectId === id) {
        const remainingIds = Object.keys(state.projects);
        state.activeProjectId = remainingIds.length > 0 ? remainingIds[0] : null;
      }
    });
  },

  setActiveProject: (id) => {
    set((state) => {
      state.activeProjectId = id;
      // Update last accessed time when project is selected
      if (id && state.projects[id]) {
        state.projects[id].lastAccessedAt = getTimestamp();
      }
    });
  },

  getProject: (id) => {
    return get().projects[id];
  },

  getAllProjects: () => {
    return Object.values(get().projects);
  },

  toggleProjectStar: (id) => {
    set((state) => {
      const project = state.projects[id];
      if (project) {
        project.isStarred = !project.isStarred;
        project.updatedAt = getTimestamp();
      }
    });
  },

  updateProjectAccessTime: (id) => {
    set((state) => {
      const project = state.projects[id];
      if (project) {
        project.lastAccessedAt = getTimestamp();
      }
    });
  },

  getStarredProjects: () => {
    return Object.values(get().projects).filter((project) => project.isStarred);
  },

  getRecentProjects: (limit = 5) => {
    return Object.values(get().projects)
      .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())
      .slice(0, limit);
  },
});
