---
specification_version: "V_0-2-0"
specification_url: "https://raw.githubusercontent.com/cogNNitive/cogNNitive/main/specs/v0.2.0/level0/defiNNe_V_0-2-0_NN.md"
level: 0
title: "defiNNe — The Definition of Definitions"
description: "Meta-specification for the iNNv0 ecosystem. Defines the structure, versioning, normative language, terminology discipline, and dependency resolution for all derived specifications."
author: "innV0 Team"
status: "Draft"
---

> [!NOTE]
> This is an **iNNfo document** — a plain-text Markdown file. Open it with any text editor or view and edit it with [cogNNitive](https://innfo.cognnitive.com/app/info-doc).

# defiNNe — The Definition of Definitions

## A meta-specification for defining structured, versioned, and machine-readable technical specifications

## Philosophy

defiNNe is built on four foundational values:

1. **Hierarchical Consistency**: Every specification belongs to a level in a defined hierarchy. Each level inherits the constraints of the levels above it and adds its own.
2. **Explicit Dependencies via Parent Chain**: Every specification declares its parent with an exact name and immutable URL. From any document, the full chain up to level 0 is resolvable.
3. **Rich Specs, Lean Models**: Specification documents (levels 0–2) are semantically rich — they carry Philosophy, Objectives, full specification text. Models (level 3) are lightweight — they carry only data and a pointer to their parent template.
4. **Cacheable Resolution**: The parent chain can be resolved at load time and cached locally, making any model functionally self-contained without duplicating specification content.

## Objectives

- **Standardize** how specifications in the iNNv0 ecosystem are structured, versioned, and referenced.
- **Enable dependency resolution** across specification levels via the parent chain.
- **Provide a normative language** (RFC 2119) that all derived specifications must use.
- **Enforce terminology discipline** so every entity has one canonical name across the ecosystem.
- **Ensure URL persistence** so every specification version is retrievable indefinitely.
- **Define the spec resolver protocol** so applications can auto-download and cache the parent chain.

## Specification

### Hierarchy of Levels

| Level | Role | Example |
|---|---|---|
| **0** | Meta-specification | `defiNNe` |
| **1** | Concrete specification | `iNNfo` |
| **2** | Template | `business`, `procedures`, `organization`, `kb` |
| **3** | Model | `Ghostbusters`, `CodeReviewProcess` |

Rules:

- A level N specification MUST declare `level: N` in its frontmatter.
- A level N specification (N > 0) MUST declare `parent_spec` as an object with `name` and `url`, pointing to its level N-1 parent.
- A level 0 specification MUST NOT declare a `parent_spec`.
- Each level ADDS constraints. It MUST NOT relax constraints from the level above.

### Terminology Discipline

Every specification defines its entities once and uses exactly one canonical name for
each throughout its normative text. This applies to all derived specifications:

- A specification MUST include a glossary that names each entity it defines.
- Normative text MUST use only those canonical names. Synonyms MUST NOT be used
  interchangeably for a defined entity.
- Implementation-only vocabulary — in particular the word **"node"** (a runtime graph
  representation) — MUST NOT appear in normative specification text.

The canonical entity vocabulary for semantic models is defined by iNNfo (level 1).

### Parent Field

The `parent_spec` field is an object, not a string:

```yaml
parent_spec:
  name: "<parent-name>_V_<version>"
  url: "<immutable-URL-to-the-parent-document>"
```

- `name`: the canonical filename of the parent (without the `_NN.md` suffix). Example: `"iNNfo_V_0-2-0"`.
- `url`: an immutable URL (RECOMMENDED: git tag-based) pointing to the raw parent document.

A level 0 specification MUST NOT include `parent_spec`.

### Spec Resolver Protocol

> **Note for application implementors**: This section describes the RECOMMENDED behavior for applications that consume iNNfo models. It is not a requirement for spec authors.

When an application loads a level 3 model, it SHOULD resolve the full parent chain:

1. Read the model's `parent_spec.url`.
2. If the parent file is NOT already cached in a `specs/` subdirectory next to the model, download it from the URL.
3. Save it to `specs/<parent.name>_NN.md`.
4. Read the downloaded spec's `parent_spec.url` and repeat until reaching level 0 (no parent_spec).
5. On subsequent loads, check `specs/` first. Only download missing files.
6. If the model's `parent_spec` changes (version bump), the application detects the mismatch and downloads the new parent.

The cached directory structure:

```
ðŸ“ <Model>_V_x-y-z_<Template>/
  ðŸ“„ <Model>_V_x-y-z_<Template>_NN.md
  ðŸ“ specs/
    ðŸ“„ <parent.name>_NN.md        â† level 2 (template)
    ðŸ“„ <grandparent.name>_NN.md   â† level 1 (iNNfo)
    ðŸ“„ <great-grandparent.name>_NN.md  â† level 0 (defiNNe)
```

### Normative Language (RFC 2119)

When a specification makes a normative statement (a rule, requirement, or constraint), it MUST use these keywords with RFC 2119 semantics:

| Keyword | Meaning |
|---|---|
| **MUST** / **REQUIRED** / **SHALL** | Absolute requirement |
| **MUST NOT** / **SHALL NOT** | Absolute prohibition |
| **SHOULD** / **RECOMMENDED** | Valid reasons to ignore may exist |
| **SHOULD NOT** / **NOT RECOMMENDED** | Valid reasons to accept may exist |
| **MAY** / **OPTIONAL** | Truly optional |

Purely descriptive or explanatory text (tables of concepts, examples, taxonomy listings) is NOT required to use RFC 2119 keywords.

### Required Frontmatter Structure

All specifications MUST begin with a YAML frontmatter block.

**Level 0 (defiNNe)**

```yaml
---
specification_version: "V_x-y-z"
specification_url: "<immutable-URL>"
level: 0
title: "..."
description: "..."
author: "..."
status: "Draft | Stable | Deprecated"
---
```

No `parent_spec`.

**Level 1 (concrete specifications)**

```yaml
---
specification_version: "V_x-y-z"
specification_url: "<immutable-URL>"
level: 1
parent_spec:
  name: "defiNNe_V_0-2-0"
  url: "https://raw.githubusercontent.com/cogNNitive/cogNNitive/main/specs/v0.2.0/level0/defiNNe_V_0-2-0_NN.md"
title: "..."
description: "..."
---
```

**Level 2 (templates)**

```yaml
---
specification_version: "V_x-y-z"
specification_url: "<immutable-URL>"
level: 2
parent_spec:
  name: "iNNfo_V_0-2-0"
  url: "https://raw.githubusercontent.com/cogNNitive/cogNNitive/main/specs/v0.2.0/level1/iNNfo_V_0-2-0_NN.md"
title: "..."
concepts: [...]
markers: [...]
matrices: [...]
relationship_types: {...}
---
```

**Level 3 (models) — Lightweight**

```yaml
---
specification_version: "V_x-y-z"
specification_url: "<URL-of-the-level-1-spec>"
level: 3
parent_spec:
  name: "<template>_V_x-y-z"
  url: "<immutable-URL-to-template>"
model_version: "V_x-y-z"
title: "..."
---
```

`model_version` and `title` are top-level keys. A level 3 model MUST NOT inline the template definition; it MUST rely on the `parent_spec` URL + spec resolver to obtain its schema.

**Frontmatter Extensibility**

Specifications MAY include additional fields beyond those required above. Applications MUST ignore unrecognized fields. Additional fields MUST NOT contradict or override the required fields defined here.

### File Naming Convention

All specification and model files use the `_NN.md` suffix.

| Level | Pattern | Example |
|---|---|---|
| 0 | `<Name>_V_x-y-z_NN.md` | `defiNNe_V_0-2-0_NN.md` |
| 1 | `<Name>_V_x-y-z_NN.md` | `iNNfo_V_0-2-0_NN.md` |
| 2 | `<Template>_V_x-y-z_NN.md` | `business_V_0-2-0_NN.md` |
| 3 | `<Model>_V_x-y-z_<Template>_NN.md` | `Ghostbusters_V_0-2-0_business_NN.md` |

Files are organized by level within each version directory:

```
v<version>/
â”œâ”€â”€ level0/         â† level 0 specs
â”œâ”€â”€ level1/         â† level 1 specs
â””â”€â”€ level2/         â† level 2 templates
    â”œâ”€â”€ <template>/
    â”‚   â”œâ”€â”€ <template>_V_x-y-z_NN.md
    â”‚   â””â”€â”€ samples/
    â””â”€â”€ ...
```

The `latest/` directory mirrors this structure but uses stable filenames without version numbers (e.g. `defiNNe_NN.md` instead of `defiNNe_V_0-2-0_NN.md`).

### Versioning

All versions use Semantic Versioning with hyphen separators: `V_MAJOR-MINOR-PATCH`.

| Increment | When to apply |
|---|---|
| **MAJOR** | Breaking change in structure or semantics |
| **MINOR** | Backward-compatible addition |
| **PATCH** | Bug fix, clarification, examples |

Specification versions are stored in versioned directories under `specs/`:

```
specs/
â”œâ”€â”€ CHANGELOG.md
â”œâ”€â”€ v0.2.0/
â”‚   â”œâ”€â”€ INDEX.md
â”‚   â”œâ”€â”€ level0/
â”‚   â”‚   â””â”€â”€ defiNNe_V_0-2-0_NN.md
â”‚   â”œâ”€â”€ level1/
â”‚   â”‚   â””â”€â”€ iNNfo_V_0-2-0_NN.md
â”‚   â””â”€â”€ level2/
â”‚       â”œâ”€â”€ business/
â”‚       â”‚   â”œâ”€â”€ business_V_0-2-0_NN.md
â”‚       â”‚   â””â”€â”€ samples/
â”‚       â”œâ”€â”€ organization/
â”‚       â”‚   â”œâ”€â”€ organization_V_0-2-0_NN.md
â”‚       â”‚   â””â”€â”€ samples/
â”‚       â””â”€â”€ procedures/
â””â”€â”€ latest/         â† stable filenames, mirrors the current version
```

- Each `vMAJOR.MINOR.PATCH/` directory is **frozen and immutable** once published.
- `latest/` is a convenience alias with stable filenames (no version in name) that mirrors the current version.
- To publish a new version, create a new directory (e.g., `v0.3.0/`), populate it with the updated specs, sync to `latest/`, and create a corresponding git tag.

### Specification URL Persistence

- The `specification_url` MUST point to an immutable version of the specification.
- RECOMMENDED: use a git tag: `https://raw.githubusercontent.com/innV0/<repo>/v<version>/<path>`
- Once a version is published under a given URL, its content MUST NOT change.
- Corrections and errata MUST be published as a new PATCH version.

### Required Body Sections (Levels 0, 1, 2)

The document body of any level 0, 1, or 2 specification MUST include these sections as H2 headings, in this exact order, with no other section before the one-sentence summary:

```
## <one-sentence-summary>

## Philosophy

## Objectives

## Specification

## Template

## Examples
```

The `<one-sentence-summary>` placeholder means a brief H2 heading that summarizes the specification in one sentence.

Level 3 models MUST NOT include these sections. They contain only model data.

### Document Notice

The first content in the Markdown body — immediately after the frontmatter — MUST be a GFM `> [!NOTE]` admonition. This applies to ALL levels (0–3).

### Cross-References

Internal cross-references MUST use stable heading names, not section numbers. Sections are unnumbered so that references remain valid as the document evolves.

### Compliance Checklist

A document is defiNNe-compliant only if ALL of the following hold:

1. Filename matches the level convention (see **File Naming Convention**).
2. Frontmatter contains `specification_version` in `V_MAJOR-MINOR-PATCH` form (see **Versioning**).
3. Frontmatter contains a resolvable `specification_url` (see **Specification URL Persistence**).
4. Frontmatter contains `level`.
5. If level > 0: frontmatter contains `parent_spec` as an object with `name` and `url`.
6. If level â‰¤ 2: body contains the required sections in order (see **Required Body Sections**).
7. If level = 3: body does NOT contain the required sections.
8. Body begins with the required Document Notice (see **Document Notice**).
9. Normative language uses RFC 2119 keywords (see **Normative Language**).
10. Normative text obeys the **Terminology Discipline** (canonical names only; no "node").

## Template

### Level 3 Model Template (Lightweight)

```markdown
---
specification_version: "V_0-2-0"
specification_url: "<url-to-level-1-spec>"
level: 3
parent_spec:
  name: "<template>_V_x-y-z"
  url: "<immutable-url-to-template>"
model_version: "V_x-y-z"
title: "Model Name"
---

> [!NOTE]
> This is an **iNNfo document** — a plain-text Markdown file. Open it with any text editor or view and edit it with [cogNNitive](https://innfo.cognnitive.com/app/info-doc).

# _NN index
...

# _NN ConceptName
...
```

## Examples

### Full Parent Chain Resolution

From the sample model `specs/v0.2.0/level2/business/samples/Ghostbusters_V_0-2-0_business_NN.md`:

```yaml
# Ghostbusters (level 3)
parent_spec:
  name: "business_V_0-2-0"
  url: "https://raw.githubusercontent.com/cogNNitive/cogNNitive/main/specs/v0.2.0/level2/business/business_V_0-2-0_NN.md"

# business_V_0-2-0 (level 2)
parent_spec:
  name: "iNNfo_V_0-2-0"
  url: "https://raw.githubusercontent.com/cogNNitive/cogNNitive/main/specs/v0.2.0/level1/iNNfo_V_0-2-0_NN.md"

# iNNfo_V_0-2-0 (level 1)
parent_spec:
  name: "defiNNe_V_0-2-0"
  url: "https://raw.githubusercontent.com/cogNNitive/cogNNitive/main/specs/v0.2.0/level0/defiNNe_V_0-2-0_NN.md"

# defiNNe_V_0-2-0 (level 0) — this document
# No parent_spec — root of the chain
```

### Cached Directory After First Load

```
ðŸ“ Ghostbusters_V_0-2-0_business/
  ðŸ“„ Ghostbusters_V_0-2-0_business_NN.md
  ðŸ“ specs/
    ðŸ“„ business_V_0-2-0_NN.md
    ðŸ“„ iNNfo_V_0-2-0_NN.md
    ðŸ“„ defiNNe_V_0-2-0_NN.md
```
