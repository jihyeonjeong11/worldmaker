/**
 * SaveAsTemplateDialog Component
 *
 * A modal dialog for saving an existing card as a reusable template.
 * Allows users to specify a template name, description, and category.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import type { Card, TemplateCategory } from '@/types';

// Category options for templates
const CATEGORY_OPTIONS: { value: TemplateCategory; label: string }[] = [
  { value: 'custom', label: 'Custom' },
  { value: 'story-structure', label: 'Story Structure' },
  { value: 'character', label: 'Character' },
  { value: 'worldbuilding', label: 'Worldbuilding' },
  { value: 'plot', label: 'Plot' },
  { value: 'workflow', label: 'Workflow' },
];

interface SaveAsTemplateDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when the dialog should close */
  onClose: () => void;
  /** The card to save as a template */
  card: Card;
  /** Callback when the template is saved */
  onSave: (data: {
    name: string;
    description: string;
    category: TemplateCategory;
    tags: string[];
  }) => void;
}

export function SaveAsTemplateDialog({
  isOpen,
  onClose,
  card,
  onSave,
}: SaveAsTemplateDialogProps): JSX.Element | null {
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('custom');
  const [tagsInput, setTagsInput] = useState('');

  // Validation state
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [touched, setTouched] = useState<{ name?: boolean }>({});

  // Refs for focus management
  const nameInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Initialize form with card data when dialog opens
  useEffect(() => {
    if (isOpen && card) {
      setName(`${card.title} Template`);
      setDescription(`Template created from: ${card.title}`);
      setCategory('custom');
      setTagsInput(card.tags.join(', '));
      setErrors({});
      setTouched({});
    }
  }, [isOpen, card]);

  // Focus name input when dialog opens
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
        nameInputRef.current?.select();
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
    const newErrors: { name?: string } = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Template name is required';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (trimmedName.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    setTouched({ name: true });

    if (!validateForm()) {
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      category,
      tags: parseTags(tagsInput),
    });

    onClose();
  };

  // Handle cancel
  const handleCancel = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onClose();
  };

  // Handle field blur for validation
  const handleNameBlur = (): void => {
    setTouched((prev) => ({ ...prev, name: true }));
    validateForm();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 animate-fade-in"
      data-testid="save-template-dialog-overlay"
    >
      <div
        ref={dialogRef}
        className="bg-surface-800 border border-border rounded-card p-6 w-full max-w-lg shadow-modal animate-scale-in max-h-[90vh] overflow-y-auto"
        data-testid="save-template-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-template-title"
      >
        <h2
          id="save-template-title"
          className="text-lg font-semibold text-text-primary mb-4"
        >
          Save Card as Template
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Template Name input */}
          <div className="mb-4">
            <label
              htmlFor="template-name"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Template Name <span className="text-error-500">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="template-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameBlur}
              placeholder="Enter template name..."
              className={`input ${touched.name && errors.name ? 'border-error-500 focus:ring-error-500' : ''}`}
              data-testid="template-name-input"
              required
            />
            {touched.name && errors.name && (
              <p className="mt-1 text-sm text-error-500" data-testid="template-name-error">
                {errors.name}
              </p>
            )}
          </div>

          {/* Description input */}
          <div className="mb-4">
            <label
              htmlFor="template-description"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Description
            </label>
            <textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter template description (optional)..."
              rows={3}
              className="input resize-none"
              data-testid="template-description-input"
            />
          </div>

          {/* Category selection */}
          <div className="mb-4">
            <label
              htmlFor="template-category"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Category
            </label>
            <select
              id="template-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TemplateCategory)}
              className="input"
              data-testid="template-category-select"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tags input */}
          <div className="mb-6">
            <label
              htmlFor="template-tags"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Tags
            </label>
            <input
              id="template-tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Enter tags separated by commas"
              className="input"
              data-testid="template-tags-input"
            />
            <p className="mt-1 text-xs text-text-muted">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Source Card Preview */}
          <div className="mb-6 p-3 bg-surface-700 rounded-card">
            <p className="text-xs text-text-muted mb-2">Source Card:</p>
            <div className="story-card p-3 rounded-card">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-medium text-text-primary text-sm line-clamp-2">
                  {card.title}
                </h4>
                <span className="badge badge-primary text-xs flex-shrink-0">
                  {card.priority}
                </span>
              </div>
              {card.description && (
                <p className="text-text-muted text-xs line-clamp-2 mb-2">
                  {card.description}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
              data-testid="save-template-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!name.trim()}
              data-testid="save-template-submit-btn"
            >
              Save as Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SaveAsTemplateDialog;
