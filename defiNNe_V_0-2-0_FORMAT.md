---
specification_version: "V_0-2-0"
specification_url: "https://raw.githubusercontent.com/innV0/defiNNe/v0.2.0/defiNNe_V_0-2-0_FORMAT.md"
level: 0
title: "defiNNe — The Definition of Definitions"
description: "Meta-specification for the iNNv0 ecosystem. Defines the structure, versioning, and normative language for all derived specifications."
author: "innV0 Team"
status: "Draft"
---

> [!NOTE]
> This is a **FORMAT document** — a plain-text Markdown file that carries its own schema in the YAML frontmatter.

# defiNNe — The Definition of Definitions

## A meta-specification for defining structured, versioned, and machine-readable technical specifications

## Philosophy

defiNNe is built on four foundational values:

1. **Hierarchical Consistency**: Every specification belongs to a level in a defined hierarchy. Each level inherits the constraints of the levels above it and adds its own.
2. **Explicit Dependencies**: Every specification declares its parent with an exact version. The dependency chain is always resolvable.
3. **Immutability by Version**: Once published, a specification version never changes. Corrections produce new versions.
4. **Human-First, Machine-Compatible**: Specifications are readable without tooling but parseable by standard Markdown and YAML parsers.

## Objectives

- **Standardize** how specifications in the iNNv0 ecosystem are structured, versioned, and referenced.
- **Enable dependency resolution** across specification levels via `level` and `parent` fields.
- **Provide a normative language** (RFC 2119) that all derived specifications must use.
- **Ensure URL persistence** so every specification version is retrievable indefinitely.

## Specification

### 1. Hierarchy of Levels

The iNNv0 ecosystem defines four specification levels:

| Level | Role | Example |
|---|---|---|
| **0** | Meta-specification | `defiNNe` |
| **1** | Concrete specification | `FORMAT` |
| **2** | Template | `business`, `procedures`, `kb` |
| **3** | Model | `Ghostbusters`, `Onboarding` |

Rules:

- A level N specification MUST declare `level: N` in its frontmatter.
- A level N specification (N > 0) MUST declare `parent` pointing to its level N-1 parent, including the parent's version.
- A level 0 specification MUST NOT declare a `parent`.
- Each level ADDS constraints. It MUST NOT relax constraints from the level above.

### 2. Normative Language (RFC 2119)

Every specification in the iNNv0 ecosystem MUST use the following keywords with RFC 2119 semantics:

| Keyword | Meaning |
|---|---|
| **MUST** / **REQUIRED** / **SHALL** | The definition is an absolute requirement. |
| **MUST NOT** / **SHALL NOT** | The definition is an absolute prohibition. |
| **SHOULD** / **RECOMMENDED** | There may exist valid reasons to ignore the requirement, but the full implications must be understood. |
| **SHOULD NOT** / **NOT RECOMMENDED** | There may exist valid reasons to accept behavior, but the full implications must be understood. |
| **MAY** / **OPTIONAL** | The item is truly optional. |

### 3. Required Frontmatter Structure

All specifications in the iNNv0 ecosystem MUST begin with a YAML frontmatter block containing:

```yaml
---
specification_version: "<V_MAJOR-MINOR-PATCH>"
specification_url: "<canonical-URL-to-this-exact-version>"
level: <0|1|2|3>
title: "<specification-title>"
description: "<one-line-summary>"
author: "<author-or-team>"
status: "Draft" | "Stable" | "Deprecated"
---
```

#### 3.1. Level 0 (defiNNe)

- `level: 0`
- MUST NOT include `parent`

#### 3.2. Level 1 (concrete specifications)

```yaml
level: 1
parent: "defiNNe_V_0-2-0"
```

- `parent` MUST be `"defiNNe_V_<exact-version>"`
- The parent value is the name of the level 0 file (without `_FORMAT.md` suffix)

#### 3.3. Level 2 (templates)

```yaml
level: 2
parent: "FORMAT_V_0-2-0"
```

- `parent` MUST be `"<level-1-name>_V_<exact-version>"`
- The template name in the `parent` field matches the level 1 specification it belongs to

#### 3.4. Level 3 (models)

```yaml
level: 3
parent: "<template-name>_V_<exact-version>"
model_version: "V_<MAJOR>-<MINOR>-<PATCH>"
mode: "FILE" | "FOLDER"
```

- `parent` MUST be `"<template-name>_V_<exact-version>"`
- `model_version` tracks the model's own version independently of its parent template
- `mode` declares the representation mode (defined by the level 1 specification)

### 4. File Naming Convention

The filename MUST follow the pattern of the LOWEST level it represents:

| Level | Pattern | Example |
|---|---|---|
| 0 | `<Name>_V_x-y-z_FORMAT.md` | `defiNNe_V_0-2-0_FORMAT.md` |
| 1 | `<Name>_V_x-y-z_FORMAT.md` | `FORMAT_V_0-2-0_FORMAT.md` |
| 2 | `<Template>_V_x-y-z_FORMAT.md` | `business_V_1-0-0_FORMAT.md` |
| 3 | `<Model>_V_x-y-z_<Template>_FORMAT.md` | `Ghostbusters_V_0-3-0_business_FORMAT.md` |

The filename does NOT encode higher levels. Those are declared in the frontmatter `parent` field and resolved through the dependency chain.

### 5. Dependency Chain Resolution

Given any specification file, the full dependency chain MUST be resolvable:

```
<current-file>                  (level N)
  └── parent → <parent-file>    (level N-1)
        └── parent → ...        (level 0)
```

Resolution rules:

- `parent` is the **name of the parent file** (without `_FORMAT.md` suffix).
- The `specification_url` of each level provides the canonical URL for that exact version.
- A resolver MAY locate the parent file by convention: `{org}/<parent>/v{version}/`.

### 6. Versioning

All versions in the iNNv0 ecosystem use Semantic Versioning with hyphen separators:

```
V_MAJOR-MINOR-PATCH
```

| Increment | When to apply |
|---|---|
| **MAJOR** | Breaking change in structure or semantics |
| **MINOR** | Backward-compatible addition (new optional field, new concept) |
| **PATCH** | Bug fix, clarification, examples |

Versioning applies to ALL levels:
- Level 0: `specification_version` in defiNNe itself
- Level 1: `specification_version` in the concrete specification
- Level 2: `template.version` in the template frontmatter
- Level 3: `model_version` in the model frontmatter

### 7. Specification URL Persistence

- The `specification_url` MUST point to an immutable version of the specification.
- RECOMMENDED: use a git tag: `https://raw.githubusercontent.com/innV0/<repo>/v<version>/<path>`
- Once a version is published under a given URL, its content MUST NOT change.
- Corrections and errata MUST be published as a new PATCH version.

### 8. Required Body Sections

The document body of any level 0, 1, or 2 specification MUST include these sections as H2 headings, in order:

```markdown
## [One-sentence summary]

## Philosophy

## Objectives

## Specification
[RFC 2119 keywords required]

## Template

## Examples
```

These sections MUST appear after the H1 title and before any other content.

### 9. Document Notice

The first content in the Markdown body — immediately after the frontmatter delimiter and before any other section — MUST be a GFM `> [!NOTE]` admonition:

```markdown
> [!NOTE]
> This is a **FORMAT document** — a plain-text Markdown file that carries its own schema in the YAML frontmatter.
```

### 10. Compliance Checklist

A document is defiNNe-compliant only if ALL of the following hold:

1. Filename matches the level convention (§4).
2. Frontmatter contains `specification_version` in `V_MAJOR-MINOR-PATCH` form (§6).
3. Frontmatter contains a resolvable `specification_url` (§7).
4. Frontmatter contains `level` and (if level > 0) `parent` with exact version (§3).
5. Body begins with the required Document Notice (§9).
6. Body contains the required sections (§8) if level ≤ 2.
7. Normative language uses RFC 2119 keywords (§2).

## Template

### Level 0 Template (defiNNe itself)

```markdown
---
specification_version: "V_0-2-0"
specification_url: "<url>"
level: 0
title: "Your Meta-Specification"
description: "One-line summary"
author: "Author"
status: "Draft | Stable | Deprecated"
---

> [!NOTE]
> This is a **FORMAT document**...

# Title

## One-sentence summary

## Philosophy

## Objectives

## Specification

## Template

## Examples
```

### Level 1 Template

```markdown
---
specification_version: "V_x-y-z"
specification_url: "<url>"
level: 1
parent: "defiNNe_V_0-2-0"
title: "Specification Name"
description: "One-line summary"
author: "Author"
status: "Draft | Stable | Deprecated"
---

> [!NOTE]
> This is a **FORMAT document**...

# Title

## One-sentence summary

## Philosophy

## Objectives

## Specification

## Template

## Examples
```

### Level 2 Template

```markdown
---
specification_version: "V_0-2-0"
specification_url: "<url-to-this-template>"
level: 2
parent: "FORMAT_V_0-2-0"
title: "Template Name"
concepts: [...]
markers: [...]
matrices: [...]
---

> [!NOTE]
> This is a **FORMAT document**...

# Title

## Summary

## Concepts

## Matrices

...

## Template

## Examples
```

### Level 3 Template (Model)

```markdown
---
specification_version: "V_0-2-0"
specification_url: "<url-to-parent-spec>"
level: 3
parent: "<template>_V_x-y-z"
model_version: "V_x-y-z"
title: "Model Name"
mode: "FILE" | "FOLDER"
---
```

## Examples

### Dependency Chain

Given a model file `Ghostbusters_V_0-3-0_business_FORMAT.md`:

```yaml
# In the model:
level: 3
parent: "business_V_1-0-0"

# Resolves to:
#   business_V_1-0-0_FORMAT.md  (level 2)
#     parent: "FORMAT_V_0-2-0"
#       FORMAT_V_0-2-0_FORMAT.md  (level 1)
#         parent: "defiNNe_V_0-2-0"
#           defiNNe_V_0-2-0_FORMAT.md  (level 0)
```

### FOLDER Mode Discovery

A FOLDER-mode model named `MyKB_V_1-0-0_kb/`:

```
📁 MyKB_V_1-0-0_kb/
  📄 _FORMAT.md           ← level:3, parent:"kb_V_1-0-0", mode:FOLDER
  📁 Alice/
    📄 _FORMAT.md         ← metadatos del elemento
    📄 photo.jpg          ← asset físico
  📁 Bob/
    📄 _FORMAT.md
```

Any directory containing `_FORMAT.md` is a node. Any directory without `_FORMAT.md` is an asset folder outside the model.
