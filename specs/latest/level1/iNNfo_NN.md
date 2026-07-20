---
specification_version: "V_0-2-0"
specification_url: "https://raw.githubusercontent.com/innV0/iNNfo/main/specs/v0.2.0/level1/iNNfo_V_0-2-0_NN.md"
level: 1
parent_spec:
  name: "defiNNe_V_0-2-0"
  url: "https://raw.githubusercontent.com/innV0/iNNfo/main/specs/v0.2.0/level0/defiNNe_V_0-2-0_NN.md"
title: "iNNfo Specification"
description: "Concrete specification for semantic modeling with concepts, elements, fields, markers, and relationships."
author: "innV0 Team"
status: "Draft"
relationship_types:
  - name: "hierarchy"
    description: "Parent-child structural relationship between elements, declared in the index block"
    representation: "index block with WikiLinks"
  - name: "evaluable_matrix"
    description: "N-to-M relationship evaluated on a value set between elements of two concepts"
    representation: "Markdown sourceâ†’target table with a declared value set"
  - name: "graph_edge"
    description: "Graph edge with optional label, weight, and arbitrary properties"
    representation: "frontmatter graph_edges array"
  - name: "sequence"
    description: "Ordered sequence of steps or milestone events"
    representation: "concept type 'steps' or 'sequence'"
---

> [!NOTE]
> This is an **iNNfo document** â€” a plain-text Markdown file that carries its own schema in the YAML frontmatter. You can view and edit this model online at [format.innv0.com/app](https://format.innv0.com/app/) or contribute via the [GitHub repository](https://github.com/innV0/iNNfo).

# iNNfo Specification

## A concrete specification for semantic modeling with concepts, elements, fields, markers, and relationships

## Philosophy

iNNfo is designed around five principles:

1. **Rich specs, lean models**: Specification documents (levels 0â€“2) are semantically rich. Models (level 3) carry only data and a parent pointer. The application resolves and caches the parent chain.
2. **Self-describing**: Every iNNfo document is valid Markdown with YAML frontmatter. No proprietary tooling required to read it.
3. **Relationship polymorphism**: Relationships between concepts and elements are expressed through a typed system â€” hierarchy, evaluable matrices, graph edges, and sequences.
4. **Template-driven**: Every model conforms to a template that defines its valid concepts, markers, and relationship types.
5. **One name, one identity**: An entity is identified by its name. The name is the single source of truth; there is no separate persisted identifier.

## Objectives

- Define a unified conceptual model (concepts, elements, fields, markers, relationships).
- Provide a template system with rich semantic documentation (Philosophy, Objectives, full spec).
- Enable machine parsing, validation, and visual rendering of models via the parent chain resolver.
- Maintain full human readability and Git-diffability.
- Ensure that model files are lightweight and never duplicate specification content.

## Specification

### Entity Glossary

iNNfo defines exactly these entities. Normative text uses only these canonical names.
The word "node" is an implementation term (a runtime graph representation) and MUST
NOT appear in normative text. The words block, section, instance, item, property, and
attribute MUST NOT be used as substitutes for the entities below.

**Containment spine (generic â†’ specific):**

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
| **Template** | A level-2 document that declares the Concepts, Markers, Matrices, and Relationship Types available to its Models. |

### Reserved Pseudo-Concepts

The names `Concepts`, `Elements`, and `Markers` are RESERVED. A Template MUST NOT
declare a Concept with any of these names. They denote cross-cutting sets:

- `Concepts` â€” the set of all Concepts in the Model.
- `Elements` â€” the set of all Elements across every Concept in the Model.
- `Markers` â€” the set of all declared Markers.

They are used as the `source`/`target` of cross-cutting matrices (for example, the
reserved `item-markers matrix` targets `Markers`).

### Identity & Naming

The **name is the single source of truth** for identity. No slug or opaque id is
persisted in a model file.

**Uniqueness:**

- An Element name MUST be unique within the whole Model â€” across all Concepts.
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
entity â€” the declaring marker, index entries, matrix row/column labels,
reference-typed field values, graph edges, and cross-model references â€” in a single
transaction, then re-validate. References that are broken by out-of-application edits
MUST be reported by the application as dangling references.

### Parent Chain

iNNfo is a level 1 specification. Its `parent_spec` points to defiNNe:

```yaml
parent_spec:
  name: "defiNNe_V_0-2-0"
  url: "https://raw.githubusercontent.com/innV0/iNNfo/main/specs/v0.2.0/level0/defiNNe_V_0-2-0_NN.md"
```

All templates (level 2) MUST declare `parent_spec` pointing to iNNfo. All models
(level 3) MUST declare `parent_spec` pointing to their template. Resolution follows the
Spec Resolver Protocol defined in defiNNe.

### Template Inline Restriction

A level 3 model MUST NOT include `concepts`, `markers`, `matrices`, or
`relationship_types` in its frontmatter. These are defined by the template (level 2)
and resolved via the parent chain. The model frontmatter is limited to:

```yaml
---
specification_version: "V_0-2-0"
specification_url: "<immutable-url>"
level: 3
parent_spec:
  name: "<template>_V_x-y-z"
  url: "<immutable-url>"
model_version: "V_x-y-z"
title: "..."
---
```

### Conceptual Model

**Template.** A Template (level 2) declares:
- `concepts`: allowed concept names, types, icons, colors, weights, field schemas
- `markers`: evaluative dimensions (weight, certainty, priority...)
- `matrices`: relationship declarations between concepts (source, target, values)
- `relationship_types`: which Relationship Types the template enables
- Body: Philosophy, Objectives, Specification, Template, Examples

**Concept.**

| Field | Description |
|---|---|
| `name` | Unique concept name within the Model |
| `type` | `text`, `category`, `weight`, `list`, `steps`, `sequence` |
| `icon` | Lucide icon identifier |
| `color` | Theme color |
| `weight` | Display priority (higher = more prominent) |
| `fields` | Optional field schema for the Concept's Elements |

**Element.** An instance of a Concept, declared as a bullet with `* _NN <Concept>: <Name>`.
A Concept section is introduced by an H1 heading `# _NN <Concept>` (or the hidden form
`# <!-- _NN --> <Concept>`, where only the marker is invisible and the heading text
renders normally). An Element MAY have Fields (YAML key-value), a Description
(free-form Markdown), and Marker scores.

**Field.** A typed key-value property of an Element. The Concept's `fields` schema
declares each Field's name and type: `string`, `select`, `reference`, `markdown_inline`
(inline prose), `markdown_file`, `image`, `file`, `video`, `audio`. A `reference` Field
declares `target_concepts`. File-backed field types are defined under **Fields & Assets**.

**Marker.** A named evaluative dimension declared in the template `markers`. Marker
scores are assigned to Elements or Concepts via the reserved `item-markers matrix`.

### Fields & Assets

A Field is either **inline** or **file-backed**:

- **Inline field** â€” the value lives in the Element's YAML (`string`, `select`,
  `reference`) or, for prose, as `markdown_inline` content.
- **File-backed field** â€” the value is a filename; the content lives in a sidecar file.
  The file-backed types are `markdown_file`, `image`, `file`, `video`, and `audio`.

**Storage convention (single, canonical).** Every file-backed field's file MUST be
stored at:

```
{modelDir}/assets/{element-slug}/{filename}
```

- `{element-slug}` is the Element's derived slug.
- The Element's YAML field value holds the `{filename}`; the directory is derived by
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

### Relationship Types

A Template enables Relationship Types via a `relationship_types` map:

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
| `hierarchy` | Parent-child taxonomy | The `# _NN index` block (see Index Block) |
| `evaluable_matrix` | N-to-M relationship on a value set | A Matrix table with a declared `values` set |
| `graph_edge` | Labeled/weighted graph edge | frontmatter `graph_edges` array |
| `sequence` | Ordered steps or events | Concept of type `steps` or `sequence` |

Hierarchy is expressed **only** through the index block. There is no hierarchy matrix.

### Model Body Syntax

**Document Notice (Required).** The first content in the body MUST be:

```markdown
> [!NOTE]
> This is an **iNNfo document**...
```

**Index Block.** The index block defines the taxonomy hierarchy via nested Markdown
lists. Each list item identifies a Concept or Element using **WikiLink syntax**
`[[Name]]`:

```markdown
# _NN index
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
| `weight` | Bullet list with `_NN` markers | Multi-instance, each with optional YAML fields |
| `list` | Bullet list with `_NN` markers | Multi-instance, each with optional YAML fields |
| `category` | No content block | Taxonomy-only concept; children appear in index |
| `steps` | Bullet list with `_NN` markers | Ordered sequence of instances |
| `sequence` | Bullet list with `_NN` markers | Ordered sequence of events |

All multi-instance types use the same bullet-list Element syntax:

```markdown
# _NN Stakeholders
* _NN Stakeholders: Element Name
  ```yaml
  field1: value1
  field2: value2
  ```
  Optional description text.
* _NN Stakeholders: Another Element
  Description without YAML fields.
```

- The `# _NN <Concept>` heading introduces a Concept block; the Concept name MUST match
  a concept from the template frontmatter.
- The visible `_NN` marker (`* _NN <Concept>: <Name>`) declares which Concept an Element
  belongs to. For invisible markers, use `<!-- _NN <Concept>: -->` followed by the name.
- Element markers MUST use `*` or `-` bullets. The parser pattern is
  `/^\s*[*\-]\s+_NN\s+([\w\s-]+?):\s+(.*)$/`. Numbered lists are not supported. Element
  order is determined by document position.
- A single-instance `text` concept has no element markers; its content is plain Markdown.

**Matrix Block.** iNNfo supports two matrix kinds, distinguished by the section name in
`# _NN matrices:`:

*Relational Matrix* â€” cross-tabulates Elements of a source Concept (rows) against
Elements of a target Concept (columns). Cells contain a value from the matrix's
declared `values`:

```markdown
# _NN matrices: problems-value propositions matrix
| Problems \ Value propositions | VP Name |
| :--- | :---: |
| Problem name | High |
```

*Item-Markers Matrix* â€” the reserved section name `item-markers matrix` assigns Marker
scores to Elements or Concepts. Rows are Element or Concept names; columns are Marker
names defined in the template:

```markdown
# _NN matrices: item-markers matrix
| Item \ Marker | weight | certainty | priority |
| :--- | :---: | :---: | :---: |
| Element Name | 9 | 5 | - |
```

### Workspace Structure

A iNNfo Workspace is a directory containing one or more Models. The entry point is an
`index.md` file at the Workspace root.

**index.md (Required).** Every Workspace MUST have an `index.md` at its root. The
application reads `index.md` as the single entry point â€” no filesystem scanning. It uses
`# _NN index` with standard Markdown links to list all Workspace Models:

```markdown
# _NN index

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
standard Markdown; `_NN` markers are plain text and safely ignored. iNNfo extends OKF
with structured semantic modeling (parent chain, concepts, markers, matrices) that OKF
does not define; these are additive.

### Immutable Versioning Policy

- **Published specs are frozen.** Once a specification version is released, its file is
  never modified. Corrections or improvements require a new spec version.
- **Migrating a model** to a new spec version means creating a new copy of the model
  adapted to the new version.
- **Parent chain resolution** always resolves to the version the model was authored
  against.

### Removed Constructs

The following are NOT part of iNNfo:

- **FOLDER mode / `_F` markers** â€” models are single files using `_NN` markers only.
- **Hierarchy matrices** â€” hierarchy is expressed only through the index block.
- **`_FORMAT.md` filenames** â€” the canonical suffix is `_NN.md`.

### Self-Description

This document (`iNNfo_V_0-2-0_NN.md`) is itself a level 1 specification following
defiNNe. It declares `parent_spec: { name: "defiNNe_V_0-2-0", url: "..." }` and includes
the required body sections in order.

## Template

### Level 2 Template Structure

```yaml
---
specification_version: "V_0-2-0"
specification_url: "<immutable-url>"
level: 2
parent_spec:
  name: "iNNfo_V_0-2-0"
  url: "https://raw.githubusercontent.com/innV0/iNNfo/main/specs/v0.2.0/level1/iNNfo_V_0-2-0_NN.md"
title: "<Template Name>"
concepts: [...]
markers: [...]
matrices: [...]
relationship_types: {...}
---

> [!NOTE]
> This is an **iNNfo document**...

# <Template Name>

## One-sentence summary

## Philosophy

## Objectives

## Specification

## Template

## Examples
```

### Level 3 Model Structure (Lightweight)

```yaml
---
specification_version: "V_0-2-0"
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
# _NN index
...
# _NN Concept
...
```

## Examples

### Parent Chain

```yaml
parent_spec:
  name: "business_V_0-2-0"
  url: "https://raw.githubusercontent.com/innV0/iNNfo/main/specs/v0.2.0/level2/business/business_V_0-2-0_NN.md"
```
