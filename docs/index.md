---
title: iNNfo — the iNNfo modeling hub
description: iNNfo is the hub for the iNNfo ecosystem. Model, edit, and validate iNNfo knowledge models with the iNNfo Modeler, the innfo-core library, and an MCP server for AI agents.
html_url: https://innfo.cognnitive.com/
generator: https://skills.innv0.com/innv0-web-design-guide
---

# iNNfo — the iNNfo modeling hub

Model, edit, and validate iNNfo knowledge models. iNNfo is the hub for the iNNfo ecosystem.

## What is iNNfo?

A monorepo that ties the iNNfo ecosystem together:

- **iNNfo Modeler** (`innfo-editor`) — a Vue 3 workspace editor. Open any folder, parse it into one normalized model tree, edit nodes, and validate in the browser.
- **@cognnitive/innfo-core** — the shared TypeScript parser, spec-chain resolver, and validator.
- **@cognnitive/innfo-mcp** — an MCP server exposing iNNfo as semantic tools for AI agents.
- **Spec Chain** — defiNNe &rarr; iNNfo &rarr; Templates &rarr; Models.

## How the iNNfo Modeler works

1. **Open workspace** — pick a folder via the File System Access API (or resume a recent one).
2. **Single parse pass** — one recursive pass walks the workspace; each `_NN.md` file and its structural children fold into a single normalized tree.
3. **Edit & validate** — sidebar tree + block sheets / table view + automatic validation against the iNNfo spec on every parse.

## Ecosystem Architecture

- **Level 0: defiNNe** — meta-specification, RFC 2119, versioning.
- **Level 1: iNNfo** — the central spec; single-file `_NN.md` models with YAML frontmatter.
- **Level 2: Templates** — business, procedures, organization.
- **Level 3: Models** — concrete data instances.

## Built for AI agents

- **innfo-mcp** — a stdio MCP server with seven semantic tools (`list_models`, `read_model`, `get_spec`, `get_template`, `validate_model`, `apply_change`, `validate_model_url`) so agents mutate models safely and re-validate every step.
- **traNNsform** — Import/Export panels generate a ready-to-run agent prompt. Drop sources into `traNNsform/input/` to build iNNfo models, or export a model to a self-contained HTML visualizer in `traNNsform/output/`.
- **Use iNNfo with AI** — a built-in checklist to connect your workspace to Claude Code, Google Antigravity, or OpenCode.

## Open Knowledge Format compatibility

iNNfo is **100% compatible** with [OKF v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) (Open Knowledge Format). Every iNNfo document is a valid OKF knowledge bundle:

- **Shared substrate**: Markdown + YAML frontmatter — no proprietary tooling required.
- **Conformance**: OKF's three conformance requirements (parseable frontmatter, non-empty `type`, reserved filenames) are all met by iNNfo. The `level` and template system provide type semantics; `index.md` follows the same progressive-disclosure convention.
- **Extensions tolerated**: OKF explicitly tolerates unknown frontmatter keys and `type` values. iNNfo's richer frontmatter (`spec_version`, `level`, `parent`, `concepts`, `markers`, `matrices`) is fully compatible.
- **A workspace = an OKF Bundle**: an iNNfo workspace is exactly the directory-of-Markdown-files structure OKF defines as its knowledge bundle. Each `_NN.md` is an OKF concept document.

## Monorepo structure

```
iNNfo/
â”œâ”€â”€ apps/
â”‚   â””â”€â”€ innfo-editor/     ← Vue 3 workspace editor (the iNNfo Modeler)
â”œâ”€â”€ packages/
â”‚   â”œâ”€â”€ innfo-core/       ← TS parser, resolver, validator
â”‚   â”œâ”€â”€ innfo-mcp/        ← MCP server for AI agents
â”‚   â””â”€â”€ pipeline-gates/   ← Validation & integration gates
â”œâ”€â”€ specs/                ← defiNNe, iNNfo, templates, samples
â”œâ”€â”€ traNNsform/           ← Agent-driven import/export pipeline
â””â”€â”€ docs/                 ← This website
```

[Launch App](https://innfo.cognnitive.com/app/)
[About the project](https://innfo.cognnitive.com/about)
[Documentation](https://innfo.cognnitive.com/documentation)
