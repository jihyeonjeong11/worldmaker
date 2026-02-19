import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInfiniteCanvas } from '../renderer/hooks/useInfiniteCanvas';

describe('useInfiniteCanvas Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should return default camera state', () => {
      const { result } = renderHook(() => useInfiniteCanvas());

      expect(result.current.camera).toEqual({
        x: 0,
        y: 0,
        scale: 1,
      });
    });

    it('should return custom initial camera state', () => {
      const { result } = renderHook(() =>
        useInfiniteCanvas({
          initialCamera: { x: 100, y: 200, scale: 2 },
        })
      );

      expect(result.current.camera).toEqual({
        x: 100,
        y: 200,
        scale: 2,
      });
    });

    it('should return partial initial camera with defaults', () => {
      const { result } = renderHook(() =>
        useInfiniteCanvas({
          initialCamera: { x: 50 },
        })
      );

      expect(result.current.camera).toEqual({
        x: 50,
        y: 0,
        scale: 1,
      });
    });

    it('should return canvas ref', () => {
      const { result } = renderHook(() => useInfiniteCanvas());

      expect(result.current.canvasRef).toBeDefined();
      expect(result.current.canvasRef.current).toBeNull();
    });

    it('should return isPanning as false initially', () => {
      const { result } = renderHook(() => useInfiniteCanvas());

      expect(result.current.isPanning).toBe(false);
    });

    it('should return isSpacePressed as false initially', () => {
      const { result } = renderHook(() => useInfiniteCanvas());

      expect(result.current.isSpacePressed).toBe(false);
    });
  });

  describe('setCamera', () => {
    it('should update camera state', () => {
      const { result } = renderHook(() => useInfiniteCanvas());

      act(() => {
        result.current.setCamera({ x: 50, y: 100, scale: 1.5 });
      });

      expect(result.current.camera).toEqual({
        x: 50,
        y: 100,
        scale: 1.5,
      });
    });

    it('should call onCameraChange callback when camera changes', () => {
      const mockCallback = vi.fn();
      const { result } = renderHook(() =>
        useInfiniteCanvas({ onCameraChange: mockCallback })
      );

      act(() => {
        result.current.setCamera({ x: 25, y: 75, scale: 0.5 });
      });

      expect(mockCallback).toHaveBeenCalledWith({
        x: 25,
        y: 75,
        scale: 0.5,
      });
    });

    it('should handle multiple camera updates', () => {
      const mockCallback = vi.fn();
      const { result } = renderHook(() =>
        useInfiniteCanvas({ onCameraChange: mockCallback })
      );

      act(() => {
        result.current.setCamera({ x: 10, y: 20, scale: 1 });
      });

      act(() => {
        result.current.setCamera({ x: 30, y: 40, scale: 2 });
      });

      expect(mockCallback).toHaveBeenCalledTimes(2);
      expect(result.current.camera).toEqual({
        x: 30,
        y: 40,
        scale: 2,
      });
    });
  });

  describe('resetCamera', () => {
    it('should reset camera to initial state', () => {
      const { result } = renderHook(() =>
        useInfiniteCanvas({
          initialCamera: { x: 100, y: 200, scale: 2 },
        })
      );

      // Change camera
      act(() => {
        result.current.setCamera({ x: 500, y: 600, scale: 5 });
      });

      expect(result.current.camera).toEqual({
        x: 500,
        y: 600,
        scale: 5,
      });

      // Reset camera
      act(() => {
        result.current.resetCamera();
      });

      expect(result.current.camera).toEqual({
        x: 100,
        y: 200,
        scale: 2,
      });
    });

    it('should reset camera to default state when no initial provided', () => {
      const { result } = renderHook(() => useInfiniteCanvas());

      // Change camera
      act(() => {
        result.current.setCamera({ x: 500, y: 600, scale: 5 });
      });

      // Reset camera
      act(() => {
        result.current.resetCamera();
      });

      expect(result.current.camera).toEqual({
        x: 0,
        y: 0,
        scale: 1,
      });
    });

    it('should call onCameraChange callback on reset', () => {
      const mockCallback = vi.fn();
      const { result } = renderHook(() =>
        useInfiniteCanvas({
          initialCamera: { x: 100, y: 200, scale: 2 },
          onCameraChange: mockCallback,
        })
      );

      // Change camera
      act(() => {
        result.current.setCamera({ x: 500, y: 600, scale: 5 });
      });

      mockCallback.mockClear();

      // Reset camera
      act(() => {
        result.current.resetCamera();
      });

      expect(mockCallback).toHaveBeenCalledWith({
        x: 100,
        y: 200,
        scale: 2,
      });
    });
  });

  describe('Coordinate Conversion', () => {
    it('should expose screenToWorld function', () => {
      const { result } = renderHook(() => useInfiniteCanvas());

      expect(typeof result.current.screenToWorld).toBe('function');
    });

    it('should expose worldToScreen function', () => {
      const { result } = renderHook(() => useInfiniteCanvas());

      expect(typeof result.current.worldToScreen).toBe('function');
    });
  });

  describe('Return object shape', () => {
    it('should return all expected properties', () => {
      const { result } = renderHook(() => useInfiniteCanvas());

      expect(result.current).toHaveProperty('canvasRef');
      expect(result.current).toHaveProperty('camera');
      expect(result.current).toHaveProperty('setCamera');
      expect(result.current).toHaveProperty('resetCamera');
      expect(result.current).toHaveProperty('screenToWorld');
      expect(result.current).toHaveProperty('worldToScreen');
      expect(result.current).toHaveProperty('isPanning');
      expect(result.current).toHaveProperty('isSpacePressed');
    });

    it('should have functions for all expected methods', () => {
      const { result } = renderHook(() => useInfiniteCanvas());

      expect(typeof result.current.setCamera).toBe('function');
      expect(typeof result.current.resetCamera).toBe('function');
      expect(typeof result.current.screenToWorld).toBe('function');
      expect(typeof result.current.worldToScreen).toBe('function');
    });
  });

  describe('Options handling', () => {
    it('should work with empty options object', () => {
      const { result } = renderHook(() => useInfiniteCanvas({}));

      expect(result.current.camera).toEqual({
        x: 0,
        y: 0,
        scale: 1,
      });
    });

    it('should work with undefined options', () => {
      const { result } = renderHook(() => useInfiniteCanvas(undefined));

      expect(result.current.camera).toEqual({
        x: 0,
        y: 0,
        scale: 1,
      });
    });

    it('should work without any arguments', () => {
      const { result } = renderHook(() => useInfiniteCanvas());

      expect(result.current.camera).toEqual({
        x: 0,
        y: 0,
        scale: 1,
      });
    });
  });

  describe('Camera state immutability', () => {
    it('should return a new camera object on state change', () => {
      const { result } = renderHook(() => useInfiniteCanvas());

      const initialCamera = result.current.camera;

      act(() => {
        result.current.setCamera({ x: 100, y: 100, scale: 2 });
      });

      // Should be a different object reference
      expect(result.current.camera).not.toBe(initialCamera);
    });
  });

  describe('Callback stability', () => {
    it('should maintain stable setCamera reference', () => {
      const { result, rerender } = renderHook(() => useInfiniteCanvas());

      const initialSetCamera = result.current.setCamera;

      rerender();

      // Function reference should remain stable
      expect(result.current.setCamera).toBe(initialSetCamera);
    });

    it('should expose resetCamera function', () => {
      const { result } = renderHook(() => useInfiniteCanvas());

      // Function should be available and callable
      expect(typeof result.current.resetCamera).toBe('function');
    });

    it('should have working resetCamera across rerenders', () => {
      const { result, rerender } = renderHook(() => useInfiniteCanvas());

      act(() => {
        result.current.setCamera({ x: 100, y: 100, scale: 2 });
      });

      rerender();

      // After rerender, resetCamera should still work
      act(() => {
        result.current.resetCamera();
      });

      expect(result.current.camera).toEqual({
        x: 0,
        y: 0,
        scale: 1,
      });
    });
  });
});
