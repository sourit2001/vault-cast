import { App, PluginSettingTab, Setting, TFolder } from "obsidian";
import type VaultCastPlugin from "./main";
import { THEME_OPTIONS } from "./theme";
import { PlaybackMode, SortDirection, SortMethod, VaultCastTheme } from "./types";

export class VaultCastSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: VaultCastPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("General")
      .setHeading();

    new Setting(containerEl)
      .setName("Audio folder")
      .setDesc("Folder inside this vault that contains your audio files. Use a vault-relative path, such as TTS Audio.")
      .addText((text) => {
        text
          .setPlaceholder("Audio")
          .setValue(this.plugin.settings.audioFolder)
          .onChange((value) => {
            this.plugin.settings.audioFolder = value.trim() || "Audio";
            void this.saveAndRefreshLibrary();
          });
      });

    new Setting(containerEl)
      .setName("Choose audio folder")
      .setDesc("Pick from folders currently found in this vault.")
      .addDropdown((dropdown) => {
        const folders = getVaultFolders(this.app);
        const current = this.plugin.settings.audioFolder;

        if (!folders.includes(current)) {
          dropdown.addOption(current, current);
        }

        folders.forEach((folder) => {
          dropdown.addOption(folder, folder);
        });
        dropdown
          .setValue(current)
          .onChange((value) => {
            this.plugin.settings.audioFolder = value;
            void this.saveAndRefreshLibrary();
          });
      });

    new Setting(containerEl)
      .setName("Default speed")
      .setDesc("Playback speed used when the player opens.")
      .addDropdown((dropdown) => {
        ["0.75", "1", "1.25", "1.5", "2"].forEach((speed) => {
          dropdown.addOption(speed, `${speed}x`);
        });
        dropdown
          .setValue(String(this.plugin.settings.defaultSpeed))
          .onChange((value) => {
            this.plugin.settings.defaultSpeed = Number(value);
            this.plugin.playbackStore.setSpeed(Number(value));
            void this.saveAndRefreshActiveView();
          });
      });

    new Setting(containerEl)
      .setName("Auto resume")
      .setDesc("Continue from the saved position when reopening a track.")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.autoResume)
          .onChange((value) => {
            this.plugin.settings.autoResume = value;
            void this.plugin.savePluginData();
          });
      });

    new Setting(containerEl)
      .setName("Auto scan")
      .setDesc("Refresh the playlist when audio files change.")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.autoScan)
          .onChange((value) => {
            this.plugin.settings.autoScan = value;
            void this.plugin.savePluginData();
          });
      });

    new Setting(containerEl)
      .setName("Sort method")
      .setDesc("How the playlist is sorted.")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("modifiedTime", "Modified time")
          .addOption("createdTime", "Created time")
          .addOption("name", "Name")
          .setValue(this.plugin.settings.sortMethod)
          .onChange((value) => {
            this.plugin.settings.sortMethod = value as SortMethod;
            void this.saveAndRefreshLibrary();
          });
      });

    new Setting(containerEl)
      .setName("Sort direction")
      .setDesc("Newest first is usually best for daily audio.")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("desc", "Descending")
          .addOption("asc", "Ascending")
          .setValue(this.plugin.settings.sortDirection)
          .onChange((value) => {
            this.plugin.settings.sortDirection = value as SortDirection;
            void this.saveAndRefreshLibrary();
          });
      });

    new Setting(containerEl)
      .setName("Playback mode")
      .setDesc("What happens when a track ends.")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("playlist-loop", "Playlist loop")
          .addOption("sequential", "Sequential")
          .addOption("single-loop", "Single loop")
          .addOption("shuffle", "Shuffle")
          .setValue(this.plugin.settings.playbackMode)
          .onChange((value) => {
            this.plugin.settings.playbackMode = value as PlaybackMode;
            this.plugin.playbackStore.setPlaybackMode(value as PlaybackMode);
            void this.saveAndRefreshActiveView();
          });
      });

    new Setting(containerEl)
      .setName("Theme")
      .setDesc("A simple seasonal skin for the player.")
      .addDropdown((dropdown) => {
        THEME_OPTIONS.forEach((theme) => {
          dropdown.addOption(theme.value, theme.label);
        });
        dropdown
          .setValue(this.plugin.settings.theme)
          .onChange((value) => {
            this.plugin.settings.theme = value as VaultCastTheme;
            void this.saveAndRefreshActiveView();
          });
      });

    new Setting(containerEl)
      .setName("Recent plays limit")
      .setDesc("How many recently played tracks to keep.")
      .addSlider((slider) => {
        slider
          .setLimits(3, 20, 1)
          .setValue(this.plugin.settings.recentPlaysLimit)
          .onChange((value) => {
            this.plugin.settings.recentPlaysLimit = value;
            this.plugin.trimRecentPlays();
            void this.saveAndRefreshActiveView();
          });
      });
  }

  private async saveAndRefreshLibrary(): Promise<void> {
    await this.plugin.savePluginData();
    this.plugin.refreshLibrary();
  }

  private async saveAndRefreshActiveView(): Promise<void> {
    await this.plugin.savePluginData();
    this.plugin.refreshActiveView();
  }
}

function getVaultFolders(app: App): string[] {
  const folders = app.vault
    .getAllLoadedFiles()
    .filter((file): file is TFolder => file instanceof TFolder)
    .map((folder) => folder.path)
    .filter((path) => path.length > 0)
    .sort((a, b) => a.localeCompare(b));

  return folders.length > 0 ? folders : ["TTS Audio"];
}
