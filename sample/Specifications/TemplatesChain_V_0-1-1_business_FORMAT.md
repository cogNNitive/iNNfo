---
specification_version: "V_0-1-1"
specification_url: "https://raw.githubusercontent.com/innV0/cogNNitive/v0.1.1/specs/business_V_0-1-1_FORMAT.md"
level: 3
parent:
  name: "business_V_0-1-1"
  url: "https://raw.githubusercontent.com/innV0/cogNNitive/v0.1.1/specs/business_V_0-1-1_FORMAT.md"
model_version: "V_0-1-1"
title: "cogNNitive — Template & Spec Chain"
mode: "FILE"
last_saved: "2026-07-01T00:00:00.000Z"
---

> [!NOTE]
> This is a **FILE-mode** FORMAT document (business template) nested inside a FOLDER-mode node. It describes the specification hierarchy using concepts and evaluable matrices.

# _F index

* [[Specifications]]
  * [[Templates]]
  * [[Models]]

# _F Specifications

The FORMAT spec chain follows a strict three-level hierarchy: defiNNe (L0) → FORMAT (L1) → Templates (L2) → Models (L3). Each level adds structure without repeating the parent's schema.

# _F Templates

* _F Templates: Business Template
  ```yaml
  mode: FILE
  concepts: 70+
  ```
  FILE-mode only. 70+ concepts for business strategy modeling.
* _F Templates: Procedures Template
  ```yaml
  mode: FILE
  concepts: workflow, steps, roles
  ```
  FILE-mode only. Workflow and procedure modeling.
* _F Templates: Knowledge Base Template
  ```yaml
  mode: FOLDER
  concepts: Persona, Topic, Reference
  ```
  FOLDER-mode only. Hierarchical knowledge bases with assets.

# _F Models

* _F Models: Ghostbusters (Business)
  ```yaml
  template: business_V_0-1-1
  mode: FILE
  ```
  Business model for a fictional paranormal elimination service. Demonstrates evaluable matrices.
* _F Models: TeamKB (Knowledge Base)
  ```yaml
  template: kb_V_0-1-1
  mode: FOLDER
  ```
  Team knowledge base with hierarchical topics and personas. Demonstrates FOLDER mode.
* _F Models: this-sample (Integration Test)
  ```yaml
  template: kb_V_0-1-1 (root) + business_V_0-1-1 (inner)
  mode: FOLDER + FILE
  ```
  Hybrid sample demonstrating FOLDER root with FILE-mode inner documents.

# _F matrices: item-markers matrix

| Item \ Marker | weight | certainty |
| :--- | :---: | :---: |
| Business Template | 9 | 5 |
| Procedures Template | 7 | 5 |
| Knowledge Base Template | 8 | 4 |
| Ghostbusters | 8 | 5 |
| TeamKB | 7 | 5 |
| this-sample | 6 | 4 |

