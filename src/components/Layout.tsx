import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import PlayerBar from './PlayerBar';
import VibeMode from './VibeMode';
import LyricsSplitView from './LyricsSplitView';
import BottomNavigation from './BottomNavigation';
import TitleBar from './TitleBar';
import { TopRightProfile } from './ProfileCard';
import { useM3Theme } from '../context/M3ThemeContext';
import { useSettings } from '../context/SettingsContext';

const Layout: React.FC = () => {
  const [showVibeMode, setShowVibeMode] = useState(false);
  const [showLyricsMode, setShowLyricsMode] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const { colorScheme } = useM3Theme();
  const { settings } = useSettings();

  // Handle responsive layout
  useEffect(() => {
    const checkWidth = () => {
      setIsCompact(window.innerWidth < 768);
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  return (
    <div 
      className="h-screen flex flex-col transition-colors duration-300"
      style={{ background: colorScheme.background }}
    >
      {/* Custom Title Bar - only shown when enabled in settings */}
      {settings.useCustomTitlebar && <TitleBar />}

      {/* Top Right Profile */}
      {settings.profilePosition === 'topright' && !isCompact && (
        <div className={`absolute ${settings.useCustomTitlebar ? 'top-10' : 'top-4'} right-4 z-40`}>
          <TopRightProfile />
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on compact mode */}
        {!isCompact && <Sidebar />}
        <MainContent />
      </div>
      
      {/* Player Bar - always visible */}
      <PlayerBar 
        onVibeMode={() => setShowVibeMode(true)} 
        onLyricsMode={() => setShowLyricsMode(true)}
        isCompact={isCompact}
      />
      
      {/* Bottom Navigation - only visible in compact mode */}
      {isCompact && <BottomNavigation />}
      
      {showVibeMode && <VibeMode onClose={() => setShowVibeMode(false)} />}
      {showLyricsMode && <LyricsSplitView onClose={() => setShowLyricsMode(false)} />}
    </div>
  );
};

export default Layout;

