# Handoff â€” ConversaciÃ³n 2026-07-02

> Fichero de handoff para continuar esta conversaciÃ³n en una sesiÃ³n nueva.
> Guardado por el orquestador `gentle-orchestrator` en iNNfo.

---

## Resumen

ConversaciÃ³n sobre la unificaciÃ³n de los modos FILE y FOLDER en FORMAT.
El usuario propuso y refinÃ³ una visiÃ³n donde **no hay dos modos distintos**,
sino un Ãºnico modelo que puede representarse fÃ­sicamente de dos formas:
todo en un archivo (FILE clÃ¡sico) o distribuido en archivos individuales
con un root `index.md` que actÃºa como Ã­ndice.

---

## Decisiones clave

### 1. FILE y FOLDER convergen en un solo modelo

| Antes | DespuÃ©s |
|---|---|
| FILE mode y FOLDER mode como modos separados | Un solo modelo. Dos representaciones fÃ­sicas. |
| La estructura de carpetas definÃ­a jerarquÃ­a | La jerarquÃ­a viene del `index.md` (root `_FORMAT.md`). |
| Conceptos como carpetas sin `_FORMAT.md` | No hay nodos "concept" estructurales. Solo existe lo que estÃ¡ en el Ã­ndice. |

### 2. El root `_FORMAT.md` (o `index.md`) es el source of truth

Contiene:
- Frontmatter con metadatos del modelo (`parent`, `model_version`, etc.)
- `# _F index` con wikilinks `[[Name]]` para la taxonomÃ­a (nombres Ãºnicos en el workspace)
- Secciones de concepto `# _F ConceptName` con elementos `* _F Concept: Name`
- Cada elemento PUEDE tener un pointer `â†’ [file](./path/_FORMAT.md)` a su archivo individual
- Los YAML blocks con fields pueden estar inline (en el root) o en el archivo individual
- El orden de los elementos en el root define el orden semÃ¡ntico

### 3. Nombres Ãºnicos en todo el workspace (como Wikipedia)

- No puede haber dos elementos con el mismo nombre en el workspace
- Si hay colisiÃ³n â†’ la aplicaciÃ³n pide desambiguar
- graph_edges usan nombres directos: `target: "Queen"` (no rutas relativas)
- Esto elimina la necesidad de qualified IDs compuestos (`Artist/Queen`)

### 4. Templates opcionales

- Un modelo nivel 3 PUEDE incluir `concepts:` en su frontmatter para autodefinir su metamodelo
- Los templates (nivel 2) son solo para reuso, no obligatorios

### 5. Assets como fields, no como concepto separado

- Un field de tipo `file`/`image`/`video` referencia un path relativo
- El elemento se organiza en carpeta si tiene assets, o puede estar inline si no
- La UI muestra previsualizaciÃ³n segÃºn el tipo (thumbnail para imÃ¡genes, link para PDFs, etc.)
- Coincide con el modelo de OKF: assets son markdown links desde el contenido

### 6. UI: mismos widgets para ambos modos

- `BlockSheet.vue` para ediciÃ³n individual de un elemento (fields, markers, descripciÃ³n)
- Tabla por concepto (por implementar): elementos como filas, fields como columnas
- `WidgetField` â†’ `FieldString`, `FieldSelect`, `FieldNumber`, etc. ya funcionan contra `modelStore`
- No necesitan saber el modo de almacenamiento â€” el store normaliza todo a `ModelNode`

### 7. OKF compliance

- Cambiar sufijo `_FORMAT.md` por `.md` NO es necesario â€” `_FORMAT.md` SÃ es un `.md` vÃ¡lido
- Adoptar `index.md` como root acercarÃ­a aÃºn mÃ¡s a OKF
- Los requerimientos OKF (frontmatter con `type`, index.md opcional, links markdown) son compatibles
- Workspace compliant con ajustes mÃ­nimos

---

## Fixtures creados

---

## Preguntas abiertas para la siguiente sesiÃ³n

1. **Tabla por concepto**: Â¿cÃ³mo implementar la vista tabla que muestre todos los elementos de un concepto como filas y fields como columnas? DeberÃ­a reutilizar `WidgetField` y el mismo mecanismo que las matrices del Folder-Format original.

2. **ConvenciÃ³n de naming para el modelo distribuido**: Â¿cÃ³mo resuelve el parser el archivo individual de un elemento? Por convenciÃ³n de nombre (`<name>/_FORMAT.md`, `<name>._FORMAT.md`) o por declaraciÃ³n explÃ­cita en el root (`â†’ [link](./path/_FORMAT.md)`).

3. **Nombres Ãºnicos**: Â¿cÃ³mo implementar la detecciÃ³n de colisiones en el workspace? Â¿DesambiguaciÃ³n automÃ¡tica (sufijo numÃ©rico) o preguntar al usuario?

4. **Mapeo fieldâ†’asset**: Â¿cÃ³mo convertir un field de tipo `file` que tiene valor `"photo.jpg"` en un asset navegable con previsualizaciÃ³n? Â¿El field type se declara en el concepto del template?

5. **Compatibilidad con modelos existentes**: Â¿los modelos FOLDER actuales (folder-model, Music_History) se migran automÃ¡ticamente o se mantienen con el parser legacy?

---

## CÃ³digo relevante

| Archivo | PropÃ³sito |
|---|---|
| `packages/format-core/src/parser.ts` | Parseo de FILE mode (parseModel) |
| `packages/format-core/src/recursiveParser.ts` | Parseo recursivo con drivers |
| `packages/format-core/src/driver-folder.ts` | Driver FOLDER (listChildren, listAssets) |
| `packages/format-core/src/driver-file.ts` | Driver FILE (lectura de un archivo) |
| `packages/format-core/src/types.ts` | Tipos: ModelNode, ElementNode, etc. |
| `packages/format-core/src/identity.ts` | IdentityRegistry (colisiones, qualified IDs) |
| `packages/format-core/src/metamodel.ts` | ResoluciÃ³n de metamodelo efectivo |
| `apps/format-editor/src/components/editor/BlockSheet.vue` | Editor individual de elemento |
| `apps/format-editor/src/components/editor/TreeEditor.vue` | Editor Ã¡rbol (selecciÃ³n â†’ detalle) |
| `apps/format-editor/src/components/editor/BlockFeed.vue` | Feed de bloques por concepto |
| `apps/format-editor/src/shared/widgets/WidgetField.vue` | Widget genÃ©rico de field |
| `apps/format-editor/src/stores/modelStore.ts` | Store central de nodos |

---

## Prompt para continuar

```
ContinÃºa la conversaciÃ³n sobre la unificaciÃ³n de FILE y FOLDER mode en FORMAT.
Los puntos clave acordados hasta ahora:

1. FILE y FOLDER convergen en un solo modelo. La diferencia es solo fÃ­sica:
   todo en un archivo vs distribuido con root index.md (o _FORMAT.md).
2. El root contiene el Ã­ndice (wikilinks [[Name]]), las secciones de concepto
   con elementos, y cada elemento puede tener un pointer a su archivo individual.
3. Los nombres de elemento son Ãºnicos en todo el workspace (como Wikipedia).
4. Templates son opcionales â€” un modelo puede definir concepts en frontmatter.
5. Assets son fields de tipo file/image/video que referencian paths relativos.
6. Los widgets de ediciÃ³n (WidgetField, BlockSheet) ya funcionan para ambos
   modos porque trabajan contra modelStore que es agnÃ³stico.
7. OKF compliance es viable con ajustes mÃ­nimos.

Los fixtures estÃ¡n en:

Temas pendientes para trabajar:
A. Implementar la vista tabla por concepto (elementos como filas, fields como
   columnas) reutilizando los widgets existentes.
B. Definir la convenciÃ³n de resoluciÃ³n de archivos individuales (por nombre
   vs declaraciÃ³n explÃ­cita).
C. DiseÃ±ar el mapeo fieldâ†’asset para previsualizaciÃ³n en tabla.
D. Revisar el parser actual (recursiveParser.ts) para que en lugar de escanear
   el FS, lea el root index.md y resuelva los elementos desde ahÃ­.
```

---

## Memoria persistente (Engram)

Las siguientes observaciones estÃ¡n guardadas en Engram para recuperaciÃ³n
en futuras sesiones:

- `decision/file-y-folder-convergen-modelo-nico-distribuido-con-index-md`
- `architecture/assets-como-fields-dentro-del-modelo-okf-style`
- `architecture/ui-blocksheet-para-elemento-individual-tabla-para-concepto-completo`

Para recuperarlas: `mem_search(query: "FILE FOLDER convergen", project: "iNNfo")`
