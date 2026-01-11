/**
 * Material Design 3 Theme Context
 * Themes: OLED (pure black) and Classic (cozy dark with optional adaptive colors)
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import {
  M3ColorScheme,
  generateM3Theme,
  generateOLEDTheme,
  generateClassicTheme,
  generateThemeFromAlbumArt,
  applyM3ThemeToCSSVariables,
} from '../utils/m3ThemeEngine';
import type { ThemeStyle } from './SettingsContext';

// Default purple source color for Adaptive theme
const DEFAULT_SOURCE_COLOR = '#808080';

interface M3ThemeContextType {
  // Current M3 color scheme
  colorScheme: M3ColorScheme;

  // Whether the theme is dark or light
  isDark: boolean;

  // Source color (extracted from album art)
  sourceColor: string;

  // Current theme style
  themeStyle: ThemeStyle;

  // Update theme from album art (only works in classic mode with adaptive colors enabled)
  updateThemeFromImage: (imageUrl: string | null) => Promise<void>;

  // Is theme transitioning
  isTransitioning: boolean;
}

const M3ThemeContext = createContext<M3ThemeContextType | undefined>(undefined);

export const useM3Theme = () => {
  const context = useContext(M3ThemeContext);
  if (!context) {
    throw new Error('useM3Theme must be used within M3ThemeProvider');
  }
  return context;
};

interface M3ThemeProviderProps {
  children: ReactNode;
  isDark: boolean;
  themeStyle: ThemeStyle;
  adaptiveColors: boolean;
}

export const M3ThemeProvider: React.FC<M3ThemeProviderProps> = ({
  children,
  isDark,
  themeStyle,
  adaptiveColors,
}) => {
  // Source color extracted from album art (used in classic mode with adaptive colors)
  const [sourceColor, setSourceColor] = useState(DEFAULT_SOURCE_COLOR);

  // Generate theme based on current settings
  const generateCurrentTheme = useCallback((dark: boolean, style: ThemeStyle, adaptive: boolean, source: string): M3ColorScheme => {
    if (style === 'oled') {
      // OLED theme - pure black with white accents
      return generateOLEDTheme(dark);
    }
    // Classic theme
    if (adaptive) {
      // Use dynamic colors from album art
      return generateM3Theme(source, dark);
    }
    // Static classic dark theme
    return generateClassicTheme(dark);
  }, []);

  // Current color scheme
  const [colorScheme, setColorScheme] = useState<M3ColorScheme>(() => {
    return generateCurrentTheme(isDark, themeStyle, adaptiveColors, sourceColor);
  });

  const [isTransitioning, setIsTransitioning] = useState(false);

  // Debounce timer ref for theme updates
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastImageUrlRef = useRef<string | null>(null);

  // Regenerate theme when isDark, themeStyle, or adaptiveColors changes
  useEffect(() => {
    const newScheme = generateCurrentTheme(isDark, themeStyle, adaptiveColors, sourceColor);
    setColorScheme(newScheme);
    applyM3ThemeToCSSVariables(newScheme);

    // Update body classes for theme-aware CSS
    document.body.classList.remove('theme-dark', 'theme-light', 'theme-oled', 'theme-classic');
    document.body.classList.add(isDark ? 'theme-dark' : 'theme-light');
    document.body.classList.add(themeStyle === 'oled' ? 'theme-oled' : 'theme-classic');
  }, [isDark, themeStyle, adaptiveColors, sourceColor, generateCurrentTheme]);

  // Update theme from album art image with debouncing
  const updateThemeFromImage = useCallback(async (imageUrl: string | null) => {
    // Only update colors if we're in classic mode with adaptive colors enabled
    if (themeStyle === 'oled' || !adaptiveColors) return;

    // Skip if same image
    if (imageUrl === lastImageUrlRef.current) return;
    lastImageUrlRef.current = imageUrl;

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce rapid track changes (e.g., fast skipping)
    debounceTimerRef.current = setTimeout(async () => {
      setIsTransitioning(true);

      try {
        const newScheme = await generateThemeFromAlbumArt(imageUrl, isDark);

        // Enable smooth transition
        document.documentElement.style.setProperty('--theme-transition-duration', '350ms');

        setColorScheme(newScheme);
        setSourceColor(newScheme.sourceColor);
        applyM3ThemeToCSSVariables(newScheme);

        // Reset transition state after animation
        setTimeout(() => {
          setIsTransitioning(false);
        }, 350);
      } catch (error) {
        console.error('Error updating theme from image:', error);
        setIsTransitioning(false);
      }
    }, 150); // 150ms debounce
  }, [isDark, themeStyle, adaptiveColors]);

  // When switching to classic mode with adaptive colors, reset the image ref to allow re-extraction
  useEffect(() => {
    if (themeStyle === 'classic' && adaptiveColors) {
      // Allow the ThemeUpdater to re-trigger extraction
      lastImageUrlRef.current = null;
    }
  }, [themeStyle, adaptiveColors]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const value: M3ThemeContextType = {
    colorScheme,
    isDark,
    sourceColor,
    themeStyle,
    updateThemeFromImage,
    isTransitioning,
  };

  return (
    <M3ThemeContext.Provider value={value}>
      {children}
    </M3ThemeContext.Provider>
  );
};

export default M3ThemeContext;
