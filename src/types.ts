export const AUDIO_EXTENSIONS = ["mp3", "m4a", "wav", "flac", "aac"] as const;

export type AudioExtension = (typeof AUDIO_EXTENSIONS)[number];

export type SortMethod = "name" | "createdTime" | "modifiedTime";
export type SortDirection = "asc" | "desc";
export type PlaybackMode = "sequential" | "playlist-loop" | "single-loop" | "shuffle";
export type VaultCastTheme = "default" | "spring" | "summer" | "autumn" | "winter";

export interface VaultCastSettings {
  audioFolder: string;
  defaultSpeed: number;
  autoResume: boolean;
  autoScan: boolean;
  sortMethod: SortMethod;
  sortDirection: SortDirection;
  playbackMode: PlaybackMode;
  theme: VaultCastTheme;
  recentPlaysLimit: number;
}

export interface AudioTrack {
  path: string;
  name: string;
  title: string;
  extension: string;
  createdTime: number;
  modifiedTime: number;
  duration?: number;
}

export interface TrackPosition {
  position: number;
  duration: number;
  lastPlayedAt: number;
  completed: boolean;
}

export interface RecentPlay {
  path: string;
  title: string;
  lastPlayedAt: number;
  position: number;
  duration: number;
}

export interface PlaybackState {
  lastPlayedFile: string;
  playbackSpeed: number;
  volume: number;
  playbackMode: PlaybackMode;
  positions: Record<string, TrackPosition>;
  recentPlays: RecentPlay[];
}

export interface VaultCastData {
  settings: VaultCastSettings;
  playback: PlaybackState;
}
