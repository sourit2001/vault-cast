import { App, TFile } from "obsidian";
import { AUDIO_EXTENSIONS, AudioTrack, IMAGE_EXTENSIONS, SortDirection, SortMethod } from "./types";

const FOLDER_COVER_NAMES = ["cover", "folder", "album", "artwork"];

export class AudioLibrary {
  constructor(private readonly app: App) {}

  scan(audioFolder: string, sortMethod: SortMethod, sortDirection: SortDirection): AudioTrack[] {
    const normalizedFolder = normalizeFolder(audioFolder);
    const files = this.app.vault.getFiles();
    const filesByPath = new Map(files.map((file) => [file.path, file]));

    return files
      .filter((file) => this.isAudioInFolder(file, normalizedFolder))
      .map((file) => this.toTrack(file, filesByPath))
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

  getCoverResourcePath(track: AudioTrack): string | null {
    if (!track.coverPath) {
      return null;
    }

    const file = this.app.vault.getAbstractFileByPath(track.coverPath);
    return file instanceof TFile ? this.app.vault.getResourcePath(file) : null;
  }

  async saveCoverForTrack(track: AudioTrack, source: File): Promise<string> {
    const extension = imageExtension(source);
    if (!extension) {
      throw new Error("Unsupported image type");
    }

    const coverPath = withExtension(track.path, extension);
    const existing = this.app.vault.getAbstractFileByPath(coverPath);
    const data = await source.arrayBuffer();

    if (existing instanceof TFile) {
      await this.app.vault.modifyBinary(existing, data);
    } else {
      await this.app.vault.createBinary(coverPath, data);
    }

    return coverPath;
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

  private toTrack(file: TFile, filesByPath: Map<string, TFile>): AudioTrack {
    return {
      path: file.path,
      name: file.name,
      title: file.basename,
      extension: file.extension.toLowerCase(),
      createdTime: file.stat.ctime,
      modifiedTime: file.stat.mtime,
      coverPath: findCoverPath(file, filesByPath),
      notePath: findNotePath(file, filesByPath)
    };
  }
}

function normalizeFolder(folder: string): string {
  return folder.trim().replace(/^\/+|\/+$/g, "");
}

function findCoverPath(file: TFile, filesByPath: Map<string, TFile>): string | undefined {
  const folder = parentFolder(file.path);
  const candidates = [
    ...IMAGE_EXTENSIONS.map((extension) => joinPath(folder, `${file.basename}.${extension}`)),
    ...IMAGE_EXTENSIONS.map((extension) => joinPath(folder, `${file.basename}.cover.${extension}`)),
    ...FOLDER_COVER_NAMES.flatMap((name) => (
      IMAGE_EXTENSIONS.map((extension) => joinPath(folder, `${name}.${extension}`))
    ))
  ];

  return candidates.find((path) => filesByPath.has(path));
}

function findNotePath(file: TFile, filesByPath: Map<string, TFile>): string | undefined {
  const folder = parentFolder(file.path);
  const notePath = joinPath(folder, `${file.basename}.md`);
  return filesByPath.has(notePath) ? notePath : undefined;
}

function parentFolder(path: string): string {
  const index = path.lastIndexOf("/");
  return index >= 0 ? path.slice(0, index) : "";
}

function joinPath(folder: string, name: string): string {
  return folder ? `${folder}/${name}` : name;
}

function withExtension(path: string, extension: string): string {
  const dotIndex = path.lastIndexOf(".");
  const slashIndex = path.lastIndexOf("/");
  const base = dotIndex > slashIndex ? path.slice(0, dotIndex) : path;
  return `${base}.${extension}`;
}

function imageExtension(file: File): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension && IMAGE_EXTENSIONS.includes(extension as never)) {
    return extension === "jpeg" ? "jpg" : extension;
  }

  if (file.type === "image/jpeg") {
    return "jpg";
  }

  const mimeExtension = file.type.replace(/^image\//, "").toLowerCase();
  return IMAGE_EXTENSIONS.includes(mimeExtension as never) ? mimeExtension : null;
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
