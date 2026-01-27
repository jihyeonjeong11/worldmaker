/**
 * ColumnActions Component
 *
 * Provides a dropdown menu for column management actions:
 * - Rename column
 * - Change color
 * - Delete column
 */
import { useState, useRef, useEffect } from 'react';
import type { Column, ColumnId } from '@/types';

interface ColumnActionsProps {
  /** The column to perform actions on */
  column: Column;
  /** Callback when rename is requested */
  onRename: (id: ColumnId, newTitle: string) => void;
  /** Callback when color change is requested */
  onColorChange: (id: ColumnId, newColor: string) => void;
  /** Callback when delete is requested */
  onDelete: (id: ColumnId) => void;
}

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

export function ColumnActions({
  column,
  onRename,
  onColorChange,
  onDelete,
}: ColumnActionsProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(column.title);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsColorPickerOpen(false);
        setIsConfirmingDelete(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus input when renaming
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleToggleMenu = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    setIsColorPickerOpen(false);
    setIsConfirmingDelete(false);
  };

  const handleStartRename = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setIsRenaming(true);
    setRenameValue(column.title);
    setIsOpen(false);
  };

  const handleRenameSubmit = (): void => {
    const trimmedValue = renameValue.trim();
    if (trimmedValue && trimmedValue !== column.title) {
      onRename(column.id, trimmedValue);
    }
    setIsRenaming(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setRenameValue(column.title);
    }
  };

  const handleColorSelect = (color: string): void => {
    onColorChange(column.id, color);
    setIsColorPickerOpen(false);
    setIsOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (isConfirmingDelete) {
      onDelete(column.id);
      setIsOpen(false);
      setIsConfirmingDelete(false);
    } else {
      setIsConfirmingDelete(true);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setIsConfirmingDelete(false);
  };

  // Inline rename input
  if (isRenaming) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={renameValue}
        onChange={(e) => setRenameValue(e.target.value)}
        onBlur={handleRenameSubmit}
        onKeyDown={handleRenameKeyDown}
        className="input text-sm py-1 px-2 w-full"
        data-testid={`column-rename-input-${column.id}`}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu trigger button */}
      <button
        onClick={handleToggleMenu}
        className="p-1 rounded hover:bg-surface-700 text-text-muted hover:text-text-primary transition-colors"
        data-testid={`column-actions-btn-${column.id}`}
        aria-label="Column actions"
        aria-expanded={isOpen}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 w-48 bg-surface-800 border border-border rounded-card shadow-dropdown z-50 py-1 animate-fade-in"
          data-testid={`column-actions-menu-${column.id}`}
        >
          {/* Rename option */}
          <button
            onClick={handleStartRename}
            className="w-full px-3 py-2 text-left text-sm text-text-secondary hover:bg-surface-700 hover:text-text-primary flex items-center gap-2 transition-colors"
            data-testid={`column-rename-btn-${column.id}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Rename
          </button>

          {/* Color picker toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsColorPickerOpen(!isColorPickerOpen);
            }}
            className="w-full px-3 py-2 text-left text-sm text-text-secondary hover:bg-surface-700 hover:text-text-primary flex items-center gap-2 transition-colors"
            data-testid={`column-color-btn-${column.id}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Change Color
            {column.color && (
              <span
                className="w-3 h-3 rounded-full ml-auto"
                style={{ backgroundColor: column.color }}
              />
            )}
          </button>

          {/* Color picker dropdown */}
          {isColorPickerOpen && (
            <div
              className="px-3 py-2 border-t border-border"
              data-testid={`column-color-picker-${column.id}`}
            >
              <div className="grid grid-cols-5 gap-1">
                {COLUMN_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleColorSelect(color.value)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                      column.color === color.value
                        ? 'border-white'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                    data-testid={`color-option-${color.name.toLowerCase()}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-border my-1" />

          {/* Delete option */}
          {isConfirmingDelete ? (
            <div className="px-3 py-2">
              <p className="text-xs text-text-muted mb-2">Delete this column?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteClick}
                  className="flex-1 px-2 py-1 text-xs bg-error-500 text-white rounded hover:bg-error-600 transition-colors"
                  data-testid={`column-confirm-delete-btn-${column.id}`}
                >
                  Delete
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 px-2 py-1 text-xs bg-surface-600 text-text-secondary rounded hover:bg-surface-500 transition-colors"
                  data-testid={`column-cancel-delete-btn-${column.id}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleDeleteClick}
              className="w-full px-3 py-2 text-left text-sm text-error-400 hover:bg-error-500/10 flex items-center gap-2 transition-colors"
              data-testid={`column-delete-btn-${column.id}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Column
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ColumnActions;
