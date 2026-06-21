import { PlaybackState, VaultCastSettings } from "./types";

export const DEFAULT_SETTINGS: VaultCastSettings = {
  audioFolder: "TTS Audio",
  defaultSpeed: 1.5,
  autoResume: true,
  autoScan: true,
  sortMethod: "modifiedTime",
  sortDirection: "desc",
  playbackMode: "playlist-loop",
  theme: "default",
  recentPlaysLimit: 10
};

export const DEFAULT_PLAYBACK_STATE: PlaybackState = {
  lastPlayedFile: "",
  playbackSpeed: 1.5,
  volume: 0.8,
  playbackMode: "playlist-loop",
  positions: {},
  recentPlays: []
};
