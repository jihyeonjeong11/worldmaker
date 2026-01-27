/**
 * CardFormDialog Component
 *
 * A modal dialog for creating and editing story cards with full validation.
 * Supports title, description, priority, status, and tags fields.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import type { Card, CardPriority, CardStatus, ColumnId, ProjectId, WorldbuildingCardType, WorldbuildingData, WorldbuildingCue } from '@/types';
// CardPriority and CardStatus kept in import for CardFormData interface
import { WORLDBUILDING_CARD_TYPES } from '@/types';

// Priority and status options kept for potential future use but not shown in UI

export interface CardFormData {
  title: string;
  description: string;
  priority: CardPriority;
  status: CardStatus;
  tags: string[];
  worldbuilding?: WorldbuildingData;
}

interface CardFormDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when the dialog should close */
  onClose: () => void;
  /** Callback when a card should be created (for new cards) */
  onCreate?: (data: CardFormData, columnId: ColumnId, projectId: ProjectId) => void;
  /** Callback when a card should be updated (for editing) */
  onUpdate?: (cardId: string, data: Partial<CardFormData>) => void;
  /** The card being edited (if editing mode) */
  card?: Card;
  /** Column ID for creating new cards */
  columnId?: ColumnId;
  /** Project ID for creating new cards */
  projectId?: ProjectId;
  /** Dialog mode - 'create' or 'edit' */
  mode: 'create' | 'edit';
}

export function CardFormDialog({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  card,
  columnId,
  projectId,
  mode,
}: CardFormDialogProps): JSX.Element | null {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<CardPriority>('medium');
  const [status, setStatus] = useState<CardStatus>('active');
  const [tagsInput, setTagsInput] = useState('');

  // Worldbuilding state
  const [isWorldbuilding, setIsWorldbuilding] = useState(false);
  const [wbCardType, setWbCardType] = useState<WorldbuildingCardType | null>(null);
  const [wbCues, setWbCues] = useState<WorldbuildingCue[]>([{ text: '', suggestion: '' }]);

  // Validation state
  const [errors, setErrors] = useState<{ title?: string; tags?: string }>({});
  const [touched, setTouched] = useState<{ title?: boolean; tags?: boolean }>({});

  // Refs for focus management
  const titleInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Initialize form with card data when editing or reset when creating
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && card) {
        setTitle(card.title);
        setDescription(card.description);
        setPriority(card.priority);
        setStatus(card.status);
        setTagsInput(card.tags.join(', '));
        if (card.worldbuilding) {
          setIsWorldbuilding(true);
          setWbCardType(card.worldbuilding.cardType);
          setWbCues(card.worldbuilding.cues.length > 0 ? card.worldbuilding.cues : [{ text: '', suggestion: '' }]);
        } else {
          setIsWorldbuilding(false);
          setWbCardType(null);
          setWbCues([{ text: '', suggestion: '' }]);
        }
      } else {
        // Reset for create mode
        setTitle('');
        setDescription('');
        setPriority('medium');
        setStatus('active');
        setTagsInput('');
        setIsWorldbuilding(true);
        setWbCardType(null);
        setWbCues([{ text: '', suggestion: '' }]);
      }
      setErrors({});
      setTouched({});
    }
  }, [isOpen, mode, card]);

  // Focus title input when dialog opens
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      // Small delay to ensure dialog is fully rendered
      const timer = setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Parse tags from comma-separated string
  const parseTags = useCallback((input: string): string[] => {
    return input
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }, []);

  // Validate form fields
  const validateForm = useCallback((): boolean => {
    const newErrors: { title?: string; tags?: string } = {};

    // Title validation
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      newErrors.title = 'Title is required';
    } else if (trimmedTitle.length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    } else if (trimmedTitle.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    // Tags validation (optional, but validate format if provided)
    const tags = parseTags(tagsInput);
    if (tags.some((tag) => tag.length > 30)) {
      newErrors.tags = 'Each tag must be less than 30 characters';
    }
    if (tags.length > 10) {
      newErrors.tags = 'Maximum 10 tags allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, tagsInput, parseTags]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ title: true, tags: true });

    if (!validateForm()) {
      return;
    }

    // Build worldbuilding data if applicable
    const worldbuildingData: WorldbuildingData | undefined =
      isWorldbuilding && wbCardType
        ? {
            cardType: wbCardType,
            cues: wbCues.filter((cue) => cue.text.trim().length > 0).map((cue) => ({
              text: cue.text.trim(),
              suggestion: cue.suggestion?.trim() || undefined,
            })),
          }
        : undefined;

    const formData: CardFormData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      tags: parseTags(tagsInput),
      ...(worldbuildingData ? { worldbuilding: worldbuildingData } : {}),
    };

    if (mode === 'create' && onCreate && columnId && projectId) {
      onCreate(formData, columnId, projectId);
    } else if (mode === 'edit' && onUpdate && card) {
      onUpdate(card.id, formData);
    }

    onClose();
  };

  // Handle cancel
  const handleCancel = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onClose();
  };

  // Handle field blur for validation
  const handleTitleBlur = (): void => {
    setTouched((prev) => ({ ...prev, title: true }));
    validateForm();
  };

  const handleTagsBlur = (): void => {
    setTouched((prev) => ({ ...prev, tags: true }));
    validateForm();
  };

  if (!isOpen) {
    return null;
  }

  const dialogTitle = mode === 'create' ? 'Create New Card' : 'Edit Card';
  const submitButtonText = mode === 'create' ? 'Create Card' : 'Save Changes';

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 animate-fade-in"
      data-testid="card-form-dialog-overlay"
    >
      <div
        ref={dialogRef}
        className="bg-surface-800 border border-border rounded-card p-6 w-full max-w-lg shadow-modal animate-scale-in max-h-[90vh] overflow-y-auto"
        data-testid="card-form-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-form-title"
      >
        <h2
          id="card-form-title"
          className="text-lg font-semibold text-text-primary mb-4"
        >
          {dialogTitle}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Title input */}
          <div className="mb-4">
            <label
              htmlFor="card-title"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Title <span className="text-error-500">*</span>
            </label>
            <input
              ref={titleInputRef}
              id="card-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Enter card title..."
              className={`input ${touched.title && errors.title ? 'border-error-500 focus:ring-error-500' : ''}`}
              data-testid="card-title-input"
              required
            />
            {touched.title && errors.title && (
              <p className="mt-1 text-sm text-error-500" data-testid="card-title-error">
                {errors.title}
              </p>
            )}
          </div>

          {/* Description input */}
          <div className="mb-4">
            <label
              htmlFor="card-description"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Description
            </label>
            <textarea
              id="card-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter card description (optional)..."
              rows={3}
              className="input resize-none"
              data-testid="card-description-input"
            />
          </div>

          {/* Worldbuilding Toggle & Fields */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isWorldbuilding}
                onChange={(e) => {
                  setIsWorldbuilding(e.target.checked);
                  if (!e.target.checked) {
                    setWbCardType(null);
                    setWbCues([{ text: '', suggestion: '' }]);
                  }
                }}
                className="w-4 h-4 rounded border-border bg-surface-700 text-primary-500 focus:ring-primary-500"
                data-testid="worldbuilding-toggle"
              />
              <span className="text-sm font-medium text-text-secondary">
                🌍 Worldbuilding Card
              </span>
            </label>

            {isWorldbuilding && (
              <div className="mt-3 p-3 bg-surface-700/50 rounded-card border border-border space-y-3">
                {/* Card Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Card Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {WORLDBUILDING_CARD_TYPES.map((meta) => (
                      <button
                        key={meta.type}
                        type="button"
                        onClick={() => setWbCardType(meta.type)}
                        className={`px-2 py-1.5 rounded-button text-xs font-medium transition-all text-left ${
                          wbCardType === meta.type
                            ? 'ring-2 ring-offset-1 ring-offset-surface-800 text-white'
                            : 'opacity-60 hover:opacity-100 text-white'
                        }`}
                        style={{
                          backgroundColor: meta.color,
                          boxShadow: wbCardType === meta.type ? `0 0 0 2px ${meta.color}` : 'none',
                        }}
                        data-testid={`wb-type-${meta.type}`}
                        title={meta.description}
                      >
                        {meta.icon} {meta.label}
                      </button>
                    ))}
                  </div>
                  {wbCardType && (
                    <p className="mt-1 text-xs text-text-muted">
                      {WORLDBUILDING_CARD_TYPES.find((m) => m.type === wbCardType)?.description}
                    </p>
                  )}
                </div>

                {/* Cues Section */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Cues <span className="text-text-muted font-normal">(optional worldbuilding elements)</span>
                  </label>
                  <div className="space-y-2">
                    {wbCues.map((cue, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            value={cue.text}
                            onChange={(e) => {
                              const updated = [...wbCues];
                              updated[index] = { ...updated[index], text: e.target.value };
                              setWbCues(updated);
                            }}
                            placeholder={`Cue ${index + 1} text...`}
                            className="input text-sm"
                            data-testid={`wb-cue-text-${index}`}
                          />
                          <input
                            type="text"
                            value={cue.suggestion ?? ''}
                            onChange={(e) => {
                              const updated = [...wbCues];
                              updated[index] = { ...updated[index], suggestion: e.target.value };
                              setWbCues(updated);
                            }}
                            placeholder="Interpretation suggestion (smaller text)..."
                            className="input text-xs text-text-muted"
                            data-testid={`wb-cue-suggestion-${index}`}
                          />
                        </div>
                        {wbCues.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setWbCues(wbCues.filter((_, i) => i !== index))}
                            className="p-1 text-error-400 hover:text-error-300 mt-1"
                            title="Remove cue"
                            data-testid={`wb-cue-remove-${index}`}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setWbCues([...wbCues, { text: '', suggestion: '' }])}
                    className="mt-2 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                    data-testid="wb-add-cue-btn"
                  >
                    + Add Cue
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tags input */}
          <div className="mb-6">
            <label
              htmlFor="card-tags"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Tags
            </label>
            <input
              id="card-tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onBlur={handleTagsBlur}
              placeholder="Enter tags separated by commas (e.g., scene, chapter, important)"
              className={`input ${touched.tags && errors.tags ? 'border-error-500 focus:ring-error-500' : ''}`}
              data-testid="card-tags-input"
            />
            {touched.tags && errors.tags && (
              <p className="mt-1 text-sm text-error-500" data-testid="card-tags-error">
                {errors.tags}
              </p>
            )}
            <p className="mt-1 text-xs text-text-muted">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Preview section */}
          <div className="mb-6 p-3 bg-surface-700 rounded-card">
            <p className="text-xs text-text-muted mb-2">Preview:</p>
            <div className="story-card p-3 rounded-card">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-medium text-text-primary text-sm line-clamp-2">
                  {title || 'Card Title'}
                </h4>
              </div>
              {description && (
                <p className="text-text-muted text-xs line-clamp-2 mb-2">
                  {description}
                </p>
              )}
              {isWorldbuilding && wbCardType && (
                <div className="mb-2">
                  <span
                    className="inline-block px-1.5 py-0.5 rounded text-xs text-white"
                    style={{ backgroundColor: WORLDBUILDING_CARD_TYPES.find((m) => m.type === wbCardType)?.color }}
                  >
                    {WORLDBUILDING_CARD_TYPES.find((m) => m.type === wbCardType)?.icon}{' '}
                    {WORLDBUILDING_CARD_TYPES.find((m) => m.type === wbCardType)?.label}
                  </span>
                  {wbCues.filter((c) => c.text.trim()).length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {wbCues.filter((c) => c.text.trim()).map((cue, i) => (
                        <div key={i} className="text-xs">
                          <span className="text-text-secondary">• {cue.text}</span>
                          {cue.suggestion && (
                            <span className="text-text-muted italic ml-1">— {cue.suggestion}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {parseTags(tagsInput).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {parseTags(tagsInput).slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="badge badge-primary text-xs py-0"
                    >
                      {tag}
                    </span>
                  ))}
                  {parseTags(tagsInput).length > 3 && (
                    <span className="text-xs text-text-muted">
                      +{parseTags(tagsInput).length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
              data-testid="card-form-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!title.trim()}
              data-testid="card-form-submit-btn"
            >
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CardFormDialog;
