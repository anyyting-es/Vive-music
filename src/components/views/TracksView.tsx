import React, { useState, useMemo, useRef, useEffect, memo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useMusicContext } from '../../context/MusicContext';
import { useSettings } from '../../context/SettingsContext';
import { useM3Theme } from '../../context/M3ThemeContext';
import { PlayIcon, MusicIcon, ClockIcon, SearchIcon, MoreIcon, PlusIcon } from '../Icons';
import type { Track } from '../../types';

const TracksView: React.FC = memo(() => {
  const { tracks, playTrack, currentTrack, isPlaying, playlists, addToPlaylist } = useMusicContext();
  const { t, getThemeColors } = useSettings();
  const { colorScheme } = useM3Theme();
  const colors = getThemeColors();
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'album'>('title');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenFor(null);
      }
    };
    if (menuOpenFor) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpenFor]);

  const handleMoreClick = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();

    // Calculate position
    const menuHeight = 220; // Estimated height
    const spaceBelow = window.innerHeight - rect.bottom;

    let y = rect.bottom + 4;

    // If not enough space below, open upwards
    if (spaceBelow < menuHeight) {
      y = rect.top - menuHeight - 4;
    }

    setMenuPosition({ x: rect.left - 160, y });
    setMenuOpenFor(menuOpenFor === trackId ? null : trackId);
  };

  const handleAddToPlaylist = (playlistId: string, trackId: string) => {
    addToPlaylist(playlistId, trackId);
    setMenuOpenFor(null);
  };

  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return tracks;
    const query = searchQuery.toLowerCase();
    return tracks.filter(track =>
      track.title.toLowerCase().includes(query) ||
      track.artist.toLowerCase().includes(query) ||
      track.album.toLowerCase().includes(query)
    );
  }, [tracks, searchQuery]);

  const sortedTracks = useMemo(() => {
    return [...filteredTracks].sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
  }, [filteredTracks, sortBy]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="animate-fade-in">
      {/* Search Bar */}
      <div className="search-bar">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }}>
            <SearchIcon size={18} />
          </span>
          <input
            type="text"
            placeholder={t('search.placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="p-5">
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>{t('player.allSongs')}</h1>

        {/* Sort Options */}
        <div className="flex gap-3 mb-5">
          {[
            { key: 'title', label: t('player.byTitle') },
            { key: 'artist', label: t('player.byArtist') },
            { key: 'album', label: t('player.byAlbum') },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setSortBy(option.key as any)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 btn-press"
              style={{
                background: sortBy === option.key ? colorScheme.primary : 'var(--bg-card)',
                color: sortBy === option.key ? colorScheme.onPrimary : 'var(--text-secondary)',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Tracks Table */}
        <div className="rounded-xl overflow-hidden border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
            <div className="col-span-1">#</div>
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Album</div>
            <div className="col-span-2">Artist</div>
            <div className="col-span-1 flex justify-end"><ClockIcon size={16} /></div>
            <div className="col-span-1"></div>
          </div>
          <div>
            {sortedTracks.map((track, index) => (
              <div
                key={track.id}
                onClick={() => playTrack(track, sortedTracks)}
                className="track-row grid grid-cols-12 gap-4 px-6 py-3 cursor-pointer group"
                style={{
                  background: currentTrack?.id === track.id ? `${colorScheme.primary}15` : 'transparent',
                }}
              >
                <div className="col-span-1 flex items-center justify-center w-8">
                  {currentTrack?.id === track.id && isPlaying ? (
                    <div className="flex items-end gap-0.5 h-4 group-hover:hidden">
                      <span className="now-playing-bar w-1 rounded-full" style={{ background: colorScheme.primary }} />
                      <span className="now-playing-bar w-1 rounded-full" style={{ background: colorScheme.primary }} />
                      <span className="now-playing-bar w-1 rounded-full" style={{ background: colorScheme.primary }} />
                    </div>
                  ) : (
                    <span className="group-hover:hidden" style={{ color: currentTrack?.id === track.id ? colorScheme.primary : 'var(--text-secondary)' }}>
                      {index + 1}
                    </span>
                  )}
                  <span className="hidden group-hover:flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <PlayIcon size={14} />
                  </span>
                </div>
                <div className="col-span-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ background: colorScheme.surfaceContainer }}>
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
                <div className="col-span-2 flex items-center truncate text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
                  {track.album}
                </div>
                <div className="col-span-2 flex items-center truncate text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
                  {track.artist}
                </div>
                <div className="col-span-1 flex items-center justify-end text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
                  {formatTime(track.duration)}
                </div>
                <div className="col-span-1 flex items-center justify-end relative">
                  <button
                    onClick={(e) => handleMoreClick(e, track.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full transition-all hover:bg-white/10"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <MoreIcon size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dropdown Menu - using portal to escape overflow container */}
      {menuOpenFor && createPortal(
        <div
          ref={menuRef}
          className="fixed z-50 rounded-xl overflow-hidden shadow-xl animate-fade-in"
          style={{
            left: menuPosition.x,
            top: menuPosition.y,
            background: colorScheme.surfaceContainerHigh,
            border: `1px solid ${colorScheme.outlineVariant}`,
            minWidth: '180px',
          }}
        >
          <div className="py-1">
            <div
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider"
              style={{ color: colorScheme.onSurfaceVariant }}
            >
              {t('playlist.addTo') || 'Add to Playlist'}
            </div>
            {playlists.length === 0 ? (
              <div
                className="px-4 py-3 text-sm"
                style={{ color: colorScheme.onSurfaceVariant }}
              >
                No playlists yet
              </div>
            ) : (
              playlists.map(playlist => (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id, menuOpenFor)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                  style={{ color: colorScheme.onSurface }}
                >
                  <PlusIcon size={16} />
                  <span className="truncate">{playlist.name}</span>
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});

TracksView.displayName = 'TracksView';

export default TracksView;
