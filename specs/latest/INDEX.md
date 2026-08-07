# iNNfo Specification — latest

> **âš ï¸ This is a convenience alias.** Files here use stable names (no version numbers). Contents mirror the current active version of each artifact.
>
> When a new spec version is published, this directory is manually synced to point to the latest. For immutable references, pin to the specific version directory (e.g. `specs/v0.2.0/`).
>
> The `specification_url` inside each file points to the canonical immutable file in the corresponding version directory. This file is identical in content.

## Active Version

**v0.3.0 (Metaplantilla Nivel 1)** — iNNfo level-1 is now a meta-template defining the four root primitives (`Concept Definition`, `Field Definition`, `Matrix Definition`, `Marker Definition`) under the unified `NN` syntax (`# NN`, `## NN <Concept>: <Element>`, `key:: value`). The level-2 templates (business, organization, procedures) have been migrated to instantiate those primitives in their body instead of declaring `concepts:`/`markers:`/`matrices:` in frontmatter. defiNNe remains at `v0.2.0`.

| File | Canonical Source |
|---|---|
| [`level0/defiNNe_NN.md`](level0/defiNNe_NN.md) | `v0.2.0/level0/defiNNe_V_0-2-0_NN.md` |
| [`level1/iNNfo_NN.md`](level1/iNNfo_NN.md) | `v0.3.0/level1/iNNfo_V_0-3-0_NN.md` (Metaplantilla Nivel 1) |
| [`level2/business/business_NN.md`](level2/business/business_NN.md) | `v0.3.0/level2/business/business_V_0-3-0_NN.md` |
| [`level2/organization/organization_NN.md`](level2/organization/organization_NN.md) | `v0.3.0/level2/organization/organization_V_0-3-0_NN.md` |
| [`level2/procedures/procedures_NN.md`](level2/procedures/procedures_NN.md) | `v0.3.0/level2/procedures/procedures_V_0-3-0_NN.md` |
| [`level2/projects/projects_NN.md`](level2/projects/projects_NN.md) | `v0.3.0/level2/projects/projects_V_0-3-0_NN.md` |

## Stable URLs

These URLs **never change** — they always point to the latest version:

```yaml
# Always the latest defiNNe:
https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level0/defiNNe_NN.md

# Always the latest iNNfo:
https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level1/iNNfo_NN.md

# Always the latest business template:
https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level2/business/business_NN.md

# Always the latest organization template:
https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level2/organization/organization_NN.md

# Always the latest procedures template:
https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level2/procedures/procedures_NN.md

# Always the latest projects template:
https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level2/projects/projects_NN.md

```

## Immutable URLs

For production use, reference the specific version (e.g. `v0.2.0/`). After creating the git tag `v0.2.0`, replace `main` with `v0.2.0` in the URL.
