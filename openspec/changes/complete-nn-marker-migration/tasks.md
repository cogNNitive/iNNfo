# Tasks: complete-nn-marker-migration

## Phase 1 — Parser hidden-form support (DONE)

- [x] `normalizeSource()` unwraps `<!-- _NN … -->` → visible `_NN` before matching
- [x] Update doc comment (function does more than line-ending normalization)
- [x] Unit test: hidden form decomposes identically to visible form
      (`packages/innfo-core/tests/recursive-parser.test.ts`)
- [x] Core suite green (48 passed, no regression)

## Phase 2 — Content migration (NOT STARTED)

- [ ] **Gen 1 (visible `_F`)**: migrate `\b_F\b` → `_NN` in
      `apps/innfo-editor/tests/fixtures/models/Ghostbusters_V_0-1-1_business_F.md`,
      `apps/innfo-editor/tests/fixtures/models/mini-file_V_0-0-1_business_F.md`,
      `models/Ghostbusters_V_0-1-2_business_F.md`,
      `tests/fixtures/file-model_F.md`
- [ ] **Gen 2 (hidden `_F`)**: `<!--\s*_F\b` → `<!-- _NN` in
      `apps/innfo-editor/tests/fixtures/models/FORMAT_V_0-1-1_business_F.md`
- [ ] **Gen 3 (`block:`)**: remap `<!-- block: … -->` grammar to `_NN` in
      `FORMAT_V_0-1-0_business_F.md`, `Comprehensive_Test_Procedure_V_1-0-0_procedures_F.md`,
      `Knowledge_Management_V_1-0-0_procedures_F.md`,
      `Knowledge_Management_V_1-0-1_procedures_F.md`,
      `iNNv0_Innovation_Process_V_1-0-0_procedures_F.md`
      (validate each `block:` value against `template.concepts`; flag unmapped, don't guess)
- [ ] Per-file before/after node-count check (each file must gain child nodes)

## Phase 3 — Golden + quarantine (NOT STARTED)

- [ ] Regenerate `recursiveParser.models.golden` snapshot
- [ ] **Audit the diff**: every fixture goes from 1 node → full tree; spot-check counts;
      no fixture may remain root-only
- [ ] Remove `it.skip` from smoke tests `2d` and `4a` in `progressive-smoke.test.ts`
- [ ] Full suite green: core + app unit + golden; typecheck clean; lint clean

## Deferred (separate hygiene task)

- [ ] Rename `*_F.md` → `*_NN.md` and update all references
      (`tests/README.md`, `tests/fixtures/workspace-index.md`, docs, golden snapshot keys,
      the two smoke-test read paths)
