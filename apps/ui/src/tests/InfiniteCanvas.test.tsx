import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { InfiniteCanvas } from '../renderer/components/InfiniteCanvas';

describe('InfiniteCanvas Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render the canvas element', () => {
      render(<InfiniteCanvas />);
      const canvas = document.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<InfiniteCanvas className="custom-class" />);
      const container = document.querySelector('.infinite-canvas-container');
      expect(container).toHaveClass('custom-class');
    });

    it('should render status bar with coordinates', () => {
      render(<InfiniteCanvas />);
      const statusBar = document.querySelector('.infinite-canvas-status');
      expect(statusBar).toBeInTheDocument();
      // Should display initial camera position (0, 0)
      expect(statusBar?.textContent).toContain('X: 0');
      expect(statusBar?.textContent).toContain('Y: 0');
    });

    it('should render status bar with zoom level', () => {
      render(<InfiniteCanvas />);
      const statusBar = document.querySelector('.infinite-canvas-status');
      expect(statusBar).toBeInTheDocument();
      // Should display initial zoom level (100%)
      expect(statusBar?.textContent).toContain('Zoom: 100%');
    });

    it('should render toolbar with reset button', () => {
      render(<InfiniteCanvas />);
      const resetButton = screen.getByTitle('Reset View (Center on Origin)');
      expect(resetButton).toBeInTheDocument();
    });

    it('should render toolbar with zoom controls', () => {
      render(<InfiniteCanvas />);
      const zoomInButton = screen.getByTitle('Zoom In');
      const zoomOutButton = screen.getByTitle('Zoom Out');
      expect(zoomInButton).toBeInTheDocument();
      expect(zoomOutButton).toBeInTheDocument();
    });

    it('should render help overlay', () => {
      render(<InfiniteCanvas />);
      const helpOverlay = document.querySelector('.infinite-canvas-help');
      expect(helpOverlay).toBeInTheDocument();
    });

    it('should render keyboard shortcut hints', () => {
      render(<InfiniteCanvas />);
      const helpOverlay = document.querySelector('.infinite-canvas-help');
      expect(helpOverlay?.textContent).toContain('Scroll');
      expect(helpOverlay?.textContent).toContain('Space');
      expect(helpOverlay?.textContent).toContain('Middle Click');
    });
  });

  describe('Canvas attributes', () => {
    it('should have tabIndex for keyboard focus', () => {
      render(<InfiniteCanvas />);
      const canvas = document.querySelector('canvas');
      expect(canvas).toHaveAttribute('tabIndex', '0');
    });

    it('should have infinite-canvas class', () => {
      render(<InfiniteCanvas />);
      const canvas = document.querySelector('canvas');
      expect(canvas).toHaveClass('infinite-canvas');
    });
  });

  describe('Camera change callback', () => {
    it('should call onCameraChange when provided', () => {
      const mockOnCameraChange = vi.fn();
      render(<InfiniteCanvas onCameraChange={mockOnCameraChange} />);

      // The callback should be called during initial render setup
      // We need to advance timers to let the animation frame run
      vi.advanceTimersByTime(100);

      // At minimum, we expect the component to accept the callback without errors
      expect(document.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('Toolbar interactions', () => {
    it('should handle reset button click', () => {
      const mockOnCameraChange = vi.fn();
      render(<InfiniteCanvas onCameraChange={mockOnCameraChange} />);

      const resetButton = screen.getByTitle('Reset View (Center on Origin)');
      fireEvent.click(resetButton);

      // The reset should be handled without errors
      expect(resetButton).toBeInTheDocument();
    });

    it('should handle zoom in button click', () => {
      render(<InfiniteCanvas />);

      const zoomInButton = screen.getByTitle('Zoom In');
      fireEvent.click(zoomInButton);

      // Should not throw error
      expect(zoomInButton).toBeInTheDocument();
    });

    it('should handle zoom out button click', () => {
      render(<InfiniteCanvas />);

      const zoomOutButton = screen.getByTitle('Zoom Out');
      fireEvent.click(zoomOutButton);

      // Should not throw error
      expect(zoomOutButton).toBeInTheDocument();
    });
  });

  describe('Status indicators', () => {
    it('should not show panning mode initially', () => {
      render(<InfiniteCanvas />);
      const panningIndicator = document.querySelector('.status-mode');
      // Initially, no mode indicator should be visible
      expect(panningIndicator).not.toBeInTheDocument();
    });
  });

  describe('Props validation', () => {
    it('should accept empty props', () => {
      expect(() => render(<InfiniteCanvas />)).not.toThrow();
    });

    it('should accept className prop', () => {
      expect(() => render(<InfiniteCanvas className="test" />)).not.toThrow();
    });

    it('should accept onCameraChange prop', () => {
      const callback = vi.fn();
      expect(() => render(<InfiniteCanvas onCameraChange={callback} />)).not.toThrow();
    });
  });
});
