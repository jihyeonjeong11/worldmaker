import React, { useEffect, useState, useCallback } from 'react';
import { InfiniteCanvas } from './InfiniteCanvas';
import { CreateRootNodeForm } from './CreateRootNodeForm';

const App: React.FC = () => {
  const [appVersion, setAppVersion] = useState<string>('');
  const [platform, setPlatform] = useState<string>('');
  const [isCreateRootNodeFormOpen, setIsCreateRootNodeFormOpen] = useState(false);

  const handleOpenCreateRootNodeForm = useCallback(() => {
    setIsCreateRootNodeFormOpen(true);
  }, []);

  const handleCloseCreateRootNodeForm = useCallback(() => {
    setIsCreateRootNodeFormOpen(false);
  }, []);

  const handleRootNodeCreated = useCallback(() => {
    console.log('Root node created successfully');
  }, []);

  useEffect(() => {
    const fetchHello = async () => {
      try {
        const response = await fetch('http://localhost:3000/hello');
        const data = await response.text();
        console.log('Server Response:', data);
      } catch (error) {
        console.error('fetch error:', error);
      }
    };

    fetchHello();
  }, []);

  useEffect(() => {
    const loadAppInfo = async () => {
      try {
        if (window.electronAPI) {
          const version = (await window.electronAPI.invoke('app:getVersion')) as string;
          const plat = (await window.electronAPI.invoke('app:getPlatform')) as string;
          setAppVersion(version);
          setPlatform(plat);
        }
      } catch (error) {
        console.error('Failed to load app info:', error);
      }
    };

    loadAppInfo();
  }, []);

  const handleCameraChange = useCallback((camera: { x: number; y: number; scale: number }) => {
    // Optional: Track camera changes for persistence or other features
    console.debug('Camera:', camera);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <div className="app-header-left">
            <h1 className="app-title">Worldmaker</h1>
            <p className="app-subtitle">Infinite Canvas</p>
            {appVersion && (
              <div className="app-info-header">
                <span>v{appVersion}</span>
                {platform && <span> • {platform}</span>}
              </div>
            )}
          </div>
          <div className="app-header-actions">
            <button
              className="header-action-button"
              onClick={handleOpenCreateRootNodeForm}
              title="Create New Root Node"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              New Root
            </button>
          </div>
        </div>
      </header>

      <main className="app-main-canvas">
        <InfiniteCanvas onCameraChange={handleCameraChange} />
      </main>

      <CreateRootNodeForm
        isOpen={isCreateRootNodeFormOpen}
        onClose={handleCloseCreateRootNodeForm}
        onSuccess={handleRootNodeCreated}
      />
    </div>
  );
};

export default App;
