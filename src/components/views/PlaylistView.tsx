import React, { memo, useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMusicContext } from '../../context/MusicContext';
import { useM3Theme } from '../../context/M3ThemeContext';
import { PlayIcon, ShuffleIcon, MoreIcon, TrashIcon, EditIcon, ImageIcon, CheckIcon, CloseIcon, ChevronUpIcon, ChevronDownIcon } from '../Icons';
import type { Playlist, Track } from '../../types';

interface PlaylistViewProps {
  playlist: Playlist;
}

const PlaylistView: React.FC<PlaylistViewProps> = memo(({ playlist }) => {
  const { tracks, playTrack, shuffle, deletePlaylist, updatePlaylist, removeTrackFromPlaylist, currentTrack, isPlaying } = useMusicContext();
  const { colorScheme } = useM3Theme();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [editName, setEditName] = useState(playlist?.name || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [draggedTrack, setDraggedTrack] = useState<string | null>(null);
  const [dragOverTrack, setDragOverTrack] = useState<string | null>(null);
  const [reorderedTracks, setReorderedTracks] = useState<string[]>([]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
        menuButtonRef.current && !menuButtonRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // Memoize playlist tracks to prevent unnecessary recalculations
  const playlistTracks = useMemo(() => {
    if (!playlist?.tracks) return [];
    return playlist.tracks
      .map((id: string) => tracks.find(t => t.id === id))
      .filter((t): t is Track => t !== undefined);
  }, [playlist?.tracks, tracks]);

  // Calculate total duration
  const totalDuration = useMemo(() => {
    const total = playlistTracks.reduce((sum: number, track: Track) => sum + (track.duration || 0), 0);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    return hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
  }, [playlistTracks]);

  // Get playlist cover from first track
  const playlistCover = useMemo(() => {
    if (playlist?.coverImage) {
      return playlist.coverImage;
    }
    if (playlistTracks.length > 0 && playlistTracks[0].picture) {
      return `data:${playlistTracks[0].picture.format};base64,${playlistTracks[0].picture.data}`;
    }
    return null;
  }, [playlistTracks, playlist?.coverImage]);

  const handlePlayAll = () => {
    if (playlistTracks.length > 0) {
      playTrack(playlistTracks[0], playlistTracks);
    }
  };

  const handleDeletePlaylist = () => {
    deletePlaylist(playlist.id);
    setShowDeleteConfirm(false);
  };

  const handleSelectImage = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e: any) => {
        const file = e.target?.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            updatePlaylist(playlist.id, { coverImage: base64 });
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  };

  const handleSelectBanner = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e: any) => {
        const file = e.target?.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            updatePlaylist(playlist.id, { bannerImage: base64 });
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } catch (error) {
      console.error('Error selecting banner:', error);
    }
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      // Save name if editing
      if (isEditingName && editName.trim() && editName !== playlist.name) {
        updatePlaylist(playlist.id, { name: editName.trim() });
      }
      setSelectedTracks(new Set());
      setIsEditingName(false);
    }
    setIsEditMode(!isEditMode);
    setShowMenu(false);
  };

  const toggleTrackSelection = (trackId: string) => {
    const newSelected = new Set(selectedTracks);
    if (newSelected.has(trackId)) {
      newSelected.delete(trackId);
    } else {
      newSelected.add(trackId);
    }
    setSelectedTracks(newSelected);
  };

  const deleteSelectedTracks = () => {
    selectedTracks.forEach(trackId => {
      removeTrackFromPlaylist(playlist.id, trackId);
    });
    setSelectedTracks(new Set());
  };

  const handleDragStart = (e: React.DragEvent, trackId: string) => {
    setDraggedTrack(trackId);
    setReorderedTracks([...playlist.tracks]);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (!draggedTrack || draggedTrack === trackId) return;

    setDragOverTrack(trackId);

    // Reorder tracks in real-time
    const newTracks = [...reorderedTracks];
    const draggedIndex = newTracks.indexOf(draggedTrack);
    const targetIndex = newTracks.indexOf(trackId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      newTracks.splice(draggedIndex, 1);
      newTracks.splice(targetIndex, 0, draggedTrack);
      setReorderedTracks(newTracks);
    }
  };

  const handleDragLeave = () => {
    // Don't clear dragOverTrack on leave to keep visual feedback
  };

  const handleDrop = (e: React.DragEvent, targetTrackId: string) => {
    e.preventDefault();
    if (!draggedTrack) {
      setDraggedTrack(null);
      setDragOverTrack(null);
      setReorderedTracks([]);
      return;
    }

    // Save the reordered tracks if there are any changes
    if (reorderedTracks.length > 0) {
      updatePlaylist(playlist.id, { tracks: reorderedTracks });
    }

    setDraggedTrack(null);
    setDragOverTrack(null);
    setReorderedTracks([]);
  };

  const handleDragEnd = () => {
    // Save on drag end as well in case drop wasn't triggered
    if (draggedTrack && reorderedTracks.length > 0) {
      updatePlaylist(playlist.id, { tracks: reorderedTracks });
    }
    setDraggedTrack(null);
    setDragOverTrack(null);
    setReorderedTracks([]);
  };

  if (!playlist) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-secondary)' }}>
        Playlist not found
      </div>
    );
  }

  return (
    <div className="view-content pb-32">
      {/* Header */}
      <div
        className="relative px-6 pt-8 pb-6 overflow-hidden"
        style={{
          background: `linear-gradient(to bottom, ${colorScheme.primaryContainer}40, var(--bg-main))`
        }}
      >
        {/* Banner Image */}
        {playlist.bannerImage && (
          <div className="absolute inset-0 h-48">
            <img
              src={playlist.bannerImage}
              alt="Playlist banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg-main)]" />
          </div>
        )}

        {/* Edit Banner Button (in edit mode) */}
        {isEditMode && (
          <button
            onClick={handleSelectBanner}
            className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
            style={{
              background: colorScheme.surfaceContainer,
              color: colorScheme.onSurface,
              border: `1px solid ${colorScheme.outline}`
            }}
          >
            <ImageIcon size={16} />
            {playlist.bannerImage ? 'Change Banner' : 'Add Banner'}
          </button>
        )}
        <div className="flex items-end gap-6">
          {/* Playlist Cover - Clickable in edit mode */}
          <div
            onClick={isEditMode ? handleSelectImage : undefined}
            className={`w-48 h-48 rounded-xl shadow-2xl flex items-center justify-center flex-shrink-0 overflow-hidden relative group ${isEditMode ? 'cursor-pointer' : ''}`}
            style={{
              background: `linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.secondary})`
            }}
          >
            {playlistCover ? (
              <img src={playlistCover} alt={playlist.name} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-20 h-20" fill="white" viewBox="0 0 24 24">
                <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
              </svg>
            )}
            {/* Edit overlay */}
            {isEditMode && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-center text-white">
                  <ImageIcon size={32} />
                  <p className="text-sm mt-2 font-medium">Change Cover</p>
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium mb-2" style={{ color: colorScheme.onSurfaceVariant }}>
              Playlist
            </p>
            {isEditingName ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (editName.trim() && editName !== playlist.name) {
                      updatePlaylist(playlist.id, { name: editName.trim() });
                    }
                    setIsEditingName(false);
                  }
                  if (e.key === 'Escape') setIsEditingName(false);
                }}
                onBlur={() => {
                  if (editName.trim() && editName !== playlist.name) {
                    updatePlaylist(playlist.id, { name: editName.trim() });
                  }
                  setIsEditingName(false);
                }}
                autoFocus
                className="text-4xl md:text-5xl font-bold mb-4 bg-transparent outline-none w-full"
                style={{
                  color: colorScheme.onSurface,
                  borderBottom: `2px solid ${colorScheme.primary}`,
                }}
              />
            ) : (
              <div className="flex items-center gap-3 mb-4">
                <h1
                  className="text-4xl md:text-5xl font-bold truncate"
                  style={{ color: colorScheme.onSurface }}
                >
                  {playlist.name}
                </h1>
                {isEditMode && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    style={{ color: colorScheme.onSurfaceVariant }}
                  >
                    <EditIcon size={20} />
                  </button>
                )}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm" style={{ color: colorScheme.onSurfaceVariant }}>
              <span>{playlistTracks.length} songs</span>
              <span>•</span>
              <span>{totalDuration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 flex items-center gap-4">
        {!isEditMode ? (
          <>
            <button
              onClick={handlePlayAll}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-lg"
              style={{ background: colorScheme.primary }}
              disabled={playlistTracks.length === 0}
            >
              <PlayIcon size={24} className="ml-1" style={{ color: colorScheme.onPrimary }} />
            </button>

            <button
              onClick={toggleEditMode}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
              style={{ color: colorScheme.onSurfaceVariant }}
              title="Edit Playlist"
            >
              <EditIcon size={20} />
            </button>

            <div className="relative">
              <button
                ref={menuButtonRef}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMenuPosition({ x: rect.left, y: rect.bottom + 4 });
                  setShowMenu(!showMenu);
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                style={{ color: colorScheme.onSurfaceVariant }}
              >
                <MoreIcon size={20} />
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={toggleEditMode}
              className="px-4 py-2 rounded-full flex items-center gap-2 transition-all hover:scale-105"
              style={{ background: colorScheme.primary, color: colorScheme.onPrimary }}
            >
              <CheckIcon size={18} />
              <span className="text-sm font-medium">Done</span>
            </button>

            {selectedTracks.size > 0 && (
              <button
                onClick={deleteSelectedTracks}
                className="px-4 py-2 rounded-full flex items-center gap-2 transition-all hover:scale-105"
                style={{ background: colorScheme.errorContainer, color: colorScheme.onErrorContainer }}
              >
                <TrashIcon size={18} />
                <span className="text-sm font-medium">Delete {selectedTracks.size}</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="rounded-2xl p-6 max-w-sm mx-4 shadow-2xl animate-slide-up"
            style={{ background: colorScheme.surfaceContainerHigh }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: colorScheme.onSurface }}
            >
              Delete Playlist?
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: colorScheme.onSurfaceVariant }}
            >
              Are you sure you want to delete "{playlist.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                style={{
                  background: colorScheme.surfaceContainer,
                  color: colorScheme.onSurface,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlaylist}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                style={{
                  background: colorScheme.error,
                  color: colorScheme.onError,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Track List */}
      {playlistTracks.length > 0 ? (
        <div className="px-6">
          <div className="space-y-1">
            {(reorderedTracks.length > 0 && draggedTrack ?
              reorderedTracks.map(id => tracks.find(t => t.id === id)).filter((t): t is Track => t !== undefined) :
              playlistTracks
            ).map((track, index) => {
              const isSelected = selectedTracks.has(track.id);
              const isCurrentTrack = currentTrack?.id === track.id;
              const isDragging = draggedTrack === track.id;
              const isDragOver = dragOverTrack === track.id;
              return (
                <div
                  key={track.id}
                  draggable={isEditMode}
                  onDragStart={(e) => isEditMode && handleDragStart(e, track.id)}
                  onDragOver={(e) => isEditMode && handleDragOver(e, track.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => isEditMode && handleDrop(e, track.id)}
                  onDragEnd={handleDragEnd}
                  className="flex items-center gap-3 p-3 rounded-md"
                  style={{
                    background: isDragging ? `${colorScheme.primary}20` :
                      isSelected ? `${colorScheme.primaryContainer}40` :
                        'transparent',
                    border: isSelected ? `1px solid ${colorScheme.primary}` :
                      '1px solid transparent',
                    opacity: isDragging ? 0.6 : 1,
                    cursor: isEditMode ? (isDragging ? 'grabbing' : 'grab') : 'default',
                    transform: isDragging ? 'scale(1.02) rotate(2deg)' : 'scale(1)',
                    transition: isDragging
                      ? 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease, box-shadow 0.2s ease'
                      : 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                    boxShadow: isDragging ? `0 8px 16px ${colorScheme.shadow}40` : 'none',
                    willChange: isEditMode ? 'transform, opacity' : 'auto',
                  }}
                  onMouseEnter={(e) => {
                    if (!isEditMode && !isCurrentTrack) {
                      e.currentTarget.style.background = colorScheme.surfaceContainerHigh;
                      e.currentTarget.style.transition = 'background 0.2s ease';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isEditMode && !isCurrentTrack) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transition = 'background 0.2s ease';
                    }
                  }}
                >
                  {isEditMode ? (
                    <>
                      {/* Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTrackSelection(track.id);
                        }}
                        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{
                          background: isSelected ? colorScheme.primary : colorScheme.surfaceVariant,
                          border: `2px solid ${isSelected ? colorScheme.primary : colorScheme.outline}`,
                        }}
                      >
                        {isSelected && (
                          <CheckIcon size={14} style={{ color: colorScheme.onPrimary }} />
                        )}
                      </button>

                      {/* Drag handle indicator */}
                      <div className="flex flex-col gap-0.5 cursor-grab active:cursor-grabbing" style={{ color: colorScheme.onSurfaceVariant }}>
                        <div className="w-4 h-0.5 rounded-full" style={{ background: 'currentColor' }} />
                        <div className="w-4 h-0.5 rounded-full" style={{ background: 'currentColor' }} />
                        <div className="w-4 h-0.5 rounded-full" style={{ background: 'currentColor' }} />
                      </div>
                    </>
                  ) : (
                    <>
                      {isCurrentTrack && isPlaying ? (
                        <div className="w-6 flex items-center justify-center">
                          <div className="flex items-end gap-0.5 h-4">
                            <span className="now-playing-bar w-1 rounded-full" style={{ background: colorScheme.primary }} />
                            <span className="now-playing-bar w-1 rounded-full" style={{ background: colorScheme.primary }} />
                            <span className="now-playing-bar w-1 rounded-full" style={{ background: colorScheme.primary }} />
                          </div>
                        </div>
                      ) : (
                        <span className="w-6 text-center text-sm" style={{ color: isCurrentTrack ? colorScheme.primary : colorScheme.onSurfaceVariant }}>
                          {index + 1}
                        </span>
                      )}
                    </>
                  )}

                  {/* Track info - clickable only when not in edit mode */}
                  <div
                    onClick={isEditMode ? undefined : () => playTrack(track, playlistTracks)}
                    className={`flex items-center gap-3 flex-1 min-w-0 ${!isEditMode ? 'cursor-pointer' : ''}`}
                  >
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
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
                      <div className="font-medium truncate" style={{ color: isCurrentTrack ? colorScheme.primary : colorScheme.onSurface }}>
                        {track.title}
                      </div>
                      <div className="text-sm truncate" style={{ color: colorScheme.onSurfaceVariant }}>
                        {track.artist}
                      </div>
                    </div>
                    <span className="text-sm" style={{ color: colorScheme.onSurfaceVariant }}>
                      {Math.floor(track.duration / 60)}:{String(Math.floor(track.duration % 60)).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center py-20 px-6"
          style={{ color: colorScheme.onSurfaceVariant }}
        >
          <svg className="w-16 h-16 mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
          </svg>
          <p className="text-lg font-medium mb-2">This playlist is empty</p>
          <p className="text-sm opacity-70">Add some songs to get started</p>
        </div>
      )}

      {/* Dropdown Menu - using portal to escape overflow container */}
      {showMenu && createPortal(
        <div
          ref={menuRef}
          className="fixed z-50 rounded-xl overflow-hidden shadow-xl animate-fade-in"
          style={{
            left: menuPosition.x,
            top: menuPosition.y,
            background: colorScheme.surfaceContainerHigh,
            border: `1px solid ${colorScheme.outlineVariant}`,
            minWidth: '160px',
          }}
        >
          <button
            onClick={() => {
              setShowMenu(false);
              setShowDeleteConfirm(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-white/5"
            style={{ color: colorScheme.error }}
          >
            <TrashIcon size={18} />
            <span>Delete Playlist</span>
          </button>
        </div>,
        document.body
      )}
    </div>
  );
});

PlaylistView.displayName = 'PlaylistView';

export default PlaylistView;
