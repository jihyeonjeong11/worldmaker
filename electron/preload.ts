/**
 * Preload Script for StoryMaker Electron Application
 *
 * This script runs in a privileged context before the renderer process loads.
 * It uses contextBridge to safely expose limited APIs to the renderer process,
 * maintaining security through context isolation.
 *
 * IMPORTANT: Never expose raw electron or node APIs directly.
 * Only expose specific, controlled functions through the contextBridge.
 */

import { contextBridge, ipcRenderer } from 'electron';

/**
 * Type definitions for the exposed API.
 * These will be available on window.electronAPI in the renderer.
 */
export interface ElectronAPI {
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

// Whitelist of allowed IPC channels for security
const ALLOWED_SEND_CHANNELS = [
  'app:minimize',
  'app:maximize',
  'app:close',
  'file:save',
  'file:open',
] as const;

const ALLOWED_INVOKE_CHANNELS = [
  'app:getVersion',
  'app:getPlatform',
  'file:read',
  'file:write',
  'dialog:openFile',
  'dialog:saveFile',
] as const;

const ALLOWED_RECEIVE_CHANNELS = [
  'app:update-available',
  'file:changed',
  'window:focus',
  'window:blur',
] as const;

type SendChannel = typeof ALLOWED_SEND_CHANNELS[number];
type InvokeChannel = typeof ALLOWED_INVOKE_CHANNELS[number];
type ReceiveChannel = typeof ALLOWED_RECEIVE_CHANNELS[number];

/**
 * Validates if a channel is in the allowed list.
 * This prevents arbitrary IPC calls from the renderer.
 */
function isValidSendChannel(channel: string): channel is SendChannel {
  return ALLOWED_SEND_CHANNELS.includes(channel as SendChannel);
}

function isValidInvokeChannel(channel: string): channel is InvokeChannel {
  return ALLOWED_INVOKE_CHANNELS.includes(channel as InvokeChannel);
}

function isValidReceiveChannel(channel: string): channel is ReceiveChannel {
  return ALLOWED_RECEIVE_CHANNELS.includes(channel as ReceiveChannel);
}

// Expose protected methods to the renderer through contextBridge
contextBridge.exposeInMainWorld('electronAPI', {
  // Direct API methods
  getVersion: (): Promise<string> => ipcRenderer.invoke('app:getVersion'),
  getPlatform: (): Promise<NodeJS.Platform> => ipcRenderer.invoke('app:getPlatform'),

  // App information
  app: {
    isDev: process.env.NODE_ENV === 'development',
  },

  // Safe IPC communication with channel validation
  ipc: {
    send: (channel: string, ...args: unknown[]): void => {
      if (isValidSendChannel(channel)) {
        ipcRenderer.send(channel, ...args);
      } else {
        console.warn(`IPC send blocked: Invalid channel "${channel}"`);
      }
    },

    invoke: async (channel: string, ...args: unknown[]): Promise<unknown> => {
      if (isValidInvokeChannel(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      } else {
        console.warn(`IPC invoke blocked: Invalid channel "${channel}"`);
        return Promise.reject(new Error(`Invalid IPC channel: ${channel}`));
      }
    },

    on: (channel: string, callback: (...args: unknown[]) => void): (() => void) => {
      if (isValidReceiveChannel(channel)) {
        const subscription = (_event: Electron.IpcRendererEvent, ...args: unknown[]) => callback(...args);
        ipcRenderer.on(channel, subscription);
        // Return cleanup function
        return () => {
          ipcRenderer.removeListener(channel, subscription);
        };
      } else {
        console.warn(`IPC on blocked: Invalid channel "${channel}"`);
        return () => {}; // No-op cleanup
      }
    },

    once: (channel: string, callback: (...args: unknown[]) => void): void => {
      if (isValidReceiveChannel(channel)) {
        ipcRenderer.once(channel, (_event: Electron.IpcRendererEvent, ...args: unknown[]) => callback(...args));
      } else {
        console.warn(`IPC once blocked: Invalid channel "${channel}"`);
      }
    },
  },
} satisfies ElectronAPI);

// Log that preload script has loaded successfully
console.log('Preload script loaded successfully');
