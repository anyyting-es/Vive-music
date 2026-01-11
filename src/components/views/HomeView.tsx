import React, { memo, useMemo, useCallback } from 'react';
import { useMusicContext } from '../../context/MusicContext';
import { useM3Theme } from '../../context/M3ThemeContext';
import { MusicIcon, AlbumIcon, UserIcon, PlayIcon, ChevronLeftIcon, ChevronRightIcon } from '../Icons';

const HomeView: React.FC = memo(() => {
  const { albums, artists, tracks, setCurrentView, playTrack } = useMusicContext();
  const { colorScheme } = useM3Theme();

  // Memoize recent albums
  const recentAlbums = useMemo(() => albums.slice(0, 6), [albums]);

  const handlePlayAlbum = useCallback((e: React.MouseEvent, album: any) => {
    e.stopPropagation();
    if (album.tracks?.[0]) {
      playTrack(album.tracks[0]);
    }
  }, [playTrack]);

  return (
    <div className="p-8 view-content">
      {/* Navigation */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all btn-press"
          style={{ background: `${colorScheme.surfaceVariant}40`, color: 'var(--text-secondary)' }}
        >
          <ChevronLeftIcon size={18} />
        </button>
        <button 
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all btn-press"
          style={{ background: `${colorScheme.surfaceVariant}40`, color: 'var(--text-secondary)' }}
        >
          <ChevronRightIcon size={18} />
        </button>
      </div>

      <h1 
        className="text-4xl font-bold mb-8"
        style={{ color: 'var(--text-primary)' }}
      >
        Good to see you again
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        <div 
          className="p-6 rounded-2xl border hover-card cursor-pointer"
          style={{ 
            background: `linear-gradient(135deg, ${colorScheme.primary}20, ${colorScheme.secondary}20)`,
            borderColor: `${colorScheme.outline}20`
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `${colorScheme.primary}30` }}
            >
              <MusicIcon size={24} style={{ color: colorScheme.primary }} />
            </div>
            <div>
              <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{tracks.length}</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Songs</div>
            </div>
          </div>
        </div>
        <div 
          className="p-6 rounded-2xl border hover-card cursor-pointer"
          style={{ 
            background: `linear-gradient(135deg, ${colorScheme.secondary}20, ${colorScheme.tertiary}20)`,
            borderColor: `${colorScheme.outline}20`
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `${colorScheme.secondary}30` }}
            >
              <AlbumIcon size={24} style={{ color: colorScheme.secondary }} />
            </div>
            <div>
              <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{albums.length}</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Albums</div>
            </div>
          </div>
        </div>
        <div 
          className="p-6 rounded-2xl border hover-card cursor-pointer"
          style={{ 
            background: `linear-gradient(135deg, ${colorScheme.tertiary}20, ${colorScheme.primary}20)`,
            borderColor: `${colorScheme.outline}20`
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `${colorScheme.tertiary}30` }}
            >
              <UserIcon size={24} style={{ color: colorScheme.tertiary }} />
            </div>
            <div>
              <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{artists.length}</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Artists</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Albums */}
      <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Recent Albums</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        {recentAlbums.map((album, index) => (
          <div
            key={album.id}
            onClick={() => setCurrentView('album', album)}
            className="p-4 rounded-xl hover-card cursor-pointer group"
            style={{ 
              background: `${colorScheme.surfaceVariant}20`,
              animationDelay: `${index * 50}ms` 
            }}
          >
            <div className="aspect-square rounded-lg mb-4 overflow-hidden relative shadow-lg">
              {album.cover ? (
                <img src={album.cover} alt={album.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.secondary})` }}
                >
                  <AlbumIcon size={48} className="text-white/50" />
                </div>
              )}
              <button 
                onClick={(e) => handlePlayAlbum(e, album)}
                className="play-btn absolute bottom-3 right-3 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110"
                style={{ background: colorScheme.primary }}
              >
                <PlayIcon size={20} style={{ color: colorScheme.onPrimary }} className="ml-0.5" />
              </button>
            </div>
            <div className="font-semibold truncate mb-1" style={{ color: 'var(--text-primary)' }}>{album.name}</div>
            <div className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{album.artist}</div>
          </div>
        ))}
      </div>
    </div>
  );
});

HomeView.displayName = 'HomeView';

export default HomeView;
