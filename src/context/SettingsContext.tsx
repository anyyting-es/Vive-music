import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

declare const window: any;
const { ipcRenderer } = window.require('electron');

export type ThemeMode = 'system' | 'dark' | 'light';
export type ThemeStyle = 'oled' | 'classic';
export type Language = 'en' | 'es';
export type FontFamily = 'system' | 'inter' | 'poppins' | 'roboto' | 'montserrat';
export type ProfileShape = 'circle' | 'square' | 'rounded' | 'squircle' | 'hexagon';
export type ProfilePosition = 'sidebar' | 'topright';
export type BorderRadius = 'none' | 'small' | 'medium' | 'large' | 'full';

export interface AppSettings {
  themeMode: ThemeMode;
  themeStyle: ThemeStyle;
  adaptiveColors: boolean;  // Enable dynamic colors from album art (only for classic theme)
  language: Language;
  fontFamily: FontFamily;
  musicFolders: string[];
  isFirstLaunch: boolean;
  showPlaylistCovers: boolean;
  showProfile: boolean;
  profilePicture: string | null;
  profileShape: ProfileShape;
  profileName: string;
  profilePosition: ProfilePosition;
  showStatsOnHover: boolean;
  useCustomAppName: boolean;
  customAppName: string;
  borderRadius: BorderRadius;
  useCustomTitlebar: boolean;
}

const defaultSettings: AppSettings = {
  themeMode: 'system',
  themeStyle: 'classic',
  adaptiveColors: true,  // Enable adaptive colors by default
  language: 'en',
  fontFamily: 'system',
  musicFolders: [],
  isFirstLaunch: true,
  showPlaylistCovers: false,
  showProfile: false,
  profilePicture: null,
  profileShape: 'circle',
  profileName: 'Music Lover',
  profilePosition: 'topright',
  showStatsOnHover: false,
  useCustomAppName: false,
  customAppName: 'Vibe',
  borderRadius: 'medium',
  useCustomTitlebar: false,
};

// Border radius options
export const borderRadiusOptions: Record<BorderRadius, { label: { en: string; es: string }, values: { sm: string; md: string; lg: string; xl: string } }> = {
  none: { label: { en: 'Square', es: 'Cuadrado' }, values: { sm: '0px', md: '0px', lg: '0px', xl: '0px' } },
  small: { label: { en: 'Slight', es: 'Leve' }, values: { sm: '4px', md: '6px', lg: '8px', xl: '12px' } },
  medium: { label: { en: 'Rounded', es: 'Redondeado' }, values: { sm: '8px', md: '12px', lg: '16px', xl: '24px' } },
  large: { label: { en: 'Very Rounded', es: 'Muy Redondeado' }, values: { sm: '12px', md: '16px', lg: '24px', xl: '32px' } },
  full: { label: { en: 'Maximum', es: 'Máximo' }, values: { sm: '16px', md: '24px', lg: '32px', xl: '9999px' } },
};

// Theme style definitions - 2 themes: OLED and Classic
export const themeStyles: Record<ThemeStyle, { name: { en: string; es: string }, description: { en: string; es: string } }> = {
  oled: {
    name: { en: 'OLED', es: 'OLED' },
    description: { en: 'Pure black theme', es: 'Tema negro puro' }
  },
  classic: {
    name: { en: 'Classic', es: 'Clásico' },
    description: { en: 'Cozy dark theme', es: 'Tema oscuro acogedor' }
  },
};



// Font definitions
export const fonts: Record<FontFamily, { name: string; value: string }> = {
  system: { name: 'System Default', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  inter: { name: 'Inter', value: '"Inter", sans-serif' },
  poppins: { name: 'Poppins', value: '"Poppins", sans-serif' },
  roboto: { name: 'Roboto', value: '"Roboto", sans-serif' },
  montserrat: { name: 'Montserrat', value: '"Montserrat", sans-serif' },
};

// Translations
export const translations: Record<Language, Record<string, string>> = {
  en: {
    // General
    'app.name': 'Vibe',
    'app.welcome': 'Welcome to Vibe',
    'app.setup.title': 'Welcome to Vibe',
    'app.setup.subtitle': 'Let\'s set up your music player',
    'app.setup.language': 'Choose your language',
    'app.setup.theme': 'Choose your theme',
    'app.setup.color': 'Choose your color',
    'app.setup.continue': 'Continue',
    'app.setup.finish': 'Start Listening',

    // Navigation
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.library': 'Library',
    'nav.albums': 'Albums',
    'nav.tracks': 'Tracks',
    'nav.artists': 'Album Artists',
    'nav.playlists': 'Playlists',
    'nav.settings': 'Settings',

    // Settings
    'settings.title': 'Settings',
    'settings.appearance': 'Appearance',
    'settings.themeMode': 'Theme Mode',
    'settings.colorTheme': 'Color Theme',
    'settings.font': 'Font',
    'settings.language': 'Language',
    'settings.musicFolders': 'Music Folders',
    'settings.addFolder': 'Add Folder',
    'settings.removeFolder': 'Remove',
    'settings.noFolders': 'No folders added',
    'settings.system': 'System',
    'settings.dark': 'Dark',
    'settings.light': 'Light',
    'settings.close': 'Close',

    // Player
    'player.noTrack': 'No track playing',
    'player.allSongs': 'All Songs',
    'player.byTitle': 'By Title',
    'player.byArtist': 'By Artist',
    'player.byAlbum': 'By Album',
    'player.songs': 'songs',
    'player.playAll': 'Play All',

    // Sidebar
    'sidebar.likedSongs': 'Liked Songs',

    // Liked Songs
    'liked.empty': 'No Liked Songs Yet',
    'liked.emptyDesc': 'Songs you like will appear here',

    // Playlists
    'playlist.newName': 'New playlist name...',
    'playlist.addTo': 'Add to Playlist',
    'playlist.delete': 'Delete Playlist',
    'playlist.deleteConfirm': 'Are you sure you want to delete this playlist?',

    // Empty states
    'empty.noMusic': 'No Music Yet',
    'empty.addFolder': 'Add a folder containing your music files to start listening',
    'empty.addMusicFolder': 'Add Music Folder',

    // Search
    'search.placeholder': 'Search songs, artists, or albums...',
  },
  es: {
    // General
    'app.name': 'Vibe',
    'app.welcome': 'Bienvenido a Vibe',
    'app.setup.title': 'Bienvenido a Vibe',
    'app.setup.subtitle': 'Configuremos tu reproductor de música',
    'app.setup.language': 'Elige tu idioma',
    'app.setup.theme': 'Elige tu tema',
    'app.setup.color': 'Elige tu color',
    'app.setup.continue': 'Continuar',
    'app.setup.finish': 'Comenzar a Escuchar',

    // Navigation
    'nav.home': 'Inicio',
    'nav.search': 'Buscar',
    'nav.library': 'Biblioteca',
    'nav.albums': 'Álbumes',
    'nav.tracks': 'Canciones',
    'nav.artists': 'Artistas',
    'nav.playlists': 'Playlists',
    'nav.settings': 'Ajustes',

    // Settings
    'settings.title': 'Ajustes',
    'settings.appearance': 'Apariencia',
    'settings.themeMode': 'Modo de Tema',
    'settings.colorTheme': 'Color del Tema',
    'settings.font': 'Fuente',
    'settings.language': 'Idioma',
    'settings.musicFolders': 'Carpetas de Música',
    'settings.addFolder': 'Agregar Carpeta',
    'settings.removeFolder': 'Eliminar',
    'settings.noFolders': 'Sin carpetas agregadas',
    'settings.system': 'Sistema',
    'settings.dark': 'Oscuro',
    'settings.light': 'Claro',
    'settings.close': 'Cerrar',

    // Player
    'player.noTrack': 'Sin reproducción',
    'player.allSongs': 'Todas las Canciones',
    'player.byTitle': 'Por Título',
    'player.byArtist': 'Por Artista',
    'player.byAlbum': 'Por Álbum',
    'player.songs': 'canciones',
    'player.playAll': 'Reproducir Todo',

    // Sidebar
    'sidebar.likedSongs': 'Canciones Favoritas',

    // Liked Songs
    'liked.empty': 'Sin Canciones Favoritas',
    'liked.emptyDesc': 'Las canciones que te gusten aparecerán aquí',

    // Playlists
    'playlist.newName': 'Nombre de la playlist...',
    'playlist.addTo': 'Añadir a Playlist',
    'playlist.delete': 'Eliminar Playlist',
    'playlist.deleteConfirm': '¿Estás seguro de que quieres eliminar esta playlist?',

    // Empty states
    'empty.noMusic': 'Sin Música',
    'empty.addFolder': 'Agrega una carpeta con tus archivos de música para comenzar',
    'empty.addMusicFolder': 'Agregar Carpeta de Música',

    // Search
    'search.placeholder': 'Buscar canciones, artistas o álbumes...',
  },
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  t: (key: string) => string;
  getThemeColors: () => { primary: string; secondary: string; accent: string };
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  completeSetup: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>('dark');

  // Get initial system theme and listen for changes
  useEffect(() => {
    // Get initial system theme synchronously to prevent flash
    try {
      const initialTheme = ipcRenderer.sendSync('get-system-theme-sync');
      setSystemTheme(initialTheme);
    } catch (e) {
      console.error('Error getting system theme:', e);
    }

    // Listen for real-time system theme changes
    const handleThemeChange = (_event: any, theme: 'dark' | 'light') => {
      setSystemTheme(theme);
    };

    ipcRenderer.on('system-theme-changed', handleThemeChange);

    return () => {
      ipcRenderer.removeListener('system-theme-changed', handleThemeChange);
    };
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('vibe-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);

        // Migrate old theme styles to new ones
        if (parsed.themeStyle === 'm3' || parsed.themeStyle === 'adaptive') {
          parsed.themeStyle = 'classic';
          parsed.adaptiveColors = true;
        }

        // Ensure adaptiveColors exists for old settings
        if (parsed.adaptiveColors === undefined) {
          parsed.adaptiveColors = true;
        }

        // Remove deprecated accentColor property
        delete parsed.accentColor;

        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage, file, and apply theme
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('vibe-settings', JSON.stringify(settings));
      // Also save to file for main process to read
      ipcRenderer.send('save-settings-to-file', settings);
      applyTheme(settings, systemTheme);
    }
  }, [settings, isLoaded, systemTheme]);

  // Resolve the effective theme (system -> actual dark/light)
  const getEffectiveTheme = (mode: ThemeMode): 'dark' | 'light' => {
    if (mode === 'system') {
      return systemTheme;
    }
    return mode;
  };

  const applyTheme = (s: AppSettings, sysTheme: 'dark' | 'light') => {
    const root = document.documentElement;
    const body = document.body;
    const effectiveTheme = s.themeMode === 'system' ? sysTheme : s.themeMode;

    // Apply font
    root.style.setProperty('--font-family', fonts[s.fontFamily].value);

    // Apply border radius
    const radiusValues = borderRadiusOptions[s.borderRadius].values;
    root.style.setProperty('--radius-sm', radiusValues.sm);
    root.style.setProperty('--radius-md', radiusValues.md);
    root.style.setProperty('--radius-lg', radiusValues.lg);
    root.style.setProperty('--radius-xl', radiusValues.xl);

    // Remove previous theme classes
    body.classList.remove('theme-dark', 'theme-light');

    // Apply new theme class - M3ThemeContext handles actual colors via CSS variables
    body.classList.add(`theme-${effectiveTheme}`);

    // Note: All --bg-*, --text-*, --border-color variables are now mapped to --m3-* 
    // in styles.css. The M3ThemeContext dynamically updates --m3-* variables.
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const t = (key: string): string => {
    return translations[settings.language][key] || key;
  };

  const getThemeColors = () => ({ primary: '#a0a0a0', secondary: '#808080', accent: '#606060' });

  const completeSetup = () => {
    updateSettings({ isFirstLaunch: false });
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      t,
      getThemeColors,
      showSettings,
      setShowSettings,
      completeSetup,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
