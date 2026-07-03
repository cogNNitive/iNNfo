# Proposal: FORMAT V_0-1-5 Compact Conventions

## Intent

Rename `_FORMAT.md` file suffix → `_F.md` and shorten `specification_version`/`specification_url` → `spec_version`/`spec_url` in frontmatter. Reduces typing overhead across ~71 FORMAT files and ~15 source files — saves ~10-15 chars per reference across the ecosystem. Patch bump V_0-1-4 → V_0-1-5.

## Scope

### In Scope
- Rename `_FORMAT.md` → `_F.md` across all FORMAT files (~71 files)
- Rename `specification_version` → `spec_version`, `specification_url` → `spec_url` in frontmatter
- Update `FORMAT_FILE_SUFFIX` constant, validator messages, regex patterns in source
- Patch version bump V_0-1-4 → V_0-1-5
- Rebuild JS bundle at `docs/app/assets/`
- Update ~15 doc/skill files referencing old names

### Out of Scope
- Template names (`business`, `procedures`, `kb`, `catalog` stay as-is)
- Ecosystem name `_FORMAT` (underscore prefix) stays unchanged
- Model version in filenames (`V_x-y-z`) stays
- No behavioral, functional, or spec-level requirement changes

## Capabilities

### New Capabilities
None — pure refactoring, no new spec-level behavior.

### Modified Capabilities
None — no requirements change. File suffix and frontmatter field names are convention, not capability behavior.

## Approach

1. **Source files**: Update `FORMAT_FILE_SUFFIX` constant in `recursiveParser.ts`, validator messages in `validator.ts`, regex patterns in `check-spec-version.mjs`
2. **All FORMAT files**: Bulk rename `_FORMAT.md` → `_F.md` across ~71 files using `git mv`
3. **Frontmatter**: Bulk replace `specification_version` → `spec_version`, `specification_url` → `spec_url` — careful with URL-path values containing `_FORMAT.md`
4. **Built assets**: `npm run build` from format-editor to regenerate bundle at `docs/app/assets/`
5. **Documentation/skills**: Update ~15 doc and skill file references
6. **Verify**: All renamed files, tests pass, bundle loads correctly

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/format-core/src/recursiveParser.ts` | Modified | `FORMAT_FILE_SUFFIX` constant, wikilink detection |
| `packages/format-core/src/validator.ts` | Modified | User-facing messages mentioning `_FORMAT.md` |
| `scripts/check-spec-version.mjs` | Modified | Regex for `specification_version`/`specification_url` |
| `models/**/*_FORMAT.md` (~71 files) | Renamed | Suffix change only, content preserved |
| `docs/` (~15 files) | Modified | References to old suffix and field names |
| `*.agents/skills/` (some files) | Modified | Any skill referencing `_FORMAT.md` convention |
| `docs/app/assets/format-editor*.js` | Rebuilt | Bundle regeneration via `npm run build` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `specification_url` values contain `_FORMAT.md` in URL paths | Med | Separate URL-path replacement from field-name replacement; verify all URLs resolve |
| Validator has stale user-facing messages | Low | Update `validator.ts` messages referencing old suffix |
| Built JS bundle stale after rename | Low | Rebuild as explicit step in execution order |
| Sandbox/mirror files pointing to old URLs | Med | Search non-project files; document known discrepancy if unpatchable |
| Ambiguity between `_F.md` suffix and `_F` content markers | Low | Suffix = file extension; `_F` marker = inside file — no parse-time collision |

## Rollback Plan

1. Revert all source changes via `git checkout HEAD -- <files>`
2. Revert FORMAT file renames via `git mv` back to `_FORMAT.md`
3. Rebuild bundle: `npm run build`
4. If partially applied, reset with `git reset --hard HEAD`

## Dependencies

- `npm run build` from `apps/format-editor` depends on Vite toolchain being functional
- No external/third-party dependencies

## Success Criteria

- [ ] All ~71 FORMAT files use `_F.md` suffix
- [ ] No source file references `_FORMAT.md` outside the `_FORMAT` ecosystem namespace
- [ ] No frontmatter uses `specification_version` or `specification_url`
- [ ] Bundle rebuilds and format-editor loads correctly
- [ ] All existing tests pass unchanged
