import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Track, Album, Artist, Playlist } from '../types';
import { Howl } from 'howler';

declare const window: any;
const { ipcRenderer } = window.require('electron');

interface MusicContextType {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  favorites: string[];
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  repeat: boolean;
  shuffle: boolean;
  queue: Track[];
  currentQueue: Track[]; // Active playback queue (context-aware)
  currentView: 'home' | 'tracks' | 'albums' | 'artists' | 'genres' | 'folders' | 'playlist' | 'album' | 'artist' | 'liked' | 'search' | 'settings';
  selectedItem: any;
  loadMusicFolder: () => Promise<void>;
  rescanAllFolders: () => Promise<void>;
  playTrack: (track: Track, contextQueue?: Track[]) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  setCurrentView: (view: any, item?: any) => void;
  createPlaylist: (name: string) => void;
  updatePlaylist: (playlistId: string, updates: Partial<Playlist>) => void;
  addToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  toggleFavorite: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const useMusicContext = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusicContext must be used within MusicProvider');
  }
  return context;
};

let currentSound: Howl | null = null;

export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentQueue, setCurrentQueue] = useState<Track[]>([]); // Context-aware queue
  const [currentView, setCurrentViewState] = useState<any>('home');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // Time update effect - runs whenever isPlaying changes
  useEffect(() => {
    // Clear any existing interval
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current);
      timeUpdateInterval.current = null;
    }

    if (isPlaying && currentSound) {
      // Update immediately
      const seek = currentSound.seek();
      if (typeof seek === 'number') {
        setCurrentTime(seek);
        ipcRenderer.send('mpris-update-position', seek);
      }

      // Counter for MPRIS updates (every 4th interval = 1 second)
      let mprisCounter = 0;

      // Then update every 250ms for smoother progress
      timeUpdateInterval.current = setInterval(() => {
        if (currentSound && currentSound.playing()) {
          const seek = currentSound.seek();
          if (typeof seek === 'number') {
            setCurrentTime(seek);
            // Update MPRIS position every second (every 4th interval)
            mprisCounter++;
            if (mprisCounter >= 4) {
              ipcRenderer.send('mpris-update-position', seek);
              mprisCounter = 0;
            }
          }
        }
      }, 250);
    }

    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
        timeUpdateInterval.current = null;
      }
    };
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    // Load saved data from localStorage
    const savedTracks = localStorage.getItem('vibe-tracks');
    const savedPlaylists = localStorage.getItem('vibe-playlists');
    let hasLoadedTracks = false;

    if (savedTracks) {
      try {
        const parsedTracks = JSON.parse(savedTracks);
        if (parsedTracks.length > 0) {
          setTracks(parsedTracks);
          processLibrary(parsedTracks);
          hasLoadedTracks = true;
        }
      } catch (e) {
        console.error('Error loading tracks:', e);
      }
    }

    // If no saved tracks, check if there are music folders to scan
    if (!hasLoadedTracks) {
      const savedSettings = localStorage.getItem('vibe-settings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          if (settings.musicFolders && settings.musicFolders.length > 0) {
            // Scan all configured music folders
            const scanFolders = async () => {
              let allTracks: Track[] = [];
              for (const folder of settings.musicFolders) {
                try {
                  const files = await ipcRenderer.invoke('scan-music-folder', folder);
                  if (files) {
                    allTracks = [...allTracks, ...files];
                  }
                } catch (e) {
                  console.error(`Error scanning folder ${folder}:`, e);
                }
              }
              if (allTracks.length > 0) {
                setTracks(allTracks);
                processLibrary(allTracks);
              }
            };
            scanFolders();
          }
        } catch (e) {
          console.error('Error loading settings:', e);
        }
      }
    }

    if (savedPlaylists) {
      try {
        setPlaylists(JSON.parse(savedPlaylists));
      } catch (e) {
        console.error('Error loading playlists:', e);
      }
    }

    const savedFavorites = localStorage.getItem('vibe-favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Error loading favorites:', e);
      }
    }
  }, []);

  // localStorage size management - warn if exceeding 5MB
  const checkLocalStorageSize = () => {
    let totalSize = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length * 2; // UTF-16 = 2 bytes per char
      }
    }
    const sizeMB = totalSize / (1024 * 1024);

    if (sizeMB > 4.5) {
      console.warn(`[Vibe] localStorage usage: ${sizeMB.toFixed(2)}MB - approaching 5MB limit`);
      // Trigger cleanup: remove artwork data from stored tracks to save space
      const savedTracks = localStorage.getItem('vibe-tracks');
      if (savedTracks) {
        try {
          const parsedTracks = JSON.parse(savedTracks);
          // Keep track metadata but remove heavy picture data
          const lightTracks = parsedTracks.map((t: Track) => ({
            ...t,
            picture: t.picture ? { format: t.picture.format, data: '' } : null
          }));
          localStorage.setItem('vibe-tracks-light', JSON.stringify(lightTracks));
          console.log('[Vibe] Created lightweight track backup');
        } catch (e) {
          console.error('Error creating light backup:', e);
        }
      }
    }
    return sizeMB;
  };

  useEffect(() => {
    if (tracks.length > 0) {
      localStorage.setItem('vibe-tracks', JSON.stringify(tracks));
      // Check storage size after saving
      checkLocalStorageSize();
    }
  }, [tracks]);

  useEffect(() => {
    localStorage.setItem('vibe-playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem('vibe-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // MPRIS listeners for Linux media controls
  useEffect(() => {
    const handlePlay = () => resumeTrack();
    const handlePause = () => pauseTrack();
    const handlePlayPause = () => {
      if (isPlaying) pauseTrack();
      else resumeTrack();
    };
    const handleNext = () => nextTrack();
    const handlePrevious = () => previousTrack();
    const handleStop = () => {
      pauseTrack();
      ipcRenderer.send('mpris-update-status', 'Stopped');
    };
    const handleSeek = (_event: any, offset: number) => {
      // Seek relative to current position
      if (currentSound) {
        const current = currentSound.seek();
        if (typeof current === 'number') {
          const newPosition = Math.max(0, current + offset);
          currentSound.seek(newPosition);
          setCurrentTime(newPosition);
          ipcRenderer.send('mpris-update-position', newPosition);
        }
      }
    };
    const handleSetPosition = (_event: any, position: number) => {
      // Seek to absolute position
      if (currentSound) {
        const newPosition = Math.max(0, position);
        currentSound.seek(newPosition);
        setCurrentTime(newPosition);
        ipcRenderer.send('mpris-update-position', newPosition);
      }
    };

    ipcRenderer.on('mpris-play', handlePlay);
    ipcRenderer.on('mpris-pause', handlePause);
    ipcRenderer.on('mpris-playpause', handlePlayPause);
    ipcRenderer.on('mpris-next', handleNext);
    ipcRenderer.on('mpris-previous', handlePrevious);
    ipcRenderer.on('mpris-stop', handleStop);
    ipcRenderer.on('mpris-seek', handleSeek);
    ipcRenderer.on('mpris-setposition', handleSetPosition);

    return () => {
      ipcRenderer.removeListener('mpris-play', handlePlay);
      ipcRenderer.removeListener('mpris-pause', handlePause);
      ipcRenderer.removeListener('mpris-playpause', handlePlayPause);
      ipcRenderer.removeListener('mpris-next', handleNext);
      ipcRenderer.removeListener('mpris-previous', handlePrevious);
      ipcRenderer.removeListener('mpris-stop', handleStop);
      ipcRenderer.removeListener('mpris-seek', handleSeek);
      ipcRenderer.removeListener('mpris-setposition', handleSetPosition);
    };
  }, [isPlaying, currentSound]);

  const processLibrary = (trackList: Track[]) => {
    // Process albums
    const albumsMap = new Map<string, Album>();
    trackList.forEach(track => {
      const albumKey = `${track.album}-${track.albumArtist}`;
      if (!albumsMap.has(albumKey)) {
        albumsMap.set(albumKey, {
          id: albumKey,
          name: track.album,
          artist: track.albumArtist,
          year: track.year,
          tracks: [],
          cover: track.picture ? `data:${track.picture.format};base64,${track.picture.data}` : null,
        });
      }
      albumsMap.get(albumKey)!.tracks.push(track);
    });
    setAlbums(Array.from(albumsMap.values()));

    // Process artists
    const artistsMap = new Map<string, Artist>();
    trackList.forEach(track => {
      if (!artistsMap.has(track.albumArtist)) {
        artistsMap.set(track.albumArtist, {
          id: track.albumArtist,
          name: track.albumArtist,
          albums: [],
          tracks: [],
        });
      }
      artistsMap.get(track.albumArtist)!.tracks.push(track);
    });

    // Add albums to artists
    albumsMap.forEach(album => {
      if (artistsMap.has(album.artist)) {
        artistsMap.get(album.artist)!.albums.push(album);
      }
    });

    setArtists(Array.from(artistsMap.values()));
  };

  const loadMusicFolder = async () => {
    const folderPath = await ipcRenderer.invoke('select-folder');
    if (folderPath) {
      // Get current settings
      const savedSettings = localStorage.getItem('vibe-settings');
      let currentFolders: string[] = [];
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          currentFolders = settings.musicFolders || [];
        } catch (e) {
          console.error('Error loading settings:', e);
        }
      }

      // Check if folder already exists
      if (currentFolders.includes(folderPath)) {
        console.log('Folder already added:', folderPath);
        return;
      }

      // Scan the new folder
      const musicFiles = await ipcRenderer.invoke('scan-music-folder', folderPath);

      // Add folder to settings
      const newFolders = [...currentFolders, folderPath];
      const updatedSettings = savedSettings ? JSON.parse(savedSettings) : {};
      updatedSettings.musicFolders = newFolders;
      localStorage.setItem('vibe-settings', JSON.stringify(updatedSettings));
      ipcRenderer.send('save-settings-to-file', updatedSettings);

      // Combine with existing tracks (avoid duplicates by path)
      const existingPaths = new Set(tracks.map(t => t.path));
      const newTracks = musicFiles.filter((t: Track) => !existingPaths.has(t.path));
      const allTracks = [...tracks, ...newTracks];

      setTracks(allTracks);
      processLibrary(allTracks);
      localStorage.setItem('vibe-tracks', JSON.stringify(allTracks));
    }
  };

  const rescanAllFolders = async () => {
    // Get current music folders from settings
    const savedSettings = localStorage.getItem('vibe-settings');
    if (!savedSettings) {
      setTracks([]);
      processLibrary([]);
      localStorage.removeItem('vibe-tracks');
      return;
    }

    try {
      const settings = JSON.parse(savedSettings);
      const folders = settings.musicFolders || [];

      if (folders.length === 0) {
        // No folders, clear library
        setTracks([]);
        processLibrary([]);
        localStorage.removeItem('vibe-tracks');
        return;
      }

      // Scan all folders
      let allTracks: Track[] = [];
      for (const folder of folders) {
        try {
          const files = await ipcRenderer.invoke('scan-music-folder', folder);
          if (files) {
            allTracks = [...allTracks, ...files];
          }
        } catch (e) {
          console.error(`Error scanning folder ${folder}:`, e);
        }
      }

      setTracks(allTracks);
      processLibrary(allTracks);
      localStorage.setItem('vibe-tracks', JSON.stringify(allTracks));
    } catch (e) {
      console.error('Error rescanning folders:', e);
    }
  };

  const playTrack = (track: Track, contextQueue?: Track[]) => {
    if (currentSound) {
      currentSound.unload();
    }

    // Set context-aware queue if provided, otherwise use current queue or full library
    if (contextQueue && contextQueue.length > 0) {
      setCurrentQueue(contextQueue);
    } else if (currentQueue.length === 0 || !currentQueue.find(t => t.id === track.id)) {
      // Fallback to full tracks list if no context or track not in current queue
      setCurrentQueue(tracks);
    }

    // Store queue reference for onend callback
    const queueForCallback = contextQueue && contextQueue.length > 0 ? contextQueue :
      (currentQueue.length > 0 && currentQueue.find(t => t.id === track.id)) ? currentQueue :
        tracks;

    currentSound = new Howl({
      src: [`file://${track.path}`],
      html5: true,
      volume: volume,
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
      onend: () => {
        if (repeat) {
          playTrack(track, queueForCallback);
        } else {
          // Find next track in queue
          const currentIndex = queueForCallback.findIndex(t => t.id === track.id);
          if (currentIndex !== -1 && currentIndex < queueForCallback.length - 1) {
            playTrack(queueForCallback[currentIndex + 1], queueForCallback);
          } else if (queueForCallback.length > 0) {
            // Loop to beginning
            playTrack(queueForCallback[0], queueForCallback);
          }
        }
      },
    });

    currentSound.play();
    setCurrentTrack(track);
    setCurrentTime(0); // Reset time immediately
    setIsPlaying(true);

    // Update MPRIS metadata
    const artUrl = track.picture
      ? `data:${track.picture.format};base64,${track.picture.data}`
      : undefined;
    ipcRenderer.send('mpris-update-metadata', {
      title: track.title,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
      artUrl: artUrl
    });
    ipcRenderer.send('mpris-update-status', 'Playing');

    // Discord Rich Presence - DISABLED FOR V0.1
    // ipcRenderer.send('discord-update-presence', {
    //   title: track.title,
    //   artist: track.artist,
    //   album: track.album,
    //   duration: track.duration,
    //   currentTime: 0,
    //   isPlaying: true
    // });
  };

  const pauseTrack = () => {
    if (currentSound) {
      currentSound.pause();
      setIsPlaying(false);
      // Send current position before pausing
      const seek = currentSound.seek();
      if (typeof seek === 'number') {
        ipcRenderer.send('mpris-update-position', seek);
      }
      ipcRenderer.send('mpris-update-status', 'Paused');

      // Discord Rich Presence - DISABLED FOR V0.1
      // if (currentTrack) {
      //   ipcRenderer.send('discord-update-presence', {
      //     title: currentTrack.title,
      //     artist: currentTrack.artist,
      //     album: currentTrack.album,
      //     isPlaying: false
      //   });
      // }
    }
  };

  const resumeTrack = () => {
    if (currentSound) {
      currentSound.play();
      // Update time immediately when resuming
      const seek = currentSound.seek();
      if (typeof seek === 'number') {
        setCurrentTime(seek);
        ipcRenderer.send('mpris-update-position', seek);
      }
      setIsPlaying(true);
      ipcRenderer.send('mpris-update-status', 'Playing');

      // Discord Rich Presence - DISABLED FOR V0.1
      // if (currentTrack) {
      //   const currentSeek = typeof seek === 'number' ? seek : 0;
      //   ipcRenderer.send('discord-update-presence', {
      //     title: currentTrack.title,
      //     artist: currentTrack.artist,
      //     album: currentTrack.album,
      //     duration: currentTrack.duration,
      //     currentTime: currentSeek,
      //     isPlaying: true
      //   });
      // }
    }
  };

  const nextTrack = () => {
    if (!currentTrack) return;

    // Use context-aware queue instead of global tracks list
    const activeQueue = currentQueue.length > 0 ? currentQueue : tracks;
    const currentIndex = activeQueue.findIndex(t => t.id === currentTrack.id);

    if (currentIndex === -1) {
      // Track not in current queue, fall back to first track
      if (activeQueue.length > 0) {
        playTrack(activeQueue[0]);
      }
      return;
    }

    let nextIndex: number;
    if (shuffle) {
      // Random next track (avoid current)
      const availableIndices = activeQueue
        .map((_, i) => i)
        .filter(i => i !== currentIndex);
      nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)] ?? 0;
    } else {
      nextIndex = (currentIndex + 1) % activeQueue.length;
    }

    playTrack(activeQueue[nextIndex]);
  };

  const previousTrack = () => {
    if (!currentTrack) return;

    // If more than 3 seconds into the track, restart instead of going to previous
    if (currentTime > 3) {
      seekTo(0);
      return;
    }

    // Use context-aware queue instead of global tracks list
    const activeQueue = currentQueue.length > 0 ? currentQueue : tracks;
    const currentIndex = activeQueue.findIndex(t => t.id === currentTrack.id);

    if (currentIndex === -1) {
      // Track not in current queue, play first track
      if (activeQueue.length > 0) {
        playTrack(activeQueue[0]);
      }
      return;
    }

    let prevIndex: number;
    if (shuffle) {
      // Random previous track (avoid current)
      const availableIndices = activeQueue
        .map((_, i) => i)
        .filter(i => i !== currentIndex);
      prevIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)] ?? 0;
    } else {
      prevIndex = currentIndex === 0 ? activeQueue.length - 1 : currentIndex - 1;
    }

    playTrack(activeQueue[prevIndex]);
  };

  const seekTo = (time: number) => {
    if (currentSound) {
      currentSound.seek(time);
      setCurrentTime(time);
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    if (currentSound) {
      currentSound.volume(newVolume);
    }
  };

  const toggleRepeat = () => setRepeat(!repeat);
  const toggleShuffle = () => setShuffle(!shuffle);

  const setCurrentView = (view: any, item?: any) => {
    setCurrentViewState(view);
    setSelectedItem(item);
  };

  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      tracks: [],
      createdAt: Date.now(),
    };
    setPlaylists([...playlists, newPlaylist]);
  };

  const updatePlaylist = (playlistId: string, updates: Partial<Playlist>) => {
    setPlaylists(playlists.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, ...updates };
      }
      return pl;
    }));
    // Update selectedItem if we're viewing this playlist
    if (currentView === 'playlist' && selectedItem?.id === playlistId) {
      setSelectedItem({ ...selectedItem, ...updates });
    }
  };

  const addToPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(playlists.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, tracks: [...pl.tracks, trackId] };
      }
      return pl;
    }));
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(playlists.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, tracks: pl.tracks.filter(id => id !== trackId) };
      }
      return pl;
    }));
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(playlists.filter(pl => pl.id !== playlistId));
    // Navigate away if we're viewing the deleted playlist
    if (currentView === 'playlist' && selectedItem?.id === playlistId) {
      setCurrentViewState('home');
      setSelectedItem(null);
    }
  };

  const toggleFavorite = (trackId: string) => {
    setFavorites(prev =>
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const isFavorite = (trackId: string) => favorites.includes(trackId);

  return (
    <MusicContext.Provider
      value={{
        tracks,
        albums,
        artists,
        playlists,
        favorites,
        currentTrack,
        isPlaying,
        currentTime,
        volume,
        repeat,
        shuffle,
        queue,
        currentQueue,
        currentView,
        selectedItem,
        loadMusicFolder,
        rescanAllFolders,
        playTrack,
        pauseTrack,
        resumeTrack,
        nextTrack,
        previousTrack,
        seekTo,
        setVolume,
        toggleRepeat,
        toggleShuffle,
        setCurrentView,
        createPlaylist,
        updatePlaylist,
        addToPlaylist,
        removeTrackFromPlaylist,
        deletePlaylist,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};
