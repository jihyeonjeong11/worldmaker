import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs/promises';

// Keep a global reference of the window object to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

// Determine if we're in development mode
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

/**
 * Creates the main application window with proper security settings.
 * Context isolation is enabled to prevent renderer process from accessing
 * Node.js APIs directly, improving security.
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'StoryMaker',
    webPreferences: {
      // Security: Enable context isolation to separate renderer from Node.js
      contextIsolation: true,
      // Security: Disable Node.js integration in renderer for security
      nodeIntegration: false,
      // Security: Disable remote module (deprecated and insecure)
      // @ts-expect-error - enableRemoteModule is deprecated but still exists
      enableRemoteModule: false,
      // Use preload script to expose safe APIs
      preload: path.join(__dirname, 'preload.js'),
      // Security: Enable sandbox for additional isolation
      sandbox: true,
    },
    // Use custom title bar on Windows/Linux for a more modern look
    frame: true,
    backgroundColor: '#1a1a1a',
    show: false, // Don't show until ready to prevent flash
  });

  // Show window when ready to prevent white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  // Load the app
  if (isDev) {
    // In development, load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when Electron is ready
app.whenReady().then(() => {
  createWindow();

  // On macOS, re-create window when dock icon is clicked and no windows are open
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (_, contents) => {
  contents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
});

// IPC Handlers - Example of secure communication between main and renderer
ipcMain.handle('app:getVersion', () => {
  return app.getVersion();
});

ipcMain.handle('app:getPlatform', () => {
  return process.platform;
});

// File persistence handlers
const getDataDirectory = (): string => {
  // Use app.getPath('userData') for persistent storage location
  // This is platform-specific:
  // - Windows: %APPDATA%\StoryMaker
  // - macOS: ~/Library/Application Support/StoryMaker
  // - Linux: ~/.config/StoryMaker
  return app.getPath('userData');
};

ipcMain.handle('file:read', async (_event, fileName: string) => {
  try {
    const filePath = path.join(getDataDirectory(), fileName);
    const data = await fs.readFile(filePath, 'utf-8');
    return { success: true, data };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File not found - not an error, just no saved state
      return { success: true, data: null, notFound: true };
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error reading file';
    console.error('[file:read] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
});

ipcMain.handle('file:write', async (_event, fileName: string, content: string) => {
  try {
    const dataDir = getDataDirectory();
    // Ensure the directory exists
    await fs.mkdir(dataDir, { recursive: true });
    const filePath = path.join(dataDir, fileName);
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error writing file';
    console.error('[file:write] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
});

// Export for testing purposes
export { mainWindow, createWindow };
