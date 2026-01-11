import React, { useState } from 'react';
import { useMusicContext } from '../context/MusicContext';
import { useSettings } from '../context/SettingsContext';
import { useM3Theme } from '../context/M3ThemeContext';
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  ShuffleIcon,
  RepeatIcon,
  VolumeIcon,
  VolumeMuteIcon,
  VolumeLowIcon,
  HeartIcon,
  HeartFilledIcon,
  MusicIcon,
  QueueIcon,
} from './Icons';

interface PlayerBarProps {
  onVibeMode?: () => void;
  onLyricsMode?: () => void;
  isCompact?: boolean;
}

const PlayerBar: React.FC<PlayerBarProps> = ({ onVibeMode, onLyricsMode, isCompact = false }) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    volume,
    repeat,
    shuffle,
    pauseTrack,
    resumeTrack,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleRepeat,
    toggleShuffle,
    toggleFavorite,
    isFavorite,
  } = useMusicContext();

  const { t } = useSettings();
  const { colorScheme } = useM3Theme();

  const liked = currentTrack ? isFavorite(currentTrack.id) : false;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const VolumeIconComponent = volume === 0 ? VolumeMuteIcon : volume < 0.5 ? VolumeLowIcon : VolumeIcon;

  if (!currentTrack) {
    return (
      <div
        className="h-20 border-t flex items-center justify-center transition-colors duration-300"
        style={{
          background: colorScheme.surfaceContainerLow,
          borderColor: colorScheme.outlineVariant
        }}
      >
        <div className="flex items-center gap-3" style={{ color: colorScheme.onSurfaceVariant }}>
          <MusicIcon size={20} />
          <span>{t('player.noTrack')}</span>
        </div>
      </div>
    );
  }

  const progress = currentTrack.duration > 0 ? (currentTime / currentTrack.duration) * 100 : 0;

  // Compact layout for mobile
  if (isCompact) {
    return (
      <div
        className="border-t transition-colors duration-300"
        style={{
          background: colorScheme.surfaceContainerLow,
          borderColor: colorScheme.outlineVariant
        }}
      >
        {/* Mini progress bar at top */}
        <div className="relative h-1" style={{ background: colorScheme.surfaceVariant }}>
          <div
            className="absolute inset-y-0 left-0"
            style={{ width: `${progress}%`, background: colorScheme.primary }}
          />
        </div>

        <div className="flex items-center px-4 py-3 gap-3">
          {/* Album art */}
          <div
            className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-m3-2"
            style={{ background: colorScheme.surfaceContainer }}
          >
            {currentTrack.picture ? (
              <img
                src={`data:${currentTrack.picture.format};base64,${currentTrack.picture.data}`}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MusicIcon size={20} style={{ color: colorScheme.onSurfaceVariant }} />
              </div>
            )}
          </div>

          {/* Track info */}
          <div className="flex-1 min-w-0">
            <div
              className="font-medium truncate"
              style={{ color: colorScheme.onSurface }}
            >
              {currentTrack.title}
            </div>
            <div
              className="text-sm truncate"
              style={{ color: colorScheme.onSurfaceVariant }}
            >
              {currentTrack.artist}
            </div>
          </div>

          {/* Play/Pause FAB */}
          <button
            onClick={isPlaying ? pauseTrack : resumeTrack}
            className="m3-fab m3-fab-medium m3-fab-primary"
            style={{
              background: colorScheme.primaryContainer,
              color: colorScheme.onPrimaryContainer,
            }}
          >
            {isPlaying ? (
              <PauseIcon size={24} />
            ) : (
              <PlayIcon size={24} className="ml-0.5" />
            )}
          </button>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div
      className="h-24 border-t px-6 flex items-center justify-between backdrop-blur-xl transition-colors duration-300 shadow-m3-2"
      style={{
        background: colorScheme.surfaceContainerLow,
        borderColor: colorScheme.outlineVariant
      }}
    >
      {/* Track Info */}
      <div className="flex items-center gap-4 w-[30%] min-w-[180px]">
        <div
          onClick={onVibeMode}
          className="w-14 h-14 rounded-m3-lg flex items-center justify-center overflow-hidden shadow-m3-2 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform duration-200"
          style={{ background: colorScheme.surfaceContainer }}
        >
          {currentTrack.picture ? (
            <img
              src={`data:${currentTrack.picture.format};base64,${currentTrack.picture.data}`}
              alt={currentTrack.title}
              className={`w-full h-full object-cover ${isPlaying ? 'animate-pulse-slow' : ''}`}
            />
          ) : (
            <MusicIcon size={24} style={{ color: colorScheme.onSurfaceVariant }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="font-semibold truncate hover:underline cursor-pointer"
            style={{ color: colorScheme.onSurface }}
          >
            {currentTrack.title}
          </div>
          <div
            className="text-sm truncate hover:underline cursor-pointer transition-colors"
            style={{ color: colorScheme.onSurfaceVariant }}
          >
            {currentTrack.artist}
          </div>
        </div>
        <button
          onClick={() => currentTrack && toggleFavorite(currentTrack.id)}
          className="p-2 rounded-m3-full transition-all duration-200 btn-press hover:scale-110"
          style={{ color: liked ? colorScheme.primary : colorScheme.onSurfaceVariant }}
        >
          {liked ? <HeartFilledIcon size={18} /> : <HeartIcon size={18} />}
        </button>
      </div>

      {/* Player Controls */}
      <div className="flex flex-col items-center w-[40%] max-w-[722px]">
        <div className="flex items-center gap-6 mb-2">
          <button
            onClick={toggleShuffle}
            className="m3-icon-button"
            style={{
              color: shuffle ? colorScheme.primary : colorScheme.onSurfaceVariant,
              background: shuffle ? `${colorScheme.primary}20` : 'transparent',
            }}
          >
            <ShuffleIcon size={20} />
          </button>
          <button
            onClick={previousTrack}
            className="m3-icon-button"
            style={{ color: colorScheme.onSurfaceVariant }}
          >
            <SkipBackIcon size={24} />
          </button>

          {/* M3 FAB Play Button */}
          <button
            onClick={isPlaying ? pauseTrack : resumeTrack}
            className="m3-fab m3-fab-medium m3-fab-primary hover:scale-105 transition-transform duration-200"
            style={{
              background: colorScheme.primaryContainer,
              color: colorScheme.onPrimaryContainer,
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
            className="m3-icon-button"
            style={{ color: colorScheme.onSurfaceVariant }}
          >
            <SkipForwardIcon size={24} />
          </button>
          <button
            onClick={toggleRepeat}
            className="m3-icon-button"
            style={{
              color: repeat ? colorScheme.primary : colorScheme.onSurfaceVariant,
              background: repeat ? `${colorScheme.primary}20` : 'transparent',
            }}
          >
            <RepeatIcon size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex items-center gap-3 group">
          <span
            className="text-xs w-10 text-right font-mono"
            style={{ color: colorScheme.onSurfaceVariant }}
          >
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 relative h-1 group">
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: colorScheme.surfaceVariant }}
            />
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
              style={{ width: `${progress}%`, background: colorScheme.primary }}
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
          <span
            className="text-xs w-10 font-mono"
            style={{ color: colorScheme.onSurfaceVariant }}
          >
            {formatTime(currentTrack.duration)}
          </span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center justify-end gap-2 w-[30%] min-w-[180px]">
        <button
          className="m3-icon-button"
          style={{ color: colorScheme.onSurfaceVariant }}
        >
          <QueueIcon size={20} />
        </button>
        <div className="volume-container flex items-center gap-2">
          <button
            onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
            className="m3-icon-button"
            style={{ color: colorScheme.onSurfaceVariant }}
          >
            <VolumeIconComponent size={20} />
          </button>
          <div className="volume-slider">
            <div className="relative w-24 h-1 group">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: colorScheme.surfaceVariant }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all"
                style={{ width: `${volume * 100}%`, background: colorScheme.primary }}
              />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerBar;