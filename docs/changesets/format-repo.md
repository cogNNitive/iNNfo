# FORMAT Repo — Changeset for V_0-2-0

> This changeset describes the exact modifications needed in the `innV0/FORMAT` repository to publish the consolidated specifications.

## Overview

| Change | Type | Risk |
|---|---|---|
| Rename spec file | File rename | Medium (breaks existing links) |
| Update spec content | Content update | Low (additive) |
| Update business template | Content update | Low |
| Update procedures template | Content update | Low |
| Create git tag v0.2.0 | Git operation | Low |

---

## 1. Spec File: Rename `_format.md` → `FORMAT_V_0-2-0_FORMAT.md`

**Old path**: `docs/documentation/spec/V_0-1-0/_format.md`
**New path**: `docs/documentation/spec/V_0-2-0/FORMAT_V_0-2-0_FORMAT.md`

```bash
mkdir -p docs/documentation/spec/V_0-2-0/
git mv docs/documentation/spec/V_0-1-0/_format.md docs/documentation/spec/V_0-2-0/FORMAT_V_0-2-0_FORMAT.md
```

**Note**: The old `V_0-1-0/` directory will still exist for backward compatibility.

## 2. Spec Content: Replace with `FORMAT_V_0-2-0_FORMAT.md`

Replace the content of `docs/documentation/spec/V_0-2-0/FORMAT_V_0-2-0_FORMAT.md` with the verified spec from `cogNNitive/verification/FORMAT_V_0-2-0_FORMAT.md`.

**Key changes from V_0-1-0**:
- Added `level: 1`, `parent` object pointing to defiNNe
- Added `modes: ["FILE", "FOLDER"]`
- Added `relationship_types` with 4 types
- Added required body sections (Philosophy, Objectives, Specification, Template, Examples)
- Added FILE Mode Body Syntax with WikiLink docs, type→syntax mapping, 3 matrix types
- Added FOLDER Mode Body Structure section

## 3. Business Template: Update to V_1-0-0

**Path**: `docs/templates/business/V_1-0-0/business_V_1-0-0_FORMAT.md`

Replace with the verified template from `cogNNitive/verification/business_V_1-0-0_FORMAT.md`.

**Key changes from V_0-1-0**:
- Added `level: 2`, `parent` pointing to FORMAT
- Added `last_updated`, `relationship_declarations`
- Added required body sections (Philosophy, Objectives, Specification, Template, Examples)
- Updated `specification_url` to point to v0.2.0 of FORMAT
- Updated concept names to match new level naming (e.g., lowercase in blocks normalized)

## 4. Procedures Template: Update to V_1-0-0

**Path**: `docs/templates/procedures/V_1-0-0/procedures_V_1-0-0_FORMAT.md`

Replace with the verified template from `cogNNitive/verification/procedures_V_1-0-0_FORMAT.md`.

**Key changes from V_0-1-0**:
- Same structural changes as business template (level, parent, body sections)
- Concept names capitalized for consistency (Procedure, Work, Artifact, Tools, Roles, Position, Person)
- Matrix references updated to capitalized concept names

## 5. Git Tag

After all changes are committed:

```bash
git tag -a v0.2.0 -m "FORMAT V_0-2-0 — Unified FILE/FOLDER modes, parent chain, relationship types"
git push origin v0.2.0
```

## 6. Verification

After publishing:
1. Verify raw URL resolves: `https://raw.githubusercontent.com/innV0/FORMAT/v0.2.0/FORMAT_V_0-2-0_FORMAT.md`
2. Verify business template URL resolves
3. Load a model in the FORMAT app with the new parent chain → confirm it parses correctly
