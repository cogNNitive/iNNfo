# Session Handoff â€” innfo-rename (FORMAT â†’ iNNfo)

**Date**: 2026-07-03
**Branch**: `innfo/code-rename` (PR #7)
**Base branch**: `dev`

---

## Resumen del cambio

Renombrar **FORMAT** â†’ **iNNfo** como nombre del ecosistema, y el structural marker **`_F`** â†’ **`_NN`** en todo el monorepo iNNfo. Breaking change MAJOR: V_0-1-5 â†’ V_0-2-0, sin compatibilidad inversa.

## Lo que se hizo (2 PRs)

### PR #1: `innfo/preparatory-spec` â†’ `dev` ([#6](https://github.com/iNNfo/iNNfo/pull/6))
- CreÃ³ `specs/iNNfo_V_0-2-0_NN.md` â€” spec nueva con naming iNNfo (411 lÃ­neas)
- Copia de `FORMAT_V_0-1-5_F.md` con transformaciones: `_F` â†’ `_NN`, `FORMAT` â†’ `iNNfo`, `V_0-1-5` â†’ `V_0-2-0`
- NO toca el cÃ³digo â€” el parser sigue esperando `_F.md`

### PR #2: `innfo/code-rename` â†’ `dev` ([#7](https://github.com/iNNfo/iNNfo/pull/7))
- **RenombrÃ³ directorios**: `packages/format-core` â†’ `packages/innfo-core`, `apps/format-editor` â†’ `apps/innfo-editor`, `packages/format-mcp` â†’ `packages/innfo-mcp`
- **MigrÃ³ parser**: `parser.ts`, `validator.ts`, `helpers.ts`, `recursiveParser.ts`, `resolver.ts`, `types.ts`, `metamodel.ts` â€” todos los regex y constantes de `_F` a `_NN`
- **MigrÃ³ MCP server**: imports, URLs, comentarios
- **MigrÃ³ editor**: UI strings (`FORMAT Modeler` â†’ `iNNfo Modeler`), badges (`_F` â†’ `_NN`), constants, imports
- **MigrÃ³ tests**: inline content `_F` â†’ `_NN` en ~20 archivos
- **MigrÃ³ defiNNe spec**: `specs/defiNNe_V_0-1-1_F.md` â†’ `defiNNe_V_0-1-1_NN.md`
- **FixeÃ³ golden tests**: CRLF test para Windows git autocrlf (normalizaciÃ³n LF)
- **ActualizÃ³ docs**: CHANGELOG.md, specs/CHANGELOG.md, ~15 docs, spec-version-propagator skill

## Estado actual

### âœ… Pasando
| Suite | Resultado |
|---|---|
| Core tests (packages/innfo-core/tests/) | **47/47** |
| Golden tests (apps/innfo-editor/tests/golden/) | **20/20** |
| Builds (tsc, tsup, vite) | âœ… |
| Stale `_F` audit en `src/` | âœ… Limpio |
| Legacy files protegidos | âœ… Intactos |

### âŒ Fallas conocidas (pre-existentes, NO del rename)
- 15 suites de componentes fallan por Vite config (falta `@vitejs/plugin-vue`)
- `db.test.ts`: 6 fallas de schema upgrade
- `workspaceStore*.test.ts`: 8 fallas
- `file-system-ops.test.ts`: 12 fallas (network mocks)

### ðŸ“ Archivos creados/modificados clave

```
specs/iNNfo_V_0-2-0_NN.md              â†’ NUEVA spec (PR #1)
specs/defiNNe_V_0-1-1_NN.md            â†’ Migrada de _F.md (PR #2)
packages/innfo-core/                    â†’ Renombrado de format-core
packages/innfo-mcp/                     â†’ Renombrado de format-mcp
apps/innfo-editor/                      â†’ Renombrado de format-editor
openspec/changes/innfo-rename/          â†’ Artefactos SDD completos
  â”œâ”€â”€ proposal.md
  â”œâ”€â”€ spec.md
  â”œâ”€â”€ design.md
  â”œâ”€â”€ tasks.md
  â””â”€â”€ verify-report.md
```

### Out of scope (intencional)
- Modelos legacy `_F.md` (fixtures, samples, Sandbox, docs/iNNfo/)
- Specs congeladas en `archive/`
- `specs/FORMAT_V_0-1-5_F.md` (spec legacy V_0-1-5)
- Templates `business_V_0-1-1_NN.md`, `procedures_V_0-1-1_NN.md` (quedaron out-of-scope en el proposal final, aunque el user inicialmente dijo de migrarlos)

## Decisiones clave tomadas

1. **`_NN` vs `NN`**: Se eligiÃ³ `_NN` con underscore â€” funcional para parseo, evita colisiones con substrings
2. **Sufijo `_FORMAT.md` â†’ `_NN.md`**: MigraciÃ³n directa sin versiÃ³n intermedia
3. **No compatibilidad inversa**: Breaking change aceptado, V_0-2-0. Sin adaptadores
4. **`size:exception` aprobado**: ~1,024 lÃ­neas de diff para PR #2 (mecÃ¡nico, no lÃ³gico)
5. **Legacy models no se migran**: Siguen siendo vÃ¡lidos para V_0-1-5; parser V_0-2-0 no los procesa

## Pendiente

- [ ] **Mergear PR #1 primero** (spec file, bajo riesgo)
- [ ] **Mergear PR #2 despuÃ©s** (code rename, necesita rebase si PR #1 se mergeÃ³)
- [ ] Opcional: Migrar los 2 templates (`business`, `procedures`) a `_NN.md`
- [ ] Opcional: Migrar modelos legacy (Ghostbusters, CodeReviewProcess, etc.)

---

## Prompt para nueva conversaciÃ³n

Copiar y pegar esto en la prÃ³xima sesiÃ³n:

```
ContinÃºa desde el handoff en docs/conversation-handoff_2026-07-03.md.

Hay 2 PRs abiertos en GitHub sin mergear:
- PR #6 (innfo/preparatory-spec â†’ dev): spec iNNfo_V_0-2-0_NN.md
- PR #7 (innfo/code-rename â†’ dev): code rename completo

Resumen del estado:
- Branch actual local: innfo/code-rename (si sigo en iNNfo)
- En GitHub: innfo/preparatory-spec y innfo/code-rename estÃ¡n pushheados
- El cambio estÃ¡ complete y verificado, falta mergear los PRs

Los artefactos SDD estÃ¡n en openspec/changes/innfo-rename/.
El Ãºltimo paso serÃ­a el archive â€” el verify-report ya existe pero no se archivÃ³ formalmente.
```
