# Tasks: Refactor Editor God Components

## Review Workload Forecast

Session review budget is **1500 changed lines** (cached preflight value, overrides the
skill-default 400). The guard line below keeps its literal `400-line budget risk` label
because downstream tooling string-matches on it; treat its value as the verdict against
the **effective 1500-line budget**, not a literal 400-line count.

| Field | Value |
|---|---|
| Estimated changed lines (whole change) | ~5,150 |
| Review budget (session) | 1,500 changed lines |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | 5 PRs (S1 → S2 → S3a → S3b → S4) |
| Delivery strategy (cached) | single-pr |
| Chain strategy | not applicable — size:exception accepted |

Decision needed before apply: Resolved
Chained PRs recommended: Yes (declined by user)
Chain strategy: n/a
400-line budget risk: High

`single-pr` cannot proceed within budget as computed: WU1 alone (~1,400 lines, pure
move) and WU6 alone (~1,300 lines, 1295-line source file) each sit near the 1,500-line
budget individually; the full change (~5,150) is far over it as one PR. The user was
presented with this forecast and the 5-PR chained split recommended by design.md, and
explicitly chose `size:exception` over splitting — the change proceeds as a single PR
despite exceeding the session review budget. `sdd-apply` must pass `size:exception` for
this run.

### Estimated Lines per Work Unit

| WU | Scope | Est. lines | Notes |
|---|---|---|---|
| WU1 | `recursiveParser/` split | ~1,400 | pure move; near budget alone |
| WU2 | shared dedup composables | ~250 | new file + 7 call sites |
| WU3 | LeftSidebar | ~300 | |
| WU4 | MatricesGrid | ~350 | |
| WU5 | ModelInfoPanel | ~300 | incl. 2 new pinning tests |
| WU6 | SetupWizard | ~1,300 | 1295-line source file; near budget alone |
| WU7a | BlockSheet component test (new) | ~150 | zero prior coverage |
| WU7b | BlockSheet extraction | ~250 | gated on WU7a green |
| WU8 | DirectoryPickerModal deletion | ~870 | mostly deletion of dead 842-line file; low review cognitive load despite line count |

Design's suggested S3 (WU5+WU7a+WU7b+WU8 ≈ 1,570) exceeds the 1,500 budget when summed —
**adjusted**: split into S3a (WU5+WU7a+WU7b ≈ 700) and S3b (WU8 ≈ 870). WU8 has no hard
dependency on WU5/WU7 in the design's sequencing graph, so this split is safe.

### Suggested Work Units (PR slices)

| Unit | Goal | PR | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| S1 | `recursiveParser/` split (WU1) | PR 1 | `npm --prefix packages/innfo-core test -- recursiveParser index` | N/A — pure library, no UI; golden snapshots are the executable proof | revert `recursiveParser/` to single file behind unchanged `index.ts`/`browser.ts` barrel |
| S2 | shared dedup + LeftSidebar + MatricesGrid (WU2+3+4) | PR 2 | `npm --prefix apps/innfo-editor test -- useMatrixDefinitions LeftSidebar MatricesGrid` | `npm --prefix apps/innfo-editor run dev`; open a workspace, verify LeftSidebar Relations list and MatricesGrid values unchanged | revert `useMatrixDefinitions.ts`, `useTreeExpansion.ts`, `useMatrixCells.ts`, `useMatrixColors.ts` + component wiring |
| S3a | ModelInfoPanel + BlockSheet test + extraction (WU5+7a+7b) | PR 3 | `npm --prefix apps/innfo-editor test -- ModelInfoPanel BlockSheet` | `npx playwright test e2e/03-block-sheet.spec.ts` | revert `useModelFrontmatter.ts`, `useVersionBump.ts`, `useBlockRawMarkdown.ts`, `useBlockAssets.ts` + component wiring |
| S3b | DirectoryPickerModal deletion (WU8) | PR 4 | `npm --prefix apps/innfo-editor test -- file-system-ops` | `rg "DirectoryPickerModal" src e2e` (must be empty) | `git revert`; restores the file, test block, and doc references together |
| S4 | SetupWizard (WU6) | PR 5 | `npm --prefix apps/innfo-editor test -- setupWizard` | `setupWizard-workflows.integration.test.ts` against the fake FS tree (existing integration harness) | revert `useWorkspaceScaffolding.ts` + `SetupWizard.vue` wiring |

## Phase 1: `recursiveParser/` split — `packages/innfo-core` (PR 1 / S1)

- [ ] 1.1 Create `recursiveParser/{types,paths,normalize,model,workspace}.ts`; move symbols per design's Component Map (no logic change).
- [ ] 1.2 Create `recursiveParser/index.ts` barrel re-exporting exactly `resolveGraphEdgeTarget`, `resolveQualifiedIdToPath`, `ParseIssue`, `RecursiveParseResult`, `normalizeSingleModel`, `recursiveParse` — no `export *`.
- [ ] 1.3 Delete old `src/recursiveParser.ts`; confirm `index.ts:43` and `browser.ts:31-38` byte-identical.
- [ ] 1.4 Run `npm --prefix packages/innfo-core test`; confirm `recursiveParser.models.golden`, `roundtrip.*`, `crlf-fidelity` snapshots unchanged — any diff stops this unit.
- [ ] 1.5 Run `npm run lint`, `npm run typecheck`, `npm run format:check`.

## Phase 2: shared dedup composables — `apps/innfo-editor` (PR 2 / S2, blocks Phase 3–4)

- [ ] 2.1 [RED] Write `useMatrixDefinitions.test.ts` covering `extractMatrixDefs` (fallback) and `mergeMatrixDefs` (merge, dedup by name) against fixtures matching current LeftSidebar/MatricesGrid output.
- [ ] 2.2 Create `src/composables/useMatrixDefinitions.ts`: `MATRIX_DEFS_KEY`, `MatrixDef`, `readMatrixDefsField`, `readRawMatricesField`, `extractMatrixDefs`, `mergeMatrixDefs`, `useMatrixDefinitions(rootIds, {strategy})`.
- [ ] 2.3 [GREEN] Confirm 2.1 passes.
- [ ] 2.4 Add `getConceptMeta(conceptType)` to existing `useConceptVisuals.ts` (moved verbatim).
- [ ] 2.5 Repoint the 7 call sites (`LeftSidebar.vue`, `MatricesGrid.vue`, `BlockSheet.vue:716`, `MetamatrixConfig.vue:174+`, `BlockMatrixSummary.vue:57,151`, `WorkspaceView.vue:382`, `SpecResolverService.ts:167`); `MetamatrixConfig`/`SpecResolverService` adopt constant + primitives only.
- [ ] 2.6 Run `npm --prefix apps/innfo-editor test`, lint, typecheck.

## Phase 3: LeftSidebar.vue (PR 2 / S2)

- [ ] 3.1 Create `src/composables/useTreeExpansion.ts` (`expandedGeneration`, `expandedModels`, `expandAll`, `collapseAll`, `toggleModel`) — moved verbatim.
- [ ] 3.2 Add `compareSemVer(a, b)` to existing `src/utils/version.ts`.
- [ ] 3.3 Wire `LeftSidebar.vue` to `useTreeExpansion`, `useMatrixDefinitions(rootIds, {strategy:'fallback'})`, `compareSemVer`; unify its two internal tree builders.
- [ ] 3.4 Run `LeftSidebar-{ghost,matrix-details,ordering}` component tests unmodified; lint/typecheck.

## Phase 4: MatricesGrid.vue (PR 2 / S2)

- [ ] 4.1 Create `src/components/editor/composables/useMatrixCells.ts` (`matrixCellKey`, `getVal`, `setVal`, `valueDistribution`, `getSetOptionsList`, `isOutOfSetValue`, `rotateCycle`) — moved verbatim.
- [ ] 4.2 Create `src/components/editor/composables/useMatrixColors.ts` (`getCycleBgColor`, `getDistClasses`, `getHeatmapClasses`) — pure functions, no wrapper.
- [ ] 4.3 Wire `MatricesGrid.vue` to `useMatrixDefinitions(rootIds, {strategy:'merge'})`, `useMatrixCells`, `useMatrixColors`; keep `@tanstack/virtual` setup in the component.
- [ ] 4.4 Run `MatricesGrid` component test unmodified; lint/typecheck.

## Phase 5: ModelInfoPanel.vue (PR 3 / S3a)

- [ ] 5.1 Create `useModelFrontmatter.ts` calling `parseFrontmatter` from `@cognnitive/innfo-core` behind a local `readString()` coercion adapter; remove `extractFrontmatterField`/`extractNestedFieldValue`; keep `parseVersionString`.
- [ ] 5.2 Create `useVersionBump.ts` (`currentModelSemVer`, `currentVersionStr`, `versionPreview`, `filenamePreview`, `currentFilename`); keep `saveVersion` in `ModelInfoPanel.vue`.
- [ ] 5.3 [RED] Add pinning tests to `tests/component/ModelInfoPanel-version.test.ts`: non-first-key `template.version` nested field; unquoted YAML scalar coerced to string via `readString`.
- [ ] 5.4 Wire `ModelInfoPanel.vue` to both composables. [GREEN] confirm 5.3 and pre-existing `ModelInfoPanel-version.test.ts` cases pass unmodified.
- [ ] 5.5 Run lint/typecheck/test.

## Phase 6: BlockSheet.vue test-first extraction (PR 3 / S3a, gated on Phase 2)

- [ ] 6.1 [RED] Write `tests/component/BlockSheet.test.ts` (new; zero prior coverage) mounting `BlockSheet.vue`, asserting current `rawMarkdown` and `assetItems` behavior. Must be green before 6.2.
- [ ] 6.2 Create `useBlockRawMarkdown.ts` (`rawMarkdown`) and `useBlockAssets.ts` (`resolveAssetUrl`, `assetItems`, owns `blobUrlCache`) — moved verbatim.
- [ ] 6.3 Wire `BlockSheet.vue` to both composables and to Phase 2's `useMatrixDefinitions`/`getConceptMeta`; keep `stripBlockDefinitions`/`cleanConceptName`/`renderedDescription` in the component.
- [ ] 6.4 [GREEN] Confirm 6.1 and `e2e/03-block-sheet.spec.ts` pass unmodified.
- [ ] 6.5 Run lint/typecheck/test.

## Phase 7: DirectoryPickerModal.vue deletion (PR 4 / S3b)

- [ ] 7.1 Run `rg "DirectoryPickerModal" src e2e`; abort if any match appears beyond the file itself.
- [ ] 7.2 Delete `src/components/layout/DirectoryPickerModal.vue`.
- [ ] 7.3 In `tests/unit/file-system-ops.test.ts`, remove the "DirectoryPickerModal guard" describe block (`:338`) and header comment (`:6`); relocate any assertion exercising `isFileSystemAccessSupported()` (from `useFileSystem.ts`) into a `useFileSystem` describe block instead of deleting it.
- [ ] 7.4 Remove the `:81` size entry and `:168` row-6 mention of `DirectoryPickerModal.vue` from `docs/code-quality-review-guide.md`.
- [ ] 7.5 Confirm `specs/file-system-ops/spec.md` R-FS-01 delta already covers this (no edit needed here).
- [ ] 7.6 Re-run `rg "DirectoryPickerModal" src e2e` — zero matches; run lint/typecheck/test.

## Phase 8: SetupWizard.vue (PR 5 / S4)

- [ ] 8.1 Create `src/composables/useWorkspaceScaffolding.ts`: `TemplateChoice`, `initWorkspaceStructure`, `createIndexMd`, `prepopulateSpecs`, `getStarterByTemplate` — plain exported async functions, no Vue reactivity.
- [ ] 8.2 Wire `SetupWizard.vue` to `useWorkspaceScaffolding.ts`; keep its existing `parseFrontmatter` import unchanged.
- [ ] 8.3 Run `setupWizard-workflows.integration.test.ts` against the fake FS tree unmodified (must import `useWorkspaceScaffolding.ts` directly).
- [ ] 8.4 Run lint/typecheck/test.

## Phase 9: Final verification (all slices, after last PR merges)

- [ ] 9.1 Run `npm run lint`, `npm run typecheck`, `npm run test`, `npm --prefix apps/innfo-editor run test:e2e`.
- [ ] 9.2 Confirm no helper duplicated across files; `innfo-core` barrel exports byte-identical; `rg "DirectoryPickerModal"` returns no `src/`/`e2e/` matches repo-wide.

## Key Learnings

1. The session-cached review budget of 1500 changed lines overrides the skill's 400-line default, but the literal guard-line label stays `400-line budget risk` for downstream string matching.
2. Summing design's proposed S3 grouping (WU5+WU7a+WU7b+WU8) produces roughly 1570 estimated lines, which exceeds the 1500-line budget and required splitting into S3a and S3b.
3. WU8 (DirectoryPickerModal deletion) has no hard dependency on WU5 or WU7 in the design's sequencing graph, which made isolating it into its own PR slice safe.
4. WU1 (recursiveParser split) and WU6 (SetupWizard) each individually approach the 1500-line budget, which rules out single-pr delivery for the whole change regardless of chaining.
5. BlockSheet.vue has zero prior Vitest component coverage, so its extraction task is hard-gated on a new RED test turning GREEN first.
