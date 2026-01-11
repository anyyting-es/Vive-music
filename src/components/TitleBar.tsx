import React, { useState, useEffect } from 'react';
import { useM3Theme } from '../context/M3ThemeContext';
import { useSettings } from '../context/SettingsContext';

declare const window: any;
const { ipcRenderer } = window.require('electron');

const TitleBar: React.FC = () => {
  const { colorScheme } = useM3Theme();
  const { settings } = useSettings();
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Get initial maximized state
    ipcRenderer.invoke('window-is-maximized').then(setIsMaximized);

    // Listen for maximize/unmaximize events
    const handleMaximizedChange = (_event: any, maximized: boolean) => {
      setIsMaximized(maximized);
    };

    ipcRenderer.on('window-maximized-changed', handleMaximizedChange);

    return () => {
      ipcRenderer.removeListener('window-maximized-changed', handleMaximizedChange);
    };
  }, []);

  if (!settings.useCustomTitlebar) {
    return null;
  }

  const handleMinimize = () => {
    ipcRenderer.send('window-minimize');
  };

  const handleMaximize = () => {
    ipcRenderer.send('window-maximize');
  };

  const handleClose = () => {
    ipcRenderer.send('window-close');
  };

  return (
    <div 
      className="h-6 flex items-center justify-between select-none"
      style={{ 
        background: colorScheme.surfaceContainer,
      }}
    >
      {/* Draggable area */}
      <div 
        className="flex-1 h-full app-drag"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      />

      {/* Window controls */}
      <div 
        className="flex h-full"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Minimize */}
        <button
          onClick={handleMinimize}
          className="w-10 h-full flex items-center justify-center transition-colors hover:bg-white/10"
          title="Minimize"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="none">
            <rect width="10" height="1" fill={colorScheme.onSurface} />
          </svg>
        </button>

        {/* Maximize/Restore */}
        <button
          onClick={handleMaximize}
          className="w-10 h-full flex items-center justify-center transition-colors hover:bg-white/10"
          title={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? (
            // Restore icon (two overlapping squares)
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="2" y="0" width="8" height="8" stroke={colorScheme.onSurface} strokeWidth="1" fill="none" />
              <rect x="0" y="2" width="8" height="8" stroke={colorScheme.onSurface} strokeWidth="1" fill={colorScheme.surfaceContainer} />
            </svg>
          ) : (
            // Maximize icon (single square)
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="0" y="0" width="10" height="10" stroke={colorScheme.onSurface} strokeWidth="1" fill="none" />
            </svg>
          )}
        </button>

        {/* Close */}
        <button
          onClick={handleClose}
          className="w-10 h-full flex items-center justify-center transition-colors hover:bg-red-500"
          title="Close"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <line x1="0" y1="0" x2="10" y2="10" stroke={colorScheme.onSurface} strokeWidth="1.2" />
            <line x1="10" y1="0" x2="0" y2="10" stroke={colorScheme.onSurface} strokeWidth="1.2" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
