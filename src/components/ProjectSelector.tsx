/**
 * ProjectSelector Component
 *
 * A dropdown component for switching between projects.
 * Shows the current project and allows selecting from available projects.
 * Can be displayed in compact mode for navigation or full mode for detailed views.
 */
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useBoardStore } from '@/store';
import type { Project, ProjectId } from '@/types';

interface ProjectSelectorProps {
  /** Optional CSS class name */
  className?: string;
  /** Callback when a project is selected */
  onProjectSelect?: (projectId: ProjectId) => void;
  /** Callback when "Create New" is clicked */
  onCreateNew?: () => void;
  /** Display mode - compact for nav, full for detailed view */
  displayMode?: 'compact' | 'full';
  /** Show metadata like card count in dropdown */
  showMetadata?: boolean;
}

/**
 * Color options for projects
 */
const PROJECT_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
];

/**
 * Get a color based on project or use default
 */
function getProjectColor(project: Project): string {
  return project.color || PROJECT_COLORS[0];
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
 * ProjectSelector - Dropdown for switching between projects
 */
export function ProjectSelector({
  className = '',
  onProjectSelect,
  onCreateNew,
  displayMode = 'full',
  showMetadata = true,
}: ProjectSelectorProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Store state
  const projects = useBoardStore((state) => state.projects);
  const activeProjectId = useBoardStore((state) => state.activeProjectId);
  const setActiveProject = useBoardStore((state) => state.setActiveProject);
  const toggleProjectStar = useBoardStore((state) => state.toggleProjectStar);
  const cards = useBoardStore((state) => state.cards);

  // Get project card count
  const getProjectCardCount = useCallback(
    (projectId: ProjectId) => {
      return Object.values(cards).filter((c) => c.projectId === projectId).length;
    },
    [cards]
  );

  // Derived state
  const projectList = Object.values(projects);
  const activeProject = activeProjectId ? projects[activeProjectId] : null;
  const starredProjects = projectList.filter((p) => p.isStarred);
  const recentProjects = projectList
    .filter((p) => !p.isStarred)
    .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())
    .slice(0, 5);

  // Get active project card count
  const activeProjectCardCount = useMemo(() => {
    return activeProjectId ? getProjectCardCount(activeProjectId) : 0;
  }, [activeProjectId, getProjectCardCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  // Handle project selection
  const handleSelectProject = useCallback(
    (projectId: ProjectId) => {
      setActiveProject(projectId);
      setIsOpen(false);
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

  // Handle create new
  const handleCreateNew = useCallback(() => {
    setIsOpen(false);
    onCreateNew?.();
  }, [onCreateNew]);

  // Render a project item in the dropdown
  const renderProjectItem = (project: Project) => {
    const isActive = project.id === activeProjectId;
    const color = getProjectColor(project);
    const cardCount = showMetadata ? getProjectCardCount(project.id) : 0;

    return (
      <div
        key={project.id}
        className={`flex items-center gap-3 px-3 py-2 cursor-pointer rounded-md transition-colors ${isActive ? 'bg-primary-500/20' : 'hover:bg-surface-700'}`}
        onClick={() => handleSelectProject(project.id)}
        role="option"
        aria-selected={isActive}
        data-testid={`project-option-${project.id}`}
      >
        {/* Color indicator */}
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />

        {/* Project info */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-text-primary truncate">
            {project.name}
          </div>
          {showMetadata ? (
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {cardCount} card{cardCount !== 1 ? 's' : ''}
              </span>
              <span>•</span>
              <span>{formatRelativeTime(project.lastAccessedAt)}</span>
            </div>
          ) : project.description ? (
            <div className="text-xs text-text-muted truncate">
              {project.description}
            </div>
          ) : null}
        </div>

        {/* Star button */}
        <button
          className={`p-1 rounded hover:bg-surface-600 transition-colors ${project.isStarred ? 'text-yellow-400' : 'text-text-muted hover:text-yellow-400'}`}
          onClick={(e) => handleToggleStar(e, project.id)}
          title={project.isStarred ? 'Remove from favorites' : 'Add to favorites'}
          data-testid={`star-project-${project.id}`}
        >
          <svg
            className="w-4 h-4"
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

        {/* Active indicator */}
        {isActive && (
          <svg
            className="w-4 h-4 text-primary-400 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    );
  };

  return (
    <div
      className={`relative ${className}`}
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger button */}
      <button
        className={`flex items-center gap-2 px-3 py-2 bg-surface-800 hover:bg-surface-700 rounded-lg transition-colors border border-border ${displayMode === 'compact' ? 'min-w-[160px]' : 'min-w-[200px]'}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        data-testid="project-selector-trigger"
      >
        {activeProject ? (
          <>
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: getProjectColor(activeProject) }}
            />
            <div className="flex-1 text-left min-w-0">
              <span className="text-sm font-medium text-text-primary truncate block">
                {activeProject.name}
              </span>
              {displayMode === 'full' && showMetadata && (
                <span className="text-xs text-text-muted">
                  {activeProjectCardCount} card{activeProjectCardCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </>
        ) : (
          <span className="flex-1 text-left text-sm text-text-muted">
            Select a project
          </span>
        )}
        <svg
          className={`w-4 h-4 text-text-muted transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-72 bg-surface-800 border border-border rounded-lg shadow-lg z-50 overflow-hidden"
          role="listbox"
          data-testid="project-selector-dropdown"
        >
          {/* Starred projects section */}
          {starredProjects.length > 0 && (
            <div className="p-2 border-b border-border">
              <div className="px-2 py-1 text-xs font-semibold text-text-muted uppercase tracking-wide">
                Favorites
              </div>
              {starredProjects.map(renderProjectItem)}
            </div>
          )}

          {/* Recent projects section */}
          {recentProjects.length > 0 && (
            <div className="p-2 border-b border-border">
              <div className="px-2 py-1 text-xs font-semibold text-text-muted uppercase tracking-wide">
                Recent
              </div>
              {recentProjects.map(renderProjectItem)}
            </div>
          )}

          {/* All projects section (if no starred or recent) */}
          {starredProjects.length === 0 && recentProjects.length === 0 && projectList.length > 0 && (
            <div className="p-2 border-b border-border">
              <div className="px-2 py-1 text-xs font-semibold text-text-muted uppercase tracking-wide">
                All Projects
              </div>
              {projectList.map(renderProjectItem)}
            </div>
          )}

          {/* Empty state */}
          {projectList.length === 0 && (
            <div className="p-4 text-center text-text-muted">
              <p className="text-sm">No projects yet</p>
            </div>
          )}

          {/* Create new project button */}
          <div className="p-2">
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary-400 hover:bg-surface-700 rounded-md transition-colors"
              onClick={handleCreateNew}
              data-testid="create-project-from-selector"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create New Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectSelector;
