/**
 * Utility functions for the store
 */

/**
 * Generate a unique ID using crypto.randomUUID if available,
 * otherwise fall back to a simple UUID-like string
 */
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Get current ISO timestamp
 */
export const getTimestamp = (): string => {
  return new Date().toISOString();
};
