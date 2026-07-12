# innfo-editor

**iNNfo Modeler** — the unified workspace editor for the iNNv0 ecosystem. Open any folder, edit iNNfo models with dedicated per-node views, and let AI agents drive the same workspace alongside you.

## End-to-end flow

1. **Open a workspace** — pick a folder via the File System Access API (`showDirectoryPicker`), resume a recent workspace from IndexedDB history, load a starter template (Business, Procedures, or Organization) or its sample model, or load a model directly from a URL.
2. **Single recursive parse** — the workspace is parsed once into a normalized node graph shared by every view.
3. **Edit** — each node opens the editing sub-view that fits its kind.
4. **Auto-validate** — every parse runs the `@innv0/innfo-core` validator (`validateFormatContent` / `validateModel`); results surface as a status badge in the header.
5. **Export / Import** — generate a copiable agent prompt that an external AI coding agent executes against the [traNNsform](trannsform) pipeline.
6. **Save** — writes back to disk with automatic backups and a version bump.

## Home

- **Open folder** — browse and open any local workspace directory.
- **Resume** — reopen a previously used workspace from IndexedDB history without re-prompting for folder access.
- **Starter templates** — bootstrap a new workspace from the Business, Procedures, or Organization starter, or load one of the live sample models (Ghostbusters, Code Review Process, Engineering Team).
- **Load from URL** — point the editor at a raw `_NN.md` model URL.
- **SetupWizard** — guides first-time setup of a new workspace.

## Editing sub-views

The editor selects the editing surface per node kind:

| View | Purpose |
|------|---------|
| **TextEditor** | Markdown body editing |
| **TreeEditor** | Structural node editing |
| **BlockFeed / BlockSheet** | Concept element cards |
| **ConceptTableView** | Spreadsheet-like list editing for a concept's elements |

## Validation

Validation runs automatically on every parse via `@innv0/innfo-core`. A pass/warn/error badge in the `Header` opens the full `ValidationReport` overlay (backed by `ValidationService`), showing every diagnostic against the resolved template.

## Visualization and inspection

- **GraphViewer** — node and relationship graph visualization of the model.
- **MatricesGrid** / **MetamatrixConfig** — evaluable matrices between concepts.
- **ModelInfoPanel** — workspace and metamodel inspection.

## Export and import

- **ExportPanel** — builds a copiable agent prompt that instructs an external AI coding agent to generate an HTML visualizer for the current model, following the [traNNsform](trannsform) protocol.
- **ImportPanel** — builds a copiable agent prompt that instructs an external AI coding agent to transform source documents into a new iNNfo model.

Neither panel transforms data itself — the actual work is executed by the AI agent reading `traNNsform/AGENT.md`.

## AI Guide

**AIGuidePanel** ("Use cogNNitive with AI") — a step checklist for connecting an external coding agent (Claude Code, Google Antigravity, or OpenCode) to the current workspace, so you can edit the same models from chat or CLI.

## Development

```bash
# From repo root
npm run build -w @innv0/innfo-core   # Build dependency first
npm run dev -w @innv0/innfo-editor   # Start dev server

# Run tests
npm run test -w @innv0/innfo-editor
```
