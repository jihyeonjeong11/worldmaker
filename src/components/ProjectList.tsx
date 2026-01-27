/**
 * ProjectList Component
 *
 * Displays all projects in a grid/list layout with options to
 * create, edit, delete, and switch between projects.
 */
import { useState, useCallback, useMemo } from 'react';
import { useBoardStore } from '@/store';
import type { Project, ProjectId } from '@/types';

interface ProjectListProps {
  /** Optional CSS class name */
  className?: string;
  /** Callback when a project is selected */
  onProjectSelect?: (projectId: ProjectId) => void;
  /** Callback when edit is clicked */
  onEditProject?: (project: Project) => void;
  /** Callback when create new is clicked */
  onCreateNew?: () => void;
}

type SortOption = 'recent' | 'name' | 'created' | 'status';

/**
 * Get status badge color
 */
function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-500/20 text-green-400';
    case 'paused':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'completed':
      return 'bg-blue-500/20 text-blue-400';
    case 'archived':
      return 'bg-gray-500/20 text-gray-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
}

/**
 * Format relative time
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * ProjectList - Display all projects with management options
 */
export function ProjectList({
  className = '',
  onProjectSelect,
  onEditProject,
  onCreateNew,
}: ProjectListProps): JSX.Element {
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Store state
  const projects = useBoardStore((state) => state.projects);
  const activeProjectId = useBoardStore((state) => state.activeProjectId);
  const setActiveProject = useBoardStore((state) => state.setActiveProject);
  const toggleProjectStar = useBoardStore((state) => state.toggleProjectStar);
  const deleteProjectWithChildren = useBoardStore((state) => state.deleteProjectWithChildren);
  const columns = useBoardStore((state) => state.columns);
  const cards = useBoardStore((state) => state.cards);

  // Get project stats
  const getProjectStats = useCallback(
    (projectId: ProjectId) => {
      const projectColumns = Object.values(columns).filter((c) => c.projectId === projectId);
      const projectCards = Object.values(cards).filter((c) => c.projectId === projectId);
      return {
        columnCount: projectColumns.length,
        cardCount: projectCards.length,
      };
    },
    [columns, cards]
  );

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let result = Object.values(projects);

    // Filter by archived status
    if (!showArchived) {
      result = result.filter((p) => p.status !== 'archived');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Sort projects
    result.sort((a, b) => {
      // Starred projects always come first
      if (a.isStarred !== b.isStarred) {
        return a.isStarred ? -1 : 1;
      }

      switch (sortBy) {
        case 'recent':
          return new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return result;
  }, [projects, sortBy, showArchived, searchQuery]);

  // Handle project selection
  const handleSelectProject = useCallback(
    (projectId: ProjectId) => {
      setActiveProject(projectId);
      onProjectSelect?.(projectId);
    },
    [setActiveProject, onProjectSelect]
  );

  // Handle star toggle
  const handleToggleStar = useCallback(
    (e: React.MouseEvent, projectId: ProjectId) => {
      e.stopPropagation();
      toggleProjectStar(projectId);
    },
    [toggleProjectStar]
  );

  // Handle delete
  const handleDelete = useCallback(
    (e: React.MouseEvent, projectId: ProjectId) => {
      e.stopPropagation();
      if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
        deleteProjectWithChildren(projectId);
      }
    },
    [deleteProjectWithChildren]
  );

  // Handle edit
  const handleEdit = useCallback(
    (e: React.MouseEvent, project: Project) => {
      e.stopPropagation();
      onEditProject?.(project);
    },
    [onEditProject]
  );

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Projects</h2>
          <p className="text-sm text-text-muted">
            {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="pl-9 pr-3 py-2 bg-surface-800 border border-border rounded-md text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              data-testid="project-search-input"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 bg-surface-800 border border-border rounded-md text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            data-testid="project-sort-select"
          >
            <option value="recent">Recently Accessed</option>
            <option value="name">Name</option>
            <option value="created">Date Created</option>
            <option value="status">Status</option>
          </select>

          {/* Show archived toggle */}
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded border-border bg-surface-800 text-primary-500 focus:ring-primary-500"
              data-testid="show-archived-checkbox"
            />
            Show Archived
          </label>

          {/* Create new button */}
          <button
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-md transition-colors"
            onClick={onCreateNew}
            data-testid="create-new-project-btn"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>
      </div>

      {/* Projects grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="project-grid">
          {filteredProjects.map((project) => {
            const stats = getProjectStats(project.id);
            const isActive = project.id === activeProjectId;
            const projectColor = project.color || '#6366f1';

            return (
              <div
                key={project.id}
                className={`relative group bg-surface-800 rounded-lg border transition-all cursor-pointer hover:shadow-lg ${
                  isActive
                    ? 'border-primary-500 ring-2 ring-primary-500/20'
                    : 'border-border hover:border-primary-500/50'
                }`}
                onClick={() => handleSelectProject(project.id)}
                data-testid={`project-card-${project.id}`}
              >
                {/* Color bar */}
                <div
                  className="h-1 rounded-t-lg"
                  style={{ backgroundColor: projectColor }}
                />

                {/* Content */}
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-text-primary truncate">
                        {project.name}
                      </h3>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </div>

                    {/* Star button */}
                    <button
                      className={`p-1 rounded transition-colors ${
                        project.isStarred
                          ? 'text-yellow-400'
                          : 'text-text-muted opacity-0 group-hover:opacity-100 hover:text-yellow-400'
                      }`}
                      onClick={(e) => handleToggleStar(e, project.id)}
                      title={project.isStarred ? 'Remove from favorites' : 'Add to favorites'}
                      data-testid={`star-btn-${project.id}`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill={project.isStarred ? 'currentColor' : 'none'}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p className="text-sm text-text-muted line-clamp-2 mb-3">
                      {project.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                      </svg>
                      {stats.columnCount} columns
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      {stats.cardCount} cards
                    </span>
                    <span className="ml-auto">
                      {formatRelativeTime(project.lastAccessedAt)}
                    </span>
                  </div>

                  {/* Actions (visible on hover) */}
                  <div className="absolute bottom-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-1.5 bg-surface-700 hover:bg-surface-600 rounded-md text-text-muted hover:text-text-primary transition-colors"
                      onClick={(e) => handleEdit(e, project)}
                      title="Edit project"
                      data-testid={`edit-btn-${project.id}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      className="p-1.5 bg-surface-700 hover:bg-red-500/20 rounded-md text-text-muted hover:text-red-400 transition-colors"
                      onClick={(e) => handleDelete(e, project.id)}
                      title="Delete project"
                      data-testid={`delete-btn-${project.id}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-3 right-3">
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs font-medium rounded-full">
                      <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
                      Active
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="empty-projects">
          <div className="w-16 h-16 mb-4 rounded-full bg-surface-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-1">
            {searchQuery ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="text-sm text-text-muted mb-4">
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Create your first project to get started'}
          </p>
          {!searchQuery && (
            <button
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-md transition-colors"
              onClick={onCreateNew}
              data-testid="create-first-project-btn"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Project
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ProjectList;
