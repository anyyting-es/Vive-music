import React from 'react';
import { useMusicContext } from '../../context/MusicContext';
import { useSettings } from '../../context/SettingsContext';
import { useM3Theme } from '../../context/M3ThemeContext';
import { PlayIcon, MusicIcon, ClockIcon, HeartFilledIcon } from '../Icons';

const LikedSongsView: React.FC = () => {
  const { tracks, favorites, playTrack, currentTrack, isPlaying, toggleFavorite } = useMusicContext();
  const { t, getThemeColors } = useSettings();
  const { colorScheme } = useM3Theme();
  const colors = getThemeColors();

  const likedTracks = tracks.filter(track => favorites.includes(track.id));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = likedTracks.reduce((acc, track) => acc + track.duration, 0);
  const totalMins = Math.floor(totalDuration / 60);

  const playAll = () => {
    if (likedTracks.length > 0) {
      playTrack(likedTracks[0]);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div
        className="p-8 pb-6"
        style={{
          background: `linear-gradient(180deg, ${colorScheme.primary}30 0%, transparent 100%)`,
        }}
      >
        <div className="flex items-end gap-6">
          <div
            className="w-56 h-56 rounded-xl flex items-center justify-center shadow-2xl overflow-hidden relative"
            style={{
              background: currentTrack?.picture ? 'transparent' : `linear-gradient(135deg, ${colorScheme.primary} 0%, ${colorScheme.primary}80 100%)`,
            }}
          >
            {currentTrack?.picture ? (
              <img
                src={`data:${currentTrack.picture.format};base64,${currentTrack.picture.data}`}
                alt="Current Track"
                className="w-full h-full object-cover animate-fade-in"
              />
            ) : (
              <HeartFilledIcon size={80} color="white" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
              Playlist
            </p>
            <h1 className="text-5xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              {t('sidebar.likedSongs')}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {likedTracks.length} {t('player.songs')} • {totalMins} min
            </p>
          </div>
        </div>

        {likedTracks.length > 0 && (
          <button
            onClick={playAll}
            className="mt-6 flex items-center gap-3 px-8 py-3 rounded-full font-semibold transition-all duration-200 btn-press hover:scale-105"
            style={{ background: colorScheme.primary, color: colorScheme.onPrimary }}
          >
            <PlayIcon size={20} />
            <span>{t('player.playAll')}</span>
          </button>
        )}
      </div>

      <div className="p-5">
        {likedTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: `${colorScheme.primary}20`, color: colorScheme.primary }}
            >
              <HeartFilledIcon size={48} />
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              {t('liked.empty')}
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              {t('liked.emptyDesc')}
            </p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card-glass)' }}>
            <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
              <div className="col-span-1">#</div>
              <div className="col-span-5">Title</div>
              <div className="col-span-3">Album</div>
              <div className="col-span-2">Artist</div>
              <div className="col-span-1 flex justify-end"><ClockIcon size={16} /></div>
            </div>
            <div>
              {likedTracks.map((track, index) => (
                <div
                  key={track.id}
                  className="track-row grid grid-cols-12 gap-4 px-5 py-3 cursor-pointer group"
                  style={{
                    background: currentTrack?.id === track.id ? `${colorScheme.primary}15` : 'transparent',
                  }}
                >
                  <div className="col-span-1 flex items-center justify-center w-8">
                    {currentTrack?.id === track.id && isPlaying ? (
                      <div className="flex items-end gap-0.5 h-4">
                        <span className="now-playing-bar w-1 rounded-full" style={{ background: colorScheme.primary }} />
                        <span className="now-playing-bar w-1 rounded-full" style={{ background: colorScheme.primary }} />
                        <span className="now-playing-bar w-1 rounded-full" style={{ background: colorScheme.primary }} />
                      </div>
                    ) : (
                      <>
                        <span className="group-hover:hidden" style={{ color: currentTrack?.id === track.id ? colorScheme.primary : 'var(--text-secondary)' }}>
                          {index + 1}
                        </span>
                        <span onClick={() => playTrack(track)} className="hidden group-hover:flex items-center" style={{ color: 'var(--text-primary)' }}>
                          <PlayIcon size={14} />
                        </span>
                      </>
                    )}
                  </div>
                  <div className="col-span-5 flex items-center gap-4" onClick={() => playTrack(track)}>
                    <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ background: 'var(--bg-sidebar)' }}>
                      {track.picture ? (
                        <img
                          src={`data:${track.picture.format};base64,${track.picture.data}`}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span style={{ color: 'var(--text-secondary)' }}><MusicIcon size={16} /></span>
                      )}
                    </div>
                    <div className="truncate font-medium" style={{ color: currentTrack?.id === track.id ? colorScheme.primary : 'var(--text-primary)' }}>
                      {track.title}
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center truncate text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {track.album}
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="truncate text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {track.artist}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-end gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(track.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: colorScheme.primary }}
                    >
                      <HeartFilledIcon size={16} />
                    </button>
                    <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {formatTime(track.duration)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedSongsView;
