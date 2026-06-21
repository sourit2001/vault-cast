import { Notice, Platform, Plugin, TAbstractFile } from "obsidian";
import { AudioLibrary } from "./audio-library";
import { DEFAULT_PLAYBACK_STATE, DEFAULT_SETTINGS } from "./defaults";
import { PlaybackStore } from "./playback-store";
import { VAULTCAST_VIEW_TYPE, VaultCastPlayerView } from "./player-view";
import { VaultCastSettingTab } from "./settings";
import { AudioTrack, VaultCastData, VaultCastSettings } from "./types";

export default class VaultCastPlugin extends Plugin {
  settings: VaultCastSettings = { ...DEFAULT_SETTINGS };
  playbackStore = new PlaybackStore(DEFAULT_PLAYBACK_STATE);
  audioLibrary!: AudioLibrary;
  tracks: AudioTrack[] = [];

  async onload(): Promise<void> {
    await this.loadPluginData();

    this.audioLibrary = new AudioLibrary(this.app);
    this.refreshLibrary();

    this.registerView(
      VAULTCAST_VIEW_TYPE,
      (leaf) => new VaultCastPlayerView(leaf, this)
    );

    this.addRibbonIcon("headphones", "Open VaultCast", () => {
      void this.activateView(Platform.isMobile);
    });

    this.addCommand({
      id: "open-vaultcast-player",
      name: "Open VaultCast player",
      callback: () => {
        void this.activateView(Platform.isMobile);
      }
    });

    this.addCommand({
      id: "open-vaultcast-player-main",
      name: "Open VaultCast player in main area",
      callback: () => {
        void this.activateView(true);
      }
    });

    this.addCommand({
      id: "refresh-vaultcast-library",
      name: "Refresh VaultCast library",
      callback: () => {
        this.refreshLibrary();
        new Notice("VaultCast playlist refreshed");
      }
    });

    this.registerEvent(this.app.vault.on("create", (file) => this.onVaultFileChanged(file)));
    this.registerEvent(this.app.vault.on("modify", (file) => this.onVaultFileChanged(file)));
    this.registerEvent(this.app.vault.on("delete", (file) => this.onVaultFileChanged(file)));
    this.registerEvent(this.app.vault.on("rename", (file) => this.onVaultFileChanged(file)));

    this.addSettingTab(new VaultCastSettingTab(this.app, this));
  }

  onunload(): void {
    this.app.workspace.detachLeavesOfType(VAULTCAST_VIEW_TYPE);
  }

  async activateView(openInMainArea = false): Promise<void> {
    if (openInMainArea) {
      const leaf = this.app.workspace.getLeaf(true);
      await leaf.setViewState({
        type: VAULTCAST_VIEW_TYPE,
        active: true
      });
      this.app.workspace.revealLeaf(leaf);
      return;
    }

    const leaves = this.app.workspace.getLeavesOfType(VAULTCAST_VIEW_TYPE);
    let leaf = leaves[0];

    if (!leaf) {
      leaf = this.app.workspace.getRightLeaf(false) ?? this.app.workspace.getLeaf(true);
      await leaf.setViewState({
        type: VAULTCAST_VIEW_TYPE,
        active: true
      });
    }

    this.app.workspace.revealLeaf(leaf);
  }

  refreshLibrary(): void {
    if (!this.audioLibrary) {
      return;
    }

    this.tracks = this.audioLibrary.scan(
      this.settings.audioFolder,
      this.settings.sortMethod,
      this.settings.sortDirection
    );
    this.refreshActiveView();
  }

  refreshActiveView(): void {
    this.app.workspace.getLeavesOfType(VAULTCAST_VIEW_TYPE).forEach((leaf) => {
      if (leaf.view instanceof VaultCastPlayerView) {
        leaf.view.refresh();
      }
    });
  }

  trimRecentPlays(): void {
    this.playbackStore.state.recentPlays = this.playbackStore.state.recentPlays.slice(
      0,
      this.settings.recentPlaysLimit
    );
  }

  async loadPluginData(): Promise<void> {
    const data = (await this.loadData()) as Partial<VaultCastData> | null;
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...data?.settings
    };
    this.playbackStore = new PlaybackStore({
      ...DEFAULT_PLAYBACK_STATE,
      ...data?.playback,
      playbackSpeed: data?.playback?.playbackSpeed ?? this.settings.defaultSpeed,
      playbackMode: data?.playback?.playbackMode ?? this.settings.playbackMode
    });
  }

  async savePluginData(): Promise<void> {
    await this.saveData({
      settings: this.settings,
      playback: this.playbackStore.state
    } satisfies VaultCastData);
  }

  private onVaultFileChanged(file: TAbstractFile): void {
    if (!this.settings.autoScan) {
      return;
    }

    const path = file.path.toLowerCase();
    const folder = this.settings.audioFolder.trim().replace(/^\/+|\/+$/g, "").toLowerCase();
    const isInAudioFolder = !folder || path === folder || path.startsWith(`${folder}/`);
    const isPotentialAudio = /\.(mp3|m4a|wav|flac|aac)$/.test(path);

    if (isInAudioFolder || isPotentialAudio) {
      this.refreshLibrary();
    }
  }
}
