import React, { memo, useMemo, useState, useCallback } from 'react';
import { useMusicContext } from '../../context/MusicContext';
import { useM3Theme } from '../../context/M3ThemeContext';
import { SearchIcon, CloseIcon } from '../Icons';
import type { Track, Album, Artist } from '../../types';

interface SearchAlbum {
  id: string;
  name: string;
  artist: string;
  cover: string | null;
  tracks: Track[];
}

interface SearchArtist {
  id: string;
  name: string;
  cover: string | null;
  tracks: Track[];
}

const SearchView: React.FC = memo(() => {
  const { tracks, setCurrentView, playTrack } = useMusicContext();
  const { colorScheme } = useM3Theme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  // Memoized search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return { tracks: [] as Track[], albums: [] as SearchAlbum[], artists: [] as SearchArtist[] };
    }

    const query = searchQuery.toLowerCase().trim();

    // Search tracks
    const matchedTracks = tracks.filter(track =>
      track.title.toLowerCase().includes(query) ||
      track.artist.toLowerCase().includes(query) ||
      track.album.toLowerCase().includes(query)
    );

    // Group by albums
    const albumMap = new Map<string, SearchAlbum>();
    matchedTracks.forEach(track => {
      const key = `${track.album}-${track.artist}`;
      if (!albumMap.has(key)) {
        albumMap.set(key, {
          id: key,
          name: track.album,
          artist: track.artist,
          cover: track.picture ? `data:${track.picture.format};base64,${track.picture.data}` : null,
          tracks: []
        });
      }
      albumMap.get(key)!.tracks.push(track);
    });

    // Group by artists
    const artistMap = new Map<string, SearchArtist>();
    matchedTracks.forEach(track => {
      if (!artistMap.has(track.artist)) {
        artistMap.set(track.artist, {
          id: track.artist,
          name: track.artist,
          cover: track.picture ? `data:${track.picture.format};base64,${track.picture.data}` : null,
          tracks: []
        });
      }
      artistMap.get(track.artist)!.tracks.push(track);
    });

    return {
      tracks: matchedTracks.slice(0, 10),
      albums: Array.from(albumMap.values()).slice(0, 6),
      artists: Array.from(artistMap.values()).slice(0, 6)
    };
  }, [searchQuery, tracks]);

  const handleClear = useCallback(() => {
    setSearchQuery('');
  }, []);

  const totalResults = searchResults.tracks.length + searchResults.albums.length + searchResults.artists.length;

  return (
    <div className="view-content pb-32">
      {/* Search Header */}
      <div className="sticky top-0 z-10 px-6 py-4" style={{ background: 'var(--bg-main)' }}>
        <div
          className="relative flex items-center rounded-2xl px-4 py-3 transition-all"
          style={{
            background: `${colorScheme.surfaceVariant}50`,
            border: `2px solid ${isFocused ? colorScheme.primary : 'transparent'}`,
            boxShadow: isFocused ? `0 0 0 2px ${colorScheme.primary}30` : 'none'
          }}
        >
          <SearchIcon size={20} className="mr-3" style={{ color: isFocused ? colorScheme.primary : 'var(--text-secondary)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search songs, albums, artists..."
            className="flex-1 bg-transparent outline-none text-base"
            style={{ color: 'var(--text-primary)' }}
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="p-1 rounded-full transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              <CloseIcon size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="px-6">
        {!searchQuery.trim() ? (
          <div className="flex flex-col items-center justify-center py-20" style={{ color: 'var(--text-secondary)' }}>
            <SearchIcon size={64} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">Search your library</p>
            <p className="text-sm opacity-70">Find songs, albums, and artists</p>
          </div>
        ) : totalResults === 0 ? (
          <div className="flex flex-col items-center justify-center py-20" style={{ color: 'var(--text-secondary)' }}>
            <svg className="w-16 h-16 mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <p className="text-lg font-medium">No results found</p>
            <p className="text-sm opacity-70">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Tracks */}
            {searchResults.tracks.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Songs
                </h2>
                <div className="space-y-1">
                  {searchResults.tracks.map((track) => (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track)}
                      className="flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors hover:bg-white/5"
                    >
                      <div className="w-10 h-10 rounded overflow-hidden bg-zinc-800 flex-shrink-0">
                        {track.picture ? (
                          <img
                            src={`data:${track.picture.format};base64,${track.picture.data}`}
                            alt={track.album}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: colorScheme.surfaceVariant }}
                          >
                            <svg className="w-4 h-4" fill={colorScheme.onSurfaceVariant} viewBox="0 0 24 24">
                              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {track.title}
                        </div>
                        <div className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                          {track.artist} • {track.album}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Albums */}
            {searchResults.albums.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Albums
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {searchResults.albums.map(album => (
                    <button
                      key={album.id}
                      onClick={() => setCurrentView('albums')}
                      className="group p-3 rounded-xl transition-all hover:scale-[1.02] text-left"
                      style={{ background: `${colorScheme.surfaceVariant}30` }}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden mb-3 shadow-md">
                        {album.cover ? (
                          <img src={album.cover} alt={album.name} className="w-full h-full object-cover" />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: colorScheme.primaryContainer }}
                          >
                            <svg className="w-10 h-10" fill={colorScheme.onPrimaryContainer} viewBox="0 0 24 24">
                              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {album.name}
                      </p>
                      <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                        {album.artist}
                      </p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Artists */}
            {searchResults.artists.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Artists
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {searchResults.artists.map(artist => (
                    <button
                      key={artist.id}
                      onClick={() => setCurrentView('artists')}
                      className="group p-3 rounded-xl transition-all hover:scale-[1.02] text-center"
                      style={{ background: `${colorScheme.surfaceVariant}30` }}
                    >
                      <div className="aspect-square rounded-full overflow-hidden mb-3 shadow-md mx-auto">
                        {artist.cover ? (
                          <img src={artist.cover} alt={artist.name} className="w-full h-full object-cover" />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: colorScheme.secondaryContainer }}
                          >
                            <svg className="w-10 h-10" fill={colorScheme.onSecondaryContainer} viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {artist.name}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Artist
                      </p>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

SearchView.displayName = 'SearchView';

export default SearchView;
