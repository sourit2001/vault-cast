# VaultCast

VaultCast is a cute private podcast player for local audio files in your Obsidian vault.

It is designed for people who generate, download, or sync audio into their vault and want one simple player instead of opening audio files one by one.

## Features

- Scan a vault folder for local audio files
- Play audio inside Obsidian
- Play, pause, previous, and next controls
- Seek with a full-width progress bar
- Volume and playback speed controls
- Playback modes: sequential, playlist loop, single loop, and shuffle
- Searchable playlist
- Sort by name, created time, or modified time
- Resume from the last saved position
- Mark tracks as completed after listening
- Recent plays list
- Seasonal themes: Default, Spring, Summer, Autumn, and Winter
- Open same-name Markdown notes for audio files
- Mobile-friendly main-area player command

Supported audio formats:

- `.mp3`
- `.m4a`
- `.wav`
- `.flac`
- `.aac`

## Installation

### From Obsidian Community Plugins

VaultCast is not yet listed in the official Community Plugins directory.

### Manual Installation

Download these files from the latest GitHub release:

- `manifest.json`
- `main.js`
- `styles.css`

Place them in:

```text
<your-vault>/.obsidian/plugins/vaultcast/
```

Then restart Obsidian and enable VaultCast from:

```text
Settings -> Community plugins -> Installed plugins
```

## Usage

1. Put audio files in a folder inside your vault, for example:

   ```text
   Audio/
   ```

2. Open:

   ```text
   Settings -> VaultCast
   ```

3. Set **Audio folder** to the vault-relative folder path.

4. Run the command:

   ```text
   Open VaultCast player
   ```

5. Press **Play latest** or choose a track from the playlist.

## Audio Folder Paths

VaultCast uses vault-relative paths.

For example, if your full folder path is:

```text
/Users/you/Documents/My Vault/TTS Audio
```

and your vault root is:

```text
/Users/you/Documents/My Vault
```

then set the VaultCast audio folder to:

```text
TTS Audio
```

Do not enter the full computer path.

More examples:

```text
Audio
Daily Audio
Podcasts/TTS
Assets/Audio
```

## Mobile

On mobile, use the command:

```text
Open VaultCast player
```

VaultCast will open in the main workspace area so it feels more like a full-page player.

There is also a desktop-friendly command:

```text
Open VaultCast player in main area
```

## Settings

- **Audio folder**: folder to scan for audio files
- **Choose audio folder**: pick from folders in the current vault
- **Default speed**: default playback speed
- **Auto resume**: continue from saved position
- **Auto scan**: refresh when files change
- **Sort method**: name, created time, or modified time
- **Sort direction**: ascending or descending
- **Playback mode**: loop, sequential, single loop, or shuffle
- **Theme**: seasonal visual theme
- **Recent plays limit**: number of recent tracks to keep

## Development

Install dependencies:

```bash
npm install
```

Build:

```bash
npm run build
```

Development watch mode:

```bash
npm run dev
```

## Roadmap

- Better mobile layout refinements
- Optional custom cover image
- Per-track cover matching
- Folder-specific playlists
- Keyboard shortcuts

## License

MIT
