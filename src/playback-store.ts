import { DEFAULT_PLAYBACK_STATE } from "./defaults";
import { AudioTrack, PlaybackMode, PlaybackState, RecentPlay } from "./types";

export class PlaybackStore {
  state: PlaybackState;

  constructor(initialState?: Partial<PlaybackState>) {
    this.state = {
      ...DEFAULT_PLAYBACK_STATE,
      ...initialState,
      positions: {
        ...DEFAULT_PLAYBACK_STATE.positions,
        ...initialState?.positions
      },
      recentPlays: initialState?.recentPlays ?? DEFAULT_PLAYBACK_STATE.recentPlays
    };
  }

  setSpeed(speed: number): void {
    this.state.playbackSpeed = speed;
  }

  setVolume(volume: number): void {
    this.state.volume = volume;
  }

  setPlaybackMode(mode: PlaybackMode): void {
    this.state.playbackMode = mode;
  }

  saveProgress(track: AudioTrack, position: number, duration: number, completed: boolean): void {
    const safeDuration = Number.isFinite(duration) ? duration : 0;
    const safePosition = Number.isFinite(position) ? position : 0;

    this.state.lastPlayedFile = track.path;
    this.state.positions[track.path] = {
      position: safePosition,
      duration: safeDuration,
      lastPlayedAt: Date.now(),
      completed
    };

    this.addRecentPlay({
      path: track.path,
      title: track.title,
      lastPlayedAt: Date.now(),
      position: safePosition,
      duration: safeDuration
    });
  }

  getPosition(path: string): number {
    return this.state.positions[path]?.position ?? 0;
  }

  getProgress(path: string): number {
    const position = this.state.positions[path];

    if (!position || position.duration <= 0) {
      return 0;
    }

    return Math.min(position.position / position.duration, 1);
  }

  isCompleted(path: string): boolean {
    return this.state.positions[path]?.completed ?? false;
  }

  private addRecentPlay(play: RecentPlay): void {
    const existing = this.state.recentPlays.filter((item) => item.path !== play.path);
    this.state.recentPlays = [play, ...existing];
  }
}
