/**
 * ProjectFormDialog Component
 *
 * A modal dialog for creating and editing projects.
 * Supports setting name, description, and color.
 */
import { useState, useEffect, useCallback } from 'react';
import type { Project, ProjectStatus } from '@/types';

interface ProjectFormDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback to close the dialog */
  onClose: () => void;
  /** Mode: 'create' for new project, 'edit' for existing */
  mode: 'create' | 'edit';
  /** Project data when editing */
  project?: Project;
  /** Callback when project is created */
  onCreate?: (data: ProjectFormData) => void;
  /** Callback when project is updated */
  onUpdate?: (projectId: string, data: Partial<ProjectFormData>) => void;
}

export interface ProjectFormData {
  name: string;
  description: string;
  color: string;
  status: ProjectStatus;
}

/**
 * Available color options for projects
 */
const COLOR_OPTIONS = [
  { value: '#6366f1', name: 'Indigo' },
  { value: '#8b5cf6', name: 'Purple' },
  { value: '#ec4899', name: 'Pink' },
  { value: '#ef4444', name: 'Red' },
  { value: '#f59e0b', name: 'Amber' },
  { value: '#22c55e', name: 'Green' },
  { value: '#06b6d4', name: 'Cyan' },
  { value: '#3b82f6', name: 'Blue' },
];

/**
 * Available status options for projects
 */
const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

/**
 * ProjectFormDialog - Modal for creating/editing projects
 */
export function ProjectFormDialog({
  isOpen,
  onClose,
  mode,
  project,
  onCreate,
  onUpdate,
}: ProjectFormDialogProps): JSX.Element | null {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0].value);
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens or project changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && project) {
        setName(project.name);
        setDescription(project.description);
        setColor(project.color || COLOR_OPTIONS[0].value);
        setStatus(project.status);
      } else {
        setName('');
        setDescription('');
        setColor(COLOR_OPTIONS[0].value);
        setStatus('active');
      }
      setError(null);
    }
  }, [isOpen, mode, project]);

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Validate
      const trimmedName = name.trim();
      if (!trimmedName) {
        setError('Project name is required');
        return;
      }

      const formData: ProjectFormData = {
        name: trimmedName,
        description: description.trim(),
        color,
        status,
      };

      if (mode === 'create') {
        onCreate?.(formData);
      } else if (project) {
        onUpdate?.(project.id, formData);
      }

      onClose();
    },
    [name, description, color, status, mode, project, onCreate, onUpdate, onClose]
  );

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      data-testid="project-form-dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        data-testid="project-form-backdrop"
      />

      {/* Dialog */}
      <div className="relative bg-surface-800 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">
            {mode === 'create' ? 'Create New Project' : 'Edit Project'}
          </h2>
          <button
            className="p-1 text-text-muted hover:text-text-primary rounded-md transition-colors"
            onClick={onClose}
            data-testid="close-project-form"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Name field */}
          <div>
            <label htmlFor="project-name" className="block text-sm font-medium text-text-secondary mb-1">
              Project Name *
            </label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              className="w-full px-3 py-2 bg-surface-900 border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter project name"
              autoFocus
              data-testid="project-name-input"
            />
          </div>

          {/* Description field */}
          <div>
            <label htmlFor="project-description" className="block text-sm font-medium text-text-secondary mb-1">
              Description
            </label>
            <textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-surface-900 border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Enter project description (optional)"
              data-testid="project-description-input"
            />
          </div>

          {/* Color selector */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Project Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === option.value
                      ? 'border-white scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: option.value }}
                  onClick={() => setColor(option.value)}
                  title={option.name}
                  data-testid={`color-option-${option.name.toLowerCase()}`}
                />
              ))}
            </div>
          </div>

          {/* Status selector (only for edit mode) */}
          {mode === 'edit' && (
            <div>
              <label htmlFor="project-status" className="block text-sm font-medium text-text-secondary mb-1">
                Status
              </label>
              <select
                id="project-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 bg-surface-900 border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                data-testid="project-status-select"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              onClick={onClose}
              data-testid="cancel-project-form"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
              data-testid="submit-project-form"
            >
              {mode === 'create' ? 'Create Project' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectFormDialog;
