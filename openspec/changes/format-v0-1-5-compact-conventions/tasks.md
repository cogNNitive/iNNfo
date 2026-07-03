# Tasks: FORMAT V_0-1-5 Compact Conventions

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~530 |
| 800-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr-default |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Suffix rename + source constant updates | PR 1 | `git mv` all `_FORMAT.md`→`_F.md` (71 files) + update `FORMAT_FILE_SUFFIX`, validator naming checks, resolver cache, version.ts patterns, check-spec-version.mjs patterns |
| 2 | Frontmatter field rename `specification_version`→`spec_version`, `specification_url`→`spec_url` | PR 1 | Source type defs, parser serialization, validator checks, ModelInfoPanel.vue, all FORMAT file frontmatter, all test inline frontmatter |
| 3 | Version bump V_0-1-4→V_0-1-5 | PR 1 | Update `FORMAT_V_0-1-4_F.md` frontmatter, `DEFAULT_FORMAT_VERSION`, `parent.name`/`parent.url` on dependent templates, CHANGELOGs |
| 4 | Docs + skills update | PR 1 | ~15 doc/skill files referencing old names |
| 5 | Build + verify | PR 1 | `npm run build` in format-editor, run all tests, verify bundle |

## Phase 1: File Suffix Rename + Source Constant Updates

- [ ] 1.1 `git mv` all `*_FORMAT.md` → `*_F.md` across specs/, tests/fixtures/, apps/*/tests/fixtures/, docs/cogNNitive/, Sandbox/ (71 files). Use a script to batch it. Verify with `git diff --stat`.
- [ ] 1.2 Update `FORMAT_FILE_SUFFIX` in `packages/format-core/src/recursiveParser.ts`: `'_FORMAT.md'` → `'_F.md'`
- [ ] 1.3 Update naming validation in `packages/format-core/src/validator.ts`: lines 399-411 (`_FORMAT.md` checks → `_F.md`), line 494 label
- [ ] 1.4 Update cache path in `packages/format-core/src/resolver.ts`: line 49 (`${currentName}_FORMAT.md` → `${currentName}_F.md`)
- [ ] 1.5 Update version.ts in `apps/format-editor/src/utils/version.ts`: comments (lines 8-11), regex patterns (lines 43, 59), `buildFormatFilename` (line 84) — all `_FORMAT.md` → `_F.md`
- [ ] 1.6 Update `apps/format-editor/src/views/HomeView.vue`: sample paths and descriptions (lines 27, 29, 35, 45)
- [ ] 1.7 Update `apps/format-editor/src/components/editor/ModelInfoPanel.vue`: line 191 — `extractFrontmatterField('specification_version')` → `extractFrontmatterField('spec_version')`
- [ ] 1.8 Update `scripts/check-spec-version.mjs`: classification patterns (lines 72, 76, 77, 89) for `_FORMAT.md` → `_F.md`; frontmatter regexes (lines 117, 125) for `specification_version`/`specification_url` → `spec_version`/`spec_url`
- [ ] 1.9 Update JSDoc in `packages/format-core/src/types.ts`: lines 324, 364 — `_FORMAT.md` → `_F.md`
- [ ] 1.10 **Test**: Update all test file references to renamed filenames (e.g. `'gb_FORMAT.md'` → `'gb_F.md'`, `'_FORMAT.md'` → `'_F.md'`) in `tests/recursive-parser.test.ts`, `tests/index.test.ts`, `apps/format-editor/tests/unit/*.test.ts`, `apps/format-editor/tests/golden/*.test.ts`, `apps/format-editor/tests/integration/*.test.ts`, `apps/format-editor/tests/progressive-smoke.test.ts`

## Phase 2: Frontmatter Field Rename

- [ ] 2.1 Update type definitions in `packages/format-core/src/types.ts`: lines 54-55 — `specification_version` → `spec_version`, `specification_url` → `spec_url`
- [ ] 2.2 Update serialization in `packages/format-core/src/parser.ts`: lines 415-416
- [ ] 2.3 Update validation in `packages/format-core/src/validator.ts`: lines 124-125 (JSDoc), 220-243 (checks + messages)
- [ ] 2.4 Update `apps/format-editor/src/components/editor/ModelInfoPanel.vue`: line 191 — field name in `extractFrontmatterField` call (already covered in 1.7 if using `spec_version`)
- [ ] 2.5 Bulk replace `specification_version` → `spec_version` and `specification_url` → `spec_url` in ALL FORMAT file frontmatter (specs, templates, samples, fixtures, Sandbox models, Music History catalog). **CRITICAL**: Do NOT change URL path values containing `_FORMAT.md` — only change field names.
- [ ] 2.6 **Test**: Update all test inline frontmatter strings (`specification_version` → `spec_version`, `specification_url` → `spec_url`) in every `.test.ts` file. Do NOT change version values (they test against fixed versions).

## Phase 3: Version Bump V_0-1-4 → V_0-1-5

- [ ] 3.1 Update `specs/FORMAT_V_0-1-4_F.md` frontmatter: `specification_version: "V_0-1-4"` → `spec_version: "V_0-1-5"`, update `specification_url` path to `FORMAT_V_0-1-5_F.md`, update `parent.url` (repo tag stays until release)
- [ ] 3.2 Update `apps/format-editor/src/utils/constants.ts`: `DEFAULT_FORMAT_VERSION = 'V_0-1-0'` → `'V_0-1-5'` (or the current value that was already V_0-1-4)
- [ ] 3.3 Update `parent.name` and `parent.url` in `defiNNe`, `business`, `procedures`, `catalog` template specs and their child samples/models to point to new FORMAT file name
- [ ] 3.4 Update CHANGELOGs: add V_0-1-5 entry to `specs/CHANGELOG.md` and project `CHANGELOG.md`

## Phase 4: Documentation and Skills Update

- [ ] 4.1 Update `docs/*.md` files referencing `_FORMAT.md`, `specification_version`, `specification_url` (affected: `docs/index.md`, `docs/about.md`, `docs/spec_consolidation.md`, `docs/cogNNitive/_FORMAT.md`→`_F.md`, etc.)
- [ ] 4.2 Update `.agents/skills/*/SKILL.md` files referencing old conventions (affected: `spec-version-propagator/`, others)
- [ ] 4.3 Update `docs/documentation/*.md` files referencing `_FORMAT.md`, `specification_version`, `specification_url`
- [ ] 4.4 Update `docs/changesets/*.md` files

## Phase 5: Build and Verify

- [ ] 5.1 Run `npm run build` in `apps/format-editor` to regenerate `docs/app/assets/index-*.js` bundle
- [ ] 5.2 Run `npm test` from root — all tests must pass
- [ ] 5.3 Run `node scripts/check-spec-version.mjs --version V_0-1-4 --check` — should report clean (no stale references)
- [ ] 5.4 Verify no `.md` file still uses `_FORMAT.md` suffix or `specification_version`/`specification_url` (except historical frozen files)
- [ ] 5.5 Verify format-editor loads correctly with rebuilt bundle
