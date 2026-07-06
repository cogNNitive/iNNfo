# Handover: Playwright E2E + Sandbox + SDD port-legacy-gaps

**Fecha**: 2026-07-03
**Branch**: `innfo/code-rename` (1 commit ahead of origin)
**Proyecto**: cogNNitive — monorepo npm workspaces (apps/*, packages/*)

---

## Estado actual

### ✅ Completado

1. **SDD cycle `port-legacy-gaps`** — COMPLETO
   - verify: 315/315 tests, 60/60 tasks, PASS WITH WARNINGS
   - TS fix: `getDirectoryHandle` agregado a `DirectoryHandleLike` en `packages/innfo-core/src/fs-types.ts`
   - Archive: `openspec/changes/archive/2026-07-03-port-legacy-gaps/`

2. **Sandbox V_0-1-5** — COMPLETO
   - KB root con taxonomy, colorHex
   - Entidades KB con datos para testing de widgets
   - Matriz 16×10 para virtual scrolling
   - README con guía de testing

3. **Playwright e2e suite** — 65 tests en 10 archivos bajo `apps/innfo-editor/e2e/`
   - ✅ **3 tests pasan**: home page (título, open folder, layout)
   - ❌ **62 tests fallan**: todos dependen del tree navigation que muestra "No nodes loaded"

### ⚠️ Problema principal

El **mock file system** (`MockDirectoryHandle` en `e2e/helpers/setup.ts`) logra interceptar `showDirectoryPicker`, pero cuando la app procesa los archivos mockeados, el tree queda vacío ("No nodes loaded"). El mock debe estar devolviendo datos en un formato que el parser de la app no reconoce.

Posibles causas:
1. `entries()` async generator no itera correctamente en el mock
2. `getFileHandle()` devuelve `MockFileHandle` cuya API no coincide con lo que el app espera
3. El app podría llamar a métodos no implementados en el mock

### 📝 Notas importantes

- La branch `dev` tiene los nombres viejos (`format-editor`, `format-core`) PERO `apps/format-editor/` NO tiene `package.json` ni `vite.config.ts` — está incompleto.
- La app REAL está en `apps/innfo-editor/` en la branch `innfo/code-rename`.
- La UI cambió respecto a lo visto antes: botón "**Open folder…**" (no "Open Local Folder"), título "**iNNfo Modeler**" (no "format-editor").
- Para correr tests: `cd apps/innfo-editor && npx playwright test`
- Para ver UI: `cd packages/innfo-core && npx tsc -p tsconfig.json` y después `cd apps/innfo-editor && npx vite --port 5173`

---

## Prompt para la nueva conversación

Copiá y pegá esto en la nueva conversación:

```text
Continuar desde el handover en `handover-playwright-e2e.md`.

Estamos en la branch `innfo/code-rename`. Quiero que leas el archivo
`handover-playwright-e2e.md` que está en la raíz del repo para entender
el estado actual de la sesión anterior.

El resumen corto:
- Completamos el SDD cycle de port-legacy-gaps
- Actualizamos el Sandbox a V_0-1-5
- Creamos 65 tests e2e con Playwright en apps/innfo-editor/e2e/
- 3 tests pasan, 62 fallan porque el mock file system no carga nodos en el tree

El problema principal a resolver: el mock `MockDirectoryHandle` en
`e2e/helpers/setup.ts` logra interceptar `showDirectoryPicker`, pero
cuando la app procesa los archivos mockeados, el tree muestra
"No nodes loaded". Necesito debuguear por qué el mock no funciona
y arreglarlo.

Pasos:
1. Leer handover-playwright-e2e.md para contexto completo
2. Leer apps/innfo-editor/e2e/helpers/setup.ts (el mock)
3. Leer apps/innfo-editor/tests/helpers/fakeFs.ts (el fake FS real que funciona en unit tests)
4. Comparar ambos para entender qué falta en el mock de Playwright
5. Arreglar el mock para que la app cargue nodos
6. Corregir los tests que fallan
```
