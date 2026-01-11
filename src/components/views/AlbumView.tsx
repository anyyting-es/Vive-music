import React, { useState } from 'react';
import { useMusicContext } from '../../context/MusicContext';
import { useM3Theme } from '../../context/M3ThemeContext';
import { Album } from '../../types';
import { PlayIcon, HeartIcon, MoreIcon, ChevronLeftIcon, AlbumIcon, ClockIcon } from '../Icons';

interface AlbumViewProps {
  album: Album;
}

const AlbumView: React.FC<AlbumViewProps> = ({ album }) => {
  const { playTrack, currentTrack, setCurrentView, isPlaying } = useMusicContext();
  const { colorScheme } = useM3Theme();
  const [liked, setLiked] = useState(false);

  if (!album) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = album.tracks.reduce((acc, track) => acc + track.duration, 0);
  const totalMinutes = Math.floor(totalDuration / 60);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="p-8" style={{ background: `linear-gradient(to bottom, ${colorScheme.primary}30, ${colorScheme.primary}10, transparent)` }}>
        <button
          onClick={() => setCurrentView('albums')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors btn-press"
        >
          <ChevronLeftIcon size={20} />
          <span>Back</span>
        </button>

        <div className="flex items-end gap-8">
          <div className="w-56 h-56 bg-zinc-800 rounded-xl shadow-2xl overflow-hidden flex-shrink-0 group">
            {album.cover ? (
              <img src={album.cover} alt={album.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.secondary})` }}>
                <AlbumIcon size={80} className="text-white/50" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-3">Album</div>
            <h1 className="text-5xl font-bold mb-4 leading-tight">{album.name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span className="font-semibold text-white hover:underline cursor-pointer">{album.artist}</span>
              <span className="text-gray-500">•</span>
              <span>{album.year || 'Unknown'}</span>
              <span className="text-gray-500">•</span>
              <span>{album.tracks.length} songs, {totalMinutes} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-8 py-6 flex items-center gap-6">
        <button
          onClick={() => album.tracks[0] && playTrack(album.tracks[0], album.tracks)}
          className="w-14 h-14 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-xl btn-press"
          style={{ background: colorScheme.primary, boxShadow: `0 10px 25px ${colorScheme.primary}40` }}
        >
          <PlayIcon size={24} className="text-white ml-1" />
        </button>
        <button
          onClick={() => setLiked(!liked)}
          className={`p-3 rounded-full transition-all duration-200 btn-press ${liked ? 'text-pink-500' : 'text-gray-400 hover:text-white'}`}
        >
          <HeartIcon size={28} className={liked ? 'fill-current' : ''} />
        </button>
        <button className="p-3 text-gray-400 hover:text-white transition-colors btn-press">
          <MoreIcon size={24} />
        </button>
      </div>

      {/* Track List */}
      <div className="px-8 pb-8">
        <div className="bg-black/20 rounded-xl overflow-hidden border border-white/5">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-9">Title</div>
            <div className="col-span-2 flex justify-end"><ClockIcon size={16} /></div>
          </div>
          {album.tracks
            .sort((a, b) => (a.track || 0) - (b.track || 0))
            .map((track, index) => {
              const isCurrentTrack = currentTrack?.id === track.id;
              const isCurrentlyPlaying = isCurrentTrack && isPlaying;

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, album.tracks)}
                  className="track-row grid grid-cols-12 gap-4 px-6 py-3 cursor-pointer group"
                  style={{ background: isCurrentTrack ? `${colorScheme.primary}15` : undefined }}
                >
                  <div className="col-span-1 flex items-center justify-center w-8">
                    {isCurrentlyPlaying ? (
                      <div className="flex items-end gap-0.5 h-4">
                        <span className="now-playing-bar w-1 rounded-full" style={{ background: colorScheme.primary }} />
                        <span className="now-playing-bar w-1 rounded-full" style={{ background: colorScheme.primary }} />
                        <span className="now-playing-bar w-1 rounded-full" style={{ background: colorScheme.primary }} />
                      </div>
                    ) : (
                      <>
                        <span
                          className="group-hover:hidden"
                          style={{ color: isCurrentTrack ? colorScheme.primary : 'rgb(156 163 175)' }}
                        >
                          {track.track || index + 1}
                        </span>
                        <span className="hidden group-hover:flex items-center text-white">
                          <PlayIcon size={14} />
                        </span>
                      </>
                    )}
                  </div>
                  <div className="col-span-9 flex items-center gap-3">
                    {/* Track/Album Cover */}
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                      {track.picture ? (
                        <img
                          src={`data:${track.picture.format};base64,${track.picture.data}`}
                          alt={track.album}
                          className="w-full h-full object-cover"
                        />
                      ) : album.cover ? (
                        <img
                          src={album.cover}
                          alt={album.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ background: colorScheme.surfaceVariant }}
                        >
                          <AlbumIcon size={16} style={{ color: colorScheme.onSurfaceVariant }} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <div className="font-medium truncate" style={{ color: isCurrentTrack ? colorScheme.primary : undefined }}>{track.title}</div>
                      <div className="text-sm text-gray-400 truncate">{track.artist}</div>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-end text-gray-400 text-sm font-mono">
                    {formatTime(track.duration)}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default AlbumView;
