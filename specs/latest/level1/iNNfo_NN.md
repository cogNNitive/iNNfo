---
specification_version: "V_0-3-0"
specification_url: "https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/v0.3.0/level1/iNNfo_V_0-3-0_NN.md"
level: 1
parent_spec:
  name: "defiNNe_V_0-2-0"
  url: "https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/v0.2.0/level0/defiNNe_V_0-2-0_NN.md"
title: "iNNfo Meta-template Specification"
description: "Level-1 meta-template defining the four root primitives (Concept Definition, Field Definition, Matrix Definition, Marker Definition) and the unified NN syntax: `# NN` sections, `## NN` elements, and `key:: value` properties."
author: "innV0 Team"
status: "Draft"
---

> [!NOTE]
> This is an **iNNfo document** — a plain-text Markdown file. Open it with any text editor or view and edit it with [cogNNitive](https://innfo.cognnitive.com/app/innfo-doc).

# iNNfo Meta-template Specification

## A concrete specification for semantic modeling with concepts, elements, fields, markers, and relationships, expressed through the unified NN syntax and a self-describing meta-template

## Philosophy

iNNfo is designed around five principles:

1. **Rich specs, lean models**: Specification documents (levels 0–2) are semantically rich. Models (level 3) carry only data and a parent pointer. The application resolves and caches the parent chain.
2. **Self-describing**: Every iNNfo document is valid Markdown with YAML frontmatter and the unified `NN` syntax. No proprietary tooling required to read it.
3. **Meta-template**: The level-1 specification is itself a *meta-template*. Level-2 templates are ordinary iNNfo documents that instantiate the four root primitives — `Concept Definition`, `Field Definition`, `Matrix Definition`, and `Marker Definition` — as ordinary elements in their body. There is no separate declaration format.
4. **Relationship polymorphism**: Relationships between concepts and elements are expressed through a typed system — hierarchy, evaluable matrices, graph edges, and sequences.
5. **One name, one identity**: An entity is identified by its name. The name is the single source of truth; there is no separate persisted identifier.

## Objectives

- Define a unified, minimal syntax: `# NN <Concept>`, `## NN <Concept>: <Element>`, and `key:: value` properties.
- Define the **Metaplantilla Nivel 1**: the four root primitives that every level-2 template instantiates.
- Remove the `concepts:` / `markers:` / `matrices:` frontmatter blocks from level-2 templates; their schema is expressed as body elements.
- Enable machine parsing, validation, and visual rendering of models via the parent chain resolver.
- Maintain full human readability and Git-diffability.
- Ensure that model files are lightweight and never duplicate specification content.

## Unified Syntax

iNNfo uses three structural markers. The `NN` token is required and distinguishes iNNfo structure from ordinary Markdown.

| Construct | Syntax | Example |
|---|---|---|
| Concept section | `# NN <Concept>` (H1) | `# NN Stakeholders` |
| Element | `## NN <Concept>: <Element>` (H2) | `## NN Stakeholders: Customer` |
| Property | `key:: value` (line immediately after the element heading) | `importance:: high` |

A **Concept** is a named type declared by a Template. A Concept section is introduced by an H1 heading `# NN <Concept>`.

An **Element** is a single instance of a Concept, declared as an H2 heading `## NN <Concept>: <Element>` within the Concept section. The `<Concept>` token names the owning concept (it MUST match the enclosing section concept).

A **Field** is a typed key-value property of an Element. Element properties are written on consecutive `key:: value` lines immediately after the `## NN` heading, before any free-form description text.

```markdown
# NN Stakeholders

## NN Stakeholders: Customer
importance:: high
needs:: [speed, accuracy]
Customer description text follows the properties.
```

Property values follow a small value grammar:

- Plain text — `relationship_model:: Dedicated`
- Quoted text — `brand_name:: "Acme Inc."`
- Numbers — `weight:: 90`
- Booleans — `published:: true`
- Inline arrays — `options:: [Ideation, MVP, Validation]`
- Inline objects (JSON) — `config:: {"a": 1}`

There is exactly ONE syntax. Older documents that use the legacy `_NN` markers or
fenced ```yaml blocks are not supported and MUST be migrated to the unified syntax.

## Root Primitives (Metaplantilla Nivel 1)

A level-2 **Template** is an iNNfo document (level 2) that instantiates the four root primitives. Each primitive is a reserved Concept name whose Elements carry the schema of the template.

| Primitive | Reserved Concept | Purpose | Instantiation |
|---|---|---|---|
| `Concept Definition` | `# NN Concept Definition` | Declares one Concept of the template | `## NN Concept Definition: <Name>` |
| `Field Definition` | `# NN Field Definition` | Declares one typed Field of a Concept | `## NN Field Definition: <Name>` |
| `Marker Definition` | `# NN Marker Definition` | Declares one evaluative Marker | `## NN Marker Definition: <Name>` |
| `Matrix Definition` | `# NN Matrix Definition` | Declares one evaluable Matrix | `## NN Matrix Definition: <Name>` |

### Concept Definition

Declares a Concept. The Element name is the Concept name. Allowed properties:

| Property | Type | Description |
|---|---|---|
| `type` | `text` \| `category` \| `weight` \| `list` \| `steps` \| `sequence` | Representation of the Concept (required) |
| `icon` | string | Lucide icon identifier |
| `color` | string | Theme color |
| `weight` | number | Display priority (higher = more prominent) |

```markdown
# NN Concept Definition

## NN Concept Definition: Stakeholders
icon:: users
type:: weight
color:: blue
weight:: 80
```

### Field Definition

Declares a typed Field of a Concept. The Element name is the Field name. Allowed properties:

| Property | Type | Description |
|---|---|---|
| `concept` | string | Name of the owning Concept Definition (required) |
| `type` | `string` \| `select` \| `reference` \| `markdown_inline` \| `markdown_file` \| `image` \| `file` \| `video` \| `audio` | Field type (required) |
| `options` | array | Allowed values for `select` fields |
| `target_concepts` | array | Target concepts for `reference` fields |
| `description` | string | Human-readable explanation |

```markdown
# NN Field Definition

## NN Field Definition: status
concept:: Stakeholders
type:: select
options:: [Ideation, MVP, Validation]
```

### Marker Definition

Declares an evaluative Marker scored per Element or Concept via the reserved `item-markers matrix`. The Element name is the Marker name. Allowed properties:

| Property | Type | Description |
|---|---|---|
| `symbol` | string | Display symbol (e.g. `*`, `!`, `?`) |
| `icon` | string | Lucide icon identifier |
| `color` | string | Theme color |
| `weight` | number | Display priority |

```markdown
# NN Marker Definition

## NN Marker Definition: priority
symbol:: !
icon:: flag
color:: red
```

### Matrix Definition

Declares an evaluable Matrix. The Element name is the Matrix name. Allowed properties:

| Property | Type | Description |
|---|---|---|
| `source` | string | Source Concept (rows) — required |
| `target` | string | Target Concept (columns) — required |
| `values` | array | Allowed cell values (empty cell `-` and boolean marker `X` are always accepted) |
| `widget` | `boolean` \| `cycle` \| `scale` \| `set` \| `text` | Cell interaction widget |
| `description` | string | Human-readable explanation |

```markdown
# NN Matrix Definition

## NN Matrix Definition: problems-value propositions matrix
source:: Problems
target:: Value propositions
widget:: set
values:: [Max, Very High, High]
```

### Resolving a Template Schema

An application resolves a Template's schema by parsing its body: the effective `concepts` are the elements of its `Concept Definition` sections, each Field Definition is attached to the Concept named by its `concept` property, and so on for Markers and Matrices. There is no other declaration format.

## Entity Glossary

iNNfo defines exactly these entities. Normative text uses only these canonical names.
The word "node" is an implementation term (a runtime graph representation) and MUST
NOT appear in normative text. The words block, section, instance, item, property, and
attribute MUST NOT be used as substitutes for the entities below.

**Containment spine (generic → specific):**

| Entity | Definition |
|---|---|
| **Workspace** | A directory with an `index.md` at its root that lists one or more Models. |
| **Model** | One level-3 document conforming to a Template. Contains Concepts and Elements. |
| **Concept** | A named type declared by the Template. Groups Elements of one kind. |
| **Element** | A single instance of a Concept. |
| **Field** | A typed key-value property of an Element, whose schema is declared on the Concept. |

**Cross-cutting entities:**

| Entity | Definition |
|---|---|
| **Marker** | A named evaluative dimension (e.g. weight, certainty, priority) scored per Element or Concept. |
| **Relationship** | A typed connection between Elements. Its subtypes are the Relationship Types. |
| **Matrix** | The tabular representation of certain Relationship Types. Not a separate semantic entity. |

**Definitional layer:**

| Entity | Definition |
|---|---|
| **Specification** | A level-0 (defiNNe) or level-1 (iNNfo) document. |
| **Template** | A level-2 document that instantiates the four root primitives (Concept, Field, Marker, Matrix Definitions) to declare the Concepts, Markers, Matrices, and Relationship Types available to its Models. |

## Reserved Pseudo-Concepts

The names `Concepts`, `Elements`, and `Markers` are RESERVED. A Template MUST NOT
declare a Concept with any of these names. They denote cross-cutting sets:

- `Concepts` — the set of all Concepts in the Model.
- `Elements` — the set of all Elements across every Concept in the Model.
- `Markers` — the set of all declared Markers.

They are used as the `source`/`target` of cross-cutting matrices (for example, the
reserved `item-markers matrix` targets `Markers`).

## Identity & Naming

The **name is the single source of truth** for identity. No slug or opaque id is
persisted in a model file.

**Uniqueness:**

- An Element name MUST be unique within the whole Model — across all Concepts.
- A Concept name MUST be unique within the Model.
- A Model's logical name is its frontmatter `title`, which MUST be unique within the
  Workspace.
- A name collision is a validation ERROR. Applications MUST NOT silently disambiguate.

**Model name vs filename:** the Model's logical name is `title`, decoupled from the
filename. The filename carries version and template purely for the resolver; an
application MAY warn on a mismatch between filename and `title`.

**Qualified references:** within a Model a bare name resolves because names are unique.
Across a Workspace, an Element is referenced as `Model :: Name` (or
`Model :: Concept :: Name` when needed). Any fully-qualified path is constructed by the
application at load time for the Workspace in which the Model is opened; it is NEVER
persisted in the model file, so a Model stays portable across Workspaces.

**Rename** is an application operation. It MUST rewrite every reference to the renamed
entity — the declaring marker, index entries, matrix row/column labels,
reference-typed field values, graph edges, and cross-model references — in a single
transaction, then re-validate. References that are broken by out-of-application edits
MUST be reported by the application as dangling references.

## Parent Chain

iNNfo is a level 1 specification. Its `parent_spec` points to defiNNe:

```yaml
parent_spec:
  name: "defiNNe_V_0-2-0"
  url: "https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/v0.2.0/level0/defiNNe_V_0-2-0_NN.md"
```

All templates (level 2) MUST declare `parent_spec` pointing to iNNfo. All models
(level 3) MUST declare `parent_spec` pointing to their template. Resolution follows the
Spec Resolver Protocol defined in defiNNe.

## Template Inline Restriction

A level 3 model MUST NOT include `concepts`, `markers`, `matrices`, or
`relationship_types` in its frontmatter. These are defined by the template (level 2)
as body elements instantiating the root primitives, and resolved via the
parent chain. The model frontmatter is limited to:

```yaml
---
specification_version: "V_0-3-0"
specification_url: "<immutable-url>"
level: 3
parent_spec:
  name: "<template>_V_x-y-z"
  url: "<immutable-url>"
model_version: "V_x-y-z"
title: "..."
---
```

## Fields & Assets

A Field is either **inline** or **file-backed**:

- **Inline field** — the value lives in the Element's `key:: value` properties
  (`string`, `select`, `reference`) or, for prose, as `markdown_inline` content.
- **File-backed field** — the value is a filename; the content lives in a sidecar file.
  The file-backed types are `markdown_file`, `image`, `file`, `video`, and `audio`.

**Storage convention (single, canonical).** Every file-backed field's file MUST be
stored at:

```
{modelDir}/assets/{element-slug}/{filename}
```

- `{element-slug}` is the Element's derived slug.
- The Element's property value holds the `{filename}`; the directory is derived by
  this convention and never stored.
- There is exactly ONE storage convention. An application MUST resolve, scan, and write
  file-backed fields through this single rule. There is no `asset_mode` and no
  per-element-at-root storage.

**Declared fields vs attachments.** The Concept `fields` schema is the source of truth
for which typed Fields an Element has. A file present under `assets/{element-slug}/` that
does not correspond to a declared Field is surfaced as an untyped **attachment**, not as
a Field. There is no parallel discovery mechanism.

**Rename.** Renaming an Element changes its `{element-slug}`; the transactional rename
MUST relocate the Element's `assets/{element-slug}/` folder accordingly.

## Relationship Types

A Template enables Relationship Types via a `relationship_types` map in its frontmatter:

```yaml
relationship_types:
  hierarchy:
    enabled: true
  evaluable_matrix:
    enabled: true
  graph_edge:
    enabled: false
  sequence:
    enabled: true
```

| Type | Meaning | Representation |
|---|---|---|
| `hierarchy` | Parent-child taxonomy | The `# NN index` block (see Index Block) |
| `evaluable_matrix` | N-to-M relationship on a value set | A Matrix table with a declared `values` set |
| `graph_edge` | Labeled/weighted graph edge | frontmatter `graph_edges` array |
| `sequence` | Ordered steps or events | Concept of type `steps` or `sequence` |

Hierarchy is expressed **only** through the index block. There is no hierarchy matrix.

## Model Body Syntax

**Document Notice (Required).** The first content in the body MUST be:

```markdown
> [!NOTE]
> This is an **iNNfo document**...
```

**Index Block.** The index block defines the taxonomy hierarchy via nested Markdown
lists. Each list item identifies a Concept or Element using **WikiLink syntax**
`[[Name]]`:

```markdown
# NN index
* [[Parent Concept]]
  * [[Child Concept]]
    * [[Grandchild Concept]]
* [[Another Root Concept]]
```

- Nesting depth indicates parent-child relationships.
- The index block is identified by the name `index`.
- Every reference MUST resolve to a name defined in the model; unresolvable references
  are reported as dangling references.
- List items MUST use `*` or `-` as the bullet character. Numbered lists are not
  supported. The valid-item pattern is `/^\s*[*\-]\s+/`.

The index block is the single mechanism for hierarchy.

**Concept Block.** Each Concept in the model corresponds to a section. The content
syntax depends on the Concept's `type`:

| Type | Syntax | Description |
|---|---|---|
| `text` | Free-form Markdown | Single block of content, no elements |
| `weight` | `## NN` element headings | Multi-instance, each with optional `key:: value` properties |
| `list` | `## NN` element headings | Multi-instance, each with optional `key:: value` properties |
| `category` | No content block | Taxonomy-only concept; children appear in index |
| `steps` | `## NN` element headings | Ordered sequence of instances |
| `sequence` | `## NN` element headings | Ordered sequence of events |

All multi-instance types use the same element-heading syntax:

```markdown
# NN Stakeholders
## NN Stakeholders: Element Name
field1:: value1
field2:: value2
Optional description text.

## NN Stakeholders: Another Element
Description without properties.
```

- The `# NN <Concept>` heading introduces a Concept block; the Concept name MUST match
  a concept defined in the template.
- The `## NN <Concept>: <Element>` heading declares an Element of that Concept. The
  parser pattern is `/^\s*##\s+NN\s+([^:\n]+?):\s+(.*)$/`. Element order is determined
  by document position.
- Property lines `key:: value` immediately follow the element heading. The parser
  pattern is `/^\s*([A-Za-z_][A-Za-z0-9_-]*)\s*::\s*(.*)$/`.
- A single-instance `text` concept has no element headings; its content is plain
  Markdown.

**Matrix Block.** iNNfo supports two matrix kinds, distinguished by the section name in
`# NN matrices:`:

*Relational Matrix* — cross-tabulates Elements of a source Concept (rows) against
Elements of a target Concept (columns). Cells contain a value from the matrix's
declared `values`:

```markdown
# NN matrices: problems-value propositions matrix
| Problems \ Value propositions | VP Name |
| :--- | :---: |
| Problem name | High |
```

*Item-Markers Matrix* — the reserved section name `item-markers matrix` assigns Marker
scores to Elements or Concepts. Rows are Element or Concept names; columns are Marker
names defined in the template:

```markdown
# NN matrices: item-markers matrix
| Item \ Marker | weight | certainty | priority |
| :--- | :---: | :---: | :---: |
| Element Name | 9 | 5 | - |
```

## Level 2 Template Structure (Metaplantilla)

A template is a level-2 iNNfo document. Its frontmatter declares only identity, parent,
and relationship settings; its body instantiates the four root primitives.

```yaml
---
specification_version: "V_0-3-0"
specification_url: "<immutable-url>"
level: 2
parent_spec:
  name: "iNNfo_V_0-3-0"
  url: "https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/v0.3.0/level1/iNNfo_V_0-3-0_NN.md"
title: "<Template Name>"
relationship_types: {...}
---
```

Body:

```markdown
> [!NOTE]
> This is an **iNNfo document**...

# NN index
* [[...]]  (the template's root concepts)

# NN Concept Definition
## NN Concept Definition: <Concept>
icon:: <icon>
type:: <type>
color:: <color>
weight:: <n>

# NN Field Definition
## NN Field Definition: <Field>
concept:: <Concept>
type:: <type>
options:: [...]
target_concepts:: [...]

# NN Marker Definition
## NN Marker Definition: <Marker>
symbol:: <symbol>

# NN Matrix Definition
## NN Matrix Definition: <Matrix>
source:: <Concept>
target:: <Concept>
values:: [..]
widget:: set

# <Template Name>       (prose: Philosophy, Objectives, Specification)
# Concept Guidance Documentation   (## <Concept> with ### Summary/Description/...)
```

## Level 3 Model Structure (Lightweight)

```yaml
---
specification_version: "V_0-3-0"
specification_url: "<immutable-url>"
level: 3
parent_spec:
  name: "<template>_V_x-y-z"
  url: "<immutable-url>"
model_version: "V_x-y-z"
title: "..."
---

> [!NOTE]
> ...
# NN index
...
# NN Concept
## NN Concept: Element
key:: value
...
```

## Workspace Structure

A iNNfo Workspace is a directory containing one or more Models. The entry point is an
`index.md` file at the Workspace root.

**index.md (Required).** Every Workspace MUST have an `index.md` at its root. The
application reads `index.md` as the single entry point — no filesystem scanning. It uses
`# NN index` with standard Markdown links to list all Workspace Models:

```markdown
# NN index

* [Business Model](./Business%20Model_V_1-0-0_business_NN.md)
* [KB Model](./KB%20Model_V_1-0-0_kb_NN.md)
```

- The Workspace root `index.md` MUST use Markdown link syntax for Open Knowledge Format
  (OKF) compatibility.
- Each link target MUST be an `_NN.md` file relative to the Workspace root.
- If `index.md` is missing, the application SHALL return an error.
- If a link targets a non-existent file, the parser SHALL emit a warning and skip it.

**Relationship to Open Knowledge Format (OKF).** iNNfo's Workspace convention is
informed by the [Open Knowledge Format (OKF)](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md).
Both use Markdown files with YAML frontmatter. OKF consumers can navigate a iNNfo
Workspace: `index.md` has no frontmatter and is read as a reserved index file; links are
standard Markdown; `NN` markers are plain text and safely ignored. iNNfo extends OKF
with structured semantic modeling (parent chain, root primitives, markers, matrices)
that OKF does not define; these are additive.

## Immutable Versioning Policy

- **Published specs are frozen.** Once a specification version is released, its file is
  never modified. Corrections or improvements require a new spec version.
- **Migrating a model** to a new spec version means creating a new copy of the model
  adapted to the new version.
- **Parent chain resolution** always resolves to the version the model was authored
  against.

## Removed Constructs

The following are NOT part of iNNfo:

- **FOLDER mode / `_F` markers** — models are single files using `NN` markers only.
- **Hierarchy matrices** — hierarchy is expressed only through the index block.
- **`_FORMAT.md` filenames** — the canonical suffix is `_NN.md`.
- **`* _NN` element bullets and fenced ```yaml property blocks** — replaced by the
  unified `## NN` headings and `key:: value` properties.

## Self-Description

This document (`iNNfo_V_0-3-0_NN.md`) is itself a level 1 specification following
defiNNe. It declares `parent_spec: { name: "defiNNe_V_0-2-0", url: "..." }` and defines
the four root primitives that every level-2 template instantiates.
