/**
 * KeywordPillButton Component
 *
 * An interactive bubble/pill button for keyword and tag filtering.
 * Displays a clickable pill with visual active states and optional count.
 */
import { useCallback, KeyboardEvent } from 'react';

/**
 * Props for the KeywordPillButton component
 */
export interface KeywordPillButtonProps {
  /** The keyword/tag text to display */
  keyword: string;
  /** Whether the pill is currently active/selected */
  isActive?: boolean;
  /** Optional count to display (e.g., number of cards with this tag) */
  count?: number;
  /** Callback when the pill is clicked */
  onClick?: (keyword: string) => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Optional CSS class name */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant for active state */
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
}

/**
 * Size class mapping for different size variants
 */
const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

/**
 * Active state class mapping for different color variants
 */
const activeVariantClasses = {
  primary: 'bg-primary-500 text-white border-primary-500 shadow-sm',
  secondary: 'bg-secondary-500 text-white border-secondary-500 shadow-sm',
  success: 'bg-success-500 text-white border-success-500 shadow-sm',
  warning: 'bg-warning-500 text-white border-warning-500 shadow-sm',
};

/**
 * Inactive state class for all variants
 */
const inactiveClass = 'bg-surface-800 text-text-secondary border-border hover:bg-surface-700 hover:border-border-strong';

/**
 * KeywordPillButton - Clickable pill button for filtering
 */
export function KeywordPillButton({
  keyword,
  isActive = false,
  count,
  onClick,
  disabled = false,
  className = '',
  size = 'md',
  variant = 'primary',
}: KeywordPillButtonProps): JSX.Element {
  // Handle click
  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      onClick(keyword);
    }
  }, [keyword, onClick, disabled]);

  // Handle keyboard activation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if ((e.key === 'Enter' || e.key === ' ') && !disabled && onClick) {
        e.preventDefault();
        onClick(keyword);
      }
    },
    [keyword, onClick, disabled]
  );

  // Determine state-based classes
  const stateClasses = isActive
    ? activeVariantClasses[variant]
    : inactiveClass;

  // Combine all classes
  const buttonClasses = [
    // Base styles
    'inline-flex items-center gap-1.5',
    'rounded-full',
    'border',
    'font-medium',
    'cursor-pointer',
    'transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'select-none',
    // Size
    sizeClasses[size],
    // State
    stateClasses,
    // Disabled
    disabled && 'opacity-50 cursor-not-allowed',
    // Custom classes
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      aria-label={`Filter by ${keyword}${count !== undefined ? `, ${count} items` : ''}`}
      className={buttonClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      data-testid={`keyword-pill-${keyword.toLowerCase().replace(/\s+/g, '-')}`}
      data-active={isActive}
    >
      {/* Keyword text */}
      <span className="truncate max-w-[150px]">{keyword}</span>

      {/* Optional count badge */}
      {count !== undefined && count > 0 && (
        <span
          className={`
            inline-flex items-center justify-center
            min-w-[18px] h-[18px]
            rounded-full
            text-xs font-semibold
            ${isActive
              ? 'bg-white/20 text-white'
              : 'bg-surface-700 text-text-muted'
            }
          `}
          data-testid={`keyword-pill-count-${keyword.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}

export default KeywordPillButton;
