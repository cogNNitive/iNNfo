# Session Handoff — innfo-rename (FORMAT → iNNfo)

**Date**: 2026-07-03
**Branch**: `innfo/code-rename` (PR #7)
**Base branch**: `dev`

---

## Resumen del cambio

Renombrar **FORMAT** → **iNNfo** como nombre del ecosistema, y el structural marker **`_F`** → **`_NN`** en todo el monorepo cogNNitive. Breaking change MAJOR: V_0-1-5 → V_0-2-0, sin compatibilidad inversa.

## Lo que se hizo (2 PRs)

### PR #1: `innfo/preparatory-spec` → `dev` ([#6](https://github.com/innV0/cogNNitive/pull/6))
- Creó `specs/iNNfo_V_0-2-0_NN.md` — spec nueva con naming iNNfo (411 líneas)
- Copia de `FORMAT_V_0-1-5_F.md` con transformaciones: `_F` → `_NN`, `FORMAT` → `iNNfo`, `V_0-1-5` → `V_0-2-0`
- NO toca el código — el parser sigue esperando `_F.md`

### PR #2: `innfo/code-rename` → `dev` ([#7](https://github.com/innV0/cogNNitive/pull/7))
- **Renombró directorios**: `packages/format-core` → `packages/innfo-core`, `apps/format-editor` → `apps/innfo-editor`, `packages/format-mcp` → `packages/innfo-mcp`
- **Migró parser**: `parser.ts`, `validator.ts`, `helpers.ts`, `recursiveParser.ts`, `resolver.ts`, `types.ts`, `metamodel.ts` — todos los regex y constantes de `_F` a `_NN`
- **Migró MCP server**: imports, URLs, comentarios
- **Migró editor**: UI strings (`FORMAT Modeler` → `iNNfo Modeler`), badges (`_F` → `_NN`), constants, imports
- **Migró tests**: inline content `_F` → `_NN` en ~20 archivos
- **Migró defiNNe spec**: `specs/defiNNe_V_0-1-1_F.md` → `defiNNe_V_0-1-1_NN.md`
- **Fixeó golden tests**: CRLF test para Windows git autocrlf (normalización LF)
- **Actualizó docs**: CHANGELOG.md, specs/CHANGELOG.md, ~15 docs, spec-version-propagator skill

## Estado actual

### ✅ Pasando
| Suite | Resultado |
|---|---|
| Core tests (packages/innfo-core/tests/) | **47/47** |
| Golden tests (apps/innfo-editor/tests/golden/) | **20/20** |
| Builds (tsc, tsup, vite) | ✅ |
| Stale `_F` audit en `src/` | ✅ Limpio |
| Legacy files protegidos | ✅ Intactos |

### ❌ Fallas conocidas (pre-existentes, NO del rename)
- 15 suites de componentes fallan por Vite config (falta `@vitejs/plugin-vue`)
- `db.test.ts`: 6 fallas de schema upgrade
- `workspaceStore*.test.ts`: 8 fallas
- `file-system-ops.test.ts`: 12 fallas (network mocks)

### 📁 Archivos creados/modificados clave

```
specs/iNNfo_V_0-2-0_NN.md              → NUEVA spec (PR #1)
specs/defiNNe_V_0-1-1_NN.md            → Migrada de _F.md (PR #2)
packages/innfo-core/                    → Renombrado de format-core
packages/innfo-mcp/                     → Renombrado de format-mcp
apps/innfo-editor/                      → Renombrado de format-editor
openspec/changes/innfo-rename/          → Artefactos SDD completos
  ├── proposal.md
  ├── spec.md
  ├── design.md
  ├── tasks.md
  └── verify-report.md
```

### Out of scope (intencional)
- Modelos legacy `_F.md` (fixtures, samples, Sandbox, docs/cogNNitive/)
- Specs congeladas en `archive/`
- `specs/FORMAT_V_0-1-5_F.md` (spec legacy V_0-1-5)
- Templates `business_V_0-1-1_NN.md`, `procedures_V_0-1-1_NN.md`, `catalog_V_0-1-2_NN.md` (quedaron out-of-scope en el proposal final, aunque el user inicialmente dijo de migrarlos)

## Decisiones clave tomadas

1. **`_NN` vs `NN`**: Se eligió `_NN` con underscore — funcional para parseo, evita colisiones con substrings
2. **Sufijo `_FORMAT.md` → `_NN.md`**: Migración directa sin versión intermedia
3. **No compatibilidad inversa**: Breaking change aceptado, V_0-2-0. Sin adaptadores
4. **`size:exception` aprobado**: ~1,024 líneas de diff para PR #2 (mecánico, no lógico)
5. **Legacy models no se migran**: Siguen siendo válidos para V_0-1-5; parser V_0-2-0 no los procesa

## Pendiente

- [ ] **Mergear PR #1 primero** (spec file, bajo riesgo)
- [ ] **Mergear PR #2 después** (code rename, necesita rebase si PR #1 se mergeó)
- [ ] Opcional: Migrar los 3 templates (`business`, `procedures`, `catalog`) a `_NN.md`
- [ ] Opcional: Migrar modelos legacy (Ghostbusters, CodeReviewProcess, etc.)

---

## Prompt para nueva conversación

Copiar y pegar esto en la próxima sesión:

```
Continúa desde el handoff en docs/conversation-handoff_2026-07-03.md.

Hay 2 PRs abiertos en GitHub sin mergear:
- PR #6 (innfo/preparatory-spec → dev): spec iNNfo_V_0-2-0_NN.md
- PR #7 (innfo/code-rename → dev): code rename completo

Resumen del estado:
- Branch actual local: innfo/code-rename (si sigo en cogNNitive)
- En GitHub: innfo/preparatory-spec y innfo/code-rename están pushheados
- El cambio está complete y verificado, falta mergear los PRs

Los artefactos SDD están en openspec/changes/innfo-rename/.
El último paso sería el archive — el verify-report ya existe pero no se archivó formalmente.
```
