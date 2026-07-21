---
title: About â€” iNNfo
description: Learn about iNNfo, the hub for the iNNfo ecosystem â€” the iNNfo Modeler, innfo-core, innfo-mcp, the traNNsform pipeline, and the spec chain.
html_url: https://innfo.cognnitive.com/about
generator: https://skills.innv0.com/innv0-web-design-guide
---

# About iNNfo

The monorepo that ties the iNNfo ecosystem together.

## Architecture

npm workspaces monorepo â€” one editor app, three shared packages, the spec chain, and an agent-driven pipeline:

```
iNNfo/
â”œâ”€â”€ apps/
â”‚   â””â”€â”€ innfo-editor/     â† Vue 3 workspace editor (the iNNfo Modeler)
â”œâ”€â”€ packages/
â”‚   â”œâ”€â”€ innfo-core/       â† TS parser, resolver, validator
â”‚   â”œâ”€â”€ innfo-mcp/        â† MCP server for AI agents
â”‚   â””â”€â”€ pipeline-gates/   â† Validation & integration gates
â”œâ”€â”€ specs/                â† defiNNe, iNNfo, templates, samples
â”œâ”€â”€ traNNsform/           â† Agent-driven import/export pipeline
â””â”€â”€ docs/                 â† This website
```

## App

**iNNfo Modeler** (`@cognnitive/innfo-editor`) â€” a Vue 3 workspace editor:
- File System Access API to open a workspace folder
- Single recursive parse pass into one normalized model graph
- Block sheets, a table view, and metamodel-driven forms for editing
- Automatic validation against the iNNfo spec on every parse
- Graph viewer, matrix grids, and an AI-guidance sidebar
- IndexedDB handle persistence for a fast reopen

## Packages

**@cognnitive/innfo-core** â€” framework-agnostic TypeScript library with:
- The iNNfo parser
- Model types (Concept, Element, Field, Marker, Matrix, Relationship)
- IO drivers for the browser and Node
- Validator against template schemas
- Parent-spec-chain resolver

**@cognnitive/innfo-mcp** â€” a Model Context Protocol server (stdio) wrapping innfo-core. Exposes seven semantic tools â€” `list_models`, `read_model`, `get_spec`, `get_template`, `validate_model`, `apply_change`, `validate_model_url` â€” so any MCP-capable AI agent can read, validate, and safely mutate iNNfo models.

**@cognnitive/pipeline-gates** â€” validation and integration gates for iNNfo model pipelines; the dev-tooling layer that validates, integrates, and versions models in CI.

## Specifications

- **Level 0: defiNNe** â€” Meta-specification (structure, SemVer, RFC 2119)
- **Level 1: iNNfo** â€” Central spec; single-file `_NN.md` models with YAML frontmatter
- **Level 2: Templates** â€” business, procedures, organization
- **Level 3: Models** â€” Concrete data instances (Ghostbusters, Engineering Team)

## Open Knowledge Format compatibility

iNNfo is **100% compatible** with [OKF v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) (Open Knowledge Format) by Google Cloud Platform. Every iNNfo document is a valid OKF knowledge bundle:

- **Shared substrate**: Both use Markdown + YAML frontmatter. No proprietary tooling.
- **Conformance**: OKF's three conformance rules (parseable frontmatter, non-empty `type`, reserved filenames) are fully met by iNNfo's structure.
- **Tolerant extensions**: OKF explicitly tolerates unknown frontmatter keys and unknown `type` values â€” iNNfo's richer metadata (`spec_version`, `level`, `parent`, `concepts`, `markers`, `matrices`) is fully compatible.
- **A workspace = an OKF Bundle**: an iNNfo workspace produces exactly the directory tree OKF defines as a knowledge bundle. Each `_NN.md` is an OKF concept document.

[Home](https://innfo.cognnitive.com/)
