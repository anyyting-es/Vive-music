import React, { memo, useMemo } from 'react';
import { useMusicContext } from '../context/MusicContext';
import { useSettings } from '../context/SettingsContext';
import { useM3Theme } from '../context/M3ThemeContext';
import HomeView from './views/HomeView';
import TracksView from './views/TracksView';
import AlbumsView from './views/AlbumsView';
import ArtistsView from './views/ArtistsView';
import AlbumView from './views/AlbumView';
import ArtistView from './views/ArtistView';
import LikedSongsView from './views/LikedSongsView';
import PlaylistView from './views/PlaylistView';
import SearchView from './views/SearchView';
import SettingsView from './views/SettingsView';
import { MusicIcon, PlusIcon } from './Icons';

// Pre-render heavy views and keep them mounted (hidden) to avoid lag
const CachedViews = memo(() => {
  const { currentView } = useMusicContext();

  return (
    <>
      <div style={{ display: currentView === 'tracks' ? 'block' : 'none' }}>
        <TracksView />
      </div>
      <div style={{ display: currentView === 'albums' ? 'block' : 'none' }}>
        <AlbumsView />
      </div>
      <div style={{ display: currentView === 'artists' ? 'block' : 'none' }}>
        <ArtistsView />
      </div>
    </>
  );
});

CachedViews.displayName = 'CachedViews';

const MainContent: React.FC = () => {
  const { currentView, selectedItem, tracks, loadMusicFolder } = useMusicContext();
  const { t } = useSettings();
  const { colorScheme } = useM3Theme();

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-5 animate-fade-in">
      <div
        className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: `${colorScheme.primary}20`, border: `1px solid ${colorScheme.primary}40`, color: colorScheme.primary }}
      >
        <MusicIcon size={48} />
      </div>
      <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
        {t('empty.noMusic')}
      </h2>
      <p className="text-base mb-8 max-w-sm" style={{ color: 'var(--text-secondary)' }}>
        {t('empty.addFolder')}
      </p>
      <button
        onClick={loadMusicFolder}
        className="flex items-center gap-3 px-8 py-4 rounded-full font-semibold transition-all duration-200 btn-press"
        style={{ background: colorScheme.primary, color: colorScheme.onPrimary }}
      >
        <PlusIcon size={20} />
        <span>{t('empty.addMusicFolder')}</span>
      </button>
    </div>
  );

  // These views are cached and always mounted
  const isCachedView = currentView === 'tracks' || currentView === 'albums' || currentView === 'artists';

  const renderView = () => {
    if (tracks.length === 0) {
      return renderEmptyState();
    }

    // Cached views are rendered separately, return null here
    if (isCachedView) {
      return null;
    }

    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'search':
        return <SearchView />;
      case 'album':
        return <AlbumView album={selectedItem} />;
      case 'artist':
        return <ArtistView artist={selectedItem} />;
      case 'playlist':
        return <PlaylistView playlist={selectedItem} />;
      case 'liked':
        return <LikedSongsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-main)' }}>
      {/* Always mounted cached views for Tracks, Albums, Artists */}
      {tracks.length > 0 && <CachedViews />}

      {/* Other views render normally */}
      {!isCachedView && (
        <div className="view-transition">
          {renderView()}
        </div>
      )}
    </div>
  );
};

export default MainContent;
