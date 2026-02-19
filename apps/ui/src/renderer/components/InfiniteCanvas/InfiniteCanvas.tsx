/**
 * InfiniteCanvas Component
 *
 * A high-performance infinite canvas with Excalidraw-like navigation.
 *
 * Features:
 * - Zoom at mouse cursor (mouse wheel)
 * - Pan via spacebar + drag or middle-mouse drag
 * - Dynamic grid that scales and fades
 * - 60fps rendering with requestAnimationFrame
 * - Viewport culling for performance
 * - Renders World Tree nodes from Zustand store
 */

import React, { useCallback } from 'react';
import { useInfiniteCanvas } from '../../hooks/useInfiniteCanvas';
import { useWorldTreeStore } from '../../stores';

export interface InfiniteCanvasProps {
  /** Optional class name for the container */
  className?: string;
  /** Callback when camera changes */
  onCameraChange?: (camera: { x: number; y: number; scale: number }) => void;
}

export const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({
  className = '',
  onCameraChange,
}) => {
  // Get nodes from the World Tree store
  const nodes = useWorldTreeStore((state) => state.nodes);

  const {
    canvasRef,
    camera,
    resetCamera,
    isPanning,
    isSpacePressed,
  } = useInfiniteCanvas({
    initialCamera: { x: 0, y: 0, scale: 1 },
    onCameraChange,
    nodes,
  });

  const handleResetCamera = useCallback(() => {
    resetCamera();
  }, [resetCamera]);

  const handleZoomIn = useCallback(() => {
    // Trigger a synthetic zoom event (would need to be implemented in the hook)
  }, []);

  const handleZoomOut = useCallback(() => {
    // Trigger a synthetic zoom event (would need to be implemented in the hook)
  }, []);

  return (
    <div className={`infinite-canvas-container ${className}`}>
      <canvas
        ref={canvasRef}
        className="infinite-canvas"
        tabIndex={0}
      />

      {/* Status bar */}
      <div className="infinite-canvas-status">
        <div className="status-left">
          <span className="status-item">
            X: {camera.x.toFixed(0)} | Y: {camera.y.toFixed(0)}
          </span>
          <span className="status-separator">•</span>
          <span className="status-item">
            Zoom: {(camera.scale * 100).toFixed(0)}%
          </span>
        </div>
        <div className="status-right">
          {isPanning && <span className="status-mode">Panning</span>}
          {isSpacePressed && !isPanning && <span className="status-mode">Hold to Pan</span>}
        </div>
      </div>

      {/* Toolbar */}
      <div className="infinite-canvas-toolbar">
        <button
          className="toolbar-button"
          onClick={handleResetCamera}
          title="Reset View (Center on Origin)"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" />
          </svg>
          Reset
        </button>
        <div className="toolbar-divider" />
        <div className="toolbar-zoom-controls">
          <button
            className="toolbar-button toolbar-button-icon"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M19 13H5v-2h14v2z" />
            </svg>
          </button>
          <span className="toolbar-zoom-value">{(camera.scale * 100).toFixed(0)}%</span>
          <button
            className="toolbar-button toolbar-button-icon"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Help overlay (shown briefly on first load) */}
      <div className="infinite-canvas-help">
        <div className="help-item">
          <kbd>Scroll</kbd>
          <span>Zoom at cursor</span>
        </div>
        <div className="help-item">
          <kbd>Space</kbd> + <kbd>Drag</kbd>
          <span>Pan canvas</span>
        </div>
        <div className="help-item">
          <kbd>Middle Click</kbd> + <kbd>Drag</kbd>
          <span>Pan canvas</span>
        </div>
      </div>
    </div>
  );
};

export default InfiniteCanvas;
