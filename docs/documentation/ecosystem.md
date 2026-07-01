# Ecosystem Architecture

The iNNv0 FORMAT ecosystem is organized in four specification levels.

## Level 0: defiNNe

The meta-specification. Defines the structure, versioning conventions (SemVer with `V_MAJOR-MINOR-PATCH` format), RFC 2119 normative language, and the level/parent chain system. The root of the hierarchy.

## Level 1: FORMAT

The central specification with two modes:
- **FILE mode** — single `.md` document containing concepts, elements, fields, markers, and matrices
- **FOLDER mode** — each element is a directory node with assets and a `_FORMAT.md` discovery file

## Level 2: Templates

Domain-specific templates that declare which concepts, markers, and relationship types apply:

| Template | Mode | Description |
|----------|------|-------------|
| business | FILE | Business strategy modeling (~60 concepts) |
| procedures | FILE | Workflows, SOPs, processes |
| kb | FOLDER | Knowledge base with physical assets |

## Level 3: Models

Concrete instances of a template. Lightweight — just data and a `parent` pointer to the template.

## Resolver Protocol

When a model is loaded:
1. Read the model's `parent` pointer
2. If not cached in `specs/`, download from the specification URL
3. Save to `specs/<parent.name>_FORMAT.md`
4. Read the downloaded spec's `parent`, repeat until level 0
5. On subsequent loads, use cache
6. On version mismatch, re-download
