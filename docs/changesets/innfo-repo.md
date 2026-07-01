# iNNfo Repo — Changeset for FORMAT FOLDER Mode Migration

> This changeset describes the modifications needed in the `innV0/iNNfo` repository to align with the consolidated FORMAT specification.

## Overview

iNNfo is no longer a separate specification. Its functionality becomes FORMAT's FOLDER mode. The repository remains as the home for FOLDER mode documentation and the React app.

| Change | Type | Risk |
|---|---|---|
| Update README | Content | Low |
| Redirect spec docs | Content | Low |

---

## 1. README Update

**Current**: README.md describes iNNfo as an independent specification and tool.

**New README structure**:

```markdown
# iNNfo — FORMAT FOLDER Mode (formerly iNNfo Spec)

> ⚠️ **iNNfo is now FORMAT FOLDER mode**. The independent iNNfo specification
> has been consolidated into the [FORMAT](https://github.com/innV0/FORMAT) 
> ecosystem. See below for details.

## What changed?

iNNfo was an independent specification for hierarchical node-as-folder models.
As of FORMAT V_0-2-0, this functionality is now **FOLDER mode** — one of two
representation modes in the unified FORMAT specification.

- **FORMAT FILE mode**: single-document models (the original FORMAT)
- **FORMAT FOLDER mode**: directory-tree models (formerly iNNfo)

## Documentation

- FORMAT spec (FOLDER mode): `docs/documentation/spec/V_0-2-0/FORMAT_V_0-2-0_FORMAT.md`
- FOLDER mode documentation in this repo: `docs/`

## App

The iNNfo React app continues to work as the reference implementation for
FORMAT FOLDER mode. It will be migrated to consume `@innv0/format-core`
(see [cogNNitive](https://github.com/innV0/cogNNitive) for the library roadmap).

## Migration status

- [x] Spec consolidated into FORMAT V_0-2-0
- [ ] FOLDER mode documentation updated
- [ ] App migrated to `@innv0/format-core`
```

## 2. Documentation Redirect

Update `docs/` entry point to indicate the canonical spec is now at FORMAT repo:

```markdown
# iNNfo Documentation

This documentation covers **FORMAT FOLDER mode** (formerly the iNNfo specification).

For the canonical specification, see:
[FORMAT V_0-2-0 — FOLDER Mode section](https://raw.githubusercontent.com/innV0/FORMAT/v0.2.0/FORMAT_V_0-2-0_FORMAT.md)
```

## 3. No Repo Deletion

The iNNfo repo is NOT deleted. It keeps:
- The React app source code (until migration to `@innv0/format-core`)
- FOLDER mode documentation
- Issue tracker for FOLDER mode bugs

## 4. Timeline

1. Immediately: Update README and docs redirect
2. Short-term: No code changes needed; app continues to work
3. Medium-term: Migrate app to `@innv0/format-core` (see Path B in cogNNitive)
