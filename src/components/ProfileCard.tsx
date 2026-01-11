import React, { useState, useMemo } from 'react';
import { useSettings, ProfileShape } from '../context/SettingsContext';
import { useM3Theme } from '../context/M3ThemeContext';
import { useMusicContext } from '../context/MusicContext';
import { UserIcon, MusicIcon, ClockIcon, HeartIcon, CloseIcon } from './Icons';

// Stats Modal Component
const StatsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { settings } = useSettings();
  const { colorScheme } = useM3Theme();
  const { tracks, playlists, favorites } = useMusicContext();

  const stats = useMemo(() => {
    const totalDuration = tracks.reduce((sum, track) => sum + (track.duration || 0), 0);
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);

    return {
      totalSongs: tracks.length,
      totalPlaylists: playlists.length,
      likedSongs: favorites.length,
      totalTime: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
    };
  }, [tracks, playlists, favorites]);

  const getShapeStyles = (shape: ProfileShape) => {
    switch (shape) {
      case 'circle': return { borderRadius: '50%' };
      case 'rounded': return { borderRadius: '12px' };
      case 'square': return { borderRadius: '0' };
      case 'squircle': return { borderRadius: '30%' };
      case 'hexagon': return { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' };
      default: return { borderRadius: '50%' };
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: colorScheme.surfaceContainerLow }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="p-6 relative"
          style={{
            background: `linear-gradient(135deg, ${colorScheme.primaryContainer}, ${colorScheme.secondaryContainer})`,
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors"
            style={{ color: colorScheme.onSurface }}
          >
            <CloseIcon size={20} />
          </button>

          <div className="flex flex-col items-center">
            <div
              className="w-20 h-20 mb-4 overflow-hidden flex items-center justify-center shadow-lg"
              style={{
                ...getShapeStyles(settings.profileShape),
                background: settings.profilePicture
                  ? 'transparent'
                  : `linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.secondary})`,
              }}
            >
              {settings.profilePicture ? (
                <img src={settings.profilePicture} alt={settings.profileName} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={40} style={{ color: colorScheme.onPrimary }} />
              )}
            </div>

            <h2 className="text-xl font-bold mb-1" style={{ color: colorScheme.onSurface }}>
              {settings.profileName}
            </h2>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl" style={{ background: colorScheme.surfaceContainer }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center mb-2" style={{ background: colorScheme.primaryContainer }}>
                <MusicIcon size={18} style={{ color: colorScheme.primary }} />
              </div>
              <div className="text-xl font-bold" style={{ color: colorScheme.onSurface }}>{stats.totalSongs}</div>
              <div className="text-xs" style={{ color: colorScheme.onSurfaceVariant }}>Songs</div>
            </div>

            <div className="p-4 rounded-xl" style={{ background: colorScheme.surfaceContainer }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center mb-2" style={{ background: colorScheme.secondaryContainer }}>
                <HeartIcon size={18} style={{ color: colorScheme.secondary }} />
              </div>
              <div className="text-xl font-bold" style={{ color: colorScheme.onSurface }}>{stats.likedSongs}</div>
              <div className="text-xs" style={{ color: colorScheme.onSurfaceVariant }}>Liked</div>
            </div>

            <div className="p-4 rounded-xl" style={{ background: colorScheme.surfaceContainer }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center mb-2" style={{ background: colorScheme.tertiaryContainer }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colorScheme.tertiary} strokeWidth="2">
                  <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2z" />
                </svg>
              </div>
              <div className="text-xl font-bold" style={{ color: colorScheme.onSurface }}>{stats.totalPlaylists}</div>
              <div className="text-xs" style={{ color: colorScheme.onSurfaceVariant }}>Playlists</div>
            </div>

            <div className="p-4 rounded-xl" style={{ background: colorScheme.surfaceContainer }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center mb-2" style={{ background: colorScheme.errorContainer }}>
                <ClockIcon size={18} style={{ color: colorScheme.error }} />
              </div>
              <div className="text-xl font-bold" style={{ color: colorScheme.onSurface }}>{stats.totalTime}</div>
              <div className="text-xs" style={{ color: colorScheme.onSurfaceVariant }}>Duration</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sidebar Profile Card
export const SidebarProfileCard: React.FC = () => {
  const { settings } = useSettings();
  const { colorScheme } = useM3Theme();
  const { tracks, playlists, favorites } = useMusicContext();
  const [showStats, setShowStats] = useState(false);

  const stats = useMemo(() => {
    const totalSongs = tracks.length;
    const totalDuration = tracks.reduce((sum, track) => sum + (track.duration || 0), 0);
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);
    return {
      songs: totalSongs,
      time: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
    };
  }, [tracks]);

  const getShapeStyles = (shape: ProfileShape) => {
    switch (shape) {
      case 'circle': return { borderRadius: '50%' };
      case 'rounded': return { borderRadius: '8px' };
      case 'square': return { borderRadius: '0' };
      case 'squircle': return { borderRadius: '30%' };
      case 'hexagon': return { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' };
      default: return { borderRadius: '50%' };
    }
  };

  if (!settings.showProfile || settings.profilePosition !== 'sidebar') return null;

  return (
    <>
      <button
        onClick={() => setShowStats(true)}
        className="w-full p-3 mb-3 transition-all duration-200 hover:scale-[1.02] rounded-xl"
        style={{
          background: `linear-gradient(135deg, ${colorScheme.primaryContainer}60, ${colorScheme.secondaryContainer}60)`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 flex-shrink-0 overflow-hidden flex items-center justify-center"
            style={{
              ...getShapeStyles(settings.profileShape),
              background: settings.profilePicture
                ? 'transparent'
                : `linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.secondary})`,
            }}
          >
            {settings.profilePicture ? (
              <img src={settings.profilePicture} alt={settings.profileName} className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={22} style={{ color: colorScheme.onPrimary }} />
            )}
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="font-semibold text-sm truncate" style={{ color: colorScheme.onSurface }}>
              {settings.profileName}
            </div>
            {settings.showStatsOnHover && (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: colorScheme.onSurfaceVariant }}>
                <span>{stats.songs} songs</span>
                <span>•</span>
                <span>{stats.time}</span>
              </div>
            )}
          </div>
        </div>
      </button>

      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
    </>
  );
};

// Top Right Profile
export const TopRightProfile: React.FC = () => {
  const { settings } = useSettings();
  const { colorScheme } = useM3Theme();
  const { tracks, playlists, favorites } = useMusicContext();
  const [showStats, setShowStats] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const stats = useMemo(() => {
    const totalSongs = tracks.length;
    const totalDuration = tracks.reduce((sum, track) => sum + (track.duration || 0), 0);
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);
    return {
      songs: totalSongs,
      playlists: playlists.length,
      liked: favorites.length,
      time: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
    };
  }, [tracks, playlists, favorites]);

  const getShapeStyles = (shape: ProfileShape) => {
    switch (shape) {
      case 'circle': return { borderRadius: '50%' };
      case 'rounded': return { borderRadius: '8px' };
      case 'square': return { borderRadius: '0' };
      case 'squircle': return { borderRadius: '30%' };
      case 'hexagon': return { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' };
      default: return { borderRadius: '50%' };
    }
  };

  if (!settings.showProfile || settings.profilePosition !== 'topright') return null;

  return (
    <>
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          onClick={() => setShowStats(true)}
          className="w-10 h-10 overflow-hidden flex items-center justify-center transition-all hover:scale-105"
          style={{
            ...getShapeStyles(settings.profileShape),
            background: settings.profilePicture
              ? 'transparent'
              : `linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.secondary})`,
          }}
        >
          {settings.profilePicture ? (
            <img src={settings.profilePicture} alt={settings.profileName} className="w-full h-full object-cover" />
          ) : (
            <UserIcon size={20} style={{ color: colorScheme.onPrimary }} />
          )}
        </button>

        {/* Hover Stats Popup */}
        {settings.showStatsOnHover && isHovered && (
          <div
            className="absolute top-full right-0 mt-2 p-3 rounded-xl shadow-lg animate-fade-in min-w-[180px]"
            style={{ background: colorScheme.surfaceContainerHigh }}
          >
            <div className="font-medium text-sm mb-2" style={{ color: colorScheme.onSurface }}>
              {settings.profileName}
            </div>
            <div className="space-y-1 text-xs" style={{ color: colorScheme.onSurfaceVariant }}>
              <div className="flex justify-between">
                <span>Songs</span>
                <span style={{ color: colorScheme.primary }}>{stats.songs}</span>
              </div>
              <div className="flex justify-between">
                <span>Liked</span>
                <span style={{ color: colorScheme.primary }}>{stats.liked}</span>
              </div>
              <div className="flex justify-between">
                <span>Playlists</span>
                <span style={{ color: colorScheme.primary }}>{stats.playlists}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration</span>
                <span style={{ color: colorScheme.primary }}>{stats.time}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
    </>
  );
};

// Default export for backward compatibility
const ProfileCard: React.FC = () => {
  const { settings } = useSettings();

  if (settings.profilePosition === 'sidebar') {
    return <SidebarProfileCard />;
  }

  return null;
};

export default ProfileCard;
