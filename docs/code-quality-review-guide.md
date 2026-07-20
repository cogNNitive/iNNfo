# GuÃ­a de RevisiÃ³n de Calidad de CÃ³digo â€” iNNfo

> QuÃ© mirar en este proyecto para garantizar **coherencia**, **buena estructura**,
> **aplicaciÃ³n de mejores prÃ¡cticas** y, en general, **buena calidad de cÃ³digo**.
>
> Este documento sirve para dos cosas:
> 1. Como **prompt reutilizable** para lanzar una revisiÃ³n (humana o con un agente).
> 2. Como **checklist accionable** con hallazgos concretos ya detectados en el repo.

---

## 1. Contexto del proyecto (stack real)

Monorepo con **npm workspaces** (`packages/*`, `apps/*`):

| Paquete | Rol | Stack |
|---|---|---|
| `apps/innfo-editor` | Editor visual (UI) | Vue 3 (SFC, `<script setup>`), Vite 6, TS 5, Pinia, Vue Router, Tailwind 3, d3/dagre/mermaid, radix-vue |
| `packages/innfo-core` | LibrerÃ­a de dominio: parser, modelo, drivers IO, validador | TS puro, compilado con `tsc`, sin dependencias de UI |
| `packages/innfo-mcp` | Servidor MCP sobre `innfo-core` (stdio) | TS + `@modelcontextprotocol/sdk`, build con `tsup` |
| `packages/format-core`, `packages/format-mcp` | âš ï¸ **Legacy** â€” solo `dist/`, sin `src/` ni `package.json` de origen | Copias viejas anteriores al rename a `innfo-*` |

**Regla de oro de arquitectura**: `innfo-core` es el dominio y **no debe** conocer a Vue,
Pinia ni al navegador (salvo los drivers `-browser` explÃ­citos). La UI depende del core,
nunca al revÃ©s.

---

## 2. CÃ³mo usar este archivo como prompt

PegÃ¡ esto (o delegÃ¡ a un agente de revisiÃ³n) apuntando a un diff o al repo completo:

```
RevisÃ¡ este cÃ³digo de iNNfo usando docs/code-quality-review-guide.md.
EvaluÃ¡ los cuatro ejes: coherencia, estructura, mejores prÃ¡cticas y calidad general.
Para cada hallazgo indicÃ¡: archivo:lÃ­nea, severidad (CRÃTICO/ALTO/MEDIO/BAJO),
el POR QUÃ‰ tÃ©cnico, y la correcciÃ³n propuesta. No inventes problemas: si algo estÃ¡
bien, decilo. PriorizÃ¡ los hallazgos por impacto real, no por cantidad.
```

Severidades:
- **CRÃTICO**: rompe build/tests, bug de datos, vulnerabilidad, o viola el lÃ­mite de capas.
- **ALTO**: deuda que va a doler pronto (SFC inmanejable, `any` en dominio, falta de tooling).
- **MEDIO**: incoherencia de convenciÃ³n, duplicaciÃ³n evitable, test faltante.
- **BAJO**: naming, formato, nit estÃ©tico.

---

## 3. Ejes de revisiÃ³n

### 3.1 Coherencia

Lo que hace que el cÃ³digo parezca escrito por **una sola cabeza**, no por diez.

- [ ] **Rutas de import unificadas.** Hoy conviven TRES formas de importar lo mismo:
      `@cogNNitive/cogNNitive-core`, `../model/types` (shims de re-export) y el alias `@/*`
      declarado en `tsconfig` pero casi sin uso. DecidÃ­ UNA convenciÃ³n por capa y aplicala:
  - Tipos/lÃ³gica de dominio â†’ siempre desde `@cogNNitive/cogNNitive-core` (o el shim `@/model/*`),
    pero no ambos indistintamente.
  - Dentro del app â†’ alias `@/` en vez de `../../..`.
- [ ] **PatrÃ³n de stores consistente.** Todos los stores usan Pinia Options API
      (`state/getters/actions`). Si aparece un store en Composition/Setup API, es una
      incoherencia: elegÃ­ un estilo y mantenelo.
- [ ] **Naming coherente**: `useXxx` para composables, `XxxStore`/`useXxxStore` para
      stores, `XxxWidget.vue` para widgets del registry, `FieldXxx.vue` para campos.
      VerificÃ¡ que ningÃºn archivo nuevo rompa la familia.
- [ ] **Idioma coherente**: cÃ³digo, identificadores y comentarios en inglÃ©s;
      documentaciÃ³n de proyecto (`AGENTS.md`, `openspec/`, esta guÃ­a) en espaÃ±ol.
      No mezclar dentro de un mismo artefacto.
- [ ] **Un solo origen de verdad para el modelo.** `src/model/*.ts` deben seguir siendo
      shims finos de re-export; si empieza a aparecer lÃ³gica de dominio dentro del app,
      es una fuga de capa.

### 3.2 Estructura

- [ ] **LÃ­mite de capas app â†” core.** `innfo-core` no debe importar nada de `apps/`,
      de Vue, de Pinia ni de `window`/DOM fuera de los drivers `-browser`. BuscÃ¡
      violaciones: `rg "from '.*apps/" packages/innfo-core/src`.
- [ ] **TamaÃ±o de los SFC.** Componentes > ~300 lÃ­neas son seÃ±al de que hacen demasiado.
      Candidatos actuales a descomponer:
  - `components/layout/DirectoryPickerModal.vue` (~777)
  - `components/editor/GraphViewer.vue` (~669)
  - `components/editor/MatricesGrid.vue` (~561)
  - `components/editor/BlockSheet.vue` (~531)
      ExtraÃ© lÃ³gica a **composables** (`composables/`) y sub-componentes presentacionales.
- [ ] **Composables para lÃ³gica reutilizable/con estado**, no copiar-pegar `watch`/`ref`
      entre componentes. Ya hay un buen patrÃ³n en `composables/` (useFileSystem,
      useResizablePanel, etc.) â€” que las cosas nuevas lo respeten.
- [ ] **Container vs. presentational.** Los componentes que tocan stores/IO deberÃ­an
      orquestar; los que solo pintan deberÃ­an recibir props y emitir eventos. Un widget
      de campo no deberÃ­a importar un store directamente.
- [ ] **Registry de widgets.** `shared/widgets/registry.ts` centraliza el mapeo tipoâ†’widget.
      Todo widget nuevo se registra ahÃ­; que no haya `if (type === ...)` sueltos en otro lado.
- [ ] **Sin cÃ³digo muerto.** Los packages `format-core`/`format-mcp` (solo `dist/`, sin
      fuentes, no importados por cÃ³digo vivo) deberÃ­an eliminarse o archivarse. Peso muerto
      que confunde a cualquiera que abra el repo.

### 3.3 Mejores prÃ¡cticas

**TypeScript**
- [ ] `strict: true` ya estÃ¡ activo (bien). ProtegÃ© esa inversiÃ³n: **minimizÃ¡ `any`**.
      Hay ~57 usos de `any`/`as any` en ~11 archivos del app. Cada uno es un agujero en
      el sistema de tipos. ReemplazÃ¡ por tipos concretos, genÃ©ricos o `unknown` + narrowing.
- [ ] PreferÃ­ `type`/`interface` explÃ­citos sobre inferencia opaca en las fronteras
      pÃºblicas (exports de `innfo-core`, props de componentes, payloads de acciones).
- [ ] Nada de `@ts-ignore` sin comentario que justifique el porquÃ©.

**Vue 3**
- [ ] `<script setup lang="ts">` en todos los SFC nuevos (consistencia).
- [ ] Props tipadas con `defineProps<T>()`, emits con `defineEmits<T>()`.
- [ ] No mutar props; no mutar estado de un store fuera de sus `actions`.
- [ ] `computed` para derivados, no recalcular en el template.
- [ ] Keys estables en `v-for` (no el Ã­ndice cuando la lista se reordena â€” ojo con
      Ã¡rboles y matrices que sÃ­ se reordenan aquÃ­).
- [ ] Limpiar `watch`/listeners/observers en `onUnmounted` (d3, mermaid, ResizeObserver).

**Pinia**
- [ ] El estado se muta **solo** dentro de `actions`. Getters puros, sin efectos.
- [ ] Un store = una responsabilidad (model, metamodel, ui, history, workspace).
      Si un store empieza a tocar responsabilidades de otro, revisÃ¡ el lÃ­mite.

**Seguridad**
- [ ] Todo HTML/Markdown renderizado pasa por `dompurify`/`utils/sanitize.ts`.
      BuscÃ¡ `v-html` sin sanitizar: `rg "v-html" apps/innfo-editor/src`. Cada `v-html`
      debe consumir contenido ya saneado.
- [ ] Nada de `eval`, `new Function`, ni interpolaciÃ³n de input de usuario en selectores/URLs.

**Accesibilidad / UX**
- [ ] Modales (radix-vue) con foco atrapado, `Esc` para cerrar y roles ARIA correctos.
- [ ] Elementos interactivos que no sean `<button>`/`<a>` con `role` y manejo de teclado.

### 3.4 Calidad general y tooling

AquÃ­ estÃ¡ el **mayor dÃ©ficit del repo hoy**:

- [ ] âš ï¸ **No hay linter.** No existe ESLint/Biome en ningÃºn workspace. Sin esto, las
      convenciones de arriba no se pueden **garantizar**, solo esperar. RecomendaciÃ³n:
      aÃ±adir **ESLint 9 (flat config) + `eslint-plugin-vue` + `typescript-eslint`**, o
      **Biome** si se prioriza velocidad. Un script `lint` en la raÃ­z y en cada workspace.
- [ ] âš ï¸ **No hay formateador.** Sin Prettier/Biome-format, el estilo depende de la
      disciplina de cada uno. AÃ±adir formateador con config compartida en la raÃ­z.
- [ ] âš ï¸ **No hay CI.** No existe `.github/workflows/`. Todo (typecheck, tests, build)
      corre solo en local y por buena voluntad. AÃ±adir un workflow que en cada PR corra:
      `vue-tsc --noEmit`, `vitest run`, build de packages, y (cuando exista) `lint`.
      Los e2e de Playwright, al menos en un job nightly o manual.
- [ ] **Typecheck real.** El build del app ya hace `vue-tsc --noEmit` (bien). AsegurÃ¡ que
      los packages tambiÃ©n typecheckean en CI, no solo compilan.
- [ ] **Tests.** Hay buena base: ~49 specs, golden tests (`tests/golden/`) y e2e Playwright.
      VerificÃ¡ que el cÃ³digo nuevo llegue con tests y que los golden se actualicen
      **conscientemente**, no a ciegas (`--update` sin leer el diff es un anti-patrÃ³n).
      Ojo con CRLF en Windows en los golden (ya hubo fixes por `autocrlf`).
- [ ] **`console.*` fuera de producciÃ³n.** Hay ~5 llamadas `console` en el app. DefinÃ­ una
      polÃ­tica: logger centralizado o eliminarlas antes de mergear.
- [ ] **Dependencias sin fijar / duplicadas.** `@cogNNitive/cogNNitive-core` estÃ¡ referenciado como
      `"*"` en el app y `"^0.1.0"` en el mcp. UnificÃ¡ el criterio de versionado interno.

---

## 4. Hallazgos concretos ya detectados (para arrancar con ventaja)

| # | Severidad | Hallazgo | DÃ³nde |
|---|---|---|---|
| 1 | ALTO | Sin ESLint/Prettier/Biome en todo el monorepo | raÃ­z + todos los workspaces |
| 2 | ALTO | Sin CI (`.github/workflows` inexistente) | raÃ­z |
| 3 | MEDIO | Packages muertos `format-core`/`format-mcp` (solo `dist/`) | `packages/format-*` |
| 4 | MEDIO | Tres estilos de import para el dominio (`@innv0/...`, `../model/*`, alias `@/` sin uso) | `apps/innfo-editor/src` |
| 5 | MEDIO | ~57 usos de `any`/`as any` erosionan `strict: true` | ~11 archivos del app |
| 6 | MEDIO | SFCs > 500 lÃ­neas difÃ­ciles de mantener/testear | `DirectoryPickerModal`, `GraphViewer`, `MatricesGrid`, `BlockSheet` |
| 7 | BAJO | Versionado interno inconsistente (`"*"` vs `"^0.1.0"`) | `package.json` del app y del mcp |

**Lo que estÃ¡ BIEN y hay que preservar** (no romper al refactorizar):
- `tsconfig` con `strict: true`.
- `src/model/*` como shims finos de re-export (fachada correcta que preserva rutas).
- Stores Pinia consistentes y con JSDoc explicando decisiones de diseÃ±o.
- SeparaciÃ³n de dominio (`innfo-core`) sin dependencias de UI.
- Infraestructura de test completa: unit + golden + e2e.

---

## 5. Checklist rÃ¡pido antes de mergear

```
[ ] vue-tsc --noEmit pasa sin errores
[ ] vitest run verde (unit + golden)
[ ] No hay v-html sin sanitizar nuevos
[ ] No hay any nuevos en dominio (innfo-core) ni en fronteras pÃºblicas
[ ] NingÃºn SFC nuevo supera ~300 lÃ­neas sin justificaciÃ³n
[ ] Imports siguen la convenciÃ³n de su capa
[ ] No quedan console.* ni cÃ³digo comentado
[ ] Si toca el modelo, los golden se actualizaron leyendo el diff
```
