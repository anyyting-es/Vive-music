import React, { useEffect, useState, useRef } from 'react';
import { useMusicContext } from '../context/MusicContext';
import { useSettings } from '../context/SettingsContext';
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  MusicIcon,
  MinimizeIcon,
  HeartIcon,
  HeartFilledIcon,
} from './Icons';

const { ipcRenderer } = window.require('electron');

interface LyricsSplitViewProps {
  onClose: () => void;
}

// Color extraction utility - extracts dominant colors from image
function extractColorsFromImage(imageUrl: string): Promise<{ dominant: string; secondary: string; isDark: boolean }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve({ dominant: '#808080', secondary: '#a0a0a0', isDark: true });
        return;
      }

      // Sample at lower resolution for performance
      const sampleSize = 50;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

      const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;

      // Color frequency map
      const colorMap: Record<string, number> = {};
      let totalR = 0, totalG = 0, totalB = 0, count = 0;

      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];

        if (a < 128) continue;

        const qr = Math.round(r / 32) * 32;
        const qg = Math.round(g / 32) * 32;
        const qb = Math.round(b / 32) * 32;

        const key = `${qr},${qg},${qb}`;
        colorMap[key] = (colorMap[key] || 0) + 1;

        totalR += r;
        totalG += g;
        totalB += b;
        count++;
      }

      let maxCount = 0;
      let dominantKey = '128,128,128';

      for (const [key, freq] of Object.entries(colorMap)) {
        const [r, g, b] = key.split(',').map(Number);
        const brightness = (r + g + b) / 3;
        if (brightness > 30 && brightness < 225 && freq > maxCount) {
          maxCount = freq;
          dominantKey = key;
        }
      }

      const [dr, dg, db] = dominantKey.split(',').map(Number);
      const avgBrightness = count > 0 ? (totalR + totalG + totalB) / (count * 3) : 128;
      const isDark = avgBrightness < 128;

      const factor = isDark ? 1.4 : 0.7;
      const sr = Math.min(255, Math.round(dr * factor));
      const sg = Math.min(255, Math.round(dg * factor));
      const sb = Math.min(255, Math.round(db * factor));

      resolve({
        dominant: `rgb(${dr}, ${dg}, ${db})`,
        secondary: `rgb(${sr}, ${sg}, ${sb})`,
        isDark
      });
    };

    img.onerror = () => {
      resolve({ dominant: '#808080', secondary: '#a0a0a0', isDark: true });
    };

    img.src = imageUrl;
  });
}

const LyricsSplitView: React.FC<LyricsSplitViewProps> = ({ onClose }) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    pauseTrack,
    resumeTrack,
    nextTrack,
    previousTrack,
    seekTo,
    toggleFavorite,
    isFavorite,
  } = useMusicContext();

  const { getThemeColors } = useSettings();
  const colors = getThemeColors();

  const [extractedColors, setExtractedColors] = useState({
    dominant: colors.primary,
    secondary: colors.secondary,
    isDark: true
  });

  const [lyrics, setLyrics] = useState<string | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const liked = currentTrack ? isFavorite(currentTrack.id) : false;

  // Extract colors when album art changes
  useEffect(() => {
    if (currentTrack?.picture) {
      const imageUrl = `data:${currentTrack.picture.format};base64,${currentTrack.picture.data}`;
      extractColorsFromImage(imageUrl).then(setExtractedColors);
    } else {
      setExtractedColors({
        dominant: colors.primary,
        secondary: colors.secondary,
        isDark: true
      });
    }
  }, [currentTrack?.picture, colors.primary, colors.secondary]);

  // Check for local embedded lyrics only (external API disabled)
  useEffect(() => {
    if (!currentTrack) return;

    // Only use embedded lyrics - external API disabled
    if (currentTrack.lyrics) {
      setLyrics(currentTrack.lyrics);
    } else {
      setLyrics(null);
    }
    setLyricsLoading(false);
  }, [currentTrack?.id, currentTrack?.lyrics]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) {
    onClose();
    return null;
  }

  const progress = currentTrack.duration > 0 ? (currentTime / currentTrack.duration) * 100 : 0;
  const textColor = extractedColors.isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)';
  const textColorSecondary = extractedColors.isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';

  // Parse synced lyrics (LRC format) or plain lyrics
  const formatLyrics = (lyricsText: string) => {
    // Check if it's synced lyrics (LRC format with timestamps like [00:12.34])
    const lines = lyricsText.split(/\r?\n/);
    const isLRC = lines.some(line => /^\[\d{2}:\d{2}/.test(line.trim()));

    if (isLRC) {
      // Parse LRC and show lines without timestamps for now
      return lines
        .filter(line => line.trim())
        .map((line, index) => {
          const cleanLine = line.replace(/^\[\d{2}:\d{2}[.\d]*\]\s*/, '');
          return (
            <p key={index} className={`py-1 ${cleanLine.trim() === '' ? 'h-4' : ''}`}>
              {cleanLine || '\u00A0'}
            </p>
          );
        });
    }

    return lines.map((line, index) => (
      <p key={index} className={`py-1 ${line.trim() === '' ? 'h-4' : ''}`}>
        {line || '\u00A0'}
      </p>
    ));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in"
      style={{
        background: `linear-gradient(135deg, ${extractedColors.dominant} 0%, ${extractedColors.secondary} 50%, ${extractedColors.dominant} 100%)`,
      }}
    >
      {/* Overlay for better readability */}
      <div
        className="absolute inset-0"
        style={{
          background: extractedColors.isDark
            ? 'rgba(0, 0, 0, 0.4)'
            : 'rgba(255, 255, 255, 0.3)',
        }}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-20 p-3 rounded-full transition-all duration-300 hover:scale-110"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          color: textColor
        }}
      >
        <MinimizeIcon size={20} />
      </button>

      {/* Main Content - Two Column Layout */}
      <div className="relative z-10 flex w-full h-full">

        {/* Left Column - Album Art + Controls (40%) */}
        <div className="w-[40%] flex flex-col items-center justify-center p-8">

          {/* Album Art */}
          <div
            className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden shadow-2xl mb-8"
            style={{
              boxShadow: `0 30px 60px rgba(0, 0, 0, 0.4), 0 0 80px ${extractedColors.dominant}30`,
            }}
          >
            {currentTrack.picture ? (
              <img
                src={`data:${currentTrack.picture.format};base64,${currentTrack.picture.data}`}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}50, ${colors.primary}20)`
                }}
              >
                <MusicIcon size={100} style={{ color: textColorSecondary }} />
              </div>
            )}
          </div>

          {/* Track Info */}
          <div className="text-center mb-6 w-full max-w-sm">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h2
                className="text-2xl font-bold truncate"
                style={{ color: textColor }}
              >
                {currentTrack.title}
              </h2>
              <button
                onClick={() => currentTrack && toggleFavorite(currentTrack.id)}
                className="flex-shrink-0 p-1.5 rounded-full transition-all duration-200 hover:scale-110"
                style={{ color: liked ? '#ef4444' : textColorSecondary }}
              >
                {liked ? <HeartFilledIcon size={20} /> : <HeartIcon size={20} />}
              </button>
            </div>
            <p
              className="text-base truncate"
              style={{ color: textColorSecondary }}
            >
              {currentTrack.artist}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-sm mb-6">
            <div
              className="relative h-1.5 rounded-full overflow-hidden cursor-pointer group"
              style={{ background: 'rgba(255, 255, 255, 0.2)' }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all"
                style={{ width: `${progress}%`, background: textColor }}
              />
              <input
                type="range"
                min="0"
                max={currentTrack.duration || 100}
                value={currentTime}
                onChange={(e) => seekTo(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            </div>
            <div
              className="flex justify-between mt-2 text-xs font-mono"
              style={{ color: textColorSecondary }}
            >
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={previousTrack}
              className="p-3 rounded-full transition-all duration-200 hover:scale-110"
              style={{
                color: textColor,
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <SkipBackIcon size={24} />
            </button>

            <button
              onClick={isPlaying ? pauseTrack : resumeTrack}
              className="w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-lg"
              style={{
                background: textColor,
                color: extractedColors.isDark ? extractedColors.dominant : '#ffffff'
              }}
            >
              {isPlaying ? (
                <PauseIcon size={24} />
              ) : (
                <PlayIcon size={24} className="ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-3 rounded-full transition-all duration-200 hover:scale-110"
              style={{
                color: textColor,
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <SkipForwardIcon size={24} />
            </button>
          </div>
        </div>

        {/* Right Column - Only Lyrics (60%) */}
        <div className="w-[60%] flex flex-col h-full py-12 pr-12">

          {/* Lyrics Content */}
          <div
            ref={lyricsContainerRef}
            className="flex-1 overflow-y-auto rounded-2xl p-8"
            style={{
              background: 'rgba(0, 0, 0, 0.15)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {lyricsLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div
                  className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mb-4"
                  style={{ borderColor: textColorSecondary, borderTopColor: 'transparent' }}
                />
                <p style={{ color: textColorSecondary }}>
                  Searching for lyrics...
                </p>
              </div>
            ) : lyrics ? (
              <div
                className="text-lg leading-loose font-medium"
                style={{ color: textColor }}
              >
                {formatLyrics(lyrics)}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <MusicIcon size={32} style={{ color: textColorSecondary }} />
                </div>
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: textColor }}
                >
                  No local lyrics found
                </h3>
                <p className="text-sm max-w-xs" style={{ color: textColorSecondary }}>
                  This track doesn't have embedded lyrics
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LyricsSplitView;
