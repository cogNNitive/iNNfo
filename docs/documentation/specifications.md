# Specifications

The iNNv0 ecosystem defines four specification levels. Each level builds on the one below it.

## Level 0 â€” Meta-specification

The root of the chain. Defines structure, versioning (SemVer), and RFC 2119 key words for the entire ecosystem.

| Spec | Source |
|------|--------|
| **defiNNe** (latest) | [`specs/latest/level0/defiNNe_NN.md`](https://github.com/iNNfo/iNNfo/blob/main/specs/latest/level0/defiNNe_NN.md) |
| **defiNNe** V 0.2.0 | [`specs/v0.2.0/level0/defiNNe_V_0-2-0_NN.md`](https://github.com/iNNfo/iNNfo/blob/main/specs/v0.2.0/level0/defiNNe_V_0-2-0_NN.md) |

## Level 1 â€” Central specification

The **iNNfo** specification. Every model is a single `_NN.md` document with optional structural children â€” concepts, elements, fields, markers, and matrices.

| Spec | Source |
|------|--------|
| **iNNfo** (latest) | [`specs/latest/level1/iNNfo_NN.md`](https://github.com/iNNfo/iNNfo/blob/main/specs/latest/level1/iNNfo_NN.md) |
| **iNNfo** V 0.2.0 | [`specs/v0.2.0/level1/iNNfo_V_0-2-0_NN.md`](https://github.com/iNNfo/iNNfo/blob/main/specs/v0.2.0/level1/iNNfo_V_0-2-0_NN.md) |

## Level 2 â€” Templates

Domain-specific templates. Each declares concepts, markers, matrices, and relationship types for a specific domain.

| Template | Source |
|----------|--------|
| **Business** (latest) | [`specs/latest/level2/business/business_NN.md`](https://github.com/iNNfo/iNNfo/blob/main/specs/latest/level2/business/business_NN.md) |
| **Procedures** (latest) | [`specs/latest/level2/procedures/procedures_NN.md`](https://github.com/iNNfo/iNNfo/blob/main/specs/latest/level2/procedures/procedures_NN.md) |
| **Organization** (latest) | [`specs/latest/level2/organization/organization_NN.md`](https://github.com/iNNfo/iNNfo/blob/main/specs/latest/level2/organization/organization_NN.md) |

## Level 3 â€” Sample models

Concrete data instances. Lightweight â€” just data and a parent pointer to their template.

| Model | Template | Source |
|-------|----------|--------|
| **Ghostbusters** | business | [`specs/latest/level2/business/samples/Ghostbusters_V_0-1-2_business_NN.md`](https://github.com/iNNfo/iNNfo/blob/main/specs/latest/level2/business/samples/Ghostbusters_V_0-1-2_business_NN.md) |
| **Code Review Process** | procedures | [`specs/latest/level2/procedures/samples/CodeReviewProcess_V_1-0-0_procedures_NN.md`](https://github.com/iNNfo/iNNfo/blob/main/specs/latest/level2/procedures/samples/CodeReviewProcess_V_1-0-0_procedures_NN.md) |
| **Engineering Team** | organization | [`specs/latest/level2/organization/samples/EngineeringTeam_V_1-0-0_organization_NN.md`](https://github.com/iNNfo/iNNfo/blob/main/specs/latest/level2/organization/samples/EngineeringTeam_V_1-0-0_organization_NN.md) |

## Related Standards

### Open Knowledge Format (OKF)

iNNfo is **compatible** with [OKF v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md), the Open Knowledge Format by Google Cloud Platform. Every iNNfo document is a valid OKF knowledge bundle.

| OKF Conformance Rule (Â§9) | iNNfo Status |
|---|---|
| Parseable YAML frontmatter on every non-reserved `.md` file | âœ… Satisfied â€” every `_NN.md` has required frontmatter |
| Non-empty `type` field in every frontmatter block | âœ… Satisfied â€” `level` + template name provides type semantics |
| Reserved filenames follow OKF conventions | âœ… Satisfied â€” `index.md` follows progressive-disclosure pattern |

**Why the compatibility holds:**

1. **Same substrate**: Both use Markdown + YAML frontmatter. OKF's "if you can `cat` a file, you can read OKF" applies to iNNfo verbatim.
2. **OKF tolerates extensions**: OKF explicitly allows unknown frontmatter keys and unknown `type` values. iNNfo's additional fields (`spec_version`, `level`, `parent`, `concepts`, `markers`, `matrices`) are fully tolerated.
3. **A directory of `_NN.md` documents = an OKF knowledge bundle**: a workspace of iNNfo models produces the exact directory-of-Markdown-files structure OKF defines as a knowledge bundle (Â§3). Each `_NN.md` is an OKF concept document (Â§4), with `index.md` as the directory listing (Â§6).
4. **Cross-linking**: OKF uses standard Markdown links; iNNfo supports wikilinks (`[[target]]`) and standard links â€” both work for cross-referencing concepts.

See the [Ecosystem page](ecosystem) for the full compatibility mapping.
