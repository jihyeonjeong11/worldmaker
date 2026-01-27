/**
 * AddColumnDialog Component
 *
 * A modal dialog for creating new columns with title and optional color selection.
 */
import { useState, useRef, useEffect } from 'react';

// Predefined colors for column headers
const COLUMN_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Gray', value: '#6b7280' },
];

interface AddColumnDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when the dialog should close */
  onClose: () => void;
  /** Callback when a column should be created */
  onCreate: (title: string, color?: string) => void;
}

export function AddColumnDialog({
  isOpen,
  onClose,
  onCreate,
}: AddColumnDialogProps): JSX.Element | null {
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(COLUMN_COLORS[0].value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
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

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (trimmedTitle) {
      onCreate(trimmedTitle, selectedColor);
      setTitle('');
      setSelectedColor(COLUMN_COLORS[0].value);
      onClose();
    }
  };

  const handleCancel = (): void => {
    setTitle('');
    setSelectedColor(COLUMN_COLORS[0].value);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in"
      data-testid="add-column-dialog-overlay"
    >
      <div
        ref={dialogRef}
        className="bg-surface-800 border border-border rounded-card p-6 w-full max-w-md shadow-modal animate-scale-in"
        data-testid="add-column-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-column-title"
      >
        <h2
          id="add-column-title"
          className="text-lg font-semibold text-text-primary mb-4"
        >
          Add New Column
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Title input */}
          <div className="mb-4">
            <label
              htmlFor="column-title"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Column Title
            </label>
            <input
              ref={inputRef}
              id="column-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., To Do, In Progress, Done"
              className="input"
              data-testid="add-column-title-input"
              required
            />
          </div>

          {/* Color selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Column Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLUMN_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    selectedColor === color.value
                      ? 'border-white scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  data-testid={`add-column-color-${color.name.toLowerCase()}`}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="mb-6 p-3 bg-surface-700 rounded-card">
            <p className="text-xs text-text-muted mb-2">Preview:</p>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedColor }}
              />
              <span className="font-semibold text-text-primary">
                {title || 'Column Title'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
              data-testid="add-column-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!title.trim()}
              data-testid="add-column-submit-btn"
            >
              Add Column
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddColumnDialog;
