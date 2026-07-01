# cogNNitive Launcher

The Launcher is a Vue 3 + Vite application that serves as the entry point for the FORMAT ecosystem.

## How it works

1. **Open a folder** — click "Abrir carpeta" or drag a folder onto the drop zone
2. **Scan & validate** — the Launcher scans every markdown file using `@innv0/format-core`, identifies FORMAT-compliant folders (`_FORMAT.md`) and files (`.md` with FORMAT frontmatter)
3. **Explore** — the contents are displayed in a visual browser:
   - **Folders** — subdirectories with `_FORMAT.md` (folder-format compliant)
   - **Documents** — markdown files with their title and FORMAT mode
4. **Open** — click any item to open it in the appropriate editor:
   - Folder → **folder-format** (transparent to the user)
   - File → **file-format**

## Folder structure

```
root/
├── _FORMAT.md              ← root model (validated with full report)
├── architecture/
│   └── _FORMAT.md          ← subfolder compliant (folder-format)
├── requirements.md         ← standalone file (file-format)
└── notes.md                ← may or may not have FORMAT frontmatter
```

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
