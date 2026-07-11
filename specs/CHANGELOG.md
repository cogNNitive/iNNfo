# iNNfo Specification Changelog

All notable changes to the iNNfo specification ecosystem are documented here.

| Version | Date | Status | Summary |
|---|---|---|---|
| [v0.2.0](v0.2.0/) | 2026-07-11 | **Active** | Metamodel consolidation: canonical entity glossary, name-based identity, reserved pseudo-concepts, `values` matrices, wikilink index, single asset convention. FOLDER mode, `_FORMAT.md`, hierarchy matrices, and `_NN index:` removed. |
| v0.1.0 | 2026-07-06 | Removed | First versioned release (directory removed; superseded by v0.2.0). |

## v0.2.0 (2026-07-11) — Active

Metamodel consolidation and hardening. See `openspec/changes/spec-foundation-hardening`.

### Specification Changes
- **Canonical entity glossary** in iNNfo: Workspace → Model → Concept → Element → Field, plus cross-cutting Marker, Relationship, Matrix. "node" barred from normative text; synonyms removed.
- **Reserved pseudo-concepts** `Concepts`, `Elements`, `Markers`.
- **Name-based identity** (single source of truth): Element names unique within the whole Model; Model name (`title`) unique within the Workspace; no persisted slug/id.
- **Fields & Assets**: single storage convention `{modelDir}/assets/{element-slug}/{filename}`; `asset_mode` removed.
- **Relationship Types**: unified term (was `relationship_declarations`).
- **Matrices** declare `values: [...]` (replacing the `params` `;`-string DSL).
- **Hierarchy** only via the index block; hierarchy matrices removed.
- **Index syntax**: `[[wikilink]]` canonical; `_NN index:` retired.
- Section numbers dropped in favor of stable heading-name references.

### Removed (no backwards compatibility)
- **FOLDER mode / `_F` markers**, **`_FORMAT.md` filenames**, **hierarchy matrices**, **`_NN index:`** syntax.
- **The `v0.1.0/` directory** — only v0.2.0 is maintained.

## v0.1.0 (2026-07-06) — Superseded

### Structural Changes
- **Versioned directories**: Each spec version lives in `vMAJOR.MINOR.PATCH/` with level-based subdirectories (`level0/`, `level1/`, `level2/`).
- **Level organization**: Specs organized by hierarchy level — `level0/` for meta-spec, `level1/` for concrete spec, `level2/` for templates with nested samples.
- **`latest/` alias with stable filenames**: Files use names without version numbers (e.g. `defiNNe_NN.md` instead of `defiNNe_V_0-1-0_NN.md`), so external consumers can always reference `specs/latest/level1/iNNfo_NN.md` and get the current version.
- **CHANGELOG.md**: Added with version table.
- **INDEX.md**: Added per version directory and per `latest/`.

### Specification Changes
- **defiNNe V_0-1-0**: Reset from V_0-1-1. Removed legacy migration sections. Added §7.1 Version Directory Structure covering the level-based organization. Updated all examples and parent chains.
- **iNNfo V_0-1-0**: Reset from V_0-2-0. **Fixed frontmatter field names**: `spec_version` → `specification_version`, `spec_url` → `specification_url` (now defiNNe-conformant). Parent chain updated to `defiNNe_V_0-1-0`.
- **business_V_0-1-1**: Parent chain updated from `FORMAT_V_0-1-1` → `iNNfo_V_0-1-0`.
- **procedures_V_0-1-1**: Parent chain updated from `FORMAT_V_0-1-1` → `iNNfo_V_0-1-0`.

### Sample Updates
- All sample files migrated to use `_NN` markers (from legacy `_F`).
- Sample parent chain URLs point to the new level-based paths.
- Samples organized by template: each lives in its template's `samples/` folder.

### Errata (2026-07-08, in-place)
- **Level-2 templates mislabeled as level 3**: `business_V_0-1-1` and `procedures_V_0-1-1` declared `level: 3` in their frontmatter. Corrected to `level: 2` per defiNNe §1/§5.3. This defect caused `getTemplate` (innfo-core resolver) to prefer these templates over real level-3 models via `getSpecForLevel(cache, 3)`.
- **Spurious `model_version` on templates**: the same three templates carried a `model_version` key, which defiNNe §5.3 reserves for level-3 models. Removed from the level-2 frontmatter.
- Applied to both the versioned `v0.1.0/` files and their `latest/` mirrors.

### Backwards Compatibility Notes
- Previous spec versions (FORMAT V_0-1-0 through V_0-1-5) have been removed. Historical copies are in `specs.bak/`.
- Models authored against legacy `FORMAT_V_*` or `_F.md` conventions are NOT compatible and must be migrated.
