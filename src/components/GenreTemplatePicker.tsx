/**
 * GenreTemplatePicker Component
 *
 * A dialog that allows users to select a genre template (thriller, romance, fantasy, mystery)
 * and create a new project with pre-configured column structures for that narrative style.
 */
import { useState, useCallback, useMemo } from 'react';
import type { Template } from '@/types';
import { BUILT_IN_TEMPLATES } from './CardLibraryDrawer';

/**
 * Genre template metadata for display
 */
interface GenreInfo {
  id: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const GENRE_META: Record<string, GenreInfo> = {
  'genre-thriller': {
    id: 'genre-thriller',
    emoji: '\u{1F525}',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  'genre-romance': {
    id: 'genre-romance',
    emoji: '\u{1F496}',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
  },
  'genre-fantasy': {
    id: 'genre-fantasy',
    emoji: '\u{1FA84}',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  'genre-mystery': {
    id: 'genre-mystery',
    emoji: '\u{1F50D}',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
};

export interface GenreTemplatePickerProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback to close the dialog */
  onClose: () => void;
  /** Callback when a template is applied with project name */
  onApplyTemplate: (template: Template, projectName: string, projectDescription?: string) => void;
}

/**
 * GenreTemplatePicker - Dialog for selecting genre templates and creating projects
 */
export function GenreTemplatePicker({
  isOpen,
  onClose,
  onApplyTemplate,
}: GenreTemplatePickerProps): JSX.Element | null {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Get genre templates from built-in templates
  const genreTemplates = useMemo(() => {
    return BUILT_IN_TEMPLATES.filter((t) => t.id.startsWith('genre-'));
  }, []);

  const selectedTemplate = useMemo(() => {
    return genreTemplates.find((t) => t.id === selectedTemplateId) || null;
  }, [genreTemplates, selectedTemplateId]);

  const handleSelectGenre = useCallback((templateId: string) => {
    setSelectedTemplateId(templateId);
    setError(null);
  }, []);

  const handleApply = useCallback(() => {
    if (!selectedTemplate) {
      setError('Please select a genre template');
      return;
    }
    const trimmedName = projectName.trim();
    if (!trimmedName) {
      setError('Project name is required');
      return;
    }
    onApplyTemplate(selectedTemplate, trimmedName, projectDescription.trim() || undefined);
    // Reset state
    setSelectedTemplateId(null);
    setProjectName('');
    setProjectDescription('');
    setError(null);
    onClose();
  }, [selectedTemplate, projectName, projectDescription, onApplyTemplate, onClose]);

  const handleClose = useCallback(() => {
    setSelectedTemplateId(null);
    setProjectName('');
    setProjectDescription('');
    setError(null);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      data-testid="genre-template-picker"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        data-testid="genre-picker-backdrop"
      />

      {/* Dialog */}
      <div className="relative bg-surface-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Create from Genre Template
            </h2>
            <p className="text-sm text-text-muted mt-0.5">
              Choose a genre to auto-generate column structures for your story
            </p>
          </div>
          <button
            className="p-1 text-text-muted hover:text-text-primary rounded-md transition-colors"
            onClick={handleClose}
            data-testid="close-genre-picker"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Genre Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6" data-testid="genre-grid">
            {genreTemplates.map((template) => {
              const meta = GENRE_META[template.id];
              const isSelected = selectedTemplateId === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleSelectGenre(template.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                    isSelected
                      ? `${meta?.borderColor || 'border-primary-500'} ${meta?.bgColor || 'bg-primary-500/10'} ring-2 ring-primary-500/30`
                      : 'border-border hover:border-primary-500/50 bg-surface-900/50 hover:bg-surface-700/50'
                  }`}
                  data-testid={`genre-option-${template.id}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{meta?.emoji || '📖'}</span>
                    <h3 className={`font-semibold ${isSelected ? (meta?.color || 'text-primary-400') : 'text-text-primary'}`}>
                      {template.name}
                    </h3>
                  </div>
                  <p className="text-xs text-text-muted mb-2">{template.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.columns.map((col, i) => (
                      <span
                        key={i}
                        className="inline-block px-1.5 py-0.5 text-[10px] rounded-sm"
                        style={{
                          backgroundColor: `${col.color}20`,
                          color: col.color,
                          border: `1px solid ${col.color}40`,
                        }}
                      >
                        {col.title}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Template Preview */}
          {selectedTemplate && (
            <div className="mb-6 p-4 rounded-lg bg-surface-900/50 border border-border" data-testid="template-preview">
              <h4 className="text-sm font-medium text-text-secondary mb-2">
                Template Preview: {selectedTemplate.name}
              </h4>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {selectedTemplate.columns.map((col, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-32 rounded-md overflow-hidden border border-border"
                  >
                    <div
                      className="px-2 py-1.5 text-xs font-medium text-white"
                      style={{ backgroundColor: col.color || '#6b7280' }}
                    >
                      {col.title}
                    </div>
                    <div className="p-1.5 bg-surface-800 space-y-1">
                      {col.cards.length > 0 ? (
                        col.cards.map((card, j) => (
                          <div key={j} className="px-1.5 py-1 text-[10px] text-text-muted bg-surface-700 rounded">
                            {card.title}
                          </div>
                        ))
                      ) : (
                        <div className="px-1.5 py-1 text-[10px] text-text-muted italic">
                          Empty
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Name & Description */}
          <div className="space-y-4">
            <div>
              <label htmlFor="genre-project-name" className="block text-sm font-medium text-text-secondary mb-1">
                Project Name *
              </label>
              <input
                id="genre-project-name"
                type="text"
                value={projectName}
                onChange={(e) => { setProjectName(e.target.value); setError(null); }}
                className="w-full px-3 py-2 bg-surface-900 border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your story project name"
                data-testid="genre-project-name-input"
              />
            </div>
            <div>
              <label htmlFor="genre-project-desc" className="block text-sm font-medium text-text-secondary mb-1">
                Description (optional)
              </label>
              <textarea
                id="genre-project-desc"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-surface-900 border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Describe your story (optional)"
                data-testid="genre-project-desc-input"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            onClick={handleClose}
            data-testid="cancel-genre-picker"
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleApply}
            disabled={!selectedTemplateId || !projectName.trim()}
            data-testid="apply-genre-template-btn"
          >
            Create from Template
          </button>
        </div>
      </div>
    </div>
  );
}

export default GenreTemplatePicker;
