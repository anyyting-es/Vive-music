/**
 * ThemeUpdater - Connects MusicContext with M3ThemeContext
 * Updates the M3 theme when the current track changes (only in classic mode with adaptive colors)
 * Optimized: Uses URL.createObjectURL instead of Base64 for memory efficiency
 */

import { useEffect, useRef } from 'react';
import { useMusicContext } from '../context/MusicContext';
import { useM3Theme } from '../context/M3ThemeContext';
import { useSettings } from '../context/SettingsContext';

const ThemeUpdater: React.FC = () => {
  const { currentTrack } = useMusicContext();
  const { updateThemeFromImage, themeStyle } = useM3Theme();
  const { settings } = useSettings();
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // Only update theme colors in classic mode with adaptive colors enabled
    if (themeStyle !== 'classic' || !settings.adaptiveColors) return;

    // Cleanup previous object URL to prevent memory leaks
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (currentTrack?.picture?.data) {
      // Convert Base64 to Blob for memory-efficient processing
      try {
        const binaryString = atob(currentTrack.picture.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: currentTrack.picture.format });
        const objectUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objectUrl;

        updateThemeFromImage(objectUrl);
      } catch (error) {
        console.error('Error creating object URL for album art:', error);
        // Fallback to base64 if object URL fails
        const imageUrl = `data:${currentTrack.picture.format};base64,${currentTrack.picture.data}`;
        updateThemeFromImage(imageUrl);
      }
    } else {
      // Reset to default theme when no album art
      updateThemeFromImage(null);
    }

    // Cleanup on unmount
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [currentTrack?.id, currentTrack?.picture, themeStyle, settings.adaptiveColors, updateThemeFromImage]);

  return null;
};

export default ThemeUpdater;
