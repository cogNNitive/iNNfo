---
specification_version: "V_0-2-0"
specification_url: "https://raw.githubusercontent.com/innV0/cogNNitive/main/specs/v0.2.0/level2/procedures/procedures_V_0-2-0_NN.md"
level: 2
parent_spec:
  name: "iNNfo_V_0-2-0"
  url: "https://raw.githubusercontent.com/innV0/cogNNitive/main/specs/v0.2.0/level1/iNNfo_V_0-2-0_NN.md"
title: "Procedures Template"
concepts:
  - name: "Work"
    icon: "list-ordered"
    type: "list"
    color: "blue"
    weight: 100
    fields:
      - name: "step_type"
        type: "select"
        options: ["task", "decision", "event"]
      - name: "parent"
        type: "string"
      - name: "next"
        type: "string"
      - name: "condition"
        type: "string"
      - name: "input"
        type: "reference"
        target_concepts: ["Artifact"]
      - name: "output"
        type: "reference"
        target_concepts: ["Artifact"]
      - name: "output_status"
        type: "string"
      - name: "tool"
        type: "reference"
        target_concepts: ["Tools"]
  - name: "Artifact"
    icon: "package"
    type: "list"
    color: "orange"
    weight: 80
  - name: "Tools"
    icon: "wrench"
    type: "list"
    color: "orange"
    weight: 70
  - name: "Roles"
    icon: "users"
    type: "list"
    color: "green"
    weight: 60
    fields:
      - name: "scope"
        type: "select"
        options: ["internal", "external"]

markers:
  - name: "complexity"
    icon: "gauge"
    color: "green"
    weight: 50
relationship_types:
  hierarchy:
    enabled: false
  evaluable_matrix:
    enabled: true
  graph_edge:
    enabled: false
  sequence:
    enabled: true
matrices:
  - name: "work-roles matrix"
    source: "Work"
    target: "Roles"
    values: [Responsible, Accountable, Consulted, Informed]

  - name: "work-tools matrix"
    source: "Work"
    target: "Tools"
    values: [Uses]
  - name: "work-artifacts matrix"
    source: "Work"
    target: "Artifact"
    values: [Creates, Modifies, Validates, Reviews]
  - name: "item-markers matrix"
    source: "Elements"
    target: "Markers"
---

> [!NOTE]
> This is an **iNNfo document** — a plain-text Markdown file that carries its own schema in the YAML frontmatter. The template definition is resolved via the parent chain and cached in the `specs/` directory.

# Procedures Template

## A template for modeling structured workflows with sequenced steps, roles, artifacts, tools, and RACI matrices

## Philosophy

The Procedures Template is designed for modeling repeatable workflows with clear accountability. It follows the belief that any procedure can be understood as a hierarchical tree of procedures and steps, each producing or consuming artifacts, assigned to roles via a RACI matrix, and supported by tools. Work elements form a tree: root elements (no `parent`) define a procedure, child elements (`parent` set) define its steps. The template emphasizes traceability — every work step declares its inputs, outputs, parent procedure, and the roles responsible for it.

## Objectives

- Provide a complete set of concepts for workflow modeling: hierarchical procedures and steps (Work), produced artifacts (Artifact), supporting tools (Tools), and functional roles (Roles).
- Enable RACI accountability mapping via evaluable matrices (Work ↔ Roles).
- Support sequential step definitions with conditional branching, tool assignment, and artifact I/O.
- Serve as the default template for procedure and process modeling in the iNNfo ecosystem.

## Specification

### Concepts

| Concept | Type | Purpose |
|---|---|---|
| **Work** | `list` | Hierarchical tree of procedures and steps. Root elements (no `parent`) = procedure; child elements (`parent` set) = step. Each element has fields for step_type, parent, next, condition, I/O, tool |
| **Artifact** | `list` | Documents, deliverables, or data produced or consumed by work steps |
| **Tools** | `list` | Software or hardware used to execute work steps |
| **Roles** | `list` | Functional roles with accountability scope (internal/external) |


### Markers

| Marker | Purpose |
|---|---|
| `complexity` | How complex the procedure step or element is to execute |

### Matrices

| Matrix | Source → Target | Purpose |
|---|---|---|
| Work-Roles | Work → Roles | RACI assignment (Responsible, Accountable, Consulted, Informed) |

| Work-Tools | Work → Tools | Which tools are used by each work step |
| Work-Artifacts | Work → Artifact | I/O relationships (Creates, Modifies, Validates, Reviews) |

### Relationship Types

| Type | Enabled | Representation |
|---|---|---|
| Hierarchy | ✅ | Implicit via Work `parent` field — root elements are procedures, children are steps |
| Evaluable matrix | ✅ | Source→target tables with RACI params |
| Graph edge | ❌ | Not applicable |
| Sequence | ✅ | Via Work `next` field — hand-linked order between siblings at same level |

## Template

### Level 3 Model Template (Lightweight)

To create a procedures model, create a level 3 FILE mode document with:

```yaml
---
specification_version: "V_0-2-0"
specification_url: "https://raw.githubusercontent.com/innV0/cogNNitive/main/specs/v0.2.0/level1/iNNfo_V_0-2-0_NN.md"
level: 3
parent_spec:
  name: "procedures_V_0-2-0"
  url: "https://raw.githubusercontent.com/innV0/cogNNitive/main/specs/v0.2.0/level2/procedures/procedures_V_0-2-0_NN.md"
model_version: "V_x-y-z"
title: "<Procedure Name>"
---

> [!NOTE]
> This is an **iNNfo document**...

# _NN index
* [[Work]]
* [[Artifact]]
* [[Tools]]
* [[Roles]]


# _NN Work
* _NN Work: Procedure Name
  next: "Next Procedure Name"
  Description of the overall procedure.

* _NN Work: Step Name
  ```yaml
  parent: "Procedure Name"
  step_type: "task"
  next: "Next Step Name"
  tool: "Tool Name"
  ```
  Step description.

# _NN Artifact
* _NN Artifact: Artifact Name
  Description of the artifact.

# _NN matrices: work-roles matrix
| Work \ Roles | Role Name |
| :--- | :---: |
| Step Name | Responsible |
```

## Examples

### Canonical Sample

The official sample for this template is at `specs/v0.2.0/level2/procedures/samples/CodeReviewProcess_V_1-0-0_procedures_NN.md`. It exercises the hierarchical Work tree with two root procedures (Code Review Process → Emergency Hotfix Process), YAML element fields (parent, step_type, next, I/O, tool), and the `work-roles` RACI matrix across both procedures.

### Model Directory after First Load

When the sample is loaded for the first time:

```
📁 CodeReviewProcess_V_1-0-0_procedures/
  📄 CodeReviewProcess_V_1-0-0_procedures_NN.md
  📁 specs/
    📄 procedures_V_0-2-0_NN.md
    📄 iNNfo_V_0-2-0_NN.md
    📄 defiNNe_V_0-2-0_NN.md
```

### Parent Chain

```yaml
# From the CodeReviewProcess sample:
parent_spec:
  name: "procedures_V_0-2-0"
  url: "https://raw.githubusercontent.com/innV0/cogNNitive/main/specs/v0.2.0/level2/procedures/procedures_V_0-2-0_NN.md"

# This template's parent:
parent_spec:
  name: "iNNfo_V_0-2-0"
  url: "https://raw.githubusercontent.com/innV0/cogNNitive/main/specs/v0.2.0/level1/iNNfo_V_0-2-0_NN.md"
```


# Concept Guidance Documentation

## Work

### Summary
Hierarchical tree of procedures and their steps. Root elements (no `parent`) represent procedures; child elements (with `parent`) represent individual steps.

### Description
Procedures and their ordered steps form a tree: root elements describe the procedure, child elements are the steps. Root elements use `next` to order procedures, child elements use `next` to order steps within a parent. All Work items can reference artifacts as inputs and outputs (`input`, `output`), and tools as resources (`tool`).

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## Artifact

### Summary
Documents and deliverables produced or consumed by work steps.

### Description
Tangible or digital outputs that flow through the procedure (e.g. documents, forms, reports, certificates). Work items interact with artifacts via the work-artifacts matrix (Creates, Modifies, Validates, Reviews).

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## Tools

### Summary
Software and resources used to carry out work steps.

### Description
Software applications, instruments, or resources used to modify, generate, or process artifacts during a work item (e.g. IDE, spreadsheet, design tool, CI pipeline). Connected to work via the work-tools matrix.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## Roles

### Summary
The functional roles that act in the workflow.

### Description
The functional responsibilities/actors in the workflow (e.g. Developer, QA).

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*



## complexity

### Summary
Description of complexity.

### Description
Description of complexity.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## work-roles matrix

### Summary
Description of work-roles matrix.

### Description
Description of work-roles matrix.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*



## work-tools matrix

### Summary
Description of work-tools matrix.

### Description
Description of work-tools matrix.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## work-artifacts matrix

### Summary
Description of work-artifacts matrix.

### Description
Description of work-artifacts matrix.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## item-markers matrix

### Summary
Description of item-markers matrix.

### Description
Description of item-markers matrix.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

