import { describe, it, expect } from 'vitest';
import {
  screenToWorld,
  worldToScreen,
  getVisibleWorldBounds,
  isPointVisible,
  isRectVisible,
  clamp,
  lerp,
} from '../renderer/utils/coordinates';
import type { CameraState, Point } from '../renderer/utils/coordinates';

describe('Coordinate System Utilities', () => {
  const defaultCamera: CameraState = { x: 0, y: 0, scale: 1 };
  const canvasWidth = 800;
  const canvasHeight = 600;

  describe('screenToWorld', () => {
    it('should convert screen center to world origin with default camera', () => {
      const screenPoint: Point = { x: 400, y: 300 }; // Center of 800x600
      const result = screenToWorld(screenPoint, defaultCamera, canvasWidth, canvasHeight);

      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(0);
    });

    it('should convert screen top-left to negative world coordinates with default camera', () => {
      const screenPoint: Point = { x: 0, y: 0 };
      const result = screenToWorld(screenPoint, defaultCamera, canvasWidth, canvasHeight);

      expect(result.x).toBeCloseTo(-400);
      expect(result.y).toBeCloseTo(-300);
    });

    it('should convert screen bottom-right to positive world coordinates with default camera', () => {
      const screenPoint: Point = { x: 800, y: 600 };
      const result = screenToWorld(screenPoint, defaultCamera, canvasWidth, canvasHeight);

      expect(result.x).toBeCloseTo(400);
      expect(result.y).toBeCloseTo(300);
    });

    it('should account for camera position', () => {
      const camera: CameraState = { x: 100, y: 50, scale: 1 };
      const screenPoint: Point = { x: 400, y: 300 }; // Center
      const result = screenToWorld(screenPoint, camera, canvasWidth, canvasHeight);

      expect(result.x).toBeCloseTo(100);
      expect(result.y).toBeCloseTo(50);
    });

    it('should account for scale', () => {
      const camera: CameraState = { x: 0, y: 0, scale: 2 };
      const screenPoint: Point = { x: 600, y: 450 }; // 200px right, 150px down from center
      const result = screenToWorld(screenPoint, camera, canvasWidth, canvasHeight);

      // With scale 2, screen distance of 200px = world distance of 100
      expect(result.x).toBeCloseTo(100);
      expect(result.y).toBeCloseTo(75);
    });

    it('should handle combined camera offset and scale', () => {
      const camera: CameraState = { x: 50, y: 25, scale: 0.5 };
      const screenPoint: Point = { x: 400, y: 300 }; // Center
      const result = screenToWorld(screenPoint, camera, canvasWidth, canvasHeight);

      expect(result.x).toBeCloseTo(50);
      expect(result.y).toBeCloseTo(25);
    });
  });

  describe('worldToScreen', () => {
    it('should convert world origin to screen center with default camera', () => {
      const worldPoint: Point = { x: 0, y: 0 };
      const result = worldToScreen(worldPoint, defaultCamera, canvasWidth, canvasHeight);

      expect(result.x).toBeCloseTo(400);
      expect(result.y).toBeCloseTo(300);
    });

    it('should convert negative world coordinates to upper-left screen', () => {
      const worldPoint: Point = { x: -400, y: -300 };
      const result = worldToScreen(worldPoint, defaultCamera, canvasWidth, canvasHeight);

      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(0);
    });

    it('should convert positive world coordinates to lower-right screen', () => {
      const worldPoint: Point = { x: 400, y: 300 };
      const result = worldToScreen(worldPoint, defaultCamera, canvasWidth, canvasHeight);

      expect(result.x).toBeCloseTo(800);
      expect(result.y).toBeCloseTo(600);
    });

    it('should account for camera position', () => {
      const camera: CameraState = { x: 100, y: 50, scale: 1 };
      const worldPoint: Point = { x: 100, y: 50 }; // Same as camera position
      const result = worldToScreen(worldPoint, camera, canvasWidth, canvasHeight);

      // Should map to center of screen
      expect(result.x).toBeCloseTo(400);
      expect(result.y).toBeCloseTo(300);
    });

    it('should account for scale', () => {
      const camera: CameraState = { x: 0, y: 0, scale: 2 };
      const worldPoint: Point = { x: 100, y: 75 };
      const result = worldToScreen(worldPoint, camera, canvasWidth, canvasHeight);

      // With scale 2, world distance of 100 = screen distance of 200
      expect(result.x).toBeCloseTo(600);
      expect(result.y).toBeCloseTo(450);
    });
  });

  describe('screenToWorld and worldToScreen inverse relationship', () => {
    it('should be inverse operations', () => {
      const originalScreen: Point = { x: 250, y: 175 };
      const camera: CameraState = { x: 30, y: -20, scale: 1.5 };

      const worldPoint = screenToWorld(originalScreen, camera, canvasWidth, canvasHeight);
      const backToScreen = worldToScreen(worldPoint, camera, canvasWidth, canvasHeight);

      expect(backToScreen.x).toBeCloseTo(originalScreen.x);
      expect(backToScreen.y).toBeCloseTo(originalScreen.y);
    });

    it('should be inverse with various scales', () => {
      const scales = [0.1, 0.5, 1, 2, 5, 10];

      scales.forEach((scale) => {
        const originalScreen: Point = { x: 350, y: 200 };
        const camera: CameraState = { x: 0, y: 0, scale };

        const worldPoint = screenToWorld(originalScreen, camera, canvasWidth, canvasHeight);
        const backToScreen = worldToScreen(worldPoint, camera, canvasWidth, canvasHeight);

        expect(backToScreen.x).toBeCloseTo(originalScreen.x, 5);
        expect(backToScreen.y).toBeCloseTo(originalScreen.y, 5);
      });
    });
  });

  describe('getVisibleWorldBounds', () => {
    it('should return correct bounds with default camera', () => {
      const bounds = getVisibleWorldBounds(defaultCamera, canvasWidth, canvasHeight);

      expect(bounds.minX).toBeCloseTo(-400);
      expect(bounds.maxX).toBeCloseTo(400);
      expect(bounds.minY).toBeCloseTo(-300);
      expect(bounds.maxY).toBeCloseTo(300);
    });

    it('should return correct bounds with camera offset', () => {
      const camera: CameraState = { x: 100, y: 50, scale: 1 };
      const bounds = getVisibleWorldBounds(camera, canvasWidth, canvasHeight);

      expect(bounds.minX).toBeCloseTo(-300);
      expect(bounds.maxX).toBeCloseTo(500);
      expect(bounds.minY).toBeCloseTo(-250);
      expect(bounds.maxY).toBeCloseTo(350);
    });

    it('should return smaller bounds when zoomed in', () => {
      const camera: CameraState = { x: 0, y: 0, scale: 2 };
      const bounds = getVisibleWorldBounds(camera, canvasWidth, canvasHeight);

      // At scale 2, viewport covers half the world distance
      expect(bounds.minX).toBeCloseTo(-200);
      expect(bounds.maxX).toBeCloseTo(200);
      expect(bounds.minY).toBeCloseTo(-150);
      expect(bounds.maxY).toBeCloseTo(150);
    });

    it('should return larger bounds when zoomed out', () => {
      const camera: CameraState = { x: 0, y: 0, scale: 0.5 };
      const bounds = getVisibleWorldBounds(camera, canvasWidth, canvasHeight);

      // At scale 0.5, viewport covers twice the world distance
      expect(bounds.minX).toBeCloseTo(-800);
      expect(bounds.maxX).toBeCloseTo(800);
      expect(bounds.minY).toBeCloseTo(-600);
      expect(bounds.maxY).toBeCloseTo(600);
    });
  });

  describe('isPointVisible', () => {
    it('should return true for points at screen center', () => {
      const worldPoint: Point = { x: 0, y: 0 };
      const result = isPointVisible(worldPoint, defaultCamera, canvasWidth, canvasHeight);

      expect(result).toBe(true);
    });

    it('should return true for points within viewport', () => {
      const worldPoint: Point = { x: 200, y: 150 };
      const result = isPointVisible(worldPoint, defaultCamera, canvasWidth, canvasHeight);

      expect(result).toBe(true);
    });

    it('should return false for points outside viewport', () => {
      const worldPoint: Point = { x: 500, y: 500 };
      const result = isPointVisible(worldPoint, defaultCamera, canvasWidth, canvasHeight);

      expect(result).toBe(false);
    });

    it('should include margin in visibility check', () => {
      const worldPoint: Point = { x: 410, y: 0 }; // Just outside viewport

      const withoutMargin = isPointVisible(worldPoint, defaultCamera, canvasWidth, canvasHeight, 0);
      const withMargin = isPointVisible(worldPoint, defaultCamera, canvasWidth, canvasHeight, 50);

      expect(withoutMargin).toBe(false);
      expect(withMargin).toBe(true);
    });

    it('should account for camera position', () => {
      const camera: CameraState = { x: 500, y: 0, scale: 1 };
      const worldPoint: Point = { x: 0, y: 0 };

      // Origin is now outside visible area when camera is at (500, 0)
      const result = isPointVisible(worldPoint, camera, canvasWidth, canvasHeight);

      expect(result).toBe(false);
    });
  });

  describe('isRectVisible', () => {
    it('should return true for rect at center', () => {
      const result = isRectVisible(-50, -50, 100, 100, defaultCamera, canvasWidth, canvasHeight);
      expect(result).toBe(true);
    });

    it('should return true for rect partially in viewport', () => {
      // Rect that overlaps the right edge
      const result = isRectVisible(350, 0, 100, 100, defaultCamera, canvasWidth, canvasHeight);
      expect(result).toBe(true);
    });

    it('should return false for rect completely outside viewport', () => {
      // Rect completely to the right of viewport
      const result = isRectVisible(500, 0, 100, 100, defaultCamera, canvasWidth, canvasHeight);
      expect(result).toBe(false);
    });

    it('should return false for rect above viewport', () => {
      const result = isRectVisible(0, -500, 100, 100, defaultCamera, canvasWidth, canvasHeight);
      expect(result).toBe(false);
    });

    it('should return false for rect below viewport', () => {
      const result = isRectVisible(0, 400, 100, 100, defaultCamera, canvasWidth, canvasHeight);
      expect(result).toBe(false);
    });

    it('should account for camera scale', () => {
      const camera: CameraState = { x: 0, y: 0, scale: 2 };
      // At scale 2, visible bounds are -200 to 200 on x
      const result = isRectVisible(150, 0, 100, 100, camera, canvasWidth, canvasHeight);
      expect(result).toBe(true);
    });
  });

  describe('clamp', () => {
    it('should return value when within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it('should return min when value is below range', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it('should return max when value is above range', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('should return min when value equals min', () => {
      expect(clamp(0, 0, 10)).toBe(0);
    });

    it('should return max when value equals max', () => {
      expect(clamp(10, 0, 10)).toBe(10);
    });

    it('should work with negative ranges', () => {
      expect(clamp(-5, -10, -2)).toBe(-5);
      expect(clamp(-15, -10, -2)).toBe(-10);
      expect(clamp(0, -10, -2)).toBe(-2);
    });

    it('should work with floating point numbers', () => {
      expect(clamp(0.5, 0, 1)).toBeCloseTo(0.5);
      expect(clamp(-0.5, 0, 1)).toBeCloseTo(0);
      expect(clamp(1.5, 0, 1)).toBeCloseTo(1);
    });
  });

  describe('lerp', () => {
    it('should return start when t is 0', () => {
      expect(lerp(0, 100, 0)).toBe(0);
    });

    it('should return end when t is 1', () => {
      expect(lerp(0, 100, 1)).toBe(100);
    });

    it('should return midpoint when t is 0.5', () => {
      expect(lerp(0, 100, 0.5)).toBe(50);
    });

    it('should interpolate correctly at various t values', () => {
      expect(lerp(0, 100, 0.25)).toBe(25);
      expect(lerp(0, 100, 0.75)).toBe(75);
    });

    it('should work with negative values', () => {
      expect(lerp(-100, 100, 0.5)).toBe(0);
      expect(lerp(-100, 100, 0)).toBe(-100);
      expect(lerp(-100, 100, 1)).toBe(100);
    });

    it('should extrapolate when t is outside 0-1', () => {
      expect(lerp(0, 100, 2)).toBe(200);
      expect(lerp(0, 100, -1)).toBe(-100);
    });

    it('should work when start equals end', () => {
      expect(lerp(50, 50, 0.5)).toBe(50);
    });

    it('should work with floating point precision', () => {
      expect(lerp(0, 1, 0.3)).toBeCloseTo(0.3);
    });
  });
});
