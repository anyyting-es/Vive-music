import React, { memo, useMemo, useCallback } from 'react';
import { useMusicContext } from '../../context/MusicContext';
import { useM3Theme } from '../../context/M3ThemeContext';
import { UserIcon, PlayIcon } from '../Icons';

const ArtistsView: React.FC = memo(() => {
  const { artists, setCurrentView, playTrack } = useMusicContext();
  const { colorScheme } = useM3Theme();

  // Memoize sorted artists
  const sortedArtists = useMemo(() => {
    return [...artists].sort((a, b) => a.name.localeCompare(b.name));
  }, [artists]);

  const handlePlayArtist = useCallback((e: React.MouseEvent, artist: any) => {
    e.stopPropagation();
    if (artist.tracks?.[0]) {
      playTrack(artist.tracks[0]);
    }
  }, [playTrack]);

  return (
    <div className="p-8 view-content">
      <h1 
        className="text-4xl font-bold mb-8"
        style={{ color: 'var(--text-primary)' }}
      >
        Artists
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {sortedArtists.map((artist) => (
          <div
            key={artist.id}
            onClick={() => setCurrentView('artist', artist)}
            className="p-5 rounded-xl hover-card cursor-pointer group"
            style={{ 
              background: `${colorScheme.surfaceVariant}20`,
            }}
          >
            <div 
              className="aspect-square rounded-full mb-4 overflow-hidden relative flex items-center justify-center shadow-xl mx-auto"
              style={{ background: `linear-gradient(135deg, ${colorScheme.secondary}, ${colorScheme.tertiary})` }}
            >
              {artist.albums?.[0]?.cover ? (
                <img src={artist.albums[0].cover} alt={artist.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <UserIcon size={64} className="text-white/50" />
              )}
              <button 
                onClick={(e) => handlePlayArtist(e, artist)}
                className="play-btn absolute bottom-2 right-2 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110"
                style={{ background: colorScheme.primaryContainer }}
              >
                <PlayIcon size={18} style={{ color: colorScheme.onPrimaryContainer }} className="ml-0.5" />
              </button>
            </div>
            <div 
              className="font-bold truncate mb-1 text-center"
              style={{ color: 'var(--text-primary)' }}
            >
              {artist.name}
            </div>
            <div 
              className="text-sm text-center"
              style={{ color: 'var(--text-secondary)' }}
            >
              {artist.albums?.length || 0} albums • {artist.tracks?.length || 0} songs
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

ArtistsView.displayName = 'ArtistsView';

export default ArtistsView;
