/**
 * Material Design 3 (Material You) Theme Engine
 * Extracts source color from album art and generates full M3 color palette
 */

import {
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
  TonalPalette,
  Hct,
} from '@material/material-color-utilities';

// M3 Color Scheme interface
export interface M3ColorScheme {
  // Primary
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;

  // Secondary
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;

  // Tertiary
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;

  // Error
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;

  // Surface & Background
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;

  // Outline
  outline: string;
  outlineVariant: string;

  // Inverse
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;

  // Shadow & Scrim
  shadow: string;
  scrim: string;

  // Background (legacy)
  background: string;
  onBackground: string;

  // Source color
  sourceColor: string;
}

// Default purple theme (fallback)
const DEFAULT_SOURCE_COLOR = '#808080';

// Achromatic (grayscale) source color for minimalist mode
const ACHROMATIC_SOURCE_COLOR = '#808080';

/**
 * Generate an achromatic (grayscale/black-and-white) M3 color scheme
 * This is the fallback when Material You is disabled
 */
export function generateAchromaticTheme(isDark: boolean): M3ColorScheme {
  // Use strict B&W theme for minimalist/system mode (OLED)
  return generateStrictBWTheme(isDark);
}

/**
 * Generate a Classic theme (cozy dark gray, not pure black)
 */
export function generateClassicTheme(isDark: boolean): M3ColorScheme {
  if (isDark) {
    return {
      primary: '#a0a0a0',
      onPrimary: '#1a1a1a',
      primaryContainer: '#404040',
      onPrimaryContainer: '#e0e0e0',

      secondary: '#909090',
      onSecondary: '#1a1a1a',
      secondaryContainer: '#383838',
      onSecondaryContainer: '#d0d0d0',

      tertiary: '#888888',
      onTertiary: '#1a1a1a',
      tertiaryContainer: '#353535',
      onTertiaryContainer: '#c8c8c8',

      error: '#ffb4ab',
      onError: '#690005',
      errorContainer: '#93000a',
      onErrorContainer: '#ffdad6',

      // Cozy dark gray surfaces (not pure black)
      surface: '#1a1a1a',
      onSurface: '#e8e8e8',
      surfaceVariant: '#2a2a2a',
      onSurfaceVariant: '#c0c0c0',

      // Gray backgrounds
      surfaceContainerLowest: '#141414',
      surfaceContainerLow: '#1a1a1a',
      surfaceContainer: '#202020',
      surfaceContainerHigh: '#2a2a2a',
      surfaceContainerHighest: '#353535',

      outline: '#555555',
      outlineVariant: '#3a3a3a',

      inverseSurface: '#e8e8e8',
      inverseOnSurface: '#1a1a1a',
      inversePrimary: '#404040',

      shadow: '#000000',
      scrim: '#000000',

      background: '#1a1a1a',
      onBackground: '#e8e8e8',

      sourceColor: '#808080',
    };
  } else {
    return {
      primary: '#505050',
      onPrimary: '#ffffff',
      primaryContainer: '#e0e0e0',
      onPrimaryContainer: '#1a1a1a',

      secondary: '#606060',
      onSecondary: '#ffffff',
      secondaryContainer: '#ebebeb',
      onSecondaryContainer: '#2a2a2a',

      tertiary: '#707070',
      onTertiary: '#ffffff',
      tertiaryContainer: '#f0f0f0',
      onTertiaryContainer: '#353535',

      error: '#ba1a1a',
      onError: '#ffffff',
      errorContainer: '#ffdad6',
      onErrorContainer: '#410002',

      // Soft white surfaces
      surface: '#f5f5f5',
      onSurface: '#1a1a1a',
      surfaceVariant: '#ebebeb',
      onSurfaceVariant: '#404040',

      // Light backgrounds
      surfaceContainerLowest: '#ffffff',
      surfaceContainerLow: '#fafafa',
      surfaceContainer: '#f5f5f5',
      surfaceContainerHigh: '#efefef',
      surfaceContainerHighest: '#e8e8e8',

      outline: '#888888',
      outlineVariant: '#d0d0d0',

      inverseSurface: '#2a2a2a',
      inverseOnSurface: '#f5f5f5',
      inversePrimary: '#c0c0c0',

      shadow: '#000000',
      scrim: '#000000',

      background: '#f5f5f5',
      onBackground: '#1a1a1a',

      sourceColor: '#808080',
    };
  }
}

/**
 * Generate an OLED theme (pure black with custom accent color)
 */
export function generateOLEDTheme(isDark: boolean, accentColor: string = '#ffffff'): M3ColorScheme {
  if (isDark) {
    return {
      primary: accentColor,
      onPrimary: '#000000',
      primaryContainer: '#1a1a1a',
      onPrimaryContainer: accentColor,

      secondary: accentColor + 'cc', // 80% opacity
      onSecondary: '#000000',
      secondaryContainer: '#141414',
      onSecondaryContainer: accentColor,

      tertiary: accentColor + '99', // 60% opacity
      onTertiary: '#000000',
      tertiaryContainer: '#0f0f0f',
      onTertiaryContainer: accentColor,

      error: '#ffb4ab',
      onError: '#690005',
      errorContainer: '#93000a',
      onErrorContainer: '#ffdad6',

      // Pure Black Surface
      surface: '#000000',
      onSurface: '#ffffff',
      surfaceVariant: '#0a0a0a',
      onSurfaceVariant: '#b0b0b0',

      // Pure Black Backgrounds
      surfaceContainerLowest: '#000000',
      surfaceContainerLow: '#000000',
      surfaceContainer: '#0a0a0a',
      surfaceContainerHigh: '#111111',
      surfaceContainerHighest: '#1a1a1a',

      outline: '#404040',
      outlineVariant: '#1a1a1a',

      inverseSurface: '#ffffff',
      inverseOnSurface: '#000000',
      inversePrimary: accentColor,

      shadow: '#000000',
      scrim: '#000000',

      background: '#000000',
      onBackground: '#ffffff',

      sourceColor: accentColor,
    };
  } else {
    // Light mode OLED - white background with dark accent
    // Use dark colors for text to ensure visibility
    const darkAccent = accentColor === '#ffffff' ? '#000000' : accentColor;
    return {
      primary: darkAccent,
      onPrimary: '#ffffff',
      primaryContainer: '#f5f5f5',
      onPrimaryContainer: '#000000',

      secondary: darkAccent,
      onSecondary: '#ffffff',
      secondaryContainer: '#fafafa',
      onSecondaryContainer: '#333333',

      tertiary: darkAccent,
      onTertiary: '#ffffff',
      tertiaryContainer: '#ffffff',
      onTertiaryContainer: '#444444',

      error: '#ba1a1a',
      onError: '#ffffff',
      errorContainer: '#ffdad6',
      onErrorContainer: '#410002',

      // Pure White Surface
      surface: '#ffffff',
      onSurface: '#000000',
      surfaceVariant: '#fafafa',
      onSurfaceVariant: '#404040',

      // Pure White Backgrounds
      surfaceContainerLowest: '#ffffff',
      surfaceContainerLow: '#ffffff',
      surfaceContainer: '#fafafa',
      surfaceContainerHigh: '#f5f5f5',
      surfaceContainerHighest: '#f0f0f0',

      outline: '#c0c0c0',
      outlineVariant: '#e8e8e8',

      inverseSurface: '#000000',
      inverseOnSurface: '#ffffff',
      inversePrimary: accentColor,

      shadow: '#000000',
      scrim: '#000000',

      background: '#ffffff',
      onBackground: '#000000',

      sourceColor: darkAccent,
    };
  }
}

/**
 * Generate valid M3 Scheme from strict B&W values
 */
function generateStrictBWTheme(isDark: boolean): M3ColorScheme {
  if (isDark) {
    return {
      primary: '#ffffff',
      onPrimary: '#000000',
      primaryContainer: '#333333',
      onPrimaryContainer: '#ffffff',

      secondary: '#e0e0e0',
      onSecondary: '#000000',
      secondaryContainer: '#222222',
      onSecondaryContainer: '#ffffff',

      tertiary: '#cccccc',
      onTertiary: '#000000',
      tertiaryContainer: '#222222',
      onTertiaryContainer: '#cccccc',

      error: '#ffb4ab',
      onError: '#690005',
      errorContainer: '#93000a',
      onErrorContainer: '#ffdad6',

      // Pure Black Surface
      surface: '#000000',
      onSurface: '#ffffff',
      surfaceVariant: '#222222',
      onSurfaceVariant: '#cccccc',

      // Strict Black Backgrounds
      surfaceContainerLowest: '#000000',
      surfaceContainerLow: '#000000',
      surfaceContainer: '#000000',
      surfaceContainerHigh: '#111111',
      surfaceContainerHighest: '#222222',

      outline: '#666666',
      outlineVariant: '#333333',

      inverseSurface: '#ffffff',
      inverseOnSurface: '#000000',
      inversePrimary: '#000000',

      shadow: '#000000',
      scrim: '#000000',

      background: '#000000',
      onBackground: '#ffffff',

      sourceColor: '#000000',
    };
  } else {
    return {
      primary: '#000000',
      onPrimary: '#ffffff',
      primaryContainer: '#e0e0e0',
      onPrimaryContainer: '#000000',

      secondary: '#333333',
      onSecondary: '#ffffff',
      secondaryContainer: '#f0f0f0',
      onSecondaryContainer: '#000000',

      tertiary: '#555555',
      onTertiary: '#ffffff',
      tertiaryContainer: '#f5f5f5',
      onTertiaryContainer: '#000000',

      error: '#ba1a1a',
      onError: '#ffffff',
      errorContainer: '#ffdad6',
      onErrorContainer: '#410002',

      // Pure White Surface
      surface: '#ffffff',
      onSurface: '#000000',
      surfaceVariant: '#eeeeee',
      onSurfaceVariant: '#444444',

      // Strict White Backgrounds
      surfaceContainerLowest: '#ffffff',
      surfaceContainerLow: '#ffffff',
      surfaceContainer: '#ffffff',
      surfaceContainerHigh: '#f5f5f5',
      surfaceContainerHighest: '#eeeeee',

      outline: '#999999',
      outlineVariant: '#dddddd',

      inverseSurface: '#000000',
      inverseOnSurface: '#ffffff',
      inversePrimary: '#ffffff',

      shadow: '#000000',
      scrim: '#000000',

      background: '#ffffff',
      onBackground: '#000000',

      sourceColor: '#ffffff',
    };
  }
}

/**
 * Extract dominant color from an image
 */
export async function extractColorFromImage(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(DEFAULT_SOURCE_COLOR);
        return;
      }

      // Sample at lower resolution for performance
      const sampleSize = 64;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

      const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;

      // Color frequency map with saturation weighting
      const colorScores: Map<string, number> = new Map();

      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];

        if (a < 128) continue; // Skip transparent pixels

        // Calculate HSL for saturation weighting
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const l = (max + min) / 2 / 255;
        const s = max === min ? 0 : (l > 0.5
          ? (max - min) / (510 - max - min)
          : (max - min) / (max + min));

        // Skip very dark, very light, or unsaturated colors
        if (l < 0.15 || l > 0.85 || s < 0.2) continue;

        // Quantize colors to reduce noise
        const qr = Math.round(r / 16) * 16;
        const qg = Math.round(g / 16) * 16;
        const qb = Math.round(b / 16) * 16;

        const hex = `#${qr.toString(16).padStart(2, '0')}${qg.toString(16).padStart(2, '0')}${qb.toString(16).padStart(2, '0')}`;

        // Score by saturation (more saturated = better source color)
        const score = (colorScores.get(hex) || 0) + s * 10;
        colorScores.set(hex, score);
      }

      // Find highest scoring color
      let bestColor = DEFAULT_SOURCE_COLOR;
      let bestScore = 0;

      colorScores.forEach((score, color) => {
        if (score > bestScore) {
          bestScore = score;
          bestColor = color;
        }
      });

      resolve(bestColor);
    };

    img.onerror = () => {
      resolve(DEFAULT_SOURCE_COLOR);
    };

    img.src = imageUrl;
  });
}

/**
 * Generate M3 color scheme from a source color
 */
export function generateM3Theme(sourceColorHex: string, isDark: boolean): M3ColorScheme {
  try {
    const sourceColor = argbFromHex(sourceColorHex);
    const theme = themeFromSourceColor(sourceColor);
    const scheme = isDark ? theme.schemes.dark : theme.schemes.light;

    // Get neutral palette for surface container colors
    const neutralPalette = theme.palettes.neutral;

    // Surface container tones (M3 spec)
    // Dark: lowest=4, low=10, container=12, high=17, highest=22
    // Light: lowest=100, low=96, container=94, high=92, highest=90
    const surfaceContainerTones = isDark
      ? { lowest: 4, low: 10, container: 12, high: 17, highest: 22 }
      : { lowest: 100, low: 96, container: 94, high: 92, highest: 90 };

    return {
      // Primary
      primary: hexFromArgb(scheme.primary),
      onPrimary: hexFromArgb(scheme.onPrimary),
      primaryContainer: hexFromArgb(scheme.primaryContainer),
      onPrimaryContainer: hexFromArgb(scheme.onPrimaryContainer),

      // Secondary
      secondary: hexFromArgb(scheme.secondary),
      onSecondary: hexFromArgb(scheme.onSecondary),
      secondaryContainer: hexFromArgb(scheme.secondaryContainer),
      onSecondaryContainer: hexFromArgb(scheme.onSecondaryContainer),

      // Tertiary
      tertiary: hexFromArgb(scheme.tertiary),
      onTertiary: hexFromArgb(scheme.onTertiary),
      tertiaryContainer: hexFromArgb(scheme.tertiaryContainer),
      onTertiaryContainer: hexFromArgb(scheme.onTertiaryContainer),

      // Error
      error: hexFromArgb(scheme.error),
      onError: hexFromArgb(scheme.onError),
      errorContainer: hexFromArgb(scheme.errorContainer),
      onErrorContainer: hexFromArgb(scheme.onErrorContainer),

      // Surface
      surface: hexFromArgb(scheme.surface),
      onSurface: hexFromArgb(scheme.onSurface),
      surfaceVariant: hexFromArgb(scheme.surfaceVariant),
      onSurfaceVariant: hexFromArgb(scheme.onSurfaceVariant),
      surfaceContainerLowest: hexFromArgb(neutralPalette.tone(surfaceContainerTones.lowest)),
      surfaceContainerLow: hexFromArgb(neutralPalette.tone(surfaceContainerTones.low)),
      surfaceContainer: hexFromArgb(neutralPalette.tone(surfaceContainerTones.container)),
      surfaceContainerHigh: hexFromArgb(neutralPalette.tone(surfaceContainerTones.high)),
      surfaceContainerHighest: hexFromArgb(neutralPalette.tone(surfaceContainerTones.highest)),

      // Outline
      outline: hexFromArgb(scheme.outline),
      outlineVariant: hexFromArgb(scheme.outlineVariant),

      // Inverse
      inverseSurface: hexFromArgb(scheme.inverseSurface),
      inverseOnSurface: hexFromArgb(scheme.inverseOnSurface),
      inversePrimary: hexFromArgb(scheme.inversePrimary),

      // Shadow & Scrim
      shadow: hexFromArgb(scheme.shadow),
      scrim: hexFromArgb(scheme.scrim),

      // Background
      background: hexFromArgb(scheme.background),
      onBackground: hexFromArgb(scheme.onBackground),

      // Source
      sourceColor: sourceColorHex,
    };
  } catch (error) {
    console.error('Error generating M3 theme:', error);
    // Return fallback theme
    return generateM3Theme(DEFAULT_SOURCE_COLOR, isDark);
  }
}

/**
 * Apply M3 color scheme to CSS variables
 * Maps all M3 colors for consistent theming across light and dark modes
 */
export function applyM3ThemeToCSSVariables(scheme: M3ColorScheme): void {
  const root = document.documentElement;

  // Primary
  root.style.setProperty('--m3-primary', scheme.primary);
  root.style.setProperty('--m3-on-primary', scheme.onPrimary);
  root.style.setProperty('--m3-primary-container', scheme.primaryContainer);
  root.style.setProperty('--m3-on-primary-container', scheme.onPrimaryContainer);

  // Secondary
  root.style.setProperty('--m3-secondary', scheme.secondary);
  root.style.setProperty('--m3-on-secondary', scheme.onSecondary);
  root.style.setProperty('--m3-secondary-container', scheme.secondaryContainer);
  root.style.setProperty('--m3-on-secondary-container', scheme.onSecondaryContainer);

  // Tertiary
  root.style.setProperty('--m3-tertiary', scheme.tertiary);
  root.style.setProperty('--m3-on-tertiary', scheme.onTertiary);
  root.style.setProperty('--m3-tertiary-container', scheme.tertiaryContainer);
  root.style.setProperty('--m3-on-tertiary-container', scheme.onTertiaryContainer);

  // Error
  root.style.setProperty('--m3-error', scheme.error);
  root.style.setProperty('--m3-on-error', scheme.onError);
  root.style.setProperty('--m3-error-container', scheme.errorContainer);
  root.style.setProperty('--m3-on-error-container', scheme.onErrorContainer);

  // Surface - Full M3 Surface Container hierarchy
  root.style.setProperty('--m3-surface', scheme.surface);
  root.style.setProperty('--m3-on-surface', scheme.onSurface);
  root.style.setProperty('--m3-surface-variant', scheme.surfaceVariant);
  root.style.setProperty('--m3-on-surface-variant', scheme.onSurfaceVariant);

  // Surface Container levels (critical for visual hierarchy)
  root.style.setProperty('--m3-surface-container-lowest', scheme.surfaceContainerLowest);
  root.style.setProperty('--m3-surface-container-low', scheme.surfaceContainerLow);
  root.style.setProperty('--m3-surface-container', scheme.surfaceContainer);
  root.style.setProperty('--m3-surface-container-high', scheme.surfaceContainerHigh);
  root.style.setProperty('--m3-surface-container-highest', scheme.surfaceContainerHighest);

  // Outline
  root.style.setProperty('--m3-outline', scheme.outline);
  root.style.setProperty('--m3-outline-variant', scheme.outlineVariant);

  // Inverse
  root.style.setProperty('--m3-inverse-surface', scheme.inverseSurface);
  root.style.setProperty('--m3-inverse-on-surface', scheme.inverseOnSurface);
  root.style.setProperty('--m3-inverse-primary', scheme.inversePrimary);

  // Shadow & Scrim
  root.style.setProperty('--m3-shadow', scheme.shadow);
  root.style.setProperty('--m3-scrim', scheme.scrim);

  // Background
  root.style.setProperty('--m3-background', scheme.background);
  root.style.setProperty('--m3-on-background', scheme.onBackground);

  // Surface tint for elevation (M3 spec)
  root.style.setProperty('--m3-surface-tint', scheme.primary);

  // Elevation overlay colors for cards/dialogs
  root.style.setProperty('--m3-elevation-1', scheme.surfaceContainerLow);
  root.style.setProperty('--m3-elevation-2', scheme.surfaceContainer);
  root.style.setProperty('--m3-elevation-3', scheme.surfaceContainerHigh);
  root.style.setProperty('--m3-elevation-4', scheme.surfaceContainerHighest);
  root.style.setProperty('--m3-elevation-5', scheme.surfaceContainerHighest);
}

/**
 * Generate theme from album art
 */
export async function generateThemeFromAlbumArt(
  imageUrl: string | null,
  isDark: boolean
): Promise<M3ColorScheme> {
  if (!imageUrl) {
    return generateM3Theme(DEFAULT_SOURCE_COLOR, isDark);
  }

  const sourceColor = await extractColorFromImage(imageUrl);
  return generateM3Theme(sourceColor, isDark);
}
