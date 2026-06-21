import { App, TFile } from "obsidian";
import { AUDIO_EXTENSIONS, AudioTrack, SortDirection, SortMethod } from "./types";

export class AudioLibrary {
  constructor(private readonly app: App) {}

  scan(audioFolder: string, sortMethod: SortMethod, sortDirection: SortDirection): AudioTrack[] {
    const normalizedFolder = normalizeFolder(audioFolder);
    const files = this.app.vault.getFiles();

    return files
      .filter((file) => this.isAudioInFolder(file, normalizedFolder))
      .map((file) => this.toTrack(file))
      .sort((a, b) => compareTracks(a, b, sortMethod, sortDirection));
  }

  getFile(path: string): TFile | null {
    const file = this.app.vault.getAbstractFileByPath(path);
    return file instanceof TFile ? file : null;
  }

  getResourcePath(track: AudioTrack): string | null {
    const file = this.getFile(track.path);
    return file ? this.app.vault.getResourcePath(file) : null;
  }

  private isAudioInFolder(file: TFile, audioFolder: string): boolean {
    if (!AUDIO_EXTENSIONS.includes(file.extension.toLowerCase() as never)) {
      return false;
    }

    if (!audioFolder) {
      return true;
    }

    return file.path === audioFolder || file.path.startsWith(`${audioFolder}/`);
  }

  private toTrack(file: TFile): AudioTrack {
    return {
      path: file.path,
      name: file.name,
      title: file.basename,
      extension: file.extension.toLowerCase(),
      createdTime: file.stat.ctime,
      modifiedTime: file.stat.mtime
    };
  }
}

function normalizeFolder(folder: string): string {
  return folder.trim().replace(/^\/+|\/+$/g, "");
}

function compareTracks(
  a: AudioTrack,
  b: AudioTrack,
  sortMethod: SortMethod,
  sortDirection: SortDirection
): number {
  const direction = sortDirection === "asc" ? 1 : -1;

  if (sortMethod === "name") {
    return a.title.localeCompare(b.title) * direction;
  }

  return (a[sortMethod] - b[sortMethod]) * direction;
}
