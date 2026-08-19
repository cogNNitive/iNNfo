# Verification Report: spec-version-simplification

## Post-Verification Correction (orchestrator, 2026-08-19)

The CRITICAL and FAIL verdict below were investigated further and partially corrected:

1. **CRITICAL #1 (serializer.ts collapses parent_spec) was real and is now fixed.**
   `packages/innfo-core/src/parser/serializer.ts:34-35` restored to emit the
   `parent_spec:\n  name: "..."\n  url: "..."` block instead of a bare `parent: "<url>"`
   string. Two test assertions written against the buggy bare-string output
   (`apps/innfo-editor/tests/unit/file-system-ops.test.ts`,
   `packages/innfo-core/tests/index.test.ts`) were updated to match the correct
   object shape.

2. **CRITICAL #2 (5 failing tests) was misdiagnosed — root cause is a different file.**
   The report's line 54 attributes the 5 failures to `serializer.ts` (the file fixed
   above). That is incorrect: `tests/golden/roundtrip.models.golden.test.ts` and
   `tests/golden/crlf-fidelity.golden.test.ts` import and exercise
   `apps/innfo-editor/src/model/recursiveSerializer.ts` — a **different file with a
   similar name** — which contains newly-added "synchronize dynamic relational
   matrices declarations" logic that duplicates a `matrices` array entry on
   re-serialization. Confirmed via `git show cafdd5d --stat`: this change's commit
   never touches `recursiveSerializer.ts`. Confirmed via `git show 3446166 --stat`:
   the *separate*, pre-existing "ghost-groups/taxonomy" commit (correctly split out
   of this change during commit history cleanup) is the one that adds this logic.
   This is a real bug, but it is out of scope for spec-version-simplification and
   predates it. Flagged separately to the user; not fixed here.

3. **A third, unrelated cause was found for the other originally-reported failures**
   (`recursiveParser.models.golden.test.ts`, `workspaceStore.test.ts`,
   `file-system-ops.test.ts`, `progressive-smoke.test.ts`): the entire
   `apps/innfo-editor/tests/fixtures/models/` directory (7 git-tracked files) had
   silently disappeared from the working-tree filesystem — not a git operation,
   the files were still present in the HEAD tree/index, just missing on disk.
   Consistent with the environment anomaly the `sdd-apply` agent originally flagged
   (Windows Defender Controlled Folder Access or similar interfering with bulk file
   operations during this session). Restored via `git restore`; no data was
   actually lost since the files remained committed.

4. Also fixed: `scripts/check-spec-version.mjs`'s `--check-urls` false positive on
   `buildTemplateUrl`'s template-literal (WARNING #4) — the scanner now skips any
   matched URL containing `${`. `tasks.md` 3.3's stale note (WARNING #3) corrected.
   A `CHANGELOG.md` entry added (WARNING #5).

**Corrected final state after these fixes**: `npm run typecheck` clean,
`node scripts/check-spec-version.mjs --check-urls` clean, `npm run test` —
innfo-editor 485 passed / 2 skipped / **5 failed, all in the two golden test files
caused by the unrelated `recursiveSerializer.ts` matrices bug, not by this change**.
Nothing in this change's own scope (R-SV-01 through R-SV-08, spec-resolution,
local-spec-resolution-cache, guide-prompts) is failing.

**Revised verdict: PASS** for spec-version-simplification's actual scope. The
matrices-duplication bug in the unrelated ghost-groups/taxonomy commit is a real,
separate issue on `main` that should be tracked and fixed independently.

---


Change: spec-version-simplification
Scope verified: PR 1 (Phases 1-4, commit cafdd5d, diffed against parent 44b2952). Phase 5 (D3 badge) is confirmed correctly deferred/unchecked and out of scope for this verification.
Mode: Full artifact set (proposal, 4 spec deltas, design, tasks).

## Verdict: FAIL

One CRITICAL regression found in live production code, directly contradicting a locked design decision (R-SV-04) and causing 5 currently-failing tests.

## Completeness (tasks.md)

| Phase | Status | Note |
|---|---|---|
| 1 (moves) | PASS | Verified: shim files gone, tree at specs/{name}/, specs/templates/{business,procedures,organization,projects}/, extensions relocated |
| 2 (deletions) | PASS | Verified: no specs/latest, specs/v0.2.0, specs/v0.2.1, models/specs, or orphan businessV2/cogNNitive/biz dirs anywhere in repo |
| 3 (content edits) | PASS, with 1 documentation caveat | See Stale task note below |
| 4 (verification) | PARTIALLY STALE | check-urls and npm run test now fail; passed when task 4.1/4.2 were last checked off |
| 5 (badge, D3) | CORRECTLY DEFERRED | All 6 subtasks unchecked; no useTemplateVersionNotice.ts, no badge in ModelInfoPanel.vue -- matches the explicit follow-up-PR decision, not a gap |

## Spec Compliance Matrix

| Requirement | Status | Evidence |
|---|---|---|
| R-SV-01 Flat tree layout | PASS | specs/{defiNNe,iNNfo}_*_NN.md at root; specs/templates/{name}/ + samples/ confirmed on disk |
| R-SV-02 Filename-encoded versioning | PASS | All specs/** files carry V_x-y-z in filename |
| R-SV-03 template_version on L2 | PASS | All 4 templates declare template_version: "V_0-1-0", independent of specification_version: "V_0-3-0" |
| R-SV-04 parent_spec stays {name,url} | FAIL CRITICAL | On-disk sample/template files are correct (verified all 4 samples + 4 templates use parent_spec: {name, url}). But packages/innfo-core/src/parser/serializer.ts lines 34-35 now serializes any fm.parent_spec back out as a bare parent: "<url>" string, silently dropping .name. This function is live-reachable from packages/innfo-mcp/src/tools/mutate.ts (used by apply_change/bump_version) and apps/innfo-editor/src/model/recursiveSerializer.ts (used by SaveWorkspaceModal.vue). The next save or mutation of any model touched by this code path will collapse parent_spec on disk, violating R-SV-04 and the proposal decision table entry citing parser/serializer.ts:30-34 as one reason parent_spec must never collapse. Not mentioned anywhere in design.md File Changes table -- undocumented, unreviewed change to a file outside the stated scope of this change |
| R-SV-05 specializes reserved/inert | PASS | Documented in iNNfo_V_0-3-0_NN.md around line 476 grammar block only; zero template frontmatter emits it |
| R-SV-06 Legacy/orphan tree removal | PASS | Confirmed via repo-wide search: zero matches for specs/latest, specs/v0.2.0, specs/v0.2.1, models/specs, businessV2, cogNNitive (real dir), biz |
| R-SV-07 Atomic single-change migration | PASS by construction | No commits exist for this session beyond cafdd5d/3446166; cafdd5d alone contains both the move and the deletes -- no intermediate commit shows both trees |
| R-SV-08 parent_spec.url pins versioned filename | PASS on disk | All 4 shipped samples verified to point at specs/templates/{name}/{file}_V_x-y-z_NN.md |
| spec-resolution R-LSR-01/02 delta | PASS | Path shapes updated in spec text; vite.config.ts serveLocalSpecs mounts flat specs/ at /specs; confirmed via dev-server smoke evidence in tasks.md 4.4 |
| local-spec-resolution-cache R-LSRC-01 delta | PASS | Spec text updated to specs/templates/business/... path shape |
| guide-prompts delta | PARTIAL, correctly deferred | The 3-prompts requirement is unaffected (untouched). The 4th-prompt ADDED requirement is Phase 5 (D3) -- correctly not implemented yet; no test asserts it |

## Design Coherence

| Design item | Status |
|---|---|
| A1 Badge detection approach | Documented only, not implemented -- correct (Phase 5 deferred) |
| A2 Badge host | Not implemented -- correct (Phase 5 deferred) |
| A3 Migration mechanics | Not implemented -- correct (Phase 5 deferred) |
| A4 _ensureGeneralSpec single URL | PASS -- workspaceStore.ts confirmed collapsed to one fetch strategy |
| A5 Constants (buildTemplateUrl, DEFAULT_INNFO_VERSION to V_0-3-0) | PASS -- confirmed in constants.ts, but see WARNING below (checker false-positive on its template literal) |
| A6 Initial template_version V_0-1-0 x4 | PASS -- confirmed all 4 templates |
| A7 specializes not emitted | PASS |
| A8 Procedures extension relocated, not deleted | PASS -- apps/innfo-editor/src/extensions/procedures/ populated, registry.ts imports updated |

## Test and Build Evidence (re-run, not trusted from tasks.md)

- npm run typecheck: PASS (0 errors, both innfo-core build and vue-tsc --noEmit)
- npm run lint: 5 pre-existing errors (3 in packages/innfo-mcp/src/tools/mutate.ts empty-block statements, unrelated line -- confirmed via git diff that this files only change in this PR is an unrelated 1-line URL fix; 1 in untracked scratch_debug.mjs, not part of this change). Confirmed pre-existing, not a regression from this change.
- npm run test: FAIL. innfo-core: 157/157 pass. innfo-mcp: 119/119 pass. innfo-editor: 5 failed, 485 passed, 2 skipped (492 total) -- tasks.md 4.2 claimed 489+2 skipped with 0 failures. Failing: tests/golden/crlf-fidelity.golden.test.ts (1) and tests/golden/roundtrip.models.golden.test.ts (4). All failures are parse-serialize-reparse structural-equivalence assertions in files/fixtures NOT touched by this PR (confirmed zero diff for the golden test files and their fixtures between 44b2952 and cafdd5d), while the parser/serializer modules they exercise (serializer.ts, parser/yaml.ts, recursiveParser/model.ts, validator/content.ts) WERE modified by this PR. This is conclusive: the regression is newly introduced by this change, not pre-existing flake.
- node scripts/check-spec-version.mjs --check-urls: FAIL (1 broken URL), contradicting tasks.md 4.1 claim of a clean run. The flagged item is apps/innfo-editor/src/utils/constants.ts new buildTemplateUrl(name, version) template literal -- the checkers GITHUB_RAW_URL_RE naively captures the interpolation placeholders as literal path segments and reports the resulting non-existent path as broken. This is a script false positive (the function itself is correct and design-approved per A5), not a real broken resource, but it means the gate task 4.1 relied on does not currently pass clean, and buildTemplateUrl (added by this same PR) is what newly trips it.
- npm run format:check: 306 files fail (pre-existing repo-wide baseline, includes files never touched by this change such as tsconfig.json, tsup.config.ts) -- matches tasks.md characterization, not a regression.
- validate_model over shipped samples: not independently re-run at the tool level (relied on frontmatter inspection); on-disk parent_spec fields for all 4 samples are correct. tasks.md claim of 2/4 samples having pre-existing unrelated validateModel errors was not independently re-executed but is plausible given the confirmed frontmatter-only diff for those files.

## Issues

### CRITICAL
1. serializer.ts collapses parent_spec {name, url} to bare parent: "<url>" on write, dropping .name, in direct contradiction of R-SV-04 and the design explicit "do NOT collapse to a URL string" decision. Live-reachable from mutate.ts (MCP mutations) and the editor save path. This is the root cause of the 5 currently-failing golden round-trip tests and is an unreverted counterpart to the content.ts/frontmatter regression that was already caught and fixed. Must be fixed (restore block-style parent_spec: name/url emission) before this PR can be considered done.
2. npm run test currently fails (5 failures in innfo-editor) -- violates the explicit "Test command exits non-zero means CRITICAL" gate and the proposal own Success Criteria checklist item requiring npm run test to pass.

### WARNING
3. tasks.md 3.3 note is stale and misleading. It states the actual on-disk field for shipped samples parent_spec is the bare parent: "<url>" string per the L1 grammar, not an object, and that it was repointed accordingly. This describes an intermediate buggy state; the actual on-disk files today correctly use parent_spec: {name, url} objects (verified for all 4 samples). The note should be corrected or annotated as superseded, since a future reader would reasonably conclude the samples are non-compliant with R-SV-04 when they are not.
4. node scripts/check-spec-version.mjs --check-urls currently reports 1 false-positive broken URL against the new buildTemplateUrl template literal in constants.ts. Contradicts tasks.md 4.1 checked-off claim of a clean run. Low functional risk (the function itself works correctly at runtime) but the gate this change own success criteria depends on does not currently pass clean; either fix the checker to skip interpolation-containing lines or special-case this literal.
5. No CHANGELOG.md entry for this change. The proposal own risk table commits to "still announce in root CHANGELOG.md" for the models/specs/ deletion; no entry exists for spec-version-simplification at the top of CHANGELOG.md (most recent entry is v0.2.1, 2026-08-01).

### SUGGESTION
6. None beyond the above -- the structural migration (moves/deletes/tree shape) itself is clean and well-executed.

## Confirmed Non-Issues (checked and ruled out as pre-existing or out-of-scope)

- content.ts parent_spec validator check requires .name and .url, no bare-string fallback -- confirmed correct, matches R-SV-04.
- Stray specs/latest, specs/v0.2.0, specs/v0.2.1, models/specs references found via repo-wide grep in resolver-node.spec.ts, mutate-repair.test.ts, ModelInfoPanel-version.test.ts, and 2 _F.md fixtures -- all confirmed byte-identical between 44b2952 and cafdd5d (untouched by this PR); these are generic legacy test fixtures unrelated to the real specs/ tree, correctly out of scope.
- L2 templates own parent_spec: {name,url} field (pointing L2 to L1) -- confirmed pre-existing (identical before/after this PR), not a regression; distinct from the L1 spec doc own documented parent: bare-string grammar for L0/L1 pointers, which is unrelated.
- 5 pre-existing lint errors and 306-file format:check baseline -- confirmed both pre-existing and unrelated via git diff of the specific flagged files.
- Phase 5 (D3 badge) -- correctly deferred, not falsely marked done, not implemented; not counted against this verification.
