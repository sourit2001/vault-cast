# VaultCast - Obsidian Podcast Player

Version: V1.0 MVP

Author: Li Zhu

Status: Draft

Last Updated: 2026-06-21

---

## 1. Product Overview

VaultCast is an Obsidian plugin that turns a local Obsidian vault into a private podcast player.

The first version focuses on one clear workflow:

1. Audio files are generated or synced into the vault every day.
2. VaultCast automatically discovers the latest audio files.
3. The user opens one player panel and listens directly inside Obsidian.

VaultCast is mainly for:

- Obsidian users
- AI daily brief listeners
- RSS/TTS users
- Personal knowledge management users
- People who store audio and notes together in one vault

V1 does not generate audio, summarize audio, transcribe audio, or provide cloud sync. It only provides a stable and pleasant listening experience for local audio files already inside the vault.

---

## 2. Design Principles

Core principle:

**Simple, stable, fast.**

VaultCast should prioritize:

- Automatic local audio discovery
- Smooth playback
- Reliable playback progress saving
- A beautiful but uncluttered player interface
- Fast access to today's newest audio
- Minimal setup

VaultCast should avoid in V1:

- AI summary generation
- TTS generation
- Whisper transcription
- Remote cloud sync
- User accounts
- Payment or licensing

---

## 3. Primary User Story

The user already has a daily automation that creates TTS audio files inside an iCloud-synced Obsidian vault.

Today, listening is inconvenient because the user has to open audio files one by one in Obsidian.

VaultCast should solve this by providing one dedicated player panel:

- The newest audio appears automatically.
- The user can press play immediately.
- The player remembers where the user stopped.
- The playlist is sorted by time, so daily audio feels like a private podcast feed.

---

## 4. iCloud Sync Boundary

VaultCast does not connect to iCloud directly.

Instead, it relies on the local Obsidian vault file system:

- iCloud syncs files into the vault.
- Obsidian sees those files as local files.
- VaultCast scans and watches the configured audio folder inside the vault.
- When iCloud adds or updates an audio file, VaultCast refreshes the playlist.

This keeps the plugin simple and compatible with Obsidian's local-first model.

Recommended folder examples:

```text
Audio/
Daily Audio/
Podcasts/
TTS/
```

Default folder for this vault:

```text
TTS Audio/
```

---

## 5. MVP Features

### 5.1 Audio Folder Scan

The user can specify an audio folder in plugin settings.

Supported formats:

- `.mp3`
- `.m4a`
- `.wav`
- `.flac`
- `.aac`

Requirements:

- Scan automatically when the plugin loads.
- Support subfolders.
- Provide a manual refresh button.
- Refresh when audio files are created, modified, renamed, or deleted.
- Ignore unsupported files.
- Keep scanning fast for large vaults.

Default behavior:

- Audio folder: `TTS Audio`
- Sort method: `Modified Time DESC`
- Newest audio appears first.

### 5.2 Podcast Player Panel

VaultCast provides a dedicated Obsidian sidebar view.

The panel should feel like a compact podcast player, not a raw file browser.

Primary sections:

- Header: `VaultCast`
- Cover/skin area
- Current track title
- Optional file metadata
- Progress bar
- Current time / total duration
- Playback controls
- Speed control
- Volume control
- Playback mode control
- Playlist
- Recent plays

Example layout:

```text
VaultCast

[Cover Image / Skin Area]

AI Daily Brief
08:35 / 25:10
[progress bar]

[previous] [play/pause] [next]
[mode] [1.5x] [volume]

Playlist
✓ AI Daily Brief
  Reddit Trends
  Google Trends
  Serenity
```

### 5.3 Playback Controls

Basic controls:

- Play
- Pause
- Previous
- Next

Progress controls:

- Drag progress bar to seek.
- Click progress bar to jump.
- Show elapsed time.
- Show total duration when metadata is available.

Volume:

- Volume slider.
- Persist the user's last selected volume.

Speed:

- `0.75x`
- `1.0x`
- `1.25x`
- `1.5x`
- `2.0x`

Default speed:

- `1.5x`

### 5.4 Playback Modes

Supported modes:

- Sequential: `A -> B -> C -> Stop`
- Playlist loop: `A -> B -> C -> A`
- Single loop: `A -> A -> A`
- Shuffle: random next track from the playlist

Default mode:

- Playlist loop

### 5.5 Playlist

The playlist displays all discovered audio files.

Requirements:

- Click a track to play.
- Highlight the currently playing track.
- Show basic metadata:
  - Display title
  - File path or folder
  - Modified date
  - Duration when available
  - Saved playback progress
- Search by filename.
- Sort by:
  - Name
  - Created time
  - Modified time
- Sort direction:
  - Ascending
  - Descending

Default:

- Modified time descending

### 5.6 Play Latest Audio

VaultCast should make the daily listening workflow very quick.

Requirements:

- The newest audio should be visible at the top by default.
- Provide a clear "play latest" action.
- If the latest audio has saved progress, follow the auto resume setting.

### 5.7 Resume Playback

VaultCast automatically saves playback progress.

Saved per audio file:

- Last position
- Duration
- Last played time
- Playback completed status when possible

When reopening Obsidian:

- If auto resume is on, continue from the saved position.
- If auto resume is off, start from the beginning.

Future optional behavior:

- Ask: "Continue from 13:25?"
- Actions:
  - Continue
  - Start over

Default:

- Auto resume: ON

### 5.8 Recent Plays

VaultCast keeps a recent listening list.

Default count:

- 10

Saved fields:

- File path
- Display title
- Last played time
- Last position
- Duration
- Progress percentage

---

## 6. Theme System

V1 should include a simple visual theme system.

The goal is to make the player feel cute, pleasant, and personal without making the first version too complex.

Cover customization is not a priority for V1. The first version only needs a few simple default visual styles.

### 6.1 Built-In Seasonal Themes

Initial built-in themes should be seasonal and friendly:

- Spring
- Summer
- Autumn
- Winter
- Default

Theme settings may control:

- Background
- Accent color
- Text color
- Button style
- Progress bar color
- Playlist highlight
- Cover/visual area gradient

Theme direction:

- Cute and warm
- Light enough for daily use
- Clean enough for reading filenames
- Soft color contrast
- Not too corporate or technical

Possible theme examples:

- Spring: soft green, pink, and warm white
- Summer: sky blue, lemon, and clean white
- Autumn: amber, warm red, and cream
- Winter: icy blue, lavender, and deep navy

### 6.2 Default Visual Area

The player should include a simple visual area above the track title.

For V1, this can be generated with CSS instead of custom user images:

- Seasonal gradient background
- Simple icon or decorative shape
- Current theme color treatment

This area should make the player feel more polished than a plain file list, while still keeping the implementation simple.

### 6.3 Custom Cover Image

Custom cover image is optional and can be delayed to V1.1.

Possible future setting:

```text
Cover Image Path: Assets/vaultcast-cover.png
```

Supported formats:

- `.png`
- `.jpg`
- `.jpeg`
- `.webp`
- `.gif`

Behavior:

- If a custom cover exists, show it in the player.
- If no custom cover exists, show a built-in visual background.
- If the image path is invalid, fall back gracefully.

### 6.4 Per-Track Cover Matching

This is not required for V1 and can be V1.1 or later.

Possible matching rules:

- `Audio/AI Daily.mp3` uses `Audio/AI Daily.jpg`
- `Audio/AI Daily.mp3` uses `Audio/AI Daily.png`
- Folder-level cover: `Audio/cover.jpg`

Priority:

1. Same-name track cover
2. Folder cover
3. Global custom cover
4. Built-in fallback cover

### 6.5 Custom CSS Theme

Custom CSS is not required for V1.

Possible V1.5 setting:

```text
Custom Theme CSS Path: Assets/vaultcast.css
```

---

## 7. Settings

Settings panel:

```text
Settings
└─ VaultCast
```

Settings:

- Audio Folder
  - Default: `TTS Audio`
- Default Speed
  - Default: `1.5x`
- Auto Resume
  - Default: ON
- Auto Scan
  - Default: ON
- Sort Method
  - Default: Modified Time
- Sort Direction
  - Default: Descending
- Playback Mode
  - Default: Playlist loop
- Theme
  - Default: Default
- Recent Plays Limit
  - Default: 10

V1.1 or later settings:

- Cover Image Path
  - Default: empty
- Custom Theme CSS Path
  - Default: empty

---

## 8. Technical Stack

Framework:

- Obsidian Plugin API
- TypeScript

Audio engine:

- HTML5 Audio API

Storage:

- Obsidian Plugin Data API

Build:

- TypeScript
- esbuild

Suggested project files:

```text
manifest.json
package.json
tsconfig.json
esbuild.config.mjs
main.ts
styles.css
versions.json
```

Suggested source structure:

```text
src/
  main.ts
  settings.ts
  player-view.ts
  audio-library.ts
  playback-store.ts
  theme.ts
  types.ts
styles.css
```

---

## 9. Data Model

### 9.1 Plugin Settings

```json
{
  "audioFolder": "TTS Audio",
  "defaultSpeed": 1.5,
  "autoResume": true,
  "autoScan": true,
  "sortMethod": "modifiedTime",
  "sortDirection": "desc",
  "playbackMode": "playlist-loop",
  "theme": "default",
  "recentPlaysLimit": 10
}
```

### 9.2 Playback State

```json
{
  "lastPlayedFile": "",
  "playbackSpeed": 1.5,
  "volume": 0.8,
  "playbackMode": "playlist-loop",
  "positions": {
    "Audio/AI Daily Brief.mp3": {
      "position": 805,
      "duration": 1510,
      "lastPlayedAt": 1782032400000,
      "completed": false
    }
  },
  "recentPlays": [
    {
      "path": "Audio/AI Daily Brief.mp3",
      "title": "AI Daily Brief",
      "lastPlayedAt": 1782032400000,
      "position": 805,
      "duration": 1510
    }
  ]
}
```

### 9.3 Audio Track

Runtime track object:

```ts
interface AudioTrack {
  path: string;
  name: string;
  title: string;
  extension: string;
  createdTime: number;
  modifiedTime: number;
  duration?: number;
  coverPath?: string;
}
```

---

## 10. UI Direction

The player should be visually pleasant but not heavy.

Recommended style:

- Compact podcast-player feeling
- Large enough controls for daily use
- Clear current-track focus
- Smooth progress display
- Polished cover area
- Playlist optimized for scanning

Avoid:

- A plain file list with tiny controls
- Too many visible settings in the player panel
- Decorative UI that makes playback harder
- Large landing-page style hero sections

The interface should work well in a narrow Obsidian sidebar.

---

## 11. Non-Goals For V1

AI:

- Podcast summary
- Show notes
- Daily brief generation
- AI tagging

Audio processing:

- Whisper
- Speech to text
- TTS generation
- Audio conversion

Sync:

- Direct iCloud API integration
- Cloud accounts
- Cross-device account sync

Commerce:

- Payment
- License system

---

## 12. Roadmap

### V1.0

- Local audio scanning
- Player panel
- Playback controls
- Playlist
- Search and sorting
- Resume playback
- Recent plays
- Seasonal built-in themes
- Simple default visual area

### V1.1

- Global custom cover image
- Per-track cover matching
- Folder cover matching
- Play latest button refinement
- Better duration extraction and caching
- Keyboard shortcuts
- Track completion indicators

### V1.5

- Custom CSS theme file
- More built-in skins
- Folder-specific playlists
- Playlist filters
- Link audio files to Markdown notes

### V2

- AI-generated podcast summaries
- Show notes
- Chapter extraction
- Knowledge extraction:
  - People
  - Companies
  - Stocks
  - Products
- Write extracted information back to Obsidian notes

### V3

Full private podcast workspace:

```text
Markdown
-> TTS
-> Audio
-> Listen
-> Summary
-> Knowledge Base
```

Long-term goal:

Make Obsidian a private podcast and knowledge management workspace.
