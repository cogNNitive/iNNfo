# cogNNitive Launcher

The Launcher is a Vue 3 + Vite application that serves as the entry point for the FORMAT ecosystem.

## How it works

1. **Drop or select** — drag a `.md` file or an entire folder onto the drop zone, or use the file/folder picker buttons
2. **Detect mode** — the Launcher reads the FORMAT frontmatter using `@innv0/format-core`'s `parseFrontmatter` and identifies the mode: `FILE`, `FOLDER`, or `BOTH`
3. **Launch editor** — depending on the detected mode, it opens the model in the appropriate editor (file-format for FILE mode, folder-format for FOLDER mode)

## Detection Logic

| Input | Detected Mode | Action |
|-------|--------------|--------|
| Single `.md` with `mode: FILE` | FILE | Open in file-format |
| Single `.md` with `mode: FOLDER` | FOLDER | Open in folder-format |
| Single `.md` with `mode: [FILE, FOLDER]` | BOTH | Show both options |
| Folder with `_FORMAT.md` having `mode: FOLDER` | FOLDER | Open in folder-format |
| Folder with `_FORMAT.md` having `mode: FILE` | FILE | Open in file-format |
| No valid frontmatter | NONE | Show error |

## Configuration

The Launcher reads editor URLs from environment variables:

```bash
VITE_FILE_FORMAT_URL=https://format.innv0.com/app
VITE_FOLDER_FORMAT_URL=http://localhost:5174
```

## Development

```bash
# From repo root
npm run dev -w @innv0/launcher
```
