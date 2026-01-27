/**
 * TemplateCardPreview Component
 *
 * A preview card for displaying template information in the card library.
 * Shows template name, description, type badge, and tags.
 * Supports search result highlighting.
 *
 * @example
 * ```tsx
 * <TemplateCardPreview
 *   template={template}
 *   onClick={() => handleSelectTemplate(template)}
 *   highlightText={highlightText}
 * />
 * ```
 */
import { useCallback, type ReactNode } from 'react';
import type { Template, TemplateType } from '@/types';
import type { HighlightedText as HighlightedTextType } from '@/hooks/useCardSearch';

/**
 * Highlight function type for search results
 */
export type HighlightFunction = (
  text: string,
  field: 'title' | 'description' | 'tag'
) => HighlightedTextType[];

/**
 * Props for the TemplateCardPreview component
 */
export interface TemplateCardPreviewProps {
  /** The template to display */
  template: Template;
  /** Callback when the card is clicked */
  onClick?: (template: Template) => void;
  /** Whether the card is selected */
  isSelected?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Optional function to highlight search matches in text */
  highlightText?: HighlightFunction;
}

/**
 * Render highlighted text segments
 */
function renderHighlightedText(
  segments: HighlightedTextType[],
  highlightClassName: string = 'bg-warning-500/30 text-warning-300 rounded px-0.5'
): ReactNode[] {
  return segments.map((segment, index) => {
    const key = `${segment.text.substring(0, 10)}-${index}`;
    if (segment.isHighlighted) {
      return (
        <mark
          key={key}
          className={highlightClassName}
          data-testid="search-highlight"
        >
          {segment.text}
        </mark>
      );
    }
    return <span key={key}>{segment.text}</span>;
  });
}

/**
 * Get styling for template type badge
 */
function getTypeBadgeStyles(type: TemplateType): { bg: string; text: string; label: string } {
  switch (type) {
    case 'project':
      return { bg: 'bg-primary-500/20', text: 'text-primary-300', label: 'Project' };
    case 'column':
      return { bg: 'bg-secondary-500/20', text: 'text-secondary-300', label: 'Column' };
    case 'card':
      return { bg: 'bg-success-500/20', text: 'text-success-400', label: 'Card' };
    default:
      return { bg: 'bg-surface-600/50', text: 'text-text-muted', label: 'Template' };
  }
}

/**
 * Get icon for template type
 */
function getTypeIcon(type: TemplateType): JSX.Element {
  switch (type) {
    case 'project':
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      );
    case 'column':
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"
          />
        </svg>
      );
    case 'card':
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      );
    default:
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
          />
        </svg>
      );
  }
}

/**
 * Generate a visual preview of the template structure
 */
function TemplateStructurePreview({ template }: { template: Template }): JSX.Element | null {
  if (template.type === 'project' && template.columns.length > 0) {
    // Show column structure for project templates
    return (
      <div className="flex gap-1 mt-2" data-testid="template-structure-preview">
        {template.columns.slice(0, 5).map((column, index) => (
          <div
            key={index}
            className="flex-1 h-2 rounded-sm"
            style={{ backgroundColor: column.color ?? '#6366f1' }}
            title={column.title}
          />
        ))}
        {template.columns.length > 5 && (
          <span className="text-xs text-text-muted ml-1">+{template.columns.length - 5}</span>
        )}
      </div>
    );
  }

  if (template.type === 'column' && template.columns.length > 0) {
    // Show column count for column templates
    return (
      <div className="flex gap-1 mt-2" data-testid="template-structure-preview">
        {template.columns.slice(0, 4).map((column, index) => (
          <div
            key={index}
            className="flex-1 h-2 rounded-sm"
            style={{ backgroundColor: column.color ?? '#06b6d4' }}
            title={column.title}
          />
        ))}
      </div>
    );
  }

  if (template.type === 'card' && template.cards.length > 0) {
    // Show card count for card templates
    return (
      <div className="flex items-center gap-1 mt-2" data-testid="template-structure-preview">
        <div className="flex gap-0.5">
          {template.cards.slice(0, 4).map((_, index) => (
            <div
              key={index}
              className="w-3 h-4 bg-surface-600 rounded-sm"
            />
          ))}
        </div>
        <span className="text-xs text-text-muted">
          {template.cards.length} {template.cards.length === 1 ? 'card' : 'cards'}
        </span>
      </div>
    );
  }

  return null;
}

/**
 * TemplateCardPreview - A compact preview card for templates in the library
 *
 * Features:
 * - Template name and description display
 * - Type badge with icon (Project, Column, Card)
 * - Visual structure preview (columns/cards)
 * - Tag display with overflow handling
 * - Hover and selection states
 * - Keyboard accessible
 */
export function TemplateCardPreview({
  template,
  onClick,
  isSelected = false,
  className = '',
  highlightText,
}: TemplateCardPreviewProps): JSX.Element {
  const typeStyles = getTypeBadgeStyles(template.type);

  const handleClick = useCallback(() => {
    onClick?.(template);
  }, [onClick, template]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.(template);
      }
    },
    [onClick, template]
  );

  // Display up to 3 tags
  const visibleTags = template.tags.slice(0, 3);
  const hiddenTagsCount = template.tags.length - 3;

  return (
    <div
      className={`
        p-3 rounded-card bg-surface-800 border border-border
        hover:bg-surface-700 hover:border-primary-500/50
        transition-all duration-200 cursor-pointer
        ${isSelected ? 'ring-2 ring-primary-500 bg-primary-500/10' : ''}
        ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      data-testid={`template-card-${template.id}`}
      data-template-id={template.id}
      data-template-type={template.type}
      aria-label={`Template: ${template.name}, Type: ${typeStyles.label}`}
      aria-selected={isSelected}
    >
      {/* Header: Type badge and built-in indicator */}
      <div className="flex items-center justify-between gap-2 mb-2">
        {/* Type Badge */}
        <span
          className={`badge text-xs flex items-center gap-1 ${typeStyles.bg} ${typeStyles.text}`}
          data-testid={`template-type-badge-${template.id}`}
        >
          {getTypeIcon(template.type)}
          {typeStyles.label}
        </span>

        {/* Built-in indicator */}
        {template.isBuiltIn && (
          <span
            className="text-xs text-text-muted flex items-center gap-1"
            title="Built-in template"
            data-testid={`template-builtin-${template.id}`}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
      </div>

      {/* Template Name */}
      <h4
        className="font-medium text-sm text-text-primary line-clamp-1 mb-1"
        data-testid={`template-name-${template.id}`}
      >
        {highlightText
          ? renderHighlightedText(highlightText(template.name, 'title'))
          : template.name}
      </h4>

      {/* Template Description */}
      <p
        className="text-xs text-text-muted line-clamp-2 mb-2"
        data-testid={`template-description-${template.id}`}
      >
        {highlightText
          ? renderHighlightedText(highlightText(template.description, 'description'))
          : template.description}
      </p>

      {/* Structure Preview */}
      <TemplateStructurePreview template={template} />

      {/* Tags */}
      {template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2" data-testid={`template-tags-${template.id}`}>
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="badge bg-surface-600 text-text-muted text-xs py-0"
            >
              {highlightText
                ? renderHighlightedText(highlightText(tag, 'tag'))
                : tag}
            </span>
          ))}
          {hiddenTagsCount > 0 && (
            <span className="text-xs text-text-muted">+{hiddenTagsCount}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default TemplateCardPreview;
