import { ItemView, Notice, WorkspaceLeaf, setIcon } from "obsidian";
import type VaultCastPlugin from "./main";
import { themeClass, themeLabel } from "./theme";
import { AudioTrack, PlaybackMode } from "./types";

export const VAULTCAST_VIEW_TYPE = "vaultcast-player-view";

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const MODES: PlaybackMode[] = ["playlist-loop", "sequential", "single-loop", "shuffle"];

export class VaultCastPlayerView extends ItemView {
  private audio: HTMLAudioElement;
  private currentTrack: AudioTrack | null = null;
  private searchQuery = "";
  private progressTimer: number | null = null;
  private lastSavedAt = 0;

  constructor(leaf: WorkspaceLeaf, private readonly plugin: VaultCastPlugin) {
    super(leaf);
    this.audio = new Audio();
    this.audio.preload = "metadata";
    this.audio.volume = this.plugin.playbackStore.state.volume;
    this.audio.playbackRate = this.plugin.playbackStore.state.playbackSpeed;
  }

  getViewType(): string {
    return VAULTCAST_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "VaultCast";
  }

  getIcon(): string {
    return "headphones";
  }

  async onOpen(): Promise<void> {
    this.bindAudioEvents();
    this.render();
  }

  async onClose(): Promise<void> {
    this.persistProgress(true);
    this.audio.pause();
    this.audio.src = "";

    if (this.progressTimer !== null) {
      window.clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  refresh(): void {
    this.render();
  }

  playTrack(track: AudioTrack): void {
    const resourcePath = this.plugin.audioLibrary.getResourcePath(track);

    if (!resourcePath) {
      new Notice(`VaultCast could not open ${track.name}`);
      return;
    }

    this.persistProgress(true);
    this.currentTrack = track;
    this.audio.src = resourcePath;
    this.audio.playbackRate = this.plugin.playbackStore.state.playbackSpeed;
    this.audio.volume = this.plugin.playbackStore.state.volume;

    const savedPosition = this.plugin.settings.autoResume
      ? this.plugin.playbackStore.getPosition(track.path)
      : 0;

    this.audio.onloadedmetadata = () => {
      if (savedPosition > 0 && savedPosition < this.audio.duration - 2) {
        this.audio.currentTime = savedPosition;
      }
    };

    void this.audio.play().catch(() => {
      new Notice("VaultCast could not start playback. Try pressing play again.");
    });

    this.render();
  }

  private bindAudioEvents(): void {
    this.audio.addEventListener("play", () => this.render());
    this.audio.addEventListener("pause", () => {
      this.persistProgress(true);
      this.render();
    });
    this.audio.addEventListener("timeupdate", () => {
      this.persistProgress(false);
      this.updateProgressOnly();
    });
    this.audio.addEventListener("ended", () => {
      this.persistProgress(true, true);
      this.playAfterEnd();
    });
    this.audio.addEventListener("loadedmetadata", () => this.render());

    this.progressTimer = window.setInterval(() => this.updateProgressOnly(), 500);
  }

  private render(): void {
    const container = this.contentEl;
    const coverUrl = this.currentTrack
      ? this.plugin.audioLibrary.getCoverResourcePath(this.currentTrack)
      : null;

    container.empty();
    container.addClass("vaultcast-view");
    container.removeClass(
      "vaultcast-theme-default",
      "vaultcast-theme-spring",
      "vaultcast-theme-summer",
      "vaultcast-theme-autumn",
      "vaultcast-theme-winter",
      "has-cover-image"
    );
    container.addClass(themeClass(this.plugin.settings.theme));
    if (coverUrl) {
      container.addClass("has-cover-image");
      container.style.setProperty("--vaultcast-cover-image", `url("${coverUrl.replace(/"/g, '\\"')}")`);
    } else {
      container.style.removeProperty("--vaultcast-cover-image");
    }

    const shell = container.createDiv({ cls: "vaultcast-shell" });
    this.renderHero(shell, coverUrl);
    this.renderControls(shell);
    this.renderPlaylist(shell);
    this.renderRecent(shell);
  }

  private renderHero(parent: HTMLElement, coverUrl: string | null): void {
    const hero = parent.createDiv({ cls: coverUrl ? "vaultcast-hero has-cover" : "vaultcast-hero" });
    const top = hero.createDiv({ cls: "vaultcast-hero-top" });
    top.createDiv({ cls: "vaultcast-kicker", text: themeLabel(this.plugin.settings.theme) });

    const topActions = top.createDiv({ cls: "vaultcast-hero-actions" });
    const coverInput = topActions.createEl("input", {
      cls: "vaultcast-cover-input",
      attr: {
        type: "file",
        accept: "image/png,image/jpeg,image/webp,image/gif",
        "aria-label": "Upload cover image"
      }
    });

    const uploadButton = topActions.createEl("button", {
      cls: "vaultcast-icon-button",
      attr: { "aria-label": "Upload cover image" }
    });
    setIcon(uploadButton, "image-plus");
    uploadButton.disabled = !this.currentTrack;
    uploadButton.addEventListener("click", () => coverInput.click());
    coverInput.addEventListener("change", () => {
      const [file] = Array.from(coverInput.files ?? []);
      coverInput.value = "";
      if (file) {
        void this.uploadCover(file);
      }
    });

    const refreshButton = top.createEl("button", {
      cls: "vaultcast-icon-button",
      attr: { "aria-label": "Refresh playlist" }
    });
    setIcon(refreshButton, "refresh-cw");
    refreshButton.addEventListener("click", () => this.plugin.refreshLibrary());
    topActions.appendChild(refreshButton);

    const art = hero.createDiv({ cls: "vaultcast-art" });
    if (coverUrl) {
      art.createEl("img", {
        cls: "vaultcast-cover-image",
        attr: {
          src: coverUrl,
          alt: this.currentTrack?.title ?? "VaultCast cover"
        }
      });
    } else {
      const artIcon = art.createDiv({ cls: "vaultcast-art-icon" });
      setIcon(artIcon, "headphones");
      art.createDiv({ cls: "vaultcast-art-orbit" });
    }

    const title = this.currentTrack?.title ?? "Ready for today's audio";
    hero.createEl("h3", { cls: "vaultcast-track-title", text: title });

    const subtitle = this.currentTrack
      ? this.currentTrack.path
      : `${this.plugin.tracks.length} audio file${this.plugin.tracks.length === 1 ? "" : "s"} found`;
    hero.createDiv({ cls: "vaultcast-track-subtitle", text: subtitle });

    const latest = hero.createEl("button", { cls: "vaultcast-latest-button" });
    setIcon(latest, "sparkles");
    latest.createSpan({ text: "Play latest" });
    latest.disabled = this.plugin.tracks.length === 0;
    latest.addEventListener("click", () => {
      const [track] = this.plugin.tracks;
      if (track) {
        this.playTrack(track);
      }
    });
  }

  private async uploadCover(file: File): Promise<void> {
    if (!this.currentTrack) {
      new Notice("Play or select an audio file before uploading a cover.");
      return;
    }

    try {
      const coverPath = await this.plugin.audioLibrary.saveCoverForTrack(this.currentTrack, file);
      this.currentTrack.coverPath = coverPath;
      this.plugin.refreshLibrary();
      new Notice("VaultCast cover image uploaded");
    } catch {
      new Notice("VaultCast could not upload that image. Use PNG, JPG, WEBP, or GIF.");
    }
  }

  private renderControls(parent: HTMLElement): void {
    const controls = parent.createDiv({ cls: "vaultcast-controls" });

    const buttonRow = controls.createDiv({ cls: "vaultcast-button-row" });
    this.createIconButton(buttonRow, "skip-back", "Previous", () => this.playRelative(-1));
    this.createIconButton(
      buttonRow,
      this.audio.paused ? "play" : "pause",
      this.audio.paused ? "Play" : "Pause",
      () => this.togglePlay(),
      "vaultcast-play-button"
    );
    this.createIconButton(buttonRow, "skip-forward", "Next", () => this.playRelative(1));

    const timeRow = controls.createDiv({ cls: "vaultcast-time-row" });
    timeRow.createSpan({ cls: "vaultcast-current-time", text: formatTime(this.audio.currentTime) });
    timeRow.createSpan({ cls: "vaultcast-duration", text: formatTime(this.audio.duration) });

    const progress = controls.createEl("input", {
      cls: "vaultcast-progress",
      attr: {
        type: "range",
        min: "0",
        max: "1000",
        value: String(this.progressValue())
      }
    });
    progress.disabled = !this.currentTrack;
    progress.addEventListener("input", () => {
      const duration = Number.isFinite(this.audio.duration) ? this.audio.duration : 0;
      if (duration > 0) {
        this.audio.currentTime = (Number(progress.value) / 1000) * duration;
      }
    });

    const optionRow = controls.createDiv({ cls: "vaultcast-option-row" });
    this.renderModeButton(optionRow);
    this.renderSpeedSelect(optionRow);
    this.renderVolume(optionRow);
  }

  private renderPlaylist(parent: HTMLElement): void {
    const section = parent.createDiv({ cls: "vaultcast-section" });
    const header = section.createDiv({ cls: "vaultcast-section-header" });
    header.createEl("h4", { text: "Playlist" });
    header.createSpan({ text: String(this.filteredTracks().length) });

    const search = section.createEl("input", {
      cls: "vaultcast-search",
      attr: {
        type: "search",
        placeholder: "Search audio",
        value: this.searchQuery
      }
    });
    search.addEventListener("input", () => {
      this.searchQuery = search.value;
      this.render();
    });

    const list = section.createDiv({ cls: "vaultcast-track-list" });
    const tracks = this.filteredTracks();

    if (tracks.length === 0) {
      list.createDiv({
        cls: "vaultcast-empty",
        text: `No audio found in ${this.plugin.settings.audioFolder}`
      });
      return;
    }

    tracks.forEach((track) => {
      const item = list.createEl("button", { cls: "vaultcast-track-item" });
      if (track.path === this.currentTrack?.path) {
        item.addClass("is-active");
      }
      item.addEventListener("click", () => this.playTrack(track));

      const marker = item.createDiv({ cls: "vaultcast-track-marker" });
      setIcon(marker, track.path === this.currentTrack?.path ? "volume-2" : "music");

      const text = item.createDiv({ cls: "vaultcast-track-text" });
      text.createDiv({ cls: "vaultcast-track-name", text: track.title });
      text.createDiv({ cls: "vaultcast-track-meta", text: formatDate(track.modifiedTime) });

      const progress = this.plugin.playbackStore.getProgress(track.path);
      const completed = this.plugin.playbackStore.isCompleted(track.path);
      const status = item.createDiv({ cls: "vaultcast-track-progress" });

      if (completed) {
        status.addClass("is-completed");
        setIcon(status, "check");
      } else {
        status.setText(progress > 0 ? `${Math.round(progress * 100)}%` : "");
      }
    });
  }

  private renderRecent(parent: HTMLElement): void {
    const recent = this.plugin.playbackStore.state.recentPlays.slice(0, this.plugin.settings.recentPlaysLimit);
    if (recent.length === 0) {
      return;
    }

    const section = parent.createDiv({ cls: "vaultcast-section vaultcast-recent" });
    const header = section.createDiv({ cls: "vaultcast-section-header" });
    header.createEl("h4", { text: "Recent" });

    recent.forEach((play) => {
      const item = section.createEl("button", { cls: "vaultcast-recent-item" });
      item.createSpan({ text: play.title });
      item.createSpan({ text: formatTime(play.position) });
      item.addEventListener("click", () => {
        const track = this.plugin.tracks.find((candidate) => candidate.path === play.path);
        if (track) {
          this.playTrack(track);
        }
      });
    });
  }

  private renderModeButton(parent: HTMLElement): void {
    const button = parent.createEl("button", { cls: "vaultcast-pill-button" });
    setIcon(button, modeIcon(this.plugin.playbackStore.state.playbackMode));
    button.createSpan({ text: modeLabel(this.plugin.playbackStore.state.playbackMode) });
    button.addEventListener("click", () => {
      void (async () => {
      const current = this.plugin.playbackStore.state.playbackMode;
      const next = MODES[(MODES.indexOf(current) + 1) % MODES.length];
      this.plugin.settings.playbackMode = next;
      this.plugin.playbackStore.setPlaybackMode(next);
      await this.plugin.savePluginData();
      this.render();
      })();
    });
  }

  private renderSpeedSelect(parent: HTMLElement): void {
    const select = parent.createEl("select", { cls: "vaultcast-select" });
    SPEEDS.forEach((speed) => {
      select.createEl("option", {
        text: `${speed}x`,
        value: String(speed)
      });
    });
    select.value = String(this.plugin.playbackStore.state.playbackSpeed);
    select.addEventListener("change", () => {
      void (async () => {
      const speed = Number(select.value);
      this.audio.playbackRate = speed;
      this.plugin.playbackStore.setSpeed(speed);
      await this.plugin.savePluginData();
      })();
    });
  }

  private renderVolume(parent: HTMLElement): void {
    const wrap = parent.createDiv({ cls: "vaultcast-volume" });
    setIcon(wrap.createSpan(), "volume-2");
    wrap.createSpan({ cls: "vaultcast-volume-label", text: "Volume" });
    const volume = wrap.createEl("input", {
      attr: {
        type: "range",
        min: "0",
        max: "1",
        step: "0.05",
        value: String(this.plugin.playbackStore.state.volume)
      }
    });
    volume.addEventListener("input", () => {
      void (async () => {
      const value = Number(volume.value);
      this.audio.volume = value;
      this.plugin.playbackStore.setVolume(value);
      await this.plugin.savePluginData();
      })();
    });
  }

  private createIconButton(
    parent: HTMLElement,
    icon: string,
    label: string,
    onClick: () => void,
    extraClass = ""
  ): HTMLButtonElement {
    const button = parent.createEl("button", {
      cls: `vaultcast-icon-button ${extraClass}`,
      attr: { "aria-label": label }
    });
    setIcon(button, icon);
    button.addEventListener("click", onClick);
    return button;
  }

  private togglePlay(): void {
    if (!this.currentTrack) {
      const track = this.plugin.tracks.find((candidate) => candidate.path === this.plugin.playbackStore.state.lastPlayedFile)
        ?? this.plugin.tracks[0];
      if (track) {
        this.playTrack(track);
      }
      return;
    }

    if (this.audio.paused) {
      void this.audio.play();
    } else {
      this.audio.pause();
    }
  }

  private playRelative(offset: number): void {
    if (this.plugin.tracks.length === 0) {
      return;
    }

    const currentIndex = this.currentTrack
      ? this.plugin.tracks.findIndex((track) => track.path === this.currentTrack?.path)
      : -1;
    const nextIndex = currentIndex < 0
      ? 0
      : (currentIndex + offset + this.plugin.tracks.length) % this.plugin.tracks.length;

    this.playTrack(this.plugin.tracks[nextIndex]);
  }

  private playAfterEnd(): void {
    if (!this.currentTrack) {
      return;
    }

    const mode = this.plugin.playbackStore.state.playbackMode;

    if (mode === "single-loop") {
      this.playTrack(this.currentTrack);
      return;
    }

    if (mode === "shuffle") {
      const choices = this.plugin.tracks.filter((track) => track.path !== this.currentTrack?.path);
      const next = choices[Math.floor(Math.random() * choices.length)] ?? this.currentTrack;
      this.playTrack(next);
      return;
    }

    const currentIndex = this.plugin.tracks.findIndex((track) => track.path === this.currentTrack?.path);
    const nextIndex = currentIndex + 1;

    if (nextIndex < this.plugin.tracks.length) {
      this.playTrack(this.plugin.tracks[nextIndex]);
      return;
    }

    if (mode === "playlist-loop" && this.plugin.tracks[0]) {
      this.playTrack(this.plugin.tracks[0]);
    }
  }

  private filteredTracks(): AudioTrack[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      return this.plugin.tracks;
    }

    return this.plugin.tracks.filter((track) => {
      return track.title.toLowerCase().includes(query) || track.path.toLowerCase().includes(query);
    });
  }

  private persistProgress(force: boolean, completed = false): void {
    if (!this.currentTrack) {
      return;
    }

    const now = Date.now();
    if (!force && now - this.lastSavedAt < 5000) {
      return;
    }

    this.lastSavedAt = now;
    const duration = Number.isFinite(this.audio.duration) ? this.audio.duration : 0;
    const position = Number.isFinite(this.audio.currentTime) ? this.audio.currentTime : 0;
    const isComplete = completed || (duration > 0 && position / duration >= 0.99);

    this.plugin.playbackStore.saveProgress(
      this.currentTrack,
      position,
      duration,
      isComplete
    );
    this.plugin.trimRecentPlays();
    void this.plugin.savePluginData();
  }

  private progressValue(): number {
    if (!Number.isFinite(this.audio.duration) || this.audio.duration <= 0) {
      return 0;
    }

    return Math.round((this.audio.currentTime / this.audio.duration) * 1000);
  }

  private updateProgressOnly(): void {
    const root = this.containerEl;
    const current = root.querySelector(".vaultcast-current-time");
    const duration = root.querySelector(".vaultcast-duration");
    const progress = root.querySelector<HTMLInputElement>(".vaultcast-progress");

    if (current) {
      current.textContent = formatTime(this.audio.currentTime);
    }
    if (duration) {
      duration.textContent = formatTime(this.audio.duration);
    }
    if (progress) {
      progress.value = String(this.progressValue());
    }
  }
}

function formatTime(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return "00:00";
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatDate(value: number): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
}

function modeIcon(mode: PlaybackMode): string {
  if (mode === "shuffle") return "shuffle";
  if (mode === "single-loop") return "repeat-1";
  if (mode === "sequential") return "list-end";
  return "repeat";
}

function modeLabel(mode: PlaybackMode): string {
  if (mode === "shuffle") return "Shuffle";
  if (mode === "single-loop") return "One";
  if (mode === "sequential") return "Once";
  return "Loop";
}
