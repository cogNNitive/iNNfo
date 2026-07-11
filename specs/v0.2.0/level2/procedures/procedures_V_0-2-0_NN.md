---
specification_version: "V_0-2-0"
specification_url: "https://raw.githubusercontent.com/innV0/cogNNitive/main/specs/v0.2.0/level2/procedures/procedures_V_0-2-0_NN.md"
level: 2
parent_spec:
  name: "iNNfo_V_0-2-0"
  url: "https://raw.githubusercontent.com/innV0/cogNNitive/main/specs/v0.2.0/level1/iNNfo_V_0-2-0_NN.md"
title: "Procedures Template"
concepts:
  - name: "Procedure"
    icon: "file-text"
    type: "text"
    color: "blue"
    weight: 100
  - name: "Work"
    icon: "list-ordered"
    type: "sequence"
    color: "blue"
    weight: 90
    fields:
      - name: "step_type"
        type: "select"
        options: ["task", "decision", "event"]
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
  - name: "positions-roles matrix"
    source: "Position"
    target: "Roles"
    values: [Assumes]
  - name: "persons-positions matrix"
    source: "Person"
    target: "Position"
    values: [Occupies]
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

The Procedures Template is designed for modeling repeatable workflows with clear accountability. It follows the belief that any procedure can be understood as a sequence of steps, each producing or consuming artifacts, assigned to roles via a RACI matrix, and supported by tools. The template emphasizes traceability — every work step declares its inputs, outputs, and the roles responsible for it.

## Objectives

- Provide a complete set of concepts for workflow modeling: sequenced steps (Work), produced artifacts (Artifact), supporting tools (Tools), and human resources (Roles, Position, Person).
- Enable RACI accountability mapping via evaluable matrices (Work ↔ Roles, Position ↔ Roles, Person ↔ Position).
- Support sequential step definitions with conditional branching, tool assignment, and artifact I/O.
- Serve as the default template for procedure and process modeling in the iNNfo ecosystem.

## Specification

### Concepts

| Concept | Type | Purpose |
|---|---|---|
| **Procedure** | `text` | Free-form description of the overall procedure |
| **Work** | `sequence` | Ordered list of steps; each step has fields for type, next, condition, I/O, tool |
| **Artifact** | `list` | Documents, deliverables, or data produced or consumed by work steps |
| **Tools** | `list` | Software or hardware used to execute work steps |
| **Roles** | `list` | Functional roles with accountability scope (internal/external) |
| **Position** | `list` | Organizational positions that assume one or more roles |
| **Person** | `list` | Named individuals who occupy positions |

### Markers

| Marker | Purpose |
|---|---|
| `complexity` | How complex the procedure step or element is to execute |

### Matrices

| Matrix | Source → Target | Purpose |
|---|---|---|
| Work-Roles | Work → Roles | RACI assignment (Responsible, Accountable, Consulted, Informed) |
| Positions-Roles | Position → Roles | Which positions assume which roles |
| Persons-Positions | Person → Position | Who occupies which position |
| Work-Tools | Work → Tools | Which tools are used by each work step |
| Work-Artifacts | Work → Artifact | I/O relationships (Creates, Modifies, Validates, Reviews) |

### Relationship Types

| Type | Enabled | Representation |
|---|---|---|
| Hierarchy | ❌ | Not applicable |
| Evaluable matrix | ✅ | Source→target tables with RACI params |
| Graph edge | ❌ | Not applicable |
| Sequence | ✅ | Work concept type `sequence` with numbered steps |

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
* [[Procedure]]
* [[Work]]
* [[Artifact]]
* [[Tools]]
* [[Roles]]
* [[Position]]
* [[Person]]

# _NN Procedure
Description of the overall procedure.

# _NN Work
* _NN Work: Step Name
  ```yaml
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

The official sample for this template is at `specs/v0.1.0/level2/procedures/samples/CodeReviewProcess_V_1-0-0_procedures_NN.md`. It exercises all concept types (text, sequence, list), YAML element fields, and the `work-roles` RACI matrix.

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

## Procedure

### Summary
The overall workflow this model describes.

### Description
Brief explanation of the procedure goals.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## Work

### Summary
The ordered steps, decisions, and events of the workflow.

### Description
Sequence of actions, decisions, and events in the workflow. Work items can reference artifacts as inputs and outputs, and tools as resources.

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

## Position

### Summary
Organizational positions that assume roles.

### Description
Job roles or titles within the organization (e.g. Senior Developer).

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## Person

### Summary
Named individuals who occupy positions.

### Description
The actual team members occupying those positions.

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

## positions-roles matrix

### Summary
Description of positions-roles matrix.

### Description
Description of positions-roles matrix.

### Methodologies
*No methodologies provided.*

### Prompts
*No prompts provided.*

## persons-positions matrix

### Summary
Description of persons-positions matrix.

### Description
Description of persons-positions matrix.

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

