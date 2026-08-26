# Specifications

The cogNNitive ecosystem defines four specification levels. Each level builds on the one below it.

## Level 0 — Meta-specification

The root of the chain. Defines structure, versioning (SemVer), and RFC 2119 key words for the entire ecosystem.

Every spec artifact under `specs/` is immutable and filename-encoded — there is no
mutable "latest" alias. A version bump always creates a new file; the table below
lists the current file for each spec.

| Spec | Source |
|------|--------|
| **defiNNe** V 0.1.0 | [`specs/defiNNe_V_0-1-0_NN.md`](https://github.com/iNNfo/iNNfo/blob/main/specs/defiNNe_V_0-1-0_NN.md) |

## Level 1 — Central specification

The **iNNfo** specification. Every model is a single `_NN.md` document with optional structural children — concepts, elements, fields, markers, and matrices.

| Spec | Source |
|------|--------|
| **iNNfo** V 0.1.0 | [`specs/iNNfo_V_0-1-0_NN.md`](https://github.com/iNNfo/iNNfo/blob/main/specs/iNNfo_V_0-1-0_NN.md) |

## Level 2 — Templates

Domain-specific templates. Each declares concepts, markers, matrices, and relationship types for a specific domain, and its own `template_version` (independent of `spec_version`).

| Template | Source |
|----------|--------|
| **Blank** | [`specs/templates/blank/blank_V_0-1-0_NN.md`](https://github.com/iNNfo/iNNfo/blob/main/specs/templates/blank/blank_V_0-1-0_NN.md) |
| **Business** | [`specs/templates/business/business_V_0-1-0_NN.md`](https://github.com/iNNfo/iNNfo/blob/main/specs/templates/business/business_V_0-1-0_NN.md) |
| **Innovation** | [`specs/templates/innovation/innovation_V_0-1-0_NN.md`](https://github.com/iNNfo/iNNfo/blob/main/specs/templates/innovation/innovation_V_0-1-0_NN.md) |
| **cogNNitive** | [`specs/templates/cogNNitive/cogNNitive_V_0-1-0_NN.md`](https://github.com/iNNfo/iNNfo/blob/main/specs/templates/cogNNitive/cogNNitive_V_0-1-0_NN.md) |
| **Organization** | [`specs/templates/organization/organization_V_0-1-0_NN.md`](https://github.com/iNNfo/iNNfo/blob/main/specs/templates/organization/organization_V_0-1-0_NN.md) |
| **Procedures** | [`specs/templates/procedures/procedures_V_0-1-0_NN.md`](https://github.com/iNNfo/iNNfo/blob/main/specs/templates/procedures/procedures_V_0-1-0_NN.md) |
| **Projects** | [`specs/templates/projects/projects_V_0-1-0_NN.md`](https://github.com/iNNfo/iNNfo/blob/main/specs/templates/projects/projects_V_0-1-0_NN.md) |

## Level 3 — Sample models

Concrete data instances. Lightweight — just data and a parent pointer to their template.

| Model | Template | Source |
|-------|----------|--------|
| **Ghostbusters** | business | [`specs/templates/business/samples/Ghostbusters_V_0-1-0_business_NN.md`](https://github.com/iNNfo/iNNfo/blob/main/specs/templates/business/samples/Ghostbusters_V_0-1-0_business_NN.md) |
| **DeLorean Time Travel Ventures** | innovation | [`specs/templates/innovation/samples/DeLoreanTimeTravel_V_0-1-0_innovation_NN.md`](https://github.com/iNNfo/iNNfo/blob/main/specs/templates/innovation/samples/DeLoreanTimeTravel_V_0-1-0_innovation_NN.md) |
| **Code Review Process** | procedures | [`specs/templates/procedures/samples/CodeReviewProcess_V_0-1-0_procedures_NN.md`](https://github.com/iNNfo/iNNfo/blob/main/specs/templates/procedures/samples/CodeReviewProcess_V_0-1-0_procedures_NN.md) |
| **Engineering Team** | organization | [`specs/templates/organization/samples/EngineeringTeam_V_0-1-0_organization_NN.md`](https://github.com/iNNfo/iNNfo/blob/main/specs/templates/organization/samples/EngineeringTeam_V_0-1-0_organization_NN.md) |
| **Software Release Project** | projects | [`specs/templates/projects/samples/SoftwareReleaseProject_V_0-1-0_projects_NN.md`](https://github.com/iNNfo/iNNfo/blob/main/specs/templates/projects/samples/SoftwareReleaseProject_V_0-1-0_projects_NN.md) |

## Related Standards

### Open Knowledge Format (OKF)

iNNfo is **compatible** with [OKF v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md), the Open Knowledge Format by Google Cloud Platform. Every iNNfo document is a valid OKF knowledge bundle.

| OKF Conformance Rule (Â§9) | iNNfo Status |
|---|---|
| Parseable YAML frontmatter on every non-reserved `.md` file | âœ… Satisfied — every `_NN.md` has required frontmatter |
| Non-empty `type` field in every frontmatter block | âœ… Satisfied — `level` + template name provides type semantics |
| Reserved filenames follow OKF conventions | âœ… Satisfied — `index.md` follows progressive-disclosure pattern |

**Why the compatibility holds:**

1. **Same substrate**: Both use Markdown + YAML frontmatter. OKF's "if you can `cat` a file, you can read OKF" applies to iNNfo verbatim.
2. **OKF tolerates extensions**: OKF explicitly allows unknown frontmatter keys and unknown `type` values. iNNfo's additional fields (`spec_version`, `level`, `parent`, `concepts`, `markers`, `matrices`) are fully tolerated.
3. **A directory of `_NN.md` documents = an OKF knowledge bundle**: a workspace of iNNfo models produces the exact directory-of-Markdown-files structure OKF defines as a knowledge bundle (Â§3). Each `_NN.md` is an OKF concept document (Â§4), with `index.md` as the directory listing (Â§6).
4. **Cross-linking**: OKF uses standard Markdown links; iNNfo supports wikilinks (`[[target]]`) and standard links — both work for cross-referencing concepts.

See the [Ecosystem page](ecosystem) for the full compatibility mapping.
