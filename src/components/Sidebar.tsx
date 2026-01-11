import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMusicContext } from '../context/MusicContext';
import { useSettings } from '../context/SettingsContext';
import { useM3Theme } from '../context/M3ThemeContext';
import ProfileCard from './ProfileCard';
import {
  HomeIcon,
  SearchIcon,
  LibraryIcon,
  AlbumIcon,
  MusicIcon,
  UserIcon,
  PlusIcon,
  ChevronDownIcon,
  ListMusicIcon,
  SettingsIcon,
  HeartFilledIcon,
  EditIcon,
  ImageIcon,
} from './Icons';

const Sidebar: React.FC = () => {
  const { playlists, setCurrentView, currentView, selectedItem, createPlaylist, favorites, tracks } = useMusicContext();
  const { t, setShowSettings, settings } = useSettings();
  const { colorScheme } = useM3Theme();
  const [showLibrary, setShowLibrary] = useState(true);
  const [showPlaylistInput, setShowPlaylistInput] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const menuItems = [
    { id: 'home', Icon: HomeIcon, label: t('nav.home') },
    { id: 'search', Icon: SearchIcon, label: t('nav.search') },
  ];

  const libraryItems = [
    { id: 'liked', Icon: HeartFilledIcon, label: t('sidebar.likedSongs'), hasItems: favorites.length > 0 },
    { id: 'albums', Icon: AlbumIcon, label: t('nav.albums') },
    { id: 'tracks', Icon: MusicIcon, label: t('nav.tracks') },
    { id: 'artists', Icon: UserIcon, label: t('nav.artists') },
  ];

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowPlaylistInput(false);
    }
  };

  const handlePlaylistKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreatePlaylist();
    } else if (e.key === 'Escape') {
      setShowPlaylistInput(false);
      setNewPlaylistName('');
    }
  };

  const getPlaylistCover = (playlist: any) => {
    if (playlist.coverImage) {
      return playlist.coverImage;
    }
    // Get cover from first track
    const firstTrackId = playlist.tracks?.[0];
    if (firstTrackId) {
      const firstTrack = tracks.find(t => t.id === firstTrackId);
      if (firstTrack?.picture) {
        return `data:${firstTrack.picture.format};base64,${firstTrack.picture.data}`;
      }
    }
    return null;
  };


  return (
    <div
      className="w-64 flex flex-col border-r transition-colors duration-300 shadow-m3-2"
      style={{
        background: colorScheme.surfaceContainerLow,
        borderColor: colorScheme.outlineVariant
      }}
    >
      {/* Logo / Custom Name with Profile */}
      <div className="p-5 pb-4">
        {settings.profilePosition === 'sidebar' && settings.useCustomAppName ? (
          <div className="flex items-center gap-3">
            {settings.profilePicture && (
              <div
                className="w-8 h-8 overflow-hidden flex-shrink-0"
                style={{
                  borderRadius: settings.profileShape === 'circle' ? '50%' :
                    settings.profileShape === 'rounded' ? '6px' :
                      settings.profileShape === 'square' ? '0' :
                        settings.profileShape === 'squircle' ? '30%' : '50%',
                  clipPath: settings.profileShape === 'hexagon' ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' : undefined,
                }}
              >
                <img src={settings.profilePicture} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <h1 className="text-xl font-bold truncate" style={{ color: colorScheme.primary }}>
              {settings.customAppName || 'Vibe'}
            </h1>
          </div>
        ) : (
          <h1 className="text-2xl font-bold" style={{ color: colorScheme.primary }}>Vibe</h1>
        )}
      </div>

      {/* Profile Card - only show if not using custom name */}
      {settings.profilePosition === 'sidebar' && !settings.useCustomAppName && (
        <div className="px-3">
          <ProfileCard />
        </div>
      )}

      {/* Top Menu */}
      <div className="px-3 space-y-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className="m3-ripple w-full flex items-center gap-4 px-4 py-3 rounded-m3-xl transition-all duration-200"
            style={{
              background: currentView === item.id ? colorScheme.secondaryContainer : 'transparent',
              color: currentView === item.id ? colorScheme.onSecondaryContainer : colorScheme.onSurfaceVariant,
            }}
          >
            <item.Icon size={22} className="transition-transform duration-200" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Library Section */}
      <div className="flex-1 overflow-y-auto mt-6">
        <div className="px-3">
          <button
            className="w-full flex items-center justify-between px-4 py-3 rounded-m3-lg transition-colors duration-200"
            style={{ color: colorScheme.onSurfaceVariant }}
            onClick={() => setShowLibrary(!showLibrary)}
          >
            <div className="flex items-center gap-4">
              <LibraryIcon size={22} />
              <span className="font-semibold">{t('nav.library')}</span>
            </div>
            <div className={`transition-transform duration-300 ${showLibrary ? 'rotate-0' : '-rotate-90'}`}>
              <ChevronDownIcon size={18} />
            </div>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showLibrary ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="ml-2 mt-1 space-y-1">
              {libraryItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    background: currentView === item.id ? colorScheme.secondaryContainer : 'transparent',
                    color: currentView === item.id ? colorScheme.onSecondaryContainer : colorScheme.onSurfaceVariant,
                  }}
                  className={`m3-ripple w-full flex items-center justify-between px-4 py-2.5 rounded-m3-xl transition-all duration-200 ${showLibrary ? 'animate-fade-in' : ''
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <item.Icon size={18} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {/* M3 minimalist dot indicator for liked songs */}
                  {item.hasItems && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: colorScheme.tertiary }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Playlists */}
        <div className="px-3 mt-6">
          <div className="flex items-center justify-between px-4 mb-2">
            <span
              className="font-semibold text-sm uppercase tracking-wider"
              style={{ color: colorScheme.onSurfaceVariant }}
            >
              {t('nav.playlists')}
            </span>
            <button
              onClick={() => setShowPlaylistInput(true)}
              className="m3-icon-button-tonal p-1.5 rounded-m3-full transition-all duration-200 hover:scale-110"
              style={{
                background: colorScheme.secondaryContainer,
                color: colorScheme.onSecondaryContainer,
              }}
            >
              <PlusIcon size={16} />
            </button>
          </div>

          {/* Playlist Input */}
          {showPlaylistInput && (
            <div className="px-2 mb-2 animate-fade-in">
              <input
                type="text"
                placeholder={t('playlist.newName')}
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={handlePlaylistKeyDown}
                onBlur={() => {
                  if (!newPlaylistName.trim()) {
                    setShowPlaylistInput(false);
                  }
                }}
                autoFocus
                className="w-full px-3 py-2 rounded-m3-lg text-sm outline-none transition-all duration-200"
                style={{
                  background: colorScheme.surfaceContainerHigh,
                  color: colorScheme.onSurface,
                  border: `2px solid ${colorScheme.primary}`,
                }}
              />
            </div>
          )}

          <div className="space-y-1">
            {playlists.map(playlist => {
              const isSelected = currentView === 'playlist' && selectedItem?.id === playlist.id;
              const coverImage = getPlaylistCover(playlist);
              const showCovers = settings.showPlaylistCovers;

              return (
                <button
                  key={playlist.id}
                  onClick={() => setCurrentView('playlist', playlist)}
                  className="m3-ripple w-full flex items-center gap-3 px-3 rounded-lg text-sm transition-all duration-200 relative"
                  style={{
                    color: isSelected ? colorScheme.onSecondaryContainer : colorScheme.onSurfaceVariant,
                    background: isSelected ? colorScheme.secondaryContainer : 'transparent',
                    paddingTop: showCovers ? '0.625rem' : '0.625rem',
                    paddingBottom: showCovers ? '0.625rem' : '0.625rem',
                  }}
                >
                  {showCovers ? (
                    <>
                      <div
                        className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                        style={{ background: colorScheme.surfaceContainerHighest }}
                      >
                        {coverImage ? (
                          <img src={coverImage} alt={playlist.name} className="w-full h-full object-cover" />
                        ) : (
                          <ListMusicIcon size={20} style={{ color: colorScheme.onSurfaceVariant }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-medium truncate">{playlist.name}</div>
                        <div className="text-xs" style={{ color: colorScheme.onSurfaceVariant }}>
                          {playlist.tracks?.length || 0} songs
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <ListMusicIcon size={18} />
                      <span className="truncate flex-1 text-left">{playlist.name}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Settings Button */}
      <div className="p-5 border-t" style={{ borderColor: colorScheme.outlineVariant }}>
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-3 transition-colors duration-200 hover:opacity-80"
          style={{ color: colorScheme.onSurfaceVariant }}
        >
          <SettingsIcon size={20} />
          <span className="text-sm">{t('nav.settings')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;