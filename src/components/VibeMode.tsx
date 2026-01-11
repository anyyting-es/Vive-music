import React, { useEffect, useState } from 'react';
import { useMusicContext } from '../context/MusicContext';
import { useSettings } from '../context/SettingsContext';
import AudioVisualizer from './AudioVisualizer';
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  HeartIcon,
  HeartFilledIcon,
  MinimizeIcon,
  MusicIcon,
  ShuffleIcon,
  RepeatIcon,
} from './Icons';

interface VibeModeProps {
  onClose: () => void;
}

const VibeMode: React.FC<VibeModeProps> = ({ onClose }) => {
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
    shuffle,
    repeat,
    toggleShuffle,
    toggleRepeat,
  } = useMusicContext();

  const { getThemeColors } = useSettings();
  const colors = getThemeColors();
  const [dominantColor, setDominantColor] = useState(colors.primary);

  const liked = currentTrack ? isFavorite(currentTrack.id) : false;

  type BackgroundMode = 'album' | 'solid' | 'visualizer';
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('album');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Extract dominant color from album art (simplified - uses primary color as fallback)
  useEffect(() => {
    if (currentTrack?.picture) {
      // In a real implementation, you'd use a color extraction library
      // For now, we'll use the primary color with some variation
      setDominantColor(colors.primary);
    }
  }, [currentTrack, colors.primary]);

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-vibe-in"
      style={{
        background: `linear-gradient(135deg, ${dominantColor}40 0%, rgba(0,0,0,0.95) 50%, ${dominantColor}20 100%)`,
      }}
    >
      {/* Background blur effect - only show for album mode */}
      {backgroundMode === 'album' && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: currentTrack.picture
              ? `url(data:${currentTrack.picture.format};base64,${currentTrack.picture.data})`
              : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(100px) saturate(1.5)',
          }}
        />
      )}

      {/* Audio Visualizer - only show for visualizer mode */}
      {backgroundMode === 'visualizer' && (
        <AudioVisualizer barColor={dominantColor} />
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 p-3 rounded-xl transition-all duration-300 hover:scale-110 glass-button"
        style={{ color: 'white' }}
      >
        <MinimizeIcon size={24} />
      </button>

      {/* Background mode selector */}
      <div className="absolute top-8 left-8 flex gap-2">
        <button
          onClick={() => setBackgroundMode('album')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${backgroundMode === 'album' ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}
          style={{ color: 'white' }}
        >
          Album
        </button>
        <button
          onClick={() => setBackgroundMode('solid')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${backgroundMode === 'solid' ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}
          style={{ color: 'white' }}
        >
          Solid
        </button>
        <button
          onClick={() => setBackgroundMode('visualizer')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${backgroundMode === 'visualizer' ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}
          style={{ color: 'white' }}
        >
          Visualizer
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full px-8">
        {/* Album Art */}
        <div
          className="w-80 h-80 rounded-3xl overflow-hidden shadow-2xl mb-12 album-art-vibe"
          style={{
            boxShadow: `0 30px 60px ${dominantColor}40, 0 0 100px ${dominantColor}20`,
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
              style={{ background: `linear-gradient(135deg, ${colors.primary}50, ${colors.primary}20)` }}
            >
              <MusicIcon size={120} className="text-white opacity-50" />
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            {currentTrack.title}
          </h1>
          <p className="text-xl text-white/70">
            {currentTrack.artist}
          </p>
          {currentTrack.album && (
            <p className="text-base text-white/50 mt-2">
              {currentTrack.album}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full mb-8">
          <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-200"
              style={{ width: `${progress}%`, background: 'white' }}
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
          <div className="flex justify-between mt-3 text-sm font-mono text-white/60">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentTrack.duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8">
          <button
            onClick={toggleShuffle}
            className="p-3 rounded-xl transition-all duration-200 hover:scale-110"
            style={{ color: shuffle ? colors.primary : 'rgba(255,255,255,0.6)' }}
          >
            <ShuffleIcon size={22} />
          </button>

          <button
            onClick={previousTrack}
            className="p-3 rounded-xl transition-all duration-200 hover:scale-110 text-white/80 hover:text-white"
          >
            <SkipBackIcon size={32} />
          </button>

          <button
            onClick={isPlaying ? pauseTrack : resumeTrack}
            className="w-20 h-20 rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-2xl"
            style={{
              background: 'white',
              boxShadow: `0 10px 40px rgba(255,255,255,0.3)`,
            }}
          >
            {isPlaying ? (
              <PauseIcon size={32} style={{ color: '#000' }} />
            ) : (
              <PlayIcon size={32} className="ml-1" style={{ color: '#000' }} />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-3 rounded-xl transition-all duration-200 hover:scale-110 text-white/80 hover:text-white"
          >
            <SkipForwardIcon size={32} />
          </button>

          <button
            onClick={toggleRepeat}
            className="p-3 rounded-xl transition-all duration-200 hover:scale-110"
            style={{ color: repeat ? colors.primary : 'rgba(255,255,255,0.6)' }}
          >
            <RepeatIcon size={22} />
          </button>
        </div>

        {/* Like button */}
        <button
          onClick={() => currentTrack && toggleFavorite(currentTrack.id)}
          className="mt-8 p-4 rounded-2xl transition-all duration-300 hover:scale-110 glass-button"
          style={{ color: liked ? colors.primary : 'rgba(255,255,255,0.6)' }}
        >
          {liked ? <HeartFilledIcon size={28} /> : <HeartIcon size={28} />}
        </button>
      </div>
    </div>
  );
};

export default VibeMode;
