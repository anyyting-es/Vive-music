import React from 'react';
import { MusicProvider } from '../context/MusicContext';
import { SettingsProvider, useSettings } from '../context/SettingsContext';
import { M3ThemeProvider } from '../context/M3ThemeContext';
import Layout from './Layout';
import SetupWizard from './SetupWizard';
import SettingsModal from './SettingsModal';
import ThemeUpdater from './ThemeUpdater';

const AppContent: React.FC = () => {
  const { settings } = useSettings();

  if (settings.isFirstLaunch) {
    return <SetupWizard />;
  }

  return (
    <>
      <ThemeUpdater />
      <Layout />
      <SettingsModal />
    </>
  );
};

// Wrapper that passes themeStyle and effective dark mode to M3ThemeProvider
const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();

  // Listen to system theme changes
  const [systemDark, setSystemDark] = React.useState(() => {
    try {
      const { ipcRenderer } = (window as any).require('electron');
      return ipcRenderer.sendSync('get-system-theme-sync') === 'dark';
    } catch {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  });

  React.useEffect(() => {
    try {
      const { ipcRenderer } = (window as any).require('electron');
      const handler = (_event: any, theme: 'dark' | 'light') => {
        setSystemDark(theme === 'dark');
      };
      ipcRenderer.on('system-theme-changed', handler);
      return () => ipcRenderer.removeListener('system-theme-changed', handler);
    } catch {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  // Determine effective dark mode
  const effectiveDark = settings.themeMode === 'system' ? systemDark : settings.themeMode === 'dark';

  return (
    <M3ThemeProvider
      isDark={effectiveDark}
      themeStyle={settings.themeStyle}
      adaptiveColors={settings.adaptiveColors}
    >
      {children}
    </M3ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <ThemeWrapper>
        <MusicProvider>
          <AppContent />
        </MusicProvider>
      </ThemeWrapper>
    </SettingsProvider>
  );
};

export default App;
