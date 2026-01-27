/**
 * HighlightedText Component
 *
 * A component that renders text with highlighted search matches.
 * Used in search results to show where the query matched.
 *
 * @example
 * ```tsx
 * <HighlightedText
 *   segments={[
 *     { text: 'Hello ', isHighlighted: false },
 *     { text: 'World', isHighlighted: true },
 *   ]}
 * />
 * ```
 */
import type { ReactNode } from 'react';

/**
 * A segment of text that may or may not be highlighted
 */
export interface TextSegment {
  /** The text content */
  text: string;
  /** Whether this segment should be highlighted */
  isHighlighted: boolean;
}

/**
 * Props for the HighlightedText component
 */
export interface HighlightedTextProps {
  /** Array of text segments to render */
  segments: TextSegment[];
  /** Custom class for the highlight */
  highlightClassName?: string;
  /** Custom class for normal text */
  textClassName?: string;
  /** Optional wrapper component or element type */
  as?: keyof JSX.IntrinsicElements;
  /** Additional class for the wrapper */
  className?: string;
}

/**
 * HighlightedText - Renders text with highlighted search matches
 *
 * Features:
 * - Configurable highlight styling
 * - Supports custom wrapper element
 * - Accessible highlight indication
 */
export function HighlightedText({
  segments,
  highlightClassName = 'bg-warning-500/30 text-warning-300 rounded px-0.5',
  textClassName = '',
  as: Component = 'span',
  className = '',
}: HighlightedTextProps): JSX.Element {
  return (
    <Component className={className}>
      {segments.map((segment, index) => {
        const key = `${segment.text}-${index}`;
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
        return (
          <span key={key} className={textClassName}>
            {segment.text}
          </span>
        );
      })}
    </Component>
  );
}

/**
 * Simple helper to render highlighted text inline
 * Useful when you just want to highlight text without a wrapper
 */
export function renderHighlightedSegments(
  segments: TextSegment[],
  highlightClassName: string = 'bg-warning-500/30 text-warning-300 rounded px-0.5'
): ReactNode[] {
  return segments.map((segment, index) => {
    const key = `${segment.text}-${index}`;
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

export default HighlightedText;
