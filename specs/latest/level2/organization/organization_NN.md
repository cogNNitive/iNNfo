---
specification_version: "V_0-2-0"
specification_url: "https://raw.githubusercontent.com/cogNNitive/cogNNitive/main/specs/v0.2.0/level2/organization/organization_V_0-2-0_NN.md"
level: 2
parent_spec:
  name: "iNNfo_V_0-2-0"
  url: "https://raw.githubusercontent.com/cogNNitive/cogNNitive/main/specs/v0.2.0/level1/iNNfo_V_0-2-0_NN.md"
title: "Organization Template"
concepts:
  - name: "Organization"
    icon: "building"
    type: "text"
    color: "blue"
    weight: 100
  - name: "Roles"
    icon: "users"
    type: "list"
    color: "green"
    weight: 60
    fields:
      - name: "scope"
        type: "select"
        options: ["internal", "external"]
  - name: "Position"
    icon: "briefcase"
    type: "list"
    color: "green"
    weight: 50
  - name: "Person"
    icon: "user"
    type: "list"
    color: "green"
    weight: 40
markers:
  - name: "complexity"
    icon: "gauge"
    color: "green"
    weight: 50
relationship_types:
  hierarchy:
    enabled: true
    via: "index block"
  evaluable_matrix:
    enabled: true
  graph_edge:
    enabled: false
  sequence:
    enabled: false
matrices:
  - name: "positions-roles matrix"
    source: "Position"
    target: "Roles"
    values: [Assumes]
  - name: "persons-positions matrix"
    source: "Person"
    target: "Position"
    values: [Occupies]
  - name: "item-markers matrix"
    source: "Elements"
    target: "Markers"
---

> [!NOTE]
> This is an **iNNfo document** — a plain-text Markdown file. Open it with any text editor or view and edit it with [cogNNitive](https://innfo.cognnitive.com/app/info-doc).

# Organization Template

## A template for modeling organizational structures, roles, positions, and person assignments

## Philosophy

The Organization Template is designed to model the human resource structure of an enterprise or team. It separates the definitions of functional responsibilities (Roles), organizational seats (Positions), and the physical individuals who fill those seats (Persons). By decoupling organizational structure from behavioral workflows, it ensures that changes in personnel or job titles do not invalidate process descriptions.

## Objectives

- Provide a standardized structure for representing people, positions, and roles within the iNNfo ecosystem.
- Enable clear mapping of which positions assume which roles via the positions-roles matrix.
- Enable clear mapping of which persons occupy which positions via the persons-positions matrix.
- Allow organizational structures to be modeled independently of procedures and business models.

## Specification

### Concepts

| Concept | Type | Purpose |
|---|---|---|
| **Organization** | `text` | Description of the overall organization structure and objectives |
| **Roles** | `list` | Functional responsibilities/actors with internal/external scope |
| **Position** | `list` | Job titles or seats within the organization |
| **Person** | `list` | Named individuals occupying positions |

### Markers

| Marker | Purpose |
|---|---|
| `complexity` | Indicates the complexity of a role or position |

### Matrices

| Matrix | Source → Target | Purpose |
|---|---|---|
| Positions-Roles | Position → Roles | Which positions assume which roles |
| Persons-Positions | Person → Position | Who occupies which position |

### Relationship Types

| Type | Enabled | Representation |
|---|---|---|
| Hierarchy | âœ… | index block (wikilinks) |
| Evaluable matrix | âœ… | Source→target tables |
| Graph edge | âŒ | Not applicable |
| Sequence | âŒ | Not applicable |

## Template

### Level 3 Model Template (Lightweight)

To create an organization model, create a level 3 FILE mode document with:

```yaml
---
specification_version: "V_0-2-0"
specification_url: "https://raw.githubusercontent.com/cogNNitive/cogNNitive/main/specs/v0.2.0/level1/iNNfo_V_0-2-0_NN.md"
level: 3
parent_spec:
  name: "organization_V_0-2-0"
  url: "https://raw.githubusercontent.com/cogNNitive/cogNNitive/main/specs/v0.2.0/level2/organization/organization_V_0-2-0_NN.md"
model_version: "V_x-y-z"
title: "<Organization Name>"
---

> [!NOTE]
> This is an **iNNfo document**...

# _NN index
* [[Organization]]
  * [[Roles]]
  * [[Position]]
  * [[Person]]

# _NN Organization
Description of the overall organization.

# _NN Roles
* _NN Roles: Role Name
  Description of the role.

# _NN Position
* _NN Position: Position Name
  Description of the position.

# _NN Person
* _NN Person: Person Name
  Description of the person.

# _NN matrices: positions-roles matrix
| Position \ Roles | Role Name |
| :--- | :---: |
| Position Name | Assumes |

# _NN matrices: persons-positions matrix
| Person \ Position | Position Name |
| :--- | :---: |
| Person Name | Occupies |
```

## Examples

### Canonical Sample

The official sample for this template is at `specs/v0.2.0/level2/organization/samples/EngineeringTeam_V_1-0-0_organization_NN.md`. It exercises all concept types, lists, and the positions-roles and persons-positions matrices.
