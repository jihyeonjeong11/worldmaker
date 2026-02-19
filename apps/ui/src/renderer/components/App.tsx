import React, { useEffect, useState } from 'react';

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

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Worldmaker hello</h1>
        <p className="app-subtitle">Fantasy World-Building Tool</p>
      </header>

      <main className="app-main">
        <div className="welcome-card">
          <h2>Welcome to Worldmaker</h2>
          <p>
            Build rich fantasy worlds by layering customizable story cards. Create regions,
            characters, events, lore, factions, and landmarks to craft immersive narrative settings.
          </p>
          {appVersion && (
            <div className="app-info">
              <span>Version: {appVersion}</span>
              {platform && <span> | Platform: {platform}</span>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
