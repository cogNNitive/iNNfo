---
specification_version: "V_0-1-3"
specification_url: "https://raw.githubusercontent.com/innV0/cogNNitive/main/specs/v0.1.0/level2/catalog/catalog_V_0-1-3_NN.md"
level: 2
parent_spec:
  name: "iNNfo_V_0-1-1"
  url: "https://raw.githubusercontent.com/innV0/cogNNitive/main/specs/v0.1.0/level1/iNNfo_V_0-1-1_NN.md"
title: "Catalog Template"
concepts:
  - name: "Artist"
    icon: "music"
    type: "weight"
    color: "violet"
    weight: 95
    fields:
      - name: "genre"
        type: "string"
      - name: "country"
        type: "string"
      - name: "members"
        type: "number"
      - name: "bio"
        type: "text"
  - name: "Album"
    icon: "disc"
    type: "weight"
    color: "green"
    weight: 90
    fields:
      - name: "artist"
        type: "string"
      - name: "release_year"
        type: "number"
      - name: "label"
        type: "string"
      - name: "highlights"
        type: "text"
  - name: "Genre"
    icon: "headphones"
    type: "weight"
    color: "orange"
    weight: 70
    fields:
      - name: "era"
        type: "string"
      - name: "description"
        type: "text"
  - name: "Instrument"
    icon: "guitar"
    type: "weight"
    color: "blue"
    weight: 50
    fields:
      - name: "description"
        type: "text"
  - name: "Scientist"
    icon: "flask"
    type: "weight"
    color: "blue"
    weight: 95
    fields:
      - name: "field"
        type: "string"
      - name: "nationality"
        type: "string"
      - name: "birth"
        type: "string"
      - name: "death"
        type: "string"
      - name: "bio"
        type: "text"
  - name: "Theory"
    icon: "lightbulb"
    type: "weight"
    color: "amber"
    weight: 90
    fields:
      - name: "scientist"
        type: "string"
      - name: "year"
        type: "number"
      - name: "field"
        type: "string"
      - name: "impact"
        type: "text"
  - name: "Bias"
    icon: "brain"
    type: "weight"
    color: "red"
    weight: 85
    fields:
      - name: "definicion"
        type: "text"
      - name: "impacto_en_innovacion"
        type: "text"
      - name: "storytelling"
        type: "text"
      - name: "ejemplos"
        type: "text"
      - name: "mitigation"
        type: "text"
  - name: "AILab"
    icon: "building"
    type: "weight"
    color: "purple"
    weight: 80
    fields:
      - name: "founded"
        type: "string"
      - name: "headquarters"
        type: "string"
      - name: "focus"
        type: "string"
      - name: "key_product"
        type: "string"
      - name: "bio"
        type: "text"
  - name: "AIProduct"
    icon: "box"
    type: "weight"
    color: "green"
    weight: 85
    fields:
      - name: "company"
        type: "string"
      - name: "launch"
        type: "string"
      - name: "type"
        type: "string"
      - name: "description"
        type: "text"
  - name: "Researcher"
    icon: "user"
    type: "weight"
    color: "blue"
    weight: 75
    fields:
      - name: "role"
        type: "string"
      - name: "organization"
        type: "string"
      - name: "background"
        type: "text"
      - name: "known_for"
        type: "text"
  - name: "Technology"
    icon: "zap"
    type: "weight"
    color: "purple"
    weight: 70
    fields:
      - name: "description"
        type: "text"
  - name: "Observatory"
    icon: "telescope"
    type: "weight"
    color: "cyan"
    weight: 85
    fields:
      - name: "launch"
        type: "string"
      - name: "location"
        type: "string"
      - name: "operator"
        type: "string"
      - name: "wavelength"
        type: "string"
      - name: "description"
        type: "text"
  - name: "Discovery"
    icon: "sparkles"
    type: "weight"
    color: "yellow"
    weight: 90
    fields:
      - name: "discoverer"
        type: "string"
      - name: "year"
        type: "number"
      - name: "type"
        type: "string"
      - name: "impact"
        type: "text"
  - name: "Milestone"
    icon: "flag"
    type: "weight"
    color: "red"
    weight: 60
    fields:
      - name: "year"
        type: "number"
      - name: "impact"
        type: "string"
      - name: "description"
        type: "text"
markers:
  - name: "weight"
    symbol: "*"
    icon: "plus"
    color: "blue"
  - name: "certainty"
    symbol: "?"
    icon: "help-circle"
    color: "green"
  - name: "rating"
    symbol: "+"
    icon: "star"
    color: "green"
relationship_declarations:
  hierarchy:
    enabled: true
    via: "subdirectory nesting"
  evaluable_matrix:
    enabled: false
  graph_edge:
    enabled: true
  sequence:
    enabled: false
---

> [!NOTE]
> This is an **iNNfo document** — a plain-text Markdown file that carries its own schema in the YAML frontmatter.

# Catalog Template

## A FOLDER-mode template for structured knowledge catalogs with music, science, technology, and astrophysics concepts

## Philosophy

The Catalog Template models collections of things — artists, albums, scientists, theories, labs, observatories — where each item is a folder containing structured metadata. The directory structure organizes items visually; the template defines their types and fields.

## Objectives

- Provide a FOLDER-mode template for cataloging any domain (music, science, technology, astrophysics).
- Define domain-specific concepts with typed fields for rich metadata.
- Support graph edges for cross-references between elements.
- Keep element metadata in `_NN.md` files within item folders.

## Specification

### 1. Supported Mode

This template supports **FOLDER mode only**.

### 2. Concepts

| Concept | Type | Purpose |
|---|---|---|
| **Artist** | weight | Musical artist or band |
| **Album** | weight | Music album |
| **Genre** | weight | Music genre |
| **Instrument** | weight | Musical instrument |
| **Scientist** | weight | Person doing scientific research |
| **Theory** | weight | Scientific theory or explanation |
| **Bias** | weight | Cognitive bias |
| **AILab** | weight | Organization doing AI research |
| **AIProduct** | weight | AI-powered product or service |
| **Researcher** | weight | Person doing AI research |
| **Technology** | weight | Technical domain or capability |
| **Observatory** | weight | Scientific observation facility |
| **Discovery** | weight | Scientific finding |
| **Milestone** | weight | Historical event or achievement |

### 3. Markers

| Marker | Symbol | Purpose |
|---|---|---|
| `weight` | `*` | Importance score (1–10) |
| `certainty` | `?` | Confidence level (1–5) |
| `rating` | `+` | Quality rating |

### 4. Relationship Types

| Type | Enabled | Representation |
|---|---|---|
| Hierarchy | ✅ | Subdirectory nesting |
| Evaluable matrix | ❌ | Not applicable |
| Graph edge | ✅ | `graph_edges` array in frontmatter |
| Sequence | ❌ | Not applicable |

### 5. FOLDER Mode Structure

Type folders (Artist/, Album/, etc.) are organizational. Only item folders contain `_NN.md`.

```
📁 <Model>_V_x-y-z_catalog/
  📄 _NN.md              ← root (mode: FOLDER, parent: catalog_V_0-1-2)
  📁 Artist/
    📁 Queen/
      📄 _NN.md          ← type: Artist, fields: { genre, country, bio }
    📁 Michael Jackson/
      📄 _NN.md
  📁 Album/
    📁 Thriller/
      📄 _NN.md          ← type: Album, fields: { artist, release_year, highlights }
```

### 6. Element Frontmatter

Each item folder's `_NN.md`:

```yaml
---
type: "Artist"
fields:
  genre: "Rock"
  country: "UK"
  members: 4
  bio: "Legendary rock band."
markers:
  weight: 9
---
```

### 7. Graph Edges

Items MAY reference each other via `graph_edges`:

```yaml
---
type: "Album"
fields:
  artist: "Queen"
graph_edges:
  - target: "../Queen"
    label: "created by"
---
```

## Template

### Starter Template Boilerplate

To initialize a new catalog workspace, create the following directory and file structure:

```
📁 my_catalog_V_1-0-0_catalog/
  📄 _NN.md                   ← Root catalog configuration (FILE mode parent chain config)
  📁 Artist/
    📁 Queen/
      📄 _NN.md               ← Artist instance
```

#### Root Catalog Configuration File (`_NN.md`)

```yaml
---
specification_version: "V_0-1-3"
level: 3
parent_spec:
  name: "catalog_V_0-1-3"
  url: "https://raw.githubusercontent.com/innV0/cogNNitive/main/specs/v0.1.0/level2/catalog/catalog_V_0-1-3_NN.md"
model_version: "V_1-0-0"
title: "My Catalog"
---
```

#### Element Instance File (`Artist/Queen/_NN.md`)

```yaml
---
type: "Artist"
fields:
  genre: "Rock"
  country: "UK"
  members: 4
  bio: "Legendary rock band."
markers:
  weight: 9
---
```


### Level 3 Model Structure

```yaml
---
specification_version: "V_0-1-2"
specification_url: "..."
level: 3
parent_spec:
  name: "catalog_V_0-1-2"
  url: "https://raw.githubusercontent.com/innV0/cogNNitive/main/specs/v0.1.0/level2/catalog/catalog_V_0-1-2_NN.md"
model_version: "V_1-0-0"
title: "<Model Title>"
---
```

## Examples

### Canonical Sample

The official sample for this template is at `specs/v0.1.0/level2/catalog/samples/Music_History_V_1-0-0_catalog/` (FOLDER mode). It exercises all catalog concepts with hierarchy via subdirectories.

### Parent Chain

```yaml
# From the Music_History sample:
parent_spec:
  name: "catalog_V_0-1-2"
  url: "https://raw.githubusercontent.com/innV0/cogNNitive/main/specs/v0.1.0/level2/catalog/catalog_V_0-1-2_NN.md"

# This template's parent:
parent_spec:
  name: "iNNfo_V_0-1-0"
  url: "https://raw.githubusercontent.com/innV0/cogNNitive/main/specs/v0.1.0/level1/iNNfo_V_0-1-0_NN.md"
```


# Concept Guidance Documentation

## Artist

### Summary
Musical artist or band.

### Description
Musical artist or band.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## genre

### Summary
Music genre.

### Description
Music genre.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## country

### Summary
Description of country.

### Description
Description of country.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## members

### Summary
Description of members.

### Description
Description of members.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## bio

### Summary
Description of bio.

### Description
Description of bio.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## Album

### Summary
Music album.

### Description
Music album.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## artist

### Summary
Musical artist or band.

### Description
Musical artist or band.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## release_year

### Summary
Description of release_year.

### Description
Description of release_year.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## label

### Summary
Description of label.

### Description
Description of label.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## highlights

### Summary
Description of highlights.

### Description
Description of highlights.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## Genre

### Summary
Music genre.

### Description
Music genre.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## era

### Summary
Description of era.

### Description
Description of era.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## description

### Summary
Description of description.

### Description
Description of description.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## Instrument

### Summary
Musical instrument.

### Description
Musical instrument.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## description

### Summary
Description of description.

### Description
Description of description.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## Scientist

### Summary
Person doing scientific research.

### Description
Person doing scientific research.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## field

### Summary
Description of field.

### Description
Description of field.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## nationality

### Summary
Description of nationality.

### Description
Description of nationality.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## birth

### Summary
Description of birth.

### Description
Description of birth.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## death

### Summary
Description of death.

### Description
Description of death.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## bio

### Summary
Description of bio.

### Description
Description of bio.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## Theory

### Summary
Scientific theory or explanation.

### Description
Scientific theory or explanation.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## scientist

### Summary
Person doing scientific research.

### Description
Person doing scientific research.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## year

### Summary
Description of year.

### Description
Description of year.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## field

### Summary
Description of field.

### Description
Description of field.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## impact

### Summary
Description of impact.

### Description
Description of impact.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## Bias

### Summary
Cognitive bias.

### Description
Cognitive bias.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## definicion

### Summary
Description of definicion.

### Description
Description of definicion.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## impacto_en_innovacion

### Summary
Description of impacto_en_innovacion.

### Description
Description of impacto_en_innovacion.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## storytelling

### Summary
Description of storytelling.

### Description
Description of storytelling.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## ejemplos

### Summary
Description of ejemplos.

### Description
Description of ejemplos.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## mitigation

### Summary
Description of mitigation.

### Description
Description of mitigation.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## AILab

### Summary
Organization doing AI research.

### Description
Organization doing AI research.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## founded

### Summary
Description of founded.

### Description
Description of founded.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## headquarters

### Summary
Description of headquarters.

### Description
Description of headquarters.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## focus

### Summary
Description of focus.

### Description
Description of focus.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## key_product

### Summary
Description of key_product.

### Description
Description of key_product.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## bio

### Summary
Description of bio.

### Description
Description of bio.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## AIProduct

### Summary
AI-powered product or service.

### Description
AI-powered product or service.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## company

### Summary
Description of company.

### Description
Description of company.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## launch

### Summary
Description of launch.

### Description
Description of launch.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## type

### Summary
Description of type.

### Description
Description of type.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## description

### Summary
Description of description.

### Description
Description of description.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## Researcher

### Summary
Person doing AI research.

### Description
Person doing AI research.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## role

### Summary
Description of role.

### Description
Description of role.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## organization

### Summary
Description of organization.

### Description
Description of organization.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## background

### Summary
Description of background.

### Description
Description of background.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## known_for

### Summary
Description of known_for.

### Description
Description of known_for.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## Technology

### Summary
Technical domain or capability.

### Description
Technical domain or capability.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## description

### Summary
Description of description.

### Description
Description of description.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## Observatory

### Summary
Scientific observation facility.

### Description
Scientific observation facility.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## launch

### Summary
Description of launch.

### Description
Description of launch.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## location

### Summary
Description of location.

### Description
Description of location.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## operator

### Summary
Description of operator.

### Description
Description of operator.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## wavelength

### Summary
Description of wavelength.

### Description
Description of wavelength.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## description

### Summary
Description of description.

### Description
Description of description.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## Discovery

### Summary
Scientific finding.

### Description
Scientific finding.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## discoverer

### Summary
Description of discoverer.

### Description
Description of discoverer.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## year

### Summary
Description of year.

### Description
Description of year.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## type

### Summary
Description of type.

### Description
Description of type.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## impact

### Summary
Description of impact.

### Description
Description of impact.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## Milestone

### Summary
Historical event or achievement.

### Description
Historical event or achievement.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## year

### Summary
Description of year.

### Description
Description of year.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## impact

### Summary
Description of impact.

### Description
Description of impact.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## description

### Summary
Description of description.

### Description
Description of description.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## weight

### Summary
Description of weight.

### Description
Description of weight.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## certainty

### Summary
Description of certainty.

### Description
Description of certainty.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## rating

### Summary
Description of rating.

### Description
Description of rating.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

