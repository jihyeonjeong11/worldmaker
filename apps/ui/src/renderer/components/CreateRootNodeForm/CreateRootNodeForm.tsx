/**
 * CreateRootNodeForm Component
 *
 * A modal form for creating a new root node in the World Tree.
 * Allows users to set the label and description for the root node.
 */

import React, { useState, useCallback } from 'react';
import { useWorldTreeStore } from '../../stores/worldTreeStore';

export interface CreateRootNodeFormProps {
  /** Whether the form is visible */
  isOpen: boolean;
  /** Callback when form is closed */
  onClose: () => void;
  /** Callback when root node is created successfully */
  onSuccess?: () => void;
}

export const CreateRootNodeForm: React.FC<CreateRootNodeFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRootNode = useWorldTreeStore((state) => state.createRootNode);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      // Validation
      if (!label.trim()) {
        setError('Label is required');
        return;
      }

      setIsSubmitting(true);

      try {
        createRootNode({
          label: label.trim(),
          description: description.trim(),
        });

        // Reset form
        setLabel('');
        setDescription('');

        // Notify success
        onSuccess?.();
        onClose();
      } catch (err) {
        setError('Failed to create root node. Please try again.');
        console.error('Error creating root node:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [label, description, createRootNode, onClose, onSuccess]
  );

  const handleCancel = useCallback(() => {
    // Reset form state
    setLabel('');
    setDescription('');
    setError(null);
    onClose();
  }, [onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleCancel();
      }
    },
    [handleCancel]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className="form-modal-overlay" onClick={handleOverlayClick}>
      <div className="form-modal">
        <div className="form-modal-header">
          <h2 className="form-modal-title">Create Root Node</h2>
          <button
            type="button"
            className="form-modal-close"
            onClick={handleCancel}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <form className="form-modal-body" onSubmit={handleSubmit}>
          {error && (
            <div className="form-error-message">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              {error}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="root-node-label" className="form-label">
              Label <span className="form-required">*</span>
            </label>
            <input
              id="root-node-label"
              type="text"
              className="form-input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter root node label..."
              maxLength={100}
              autoFocus
              disabled={isSubmitting}
            />
            <span className="form-hint">
              The name displayed for the root node (required)
            </span>
          </div>

          <div className="form-field">
            <label htmlFor="root-node-description" className="form-label">
              Description
            </label>
            <textarea
              id="root-node-description"
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description for the root node..."
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
            />
            <span className="form-hint">
              Optional description for the root node
            </span>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="form-button form-button-secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="form-button form-button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Root Node'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRootNodeForm;
