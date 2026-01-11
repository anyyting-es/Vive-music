import React, { useState } from 'react';
import { useMusicContext } from '../../context/MusicContext';
import { Artist } from '../../types';
import { PlayIcon, HeartIcon, ChevronLeftIcon, UserIcon, MusicIcon, AlbumIcon } from '../Icons';

interface ArtistViewProps {
  artist: Artist;
}

const ArtistView: React.FC<ArtistViewProps> = ({ artist }) => {
  const { playTrack, currentTrack, setCurrentView, isPlaying } = useMusicContext();
  const [liked, setLiked] = useState(false);

  if (!artist) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const topTracks = artist.tracks.slice(0, 5);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="p-8 bg-gradient-to-b from-pink-600/30 via-purple-900/20 to-transparent">
        <button 
          onClick={() => setCurrentView('artists')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors btn-press"
        >
          <ChevronLeftIcon size={20} />
          <span>Back</span>
        </button>
        
        <div className="flex items-end gap-8">
          <div className="w-56 h-56 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-2xl overflow-hidden flex-shrink-0 group">
            {artist.albums[0]?.cover ? (
              <img src={artist.albums[0].cover} alt={artist.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UserIcon size={80} className="text-white/50" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-3">Artist</div>
            <h1 className="text-5xl font-bold mb-4">{artist.name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span>{artist.albums.length} albums</span>
              <span className="text-gray-500">•</span>
              <span>{artist.tracks.length} songs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-8 py-6 flex items-center gap-6">
        <button
          onClick={() => artist.tracks[0] && playTrack(artist.tracks[0])}
          className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center hover:scale-110 hover:bg-purple-400 transition-all duration-200 shadow-xl shadow-purple-500/30 btn-press"
        >
          <PlayIcon size={24} className="text-white ml-1" />
        </button>
        <button 
          onClick={() => setLiked(!liked)}
          className={`p-3 rounded-full transition-all duration-200 btn-press ${liked ? 'text-pink-500' : 'text-gray-400 hover:text-white'}`}
        >
          <HeartIcon size={28} className={liked ? 'fill-current' : ''} />
        </button>
      </div>

      <div className="px-8 pb-8 space-y-10">
        {/* Top Songs */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Popular Songs</h2>
          <div className="space-y-1">
            {topTracks.map((track, index) => (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                className={`track-row flex items-center gap-4 p-3 rounded-lg cursor-pointer group ${
                  currentTrack?.id === track.id ? 'bg-purple-500/10' : ''
                }`}
              >
                <div className="w-8 flex items-center justify-center">
                  {currentTrack?.id === track.id && isPlaying ? (
                    <div className="flex items-end justify-center gap-0.5 h-4">
                      <span className="now-playing-bar w-1 bg-purple-400 rounded-full" />
                      <span className="now-playing-bar w-1 bg-purple-400 rounded-full" />
                      <span className="now-playing-bar w-1 bg-purple-400 rounded-full" />
                    </div>
                  ) : (
                    <span className={`${currentTrack?.id === track.id ? 'text-purple-400' : 'text-gray-400'} group-hover:hidden`}>
                      {index + 1}
                    </span>
                  )}
                  <span className="hidden group-hover:flex items-center justify-center text-white">
                    <PlayIcon size={14} />
                  </span>
                </div>
                <div className="w-12 h-12 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                  {track.picture ? (
                    <img
                      src={`data:${track.picture.format};base64,${track.picture.data}`}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MusicIcon size={16} className="text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium truncate ${currentTrack?.id === track.id ? 'text-purple-400' : ''}`}>{track.title}</div>
                  <div className="text-sm text-gray-400 truncate">{track.album}</div>
                </div>
                <div className="text-gray-400 text-sm font-mono">{formatTime(track.duration)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Albums */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Discography</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {artist.albums.map((album, index) => (
              <div
                key={album.id}
                onClick={() => setCurrentView('album', album)}
                className="bg-white/5 p-4 rounded-xl hover-card cursor-pointer group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="aspect-square bg-zinc-800 rounded-lg mb-4 overflow-hidden relative shadow-lg">
                  {album.cover ? (
                    <img src={album.cover} alt={album.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
                      <AlbumIcon size={48} className="text-white/50" />
                    </div>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); if(album.tracks[0]) playTrack(album.tracks[0]); }}
                    className="play-btn absolute bottom-3 right-3 w-11 h-11 bg-purple-500 rounded-full flex items-center justify-center shadow-xl"
                  >
                    <PlayIcon size={18} className="text-white ml-0.5" />
                  </button>
                </div>
                <div className="font-semibold truncate">{album.name}</div>
                <div className="text-sm text-gray-400">{album.year || 'Unknown'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistView;
