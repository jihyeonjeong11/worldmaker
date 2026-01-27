/**
 * CardDeleteConfirmation Component
 *
 * A modal dialog for confirming card deletion with warning message.
 * Follows the same pattern as other dialogs in the codebase.
 */
import { useRef, useEffect } from 'react';
import type { Card } from '@/types';

interface CardDeleteConfirmationProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when the dialog should close */
  onClose: () => void;
  /** Callback when deletion is confirmed */
  onConfirm: (cardId: string) => void;
  /** The card to be deleted */
  card: Card | null;
}

export function CardDeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  card,
}: CardDeleteConfirmationProps): JSX.Element | null {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus cancel button when dialog opens (safer default)
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      const timer = setTimeout(() => {
        cancelButtonRef.current?.focus();
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

  // Handle confirm deletion
  const handleConfirm = (): void => {
    if (card) {
      onConfirm(card.id);
      onClose();
    }
  };

  if (!isOpen || !card) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 animate-fade-in"
      data-testid="card-delete-dialog-overlay"
    >
      <div
        ref={dialogRef}
        className="bg-surface-800 border border-border rounded-card p-6 w-full max-w-md shadow-modal animate-scale-in"
        data-testid="card-delete-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-card-title"
        aria-describedby="delete-card-description"
      >
        {/* Warning icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-error-500/20 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-error-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2
            id="delete-card-title"
            className="text-lg font-semibold text-text-primary"
          >
            Delete Card
          </h2>
        </div>

        {/* Description */}
        <div id="delete-card-description" className="mb-6">
          <p className="text-text-secondary mb-3">
            Are you sure you want to delete this card? This action cannot be undone.
          </p>

          {/* Card preview */}
          <div className="p-3 bg-surface-700 rounded-card border border-border">
            <h4 className="font-medium text-text-primary text-sm mb-1 line-clamp-2">
              {card.title}
            </h4>
            {card.description && (
              <p className="text-text-muted text-xs line-clamp-2">
                {card.description}
              </p>
            )}
            {card.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {card.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="badge badge-primary text-xs py-0"
                  >
                    {tag}
                  </span>
                ))}
                {card.tags.length > 3 && (
                  <span className="text-xs text-text-muted">
                    +{card.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            className="btn-secondary"
            data-testid="card-delete-cancel-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="btn-danger"
            data-testid="card-delete-confirm-btn"
          >
            Delete Card
          </button>
        </div>
      </div>
    </div>
  );
}

export default CardDeleteConfirmation;
