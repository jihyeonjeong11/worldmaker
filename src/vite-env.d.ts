/// <reference types="vite/client" />

/**
 * Type declarations for the Electron API exposed through the preload script.
 * These types match the ElectronAPI interface defined in electron/preload.ts
 */

interface ElectronAPI {
  /** Get the application version */
  getVersion: () => Promise<string>;
  /** Get the current platform (win32, darwin, linux) */
  getPlatform: () => Promise<NodeJS.Platform>;
  /** Application lifecycle methods */
  app: {
    /** Check if running in development mode */
    isDev: boolean;
  };
  /** Safe IPC communication */
  ipc: {
    /** Send a message to the main process */
    send: (channel: string, ...args: unknown[]) => void;
    /** Invoke a handler in the main process and await response */
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
    /** Subscribe to messages from the main process */
    on: (channel: string, callback: (...args: unknown[]) => void) => () => void;
    /** Subscribe to a single message from the main process */
    once: (channel: string, callback: (...args: unknown[]) => void) => void;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
