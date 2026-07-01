# Specifications

The iNNv0 ecosystem defines four specification levels. Each level builds on the one below it.

## Level 0 — Meta-specification

The root of the chain. Defines structure, versioning (SemVer), and RFC 2119 key words for the entire ecosystem.

| Spec | Version | Source |
|------|---------|--------|
| **defiNNe** | V 0.1.0 | [`specs/defiNNe_V_0-1-0_FORMAT.md`](https://github.com/innV0/cogNNitive/blob/main/specs/defiNNe_V_0-1-0_FORMAT.md) |

## Level 1 — Central specification

The FORMAT specification with two modes: **FILE** (single document) and **FOLDER** (node-as-folder with assets). Unified relationship system, marker syntax, and matrix definitions.

| Spec | Version | Source |
|------|---------|--------|
| **FORMAT** | V 0.1.0 | [`specs/FORMAT_V_0-1-0_FORMAT.md`](https://github.com/innV0/cogNNitive/blob/main/specs/FORMAT_V_0-1-0_FORMAT.md) |
| **FORMAT** | V 0.1.1 | [`specs/FORMAT_V_0-1-1_FORMAT.md`](https://github.com/innV0/cogNNitive/blob/main/specs/FORMAT_V_0-1-1_FORMAT.md) |

## Level 2 — Templates

Domain-specific templates. Each declares concepts, markers, matrices, and relationship types for a specific domain.

| Template | Version | Source |
|----------|---------|--------|
| **Business** | V 0.1.1 | [`specs/business_V_0-1-1_FORMAT.md`](https://github.com/innV0/cogNNitive/blob/main/specs/business_V_0-1-1_FORMAT.md) |
| **Procedures** | V 0.1.1 | [`specs/procedures_V_0-1-1_FORMAT.md`](https://github.com/innV0/cogNNitive/blob/main/specs/procedures_V_0-1-1_FORMAT.md) |
| **Knowledge Base (kb)** | V 0.1.1 | [`specs/kb_V_0-1-1_FORMAT.md`](https://github.com/innV0/cogNNitive/blob/main/specs/kb_V_0-1-1_FORMAT.md) |

## Level 3 — Models

Concrete data instances. Lightweight — just data and a parent pointer to their template.

| Model | Version | Template | Source |
|-------|---------|----------|--------|
| **Ghostbusters** | V 0.1.1 | business | [`models/Ghostbusters_V_0-1-1_business_FORMAT.md`](https://github.com/innV0/cogNNitive/blob/main/models/Ghostbusters_V_0-1-1_business_FORMAT.md) |
| **TeamKB** | V 0.1.1 | kb (FOLDER mode) | [`models/TeamKB_V_0-1-1_kb/`](https://github.com/innV0/cogNNitive/tree/main/models/TeamKB_V_0-1-1_kb) |
