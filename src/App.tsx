import { useEffect, useState, useCallback } from 'react';
import './App.css';
import { useBoardStore } from '@/store';
import {
  KanbanBoard,
  StoryCardDemo,
  DrawerPanel,
  CardLibraryDrawer,
  ProjectSelector,
  ProjectFormDialog,
  ProjectList,
  GenreTemplatePicker,
  WorldbuildingSandbox,
} from '@/components';
import type { ProjectFormData } from '@/components';
import { usePersistence } from '@/hooks';
import type { Template, Project, ProjectId } from '@/types';

/** View modes for the app */
type ViewMode = 'projects' | 'board' | 'demo' | 'sandbox';

/**
 * Main Application Component
 *
 * This is the root React component for the StoryMaker application.
 * It provides multi-project management and kanban board functionality.
 */
function App(): JSX.Element {
  const [appVersion, setAppVersion] = useState<string>('');
  const [_platform, setPlatform] = useState<string>('');
  const [isElectron, setIsElectron] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('projects');
  const [showStoryCardDemo, setShowStoryCardDemo] = useState<boolean>(false);
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [drawerPosition, setDrawerPosition] = useState<'left' | 'right'>('right');
  const [showCardLibrary, setShowCardLibrary] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Project form dialog state
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [projectFormMode, setProjectFormMode] = useState<'create' | 'edit'>('create');
  const [projectToEdit, setProjectToEdit] = useState<Project | undefined>(undefined);

  // Genre template picker state
  const [isGenrePickerOpen, setIsGenrePickerOpen] = useState(false);

  // Persistence hook - handles loading saved state and auto-save
  const { isHydrated, isLoading: isPersistenceLoading, status: persistenceStatus } = usePersistence();

  // Zustand store state and actions
  const projects = useBoardStore((state) => state.projects);
  // const columns = useBoardStore((state) => state.columns);
  const cards = useBoardStore((state) => state.cards);
  const activeProjectId = useBoardStore((state) => state.activeProjectId);
  const createProject = useBoardStore((state) => state.createProject);
  const updateProject = useBoardStore((state) => state.updateProject);
  const createColumn = useBoardStore((state) => state.createColumn);
  const createCard = useBoardStore((state) => state.createCard);
  const setActiveProject = useBoardStore((state) => state.setActiveProject);
  const applyProjectTemplate = useBoardStore((state) => state.applyProjectTemplate);

  // Derived state
  const projectCount = Object.keys(projects).length;
  const cardCount = Object.keys(cards).length;
  const activeProject = activeProjectId ? projects[activeProjectId] : null;

  useEffect(() => {
    // Check if we're running in Electron
    const electronAvailable = typeof window !== 'undefined' && 'electronAPI' in window;
    setIsElectron(electronAvailable);

    if (electronAvailable) {
      // Fetch app version and platform from Electron
      const fetchElectronInfo = async (): Promise<void> => {
        try {
          const version = await window.electronAPI.getVersion();
          const platformInfo = await window.electronAPI.getPlatform();
          setAppVersion(version);
          setPlatform(platformInfo);
        } catch (error) {
          console.error('Failed to get Electron info:', error);
        }
      };

      void fetchElectronInfo();
    }
  }, []);

  // Handler to open create project dialog
  const handleOpenCreateProject = useCallback(() => {
    setProjectFormMode('create');
    setProjectToEdit(undefined);
    setIsProjectFormOpen(true);
  }, []);

  // Handler to open edit project dialog
  const handleOpenEditProject = useCallback((project: Project) => {
    setProjectFormMode('edit');
    setProjectToEdit(project);
    setIsProjectFormOpen(true);
  }, []);

  // Handler for creating a new project
  const handleCreateProject = useCallback(
    (data: ProjectFormData) => {
      const projectId = createProject({
        name: data.name,
        description: data.description,
        color: data.color,
      });
      // Create default columns for the project
      const todoColumnId = createColumn({ projectId, title: 'To Do', color: '#3b82f6' });
      createColumn({ projectId, title: 'In Progress', color: '#f59e0b' });
      createColumn({ projectId, title: 'Done', color: '#22c55e' });
      // Create a sample card
      createCard({
        projectId,
        columnId: todoColumnId,
        title: 'Welcome!',
        description: 'This is your first card. Click to edit or drag to move it.',
      });
      // Switch to board view
      setViewMode('board');
    },
    [createProject, createColumn, createCard]
  );

  // Handler for updating a project
  const handleUpdateProject = useCallback(
    (projectId: string, data: Partial<ProjectFormData>) => {
      updateProject({
        id: projectId,
        name: data.name,
        description: data.description,
        color: data.color,
        status: data.status,
      });
    },
    [updateProject]
  );

  // Handler for applying a genre template
  const handleApplyGenreTemplate = useCallback(
    (template: Template, projectName: string, projectDescription?: string) => {
      applyProjectTemplate(template, projectName, projectDescription);
      setViewMode('board');
    },
    [applyProjectTemplate]
  );

  // Handler to open genre template picker
  const handleOpenGenrePicker = useCallback(() => {
    setIsGenrePickerOpen(true);
  }, []);

  // Handler for project selection from selector or list
  const handleProjectSelect = useCallback(
    (projectId: ProjectId) => {
      setActiveProject(projectId);
      setViewMode('board');
    },
    [setActiveProject]
  );

  // Handler for toggling story card demo
  const handleToggleStoryCardDemo = (): void => {
    setShowStoryCardDemo(!showStoryCardDemo);
    if (!showStoryCardDemo) {
      setViewMode('demo');
    } else {
      setViewMode('projects');
    }
  };

  const handleOpenDrawer = (position: 'left' | 'right'): void => {
    setDrawerPosition(position);
    setShowDrawer(true);
  };

  const handleCloseDrawer = (): void => {
    setShowDrawer(false);
  };

  const handleOpenCardLibrary = (): void => {
    setShowCardLibrary(true);
  };

  const handleCloseCardLibrary = (): void => {
    setShowCardLibrary(false);
  };

  const handleSelectTemplate = (template: Template): void => {
    setSelectedTemplate(template);
    console.log('Selected template:', template);
  };

  // Show loading state while persistence is initializing
  if (!isHydrated) {
    return (
      <div className="app" data-testid="loading-screen">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: '1rem',
          }}
        >
          <h1>StoryMaker</h1>
          <p style={{ color: '#9ca3af' }}>Loading your projects...</p>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #374151',
              borderTopColor: '#6366f1',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header with navigation */}
      <header className="app-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem' }}>
        <div>
          <h1 style={{ margin: 0, cursor: 'pointer' }} onClick={() => setViewMode('projects')}>
            StoryMaker
          </h1>
          <p className="app-subtitle" style={{ margin: 0 }}>Your story planning companion</p>
        </div>

        {/* Navigation and project selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* View mode buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setViewMode('projects')}
              data-testid="view-projects-btn"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: viewMode === 'projects' ? '#6366f1' : 'transparent',
                color: viewMode === 'projects' ? 'white' : '#9ca3af',
                border: '1px solid #374151',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Projects
            </button>
            <button
              onClick={() => activeProjectId && setViewMode('board')}
              disabled={!activeProjectId}
              data-testid="view-board-btn"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: viewMode === 'board' ? '#6366f1' : 'transparent',
                color: viewMode === 'board' ? 'white' : '#9ca3af',
                border: '1px solid #374151',
                borderRadius: '4px',
                cursor: activeProjectId ? 'pointer' : 'not-allowed',
                opacity: activeProjectId ? 1 : 0.5,
              }}
            >
              Board
            </button>
            <button
              onClick={() => setViewMode('sandbox')}
              data-testid="view-sandbox-btn"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: viewMode === 'sandbox' ? '#22c55e' : 'transparent',
                color: viewMode === 'sandbox' ? 'white' : '#9ca3af',
                border: '1px solid #374151',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Sandbox
            </button>
          </div>

          {/* Quick-access project selector (visible on all views when projects exist) */}
          {projectCount > 0 && (
            <ProjectSelector
              onProjectSelect={handleProjectSelect}
              onCreateNew={handleOpenCreateProject}
              displayMode={viewMode === 'board' ? 'full' : 'compact'}
              showMetadata={true}
            />
          )}
        </div>
      </header>

      <main className="app-main" style={{ padding: '1rem 2rem' }}>
        {/* Status bar */}
        <div className="status-info" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.875rem' }}>
          <div className="status-item">
            <span className="status-label">Environment:</span>
            <span className="status-value">
              {isElectron ? 'Electron Desktop App' : 'Web Browser'}
            </span>
          </div>

          {isElectron && appVersion && (
            <div className="status-item">
              <span className="status-label">Version:</span>
              <span className="status-value">{appVersion}</span>
            </div>
          )}

          <div className="status-item">
            <span className="status-label">Auto-Save:</span>
            <span className="status-value" data-testid="persistence-status">
              {isPersistenceLoading
                ? 'Loading...'
                : isHydrated
                ? persistenceStatus?.isAutoSaveEnabled
                  ? `Active (${persistenceStatus.adapterName})`
                  : 'Disabled'
                : 'Initializing...'}
            </span>
          </div>

          <div className="status-item">
            <span className="status-label">Projects:</span>
            <span className="status-value" data-testid="project-count">{projectCount}</span>
          </div>

          <div className="status-item">
            <span className="status-label">Cards:</span>
            <span className="status-value" data-testid="card-count">{cardCount}</span>
          </div>

          {activeProject && (
            <div className="status-item">
              <span className="status-label">Active:</span>
              <span className="status-value" data-testid="active-project">{activeProject.name}</span>
            </div>
          )}

          {persistenceStatus?.lastSaved && (
            <div className="status-item">
              <span className="status-label">Last Saved:</span>
              <span className="status-value" data-testid="last-saved">
                {new Date(persistenceStatus.lastSaved).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        {/* Projects View */}
        {viewMode === 'projects' && (
          <section data-testid="projects-view" style={{ marginTop: '1rem' }}>
            <ProjectList
              onProjectSelect={handleProjectSelect}
              onEditProject={handleOpenEditProject}
              onCreateNew={handleOpenCreateProject}
            />

            {/* Additional demo buttons */}
            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#9ca3af' }}>Demo Features</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={handleToggleStoryCardDemo}
                  data-testid="toggle-story-card-demo-btn"
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {showStoryCardDemo ? 'Hide StoryCard Demo' : 'Show StoryCard Demo'}
                </button>
                <button
                  onClick={() => handleOpenDrawer('right')}
                  data-testid="toggle-drawer-btn"
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#14b8a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Open Drawer
                </button>
                <button
                  onClick={handleOpenGenrePicker}
                  data-testid="open-genre-picker-btn"
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Create from Genre Template
                </button>
                <button
                  onClick={handleOpenCardLibrary}
                  data-testid="open-card-library-btn"
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#ec4899',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Open Card Library
                </button>
              </div>
              {selectedTemplate && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'rgba(236, 72, 153, 0.1)', borderRadius: '8px', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                  <p style={{ fontSize: '0.875rem', color: '#f9a8d4' }}>
                    Last selected template: <strong>{selectedTemplate.name}</strong> ({selectedTemplate.type})
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Board View */}
        {viewMode === 'board' && (
          <section
            className="kanban-section"
            data-testid="kanban-section"
            style={{
              marginTop: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1rem',
              minHeight: '500px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <KanbanBoard />
          </section>
        )}

        {/* Sandbox View */}
        {viewMode === 'sandbox' && (
          <section
            data-testid="sandbox-section"
            style={{
              marginTop: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              overflow: 'hidden',
              minHeight: '600px',
            }}
          >
            <WorldbuildingSandbox onClose={() => setViewMode('projects')} />
          </section>
        )}

        {/* Demo View */}
        {viewMode === 'demo' && showStoryCardDemo && (
          <section
            className="story-card-demo-section"
            data-testid="story-card-demo-section"
            style={{
              marginTop: '1rem',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <StoryCardDemo />
            <button
              onClick={() => {
                setShowStoryCardDemo(false);
                setViewMode('projects');
              }}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Back to Projects
            </button>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>Built with React + Electron + Vite + TypeScript</p>
      </footer>

      {/* Project Form Dialog */}
      <ProjectFormDialog
        isOpen={isProjectFormOpen}
        onClose={() => setIsProjectFormOpen(false)}
        mode={projectFormMode}
        project={projectToEdit}
        onCreate={handleCreateProject}
        onUpdate={handleUpdateProject}
      />

      {/* DrawerPanel Demo */}
      <DrawerPanel
        isOpen={showDrawer}
        onClose={handleCloseDrawer}
        position={drawerPosition}
        title="Test Drawer"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            This is the drawer panel content. It can contain any React components.
          </p>
          <div className="p-3 bg-surface-700 rounded-card">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Features</h3>
            <ul className="text-sm text-text-muted space-y-1">
              <li>• Smooth slide-in/out animations</li>
              <li>• Overlay backdrop with fade</li>
              <li>• Press Escape to close</li>
              <li>• Click outside to close</li>
              <li>• Configurable position (left/right)</li>
              <li>• Multiple size options</li>
            </ul>
          </div>
          <button
            onClick={handleCloseDrawer}
            className="btn-primary w-full"
          >
            Close Drawer
          </button>
        </div>
      </DrawerPanel>

      {/* Genre Template Picker */}
      <GenreTemplatePicker
        isOpen={isGenrePickerOpen}
        onClose={() => setIsGenrePickerOpen(false)}
        onApplyTemplate={handleApplyGenreTemplate}
      />

      {/* Card Library Drawer */}
      <CardLibraryDrawer
        isOpen={showCardLibrary}
        onClose={handleCloseCardLibrary}
        onSelectTemplate={handleSelectTemplate}
        position="right"
      />
    </div>
  );
}

export default App;
