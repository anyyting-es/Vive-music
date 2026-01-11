import React, { memo, useMemo, useCallback } from 'react';
import { useMusicContext } from '../../context/MusicContext';
import { useM3Theme } from '../../context/M3ThemeContext';
import { AlbumIcon, PlayIcon } from '../Icons';

const AlbumsView: React.FC = memo(() => {
  const { albums, setCurrentView, playTrack } = useMusicContext();
  const { colorScheme } = useM3Theme();

  // Memoize sorted albums
  const sortedAlbums = useMemo(() => {
    return [...albums].sort((a, b) => a.name.localeCompare(b.name));
  }, [albums]);

  const handlePlayAlbum = useCallback((e: React.MouseEvent, album: any) => {
    e.stopPropagation();
    if (album.tracks?.[0]) {
      playTrack(album.tracks[0]);
    }
  }, [playTrack]);

  return (
    <div className="p-8 view-content">
      <h1 
        className="text-4xl font-bold mb-8"
        style={{ color: 'var(--text-primary)' }}
      >
        Albums
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {sortedAlbums.map((album) => (
          <div
            key={album.id}
            onClick={() => setCurrentView('album', album)}
            className="p-4 rounded-xl hover-card cursor-pointer group"
            style={{ 
              background: `${colorScheme.surfaceVariant}20`,
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
                  <AlbumIcon size={64} className="text-white/50" />
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
            <div 
              className="font-bold truncate mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              {album.name}
            </div>
            <div 
              className="text-sm truncate"
              style={{ color: 'var(--text-secondary)' }}
            >
              {album.artist}
            </div>
            <div 
              className="text-xs mt-2"
              style={{ color: 'var(--text-secondary)', opacity: 0.7 }}
            >
              {album.tracks?.length || 0} songs • {album.year || 'Unknown'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

AlbumsView.displayName = 'AlbumsView';

export default AlbumsView;
