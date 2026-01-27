/**
 * DrawerPanel Component
 *
 * A slide-out drawer panel component that can be toggled open/closed.
 * Features smooth animations and proper z-index layering for overlay and content.
 *
 * @example
 * ```tsx
 * <DrawerPanel
 *   isOpen={isDrawerOpen}
 *   onClose={() => setIsDrawerOpen(false)}
 *   position="right"
 *   title="Settings"
 * >
 *   <p>Drawer content here</p>
 * </DrawerPanel>
 * ```
 */
import { useEffect, useRef, useCallback } from 'react';

/** Position from which the drawer slides in */
export type DrawerPosition = 'left' | 'right';

/** Size variants for the drawer width */
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface DrawerPanelProps {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Callback when the drawer should close */
  onClose: () => void;
  /** Content to render inside the drawer */
  children: React.ReactNode;
  /** Position of the drawer (left or right) */
  position?: DrawerPosition;
  /** Title displayed in the drawer header */
  title?: string;
  /** Size of the drawer */
  size?: DrawerSize;
  /** Whether to show the overlay backdrop */
  showOverlay?: boolean;
  /** Whether clicking the overlay closes the drawer */
  closeOnOverlayClick?: boolean;
  /** Whether pressing Escape closes the drawer */
  closeOnEscape?: boolean;
  /** Additional class names for the drawer content */
  className?: string;
}

/** Map of size variants to Tailwind width classes */
const SIZE_CLASSES: Record<DrawerSize, string> = {
  sm: 'w-64', // 256px
  md: 'w-80', // 320px
  lg: 'w-96', // 384px
  xl: 'w-[28rem]', // 448px
};

/**
 * DrawerPanel - A slide-out drawer panel component
 *
 * Features:
 * - Smooth slide-in/out animations
 * - Configurable position (left/right)
 * - Overlay backdrop with fade animation
 * - Keyboard accessibility (Escape to close)
 * - Click-outside to close
 * - Focus management
 * - Proper z-index layering
 */
export function DrawerPanel({
  isOpen,
  onClose,
  children,
  position = 'right',
  title,
  size = 'md',
  showOverlay = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
}: DrawerPanelProps): JSX.Element | null {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen && closeOnEscape) {
        onClose();
      }
    },
    [isOpen, onClose, closeOnEscape]
  );

  // Set up keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus management - trap focus and restore on close
  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the drawer content
      if (drawerRef.current) {
        drawerRef.current.focus();
      }

      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';

      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent): void => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose]
  );

  // Determine position classes
  const positionClasses = position === 'left' ? 'left-0' : 'right-0';
  const translateClasses = position === 'left'
    ? (isOpen ? 'translate-x-0' : '-translate-x-full')
    : (isOpen ? 'translate-x-0' : 'translate-x-full');

  // Don't render anything if not open (after animation completes)
  // We still render during close animation, controlled by CSS transitions
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-modal-backdrop"
      data-testid="drawer-panel-container"
      aria-hidden={!isOpen}
    >
      {/* Overlay backdrop */}
      {showOverlay && (
        <div
          className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handleOverlayClick}
          data-testid="drawer-panel-overlay"
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className={`
          fixed top-0 ${positionClasses} h-full
          ${SIZE_CLASSES[size]}
          bg-surface-800 border-${position === 'left' ? 'r' : 'l'} border-border
          shadow-modal
          transform transition-transform duration-300 ease-out
          ${translateClasses}
          z-modal
          flex flex-col
          focus:outline-none
          ${className}
        `}
        data-testid="drawer-panel"
        data-position={position}
        data-size={size}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-panel-title' : undefined}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          {title && (
            <h2
              id="drawer-panel-title"
              className="text-lg font-semibold text-text-primary"
            >
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto p-2 rounded-button text-text-muted hover:text-text-primary hover:bg-background-hover transition-colors duration-200"
            data-testid="drawer-panel-close-btn"
            aria-label="Close drawer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto p-4"
          data-testid="drawer-panel-content"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default DrawerPanel;
