# cogNNitive Documentation

Welcome to the cogNNitive documentation. cogNNitive is the monorepo that powers the iNNv0 FORMAT ecosystem.

## Quick Start

```bash
# Install dependencies
npm install

# Start the Launcher dev server
npm run dev -w @innv0/launcher

# Build format-core
npm run build -w @innv0/format-core
```

## Sections

### [Launcher](launcher)
The cogNNitive Launcher is a Vue 3 application that detects FORMAT model modes (FILE or FOLDER) and routes them to the correct editor. Drag-and-drop or pick a file/folder.

### [format-core](format-core)
`@innv0/format-core` is a framework-agnostic TypeScript library providing:
- Unified parser for FILE and FOLDER mode documents
- Model types: Concept, Element, Field, Marker, Matrix, Relationship
- Validator against template schemas
- IO drivers for both modes

### [Ecosystem](ecosystem)
The four-level specification chain:

| Level | Name | Description |
|-------|------|-------------|
| 0 | **defiNNe** | Meta-specification: structure, SemVer, RFC 2119 |
| 1 | **FORMAT** | Central spec with FILE and FOLDER modes |
| 2 | **Templates** | business, procedures, kb |
| 3 | **Models** | Concrete instances (Ghostbusters, TeamKB) |

### [Specifications](specifications)
Complete listing of all specs and models at every level, with links to source files.

### [Usage](usage)
How to create FORMAT models, templates, and work with the ecosystem.
