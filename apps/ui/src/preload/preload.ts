import { contextBridge, ipcRenderer } from 'electron';

/**
 * Secure IPC bridge exposed to the renderer process.
 * Only explicitly whitelisted channels are accessible.
 * contextIsolation is enabled and nodeIntegration is disabled.
 */

// Whitelist of allowed IPC channels
const validInvokeChannels = [
  'app:getVersion',
  'app:getPlatform',
] as const;

const validSendChannels = [] as const;

const validReceiveChannels = [] as const;

type InvokeChannel = typeof validInvokeChannels[number];
type SendChannel = typeof validSendChannels[number];
type ReceiveChannel = typeof validReceiveChannels[number];

const electronAPI = {
  /**
   * Invoke an IPC handler in the main process and get a result back.
   * Only whitelisted channels are permitted.
   */
  invoke: (channel: InvokeChannel, ...args: unknown[]): Promise<unknown> => {
    if (validInvokeChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    throw new Error(`IPC invoke not allowed for channel: ${channel}`);
  },

  /**
   * Send a one-way message to the main process.
   * Only whitelisted channels are permitted.
   */
  send: (channel: SendChannel, ...args: unknown[]): void => {
    if ((validSendChannels as readonly string[]).includes(channel)) {
      ipcRenderer.send(channel, ...args);
    }
  },

  /**
   * Listen for messages from the main process.
   * Only whitelisted channels are permitted.
   * Returns an unsubscribe function.
   */
  on: (channel: ReceiveChannel, callback: (...args: unknown[]) => void): (() => void) => {
    if ((validReceiveChannels as readonly string[]).includes(channel)) {
      const listener = (_event: Electron.IpcRendererEvent, ...args: unknown[]) => callback(...args);
      ipcRenderer.on(channel, listener);
      return () => {
        ipcRenderer.removeListener(channel, listener);
      };
    }
    throw new Error(`IPC receive not allowed for channel: ${channel}`);
  },
};

// Expose the API to the renderer process via window.electronAPI
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
