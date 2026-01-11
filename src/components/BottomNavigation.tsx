import React from 'react';
import { HomeIcon, SearchIcon, LibraryIcon, HeartFilledIcon } from './Icons';
import { useMusicContext } from '../context/MusicContext';
import { useSettings } from '../context/SettingsContext';
import { useM3Theme } from '../context/M3ThemeContext';

interface BottomNavigationProps {
  className?: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ className = '' }) => {
  const { currentView, setCurrentView, favorites } = useMusicContext();
  const { t } = useSettings();
  const { colorScheme } = useM3Theme();

  const navItems = [
    { id: 'home', Icon: HomeIcon, label: t('nav.home') },
    { id: 'search', Icon: SearchIcon, label: t('nav.search') },
    { id: 'tracks', Icon: LibraryIcon, label: t('nav.library') },
    { id: 'liked', Icon: HeartFilledIcon, label: t('sidebar.likedSongs'), badge: favorites.length > 0 ? favorites.length : undefined },
  ];

  return (
    <nav 
      className={`m3-bottom-nav ${className}`}
      style={{ 
        background: colorScheme.surfaceContainer,
        borderTopColor: colorScheme.outlineVariant,
      }}
    >
      {navItems.map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`m3-bottom-nav-item relative ${isActive ? 'active' : ''}`}
            style={{
              color: isActive ? colorScheme.onSecondaryContainer : colorScheme.onSurfaceVariant,
            }}
          >
            <div 
              className="m3-bottom-nav-indicator"
              style={{
                background: isActive ? colorScheme.secondaryContainer : 'transparent',
              }}
            >
              <item.Icon size={24} />
              {item.badge !== undefined && (
                <span 
                  className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-medium rounded-full"
                  style={{
                    background: colorScheme.error,
                    color: colorScheme.onError,
                  }}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className="m3-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;
