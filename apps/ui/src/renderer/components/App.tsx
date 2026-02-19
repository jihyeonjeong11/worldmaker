import React, { useEffect, useState, useCallback } from 'react';
import { InfiniteCanvas } from './InfiniteCanvas';

const App: React.FC = () => {
  const [appVersion, setAppVersion] = useState<string>('');
  const [platform, setPlatform] = useState<string>('');

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
        <h1 className="app-title">Worldmaker</h1>
        <p className="app-subtitle">Infinite Canvas</p>
        {appVersion && (
          <div className="app-info-header">
            <span>v{appVersion}</span>
            {platform && <span> • {platform}</span>}
          </div>
        )}
      </header>

      <main className="app-main-canvas">
        <InfiniteCanvas onCameraChange={handleCameraChange} />
      </main>
    </div>
  );
};

export default App;
