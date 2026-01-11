import { app, BrowserWindow, ipcMain, dialog, nativeTheme, net } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { parseFile } from 'music-metadata';

// Fetch lyrics from LRCLIB API (free, no API key required)
async function fetchLyricsOnline(title: string, artist: string, album?: string, duration?: number): Promise<string | null> {
  try {
    // Build search params
    const params = new URLSearchParams({
      track_name: title,
      artist_name: artist,
    });
    if (album) params.append('album_name', album);
    if (duration) params.append('duration', Math.round(duration).toString());

    const url = `https://lrclib.net/api/get?${params.toString()}`;

    return new Promise((resolve) => {
      const request = net.request(url);
      let data = '';

      request.on('response', (response) => {
        if (response.statusCode !== 200) {
          resolve(null);
          return;
        }

        response.on('data', (chunk) => {
          data += chunk.toString();
        });

        response.on('end', () => {
          try {
            const result = JSON.parse(data);
            // Prefer synced lyrics, fallback to plain lyrics
            const lyrics = result.syncedLyrics || result.plainLyrics || null;
            resolve(lyrics);
          } catch {
            resolve(null);
          }
        });
      });

      request.on('error', () => {
        resolve(null);
      });

      request.end();
    });
  } catch (err) {
    console.error('Error fetching lyrics:', err);
    return null;
  }
}

let mainWindow: BrowserWindow | null;

// Get current system theme (works on Windows, macOS, GNOME, KDE, Hyprland)
function getSystemTheme(): 'dark' | 'light' {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
}

// Send theme to renderer process
function sendThemeToRenderer() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const theme = getSystemTheme();
    mainWindow.webContents.send('system-theme-changed', theme);
  }
}

// Get background color based on current system theme
function getBackgroundColor(): string {
  return getSystemTheme() === 'dark' ? '#0a0a0a' : '#f8f8f8';
}
let mprisPlayer: any = null;
// Discord RPC disabled for V0.1
// let discordRpc: any = null;
// let discordReady = false;

// Discord Rich Presence setup - DISABLED FOR V0.1
// const DISCORD_CLIENT_ID = '1459347227536523445';

// function setupDiscordRPC() {
//   try {
//     const RPC = require('discord-rpc');
//     discordRpc = new RPC.Client({ transport: 'ipc' });
//
//     discordRpc.on('ready', () => {
//       console.log('Discord Rich Presence connected!');
//       discordReady = true;
//
//       // Set initial presence
//       discordRpc.setActivity({
//         details: 'Idle',
//         state: 'Not playing anything',
//         largeImageKey: 'logo',
//         largeImageText: 'Vibe Music Player',
//         instance: false,
//       });
//     });
//
//     discordRpc.on('disconnected', () => {
//       console.log('Discord RPC disconnected');
//       discordReady = false;
//     });
//
//     discordRpc.login({ clientId: DISCORD_CLIENT_ID }).catch((err: any) => {
//       console.log('Discord RPC login failed (Discord might not be running):', err.message);
//     });
//   } catch (err) {
//     console.log('Discord RPC not available:', err);
//   }
// }

// Update Discord presence when track changes - DISABLED FOR V0.1
// ipcMain.on('discord-update-presence', (event, data: {
//   title: string;
//   artist: string;
//   album?: string;
//   duration?: number;
//   currentTime?: number;
//   isPlaying: boolean;
// }) => {
//   if (!discordRpc || !discordReady) return;
//
//   try {
//     if (!data.isPlaying) {
//       discordRpc.setActivity({
//         type: 2, // 2 = Listening
//         details: data.title,
//         state: `by ${data.artist}`,
//         largeImageKey: 'logo',
//         largeImageText: data.album || 'Vibe Music Player',
//         instance: false,
//       });
//     } else {
//       const activity: any = {
//         type: 2, // 2 = Listening (shows "Escuchando" / "Listening to")
//         details: data.title,
//         state: `by ${data.artist}`,
//         largeImageKey: 'logo',
//         largeImageText: data.album || 'Vibe Music Player',
//         smallImageKey: 'playing',
//         smallImageText: 'Playing',
//         instance: false,
//       };
//
//       // Add timestamps for progress bar if we have duration
//       if (data.duration && data.currentTime !== undefined) {
//         const now = Date.now();
//         const elapsed = data.currentTime * 1000;
//         const remaining = (data.duration - data.currentTime) * 1000;
//         // Start timestamp = when the song started (now minus elapsed time)
//         activity.startTimestamp = now - elapsed;
//         // End timestamp = when the song will end
//         activity.endTimestamp = now + remaining;
//       }
//
//       discordRpc.setActivity(activity);
//     }
//   } catch (err) {
//     console.error('Error updating Discord presence:', err);
//   }
// });
//
// // Clear Discord presence
// ipcMain.on('discord-clear-presence', () => {
//   if (discordRpc && discordReady) {
//     discordRpc.clearActivity();
//   }
// });

// MPRIS D-Bus setup for Linux media controls using mpris-service
function setupMPRIS() {
  if (process.platform !== 'linux') return;

  try {
    const Player = require('mpris-service');

    mprisPlayer = Player({
      name: 'vibe',
      identity: 'Vibe Music Player',
      desktopEntry: 'vibe',
      supportedUriSchemes: ['file'],
      supportedMimeTypes: ['audio/mpeg', 'audio/flac', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/aac'],
      supportedInterfaces: ['player'],
    });

    // Set initial state
    mprisPlayer.playbackStatus = 'Stopped';
    mprisPlayer.canGoNext = true;
    mprisPlayer.canGoPrevious = true;
    mprisPlayer.canPlay = true;
    mprisPlayer.canPause = true;
    mprisPlayer.canSeek = true;
    mprisPlayer.canControl = true;
    mprisPlayer.canQuit = true;
    mprisPlayer.canRaise = true;

    // Set initial empty metadata
    mprisPlayer.metadata = {
      'mpris:trackid': mprisPlayer.objectPath('track/0'),
      'xesam:title': 'No track playing',
      'xesam:artist': ['Vibe'],
      'xesam:album': '',
    };

    // Handle MPRIS events
    mprisPlayer.on('playpause', () => {
      console.log('MPRIS: playpause');
      mainWindow?.webContents.send('mpris-playpause');
    });

    mprisPlayer.on('play', () => {
      console.log('MPRIS: play');
      mainWindow?.webContents.send('mpris-play');
    });

    mprisPlayer.on('pause', () => {
      console.log('MPRIS: pause');
      mainWindow?.webContents.send('mpris-pause');
    });

    mprisPlayer.on('stop', () => {
      console.log('MPRIS: stop');
      mainWindow?.webContents.send('mpris-stop');
    });

    mprisPlayer.on('next', () => {
      console.log('MPRIS: next');
      mainWindow?.webContents.send('mpris-next');
    });

    mprisPlayer.on('previous', () => {
      console.log('MPRIS: previous');
      mainWindow?.webContents.send('mpris-previous');
    });

    mprisPlayer.on('seek', (offset: number) => {
      console.log('MPRIS: seek', offset);
      // offset is in microseconds, convert to seconds
      mainWindow?.webContents.send('mpris-seek', offset / 1000000);
    });

    mprisPlayer.on('position', (data: { trackId: string; position: number }) => {
      console.log('MPRIS: position', data);
      // position is in microseconds, convert to seconds
      mainWindow?.webContents.send('mpris-setposition', data.position / 1000000);
    });

    mprisPlayer.on('quit', () => {
      app.quit();
    });

    mprisPlayer.on('raise', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });

    console.log('MPRIS service registered as: org.mpris.MediaPlayer2.vibe');
  } catch (err) {
    console.error('Failed to setup MPRIS:', err);
  }
}

// Update MPRIS metadata when track changes
ipcMain.on('mpris-update-metadata', (event, data: { title: string, artist: string, album: string, artUrl?: string, duration?: number }) => {
  if (mprisPlayer) {
    try {
      // Build metadata object
      const metadata: any = {
        'mpris:trackid': mprisPlayer.objectPath('track/' + Date.now()),
        'xesam:title': data.title,
        'xesam:artist': [data.artist],
        'xesam:album': data.album,
      };

      // Add length in microseconds (ensure it's a reasonable number)
      if (data.duration && data.duration > 0) {
        metadata['mpris:length'] = Math.floor(data.duration * 1000000);
      }

      // Handle album art - save to temp file if base64
      if (data.artUrl && data.artUrl.startsWith('data:')) {
        try {
          const matches = data.artUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) {
            const format = matches[1];
            const base64Data = matches[2];
            const ext = format.includes('png') ? 'png' : format.includes('gif') ? 'gif' : 'jpg';
            // Use unique filename to avoid caching issues
            const tempPath = path.join(app.getPath('temp'), `vibe-cover-${Date.now()}.${ext}`);
            fs.writeFileSync(tempPath, Buffer.from(base64Data, 'base64'));
            metadata['mpris:artUrl'] = `file://${tempPath}`;

            // Clean up old cover files (keep only the latest)
            try {
              const tempDir = app.getPath('temp');
              const files = fs.readdirSync(tempDir).filter(f => f.startsWith('vibe-cover-') && f !== path.basename(tempPath));
              files.forEach(f => {
                try { fs.unlinkSync(path.join(tempDir, f)); } catch (e) { /* ignore */ }
              });
            } catch (e) { /* ignore cleanup errors */ }
          }
        } catch (artErr) {
          console.error('Error saving album art:', artErr);
        }
      } else if (data.artUrl) {
        metadata['mpris:artUrl'] = data.artUrl;
      }

      mprisPlayer.metadata = metadata;
    } catch (err) {
      console.error('Error updating MPRIS metadata:', err);
    }
  }
});

ipcMain.on('mpris-update-status', (event, status: 'Playing' | 'Paused' | 'Stopped') => {
  if (mprisPlayer) {
    mprisPlayer.playbackStatus = status;
  }
});

ipcMain.on('mpris-update-position', (event, position: number) => {
  if (mprisPlayer) {
    // Position in microseconds
    mprisPlayer.position = Math.floor(position * 1000000);
  }
});

function createWindow() {
  // Use system theme for initial background to prevent flash
  const initialBgColor = getBackgroundColor();

  // Read settings to check if custom titlebar is enabled
  let useCustomTitlebar = true; // Default to true
  try {
    const settingsPath = path.join(app.getPath('userData'), 'vibe-settings.json');
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      useCustomTitlebar = settings.useCustomTitlebar !== false;
    }
  } catch (e) {
    // Use default
  }

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: initialBgColor,
    autoHideMenuBar: true,
    frame: !useCustomTitlebar, // Disable system frame when using custom titlebar
    titleBarStyle: useCustomTitlebar ? 'hidden' : 'default',
    show: false, // Don't show until ready
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../src/index.html'));

  // Setup window state listeners for maximize/unmaximize events
  setupWindowStateListeners();

  // Show window only when ready to prevent white flash
  mainWindow.once('ready-to-show', () => {
    sendThemeToRenderer();
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Listen for system theme changes (real-time updates)
nativeTheme.on('updated', () => {
  sendThemeToRenderer();
});

app.on('ready', () => {
  createWindow();
  setupMPRIS();
  // setupDiscordRPC(); // Disabled for V0.1
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('scan-music-folder', async (event, folderPath: string) => {
  const musicFiles: any[] = [];
  const supportedFormats = ['.mp3', '.flac', '.m4a', '.wav', '.ogg', '.aac'];

  async function scanDirectory(dirPath: string) {
    try {
      const files = fs.readdirSync(dirPath);

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          await scanDirectory(filePath);
        } else if (supportedFormats.includes(path.extname(file).toLowerCase())) {
          try {
            const metadata = await parseFile(filePath);

            // Extract lyrics from various sources
            // 1. common.lyrics array (music-metadata standard)
            // 2. ID3 USLT (Unsynchronized Lyrics) frames in native tags
            let lyrics: string | null = null;

            // Check common.lyrics first (array of lyric objects)
            if (metadata.common.lyrics && metadata.common.lyrics.length > 0) {
              // Lyrics can be string or object with text property
              const lyricsEntry = metadata.common.lyrics[0];
              if (typeof lyricsEntry === 'string') {
                lyrics = lyricsEntry;
              } else if (lyricsEntry && typeof lyricsEntry === 'object' && 'text' in lyricsEntry) {
                lyrics = (lyricsEntry as any).text || null;
              }
            }

            // Fallback: Check native ID3v2 USLT frames
            if (!lyrics && metadata.native) {
              for (const format of Object.keys(metadata.native)) {
                const tags = metadata.native[format];
                const usltTag = tags?.find((tag: any) => tag.id === 'USLT');
                if (usltTag && usltTag.value) {
                  lyrics = typeof usltTag.value === 'string'
                    ? usltTag.value
                    : usltTag.value.text || null;
                  break;
                }
              }
            }

            musicFiles.push({
              id: filePath,
              path: filePath,
              title: metadata.common.title || path.basename(file, path.extname(file)),
              artist: metadata.common.artist || 'Unknown Artist',
              album: metadata.common.album || 'Unknown Album',
              albumArtist: metadata.common.albumartist || metadata.common.artist || 'Unknown Artist',
              duration: metadata.format.duration || 0,
              year: metadata.common.year || null,
              track: metadata.common.track.no || null,
              genre: metadata.common.genre?.[0] || null,
              picture: metadata.common.picture?.[0] ? {
                format: metadata.common.picture[0].format,
                data: metadata.common.picture[0].data.toString('base64')
              } : null,
              lyrics: lyrics
            });
          } catch (err) {
            console.error(`Error reading metadata for ${filePath}:`, err);
          }
        }
      }
    } catch (err) {
      console.error(`Error scanning directory ${dirPath}:`, err);
    }
  }

  await scanDirectory(folderPath);
  return musicFiles;
});

// Electron Store IPC Handlers - Handle store data requests from renderer
const storeData: Record<string, any> = {};

ipcMain.on('electron-store-get-data', (event, key: string) => {
  event.returnValue = storeData[key] ?? null;
});

ipcMain.on('electron-store-set-data', (event, key: string, value: any) => {
  storeData[key] = value;
  event.returnValue = true;
});

ipcMain.handle('electron-store-get', async (event, key: string) => {
  return storeData[key] ?? null;
});

ipcMain.handle('electron-store-set', async (event, key: string, value: any) => {
  storeData[key] = value;
  return true;
});

// System theme IPC handlers
ipcMain.handle('get-system-theme', async () => {
  return getSystemTheme();
});

ipcMain.on('get-system-theme-sync', (event) => {
  event.returnValue = getSystemTheme();
});

// Save settings to file for main process to read on next launch
ipcMain.on('save-settings-to-file', (event, settings: any) => {
  try {
    const settingsPath = path.join(app.getPath('userData'), 'vibe-settings.json');
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (e) {
    console.error('Error saving settings to file:', e);
  }
});

// Fetch lyrics online from LRCLIB API
ipcMain.handle('fetch-lyrics', async (event, data: { title: string; artist: string; album?: string; duration?: number }) => {
  return await fetchLyricsOnline(data.title, data.artist, data.album, data.duration);
});

// Window control IPC handlers for custom titlebar
ipcMain.on('window-minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('window-close', () => {
  mainWindow?.close();
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow?.isMaximized() ?? false;
});

// Restart app
ipcMain.on('app-restart', () => {
  app.relaunch();
  app.exit(0);
});

// Get home path for global scan
ipcMain.handle('get-home-path', () => {
  return app.getPath('home');
});

// Send maximize state changes to renderer
function setupWindowStateListeners() {
  if (!mainWindow) return;

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window-maximized-changed', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window-maximized-changed', false);
  });
}
