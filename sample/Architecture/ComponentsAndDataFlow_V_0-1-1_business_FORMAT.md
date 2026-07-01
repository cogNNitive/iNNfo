---
specification_version: "V_0-1-1"
specification_url: "https://raw.githubusercontent.com/innV0/cogNNitive/v0.1.1/specs/business_V_0-1-1_FORMAT.md"
level: 3
parent:
  name: "business_V_0-1-1"
  url: "https://raw.githubusercontent.com/innV0/cogNNitive/v0.1.1/specs/business_V_0-1-1_FORMAT.md"
model_version: "V_0-1-1"
title: "cogNNitive — Components & Data Flow"
mode: "FILE"
last_saved: "2026-07-01T00:00:00.000Z"
---

> [!NOTE]
> This is a **FILE-mode** FORMAT document (business template) nested inside a FOLDER-mode node. It describes the application's architecture using FILE-mode concepts and matrices.

# _F index

* [[Architecture]]
  * [[Components]]
  * [[Data Flow]]
  * [[Design Principles]]

# _F Architecture

The cogNNitive platform follows a modular monorepo architecture with three tiers: apps (user-facing), packages (shared libraries), and specs (FORMAT definitions).

# _F Components

* _F Components: Specification Engine
  ```yaml
  scope: core
  language: TypeScript
  ```
  Parses and resolves FORMAT documents, traverses the parent chain, and provides validated model data.
* _F Components: Dashboard Renderer
  ```yaml
  scope: core
  language: TypeScript
  ```
  Mustache-based visual renderer that displays any FORMAT model as an interactive HTML fragment.
* _F Components: CLI Toolchain
  ```yaml
  scope: tooling
  language: TypeScript
  ```
  Commands for validation, rendering, and model management from the terminal.
* _F Components: Spec Resolver
  ```yaml
  scope: core
  language: TypeScript
  ```
  Resolves the parent chain (model → template → FORMAT → defiNNe) and caches spec files locally.

# _F Data Flow

* _F Data Flow: Load → Resolve → Validate → Render
  Documents flow from disk through the resolver (fetches parent specs), then validation (checks against template schema), and finally rendering (Mustache placeholders → HTML).
* _F Data Flow: Write → Parse → Cache
  When a model is saved, the engine parses frontmatter, extracts concepts/elements/matrices, normalizes the structure, and writes back as valid Markdown.

# _F Design Principles

* _F Design Principles: Self-Describing Documents
  Every FORMAT file carries its own schema. No external config needed.
* _F Design Principles: Mode Agnostic
  The conceptual model is identical for FILE and FOLDER modes; only the physical layout changes.
* _F Design Principles: Parent Chain Resolution
  Models never duplicate schema data. Everything resolves up the chain via URLs.
* _F Design Principles: Git-Native
  Plain Markdown + YAML. Diffable, mergeable, reviewable like any code.

# _F matrices: item-markers matrix

| Item \ Marker | weight | priority |
| :--- | :---: | :---: |
| Specification Engine | 10 | ! |
| Dashboard Renderer | 8 | - |
| CLI Toolchain | 6 | - |
| Spec Resolver | 9 | ! |

