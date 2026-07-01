---
title: About — cogNNitive
description: Learn about cogNNitive, the central hub for the iNNv0 FORMAT ecosystem.
html_url: https://innv0.github.io/cogNNitive/about
generator: https://skills.innv0.com/innv0-web-design-guide
---

# About cogNNitive

The monorepo that ties the iNNv0 FORMAT ecosystem together.

## Architecture

npm workspaces monorepo with apps/, packages/, specs/, models/, and docs/.

## Package

**@innv0/format-core** — framework-agnostic TypeScript library with:
- Unified parser for FILE and FOLDER modes
- Model types (concepts, elements, fields, markers, relationships)
- Validator against template schemas
- IO drivers for both FILE and FOLDER modes

## App

**cogNNitive Launcher** — Vue 3 drag-and-drop app that detects FILE/FOLDER mode from FORMAT frontmatter and routes to the right editor.

## Specifications

- **Level 0: defiNNe** — Meta-specification
- **Level 1: FORMAT** — Central spec with FILE and FOLDER modes
- **Level 2: Templates** — business, procedures, kb
- **Level 3: Models** — Concrete data instances

[Home](https://innv0.github.io/cogNNitive/)
