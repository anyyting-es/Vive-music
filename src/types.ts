export interface Track {
  id: string;
  path: string;
  title: string;
  artist: string;
  album: string;
  albumArtist: string;
  duration: number;
  year: number | null;
  track: number | null;
  genre: string | null;
  picture: {
    format: string;
    data: string;
  } | null;
  lyrics: string | null;
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  year: number | null;
  tracks: Track[];
  cover: string | null;
}

export interface Artist {
  id: string;
  name: string;
  albums: Album[];
  tracks: Track[];
}

export interface Playlist {
  id: string;
  name: string;
  tracks: string[];
  createdAt: number;
  coverImage?: string; // Base64 image data
  bannerImage?: string; // Base64 banner image data
}
