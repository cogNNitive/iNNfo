# Sandbox â€” Regreso al Futuro

Workspace iNNfo V_0-2-0 para probar la aplicaciÃ³n iNNfo.

## Contenido

| Archivo | Tipo | DescripciÃ³n |
|---------|------|-------------|
| `HillValleyTimeTravel_V_1-0-0_business_NN.md` | FILE | Modelo de negocio con stakeholders, problemas, matrices grandes (16Ã—10) |
| `TimeTravelProtocol_V_1-0-0_procedures_NN.md` | FILE | Procedimiento operativo con pasos, roles, herramientas, matrices |
| `BackToTheFuture_V_1-0-0_kb/` | FOLDER | Knowledge Base con entidades con colorHex, taxonomÃ­a, graph_edges |
| `workspace-regreso-al-futuro/` | WORKSPACE | Carpeta completa para abrir con File System Access API |

## CÃ³mo cargar

### OpciÃ³n 1: Abrir carpeta local (recomendado)

```bash
npm --prefix apps/innfo-editor run dev
# â†’ http://localhost:5173
# â†’ "Open Local Folder" â†’ seleccionar sandbox/
```

**QuÃ© abre**: `sandbox/index.md` con wikilinks a los modelos FILE-mode y al KB folder. El workspace `workspace-regreso-al-futuro/` se abre por separado (OpciÃ³n 3).

### OpciÃ³n 2: Cargar modelo individual por URL

```bash
# Desde el root del repo:
python -m http.server 8000
# En la app: "Load from URL" â†’
#   http://localhost:8000/sandbox/HillValleyTimeTravel_V_1-0-0_business_NN.md
#   http://localhost:8000/sandbox/TimeTravelProtocol_V_1-0-0_procedures_NN.md
```

### OpciÃ³n 3: Cargar workspace o KB folder

```bash
# "Open Local Folder" â†’ sandbox/workspace-regreso-al-futuro/
# "Open Local Folder" â†’ sandbox/BackToTheFuture_V_1-0-0_kb/
```

## Testing Guide â€” Feature por Feature

---

### 1. ðŸŽ¨ Tree Navigation â€” Colored Pills (BlockPill)

**QuÃ© probar**: Pills con color de fondo, texto con contraste YIQ, contadores
de instancias, popups de informaciÃ³n, estados ghost.

**Datos de prueba**:
| Entidad | colorHex | Perspectiva | Props |
|---------|----------|-------------|-------|
| DeLorean | `#059669` | Vehicles | Verde esmeralda, texto blanco (YIQ pasa) |
| Flux Capacitor | `#D97706` | Devices | Ãmbar, texto blanco |
| Hoverboard | `#059669` | Vehicles | Mismo color que DeLorean (misma perspectiva) |
| Doc Brown | `#0891B2` | Protagonists | Cyan, texto blanco |
| Marty McFly | `#0891B2` | Protagonists | Mismo color que Doc (misma perspectiva) |

**CÃ³mo probar**:
1. Cargar `BackToTheFuture_V_1-0-0_kb/` como carpeta
2. En el tree panel (sidebar izquierdo): cada entidad muestra un pill
   con su `colorHex` de fondo y texto blanco/negro segÃºn YIQ
3. Hover sobre un pill â†’ muestra popup con info de la entidad
4. Entidades sin contenido â†’ ghost state (opacidad reducida, itÃ¡lica "Empty")

---

### 2. ðŸ“‹ Sheet Content â€” BlockSheet 4 Tabs

**QuÃ© probar**: Los 4 tabs del BlockSheet (View / Visual / History / Compliance),
Markdown rendering, inline graph, relaciones, media, field viewer, compliance.

**CÃ³mo probar** (en cualquier entidad del KB):
1. Click en una entidad del tree â†’ se abre BlockSheet en el panel derecho
2. **Tab View**: contenido Markdown de la entidad renderizado
3. **Tab Visual**: inline GraphViewer (320px) mostrando conexiones
4. **Tab History**: (placeholder para futura implementaciÃ³n)
5. **Tab Compliance**: reporte de validaciÃ³n scoped al tipo de concepto

**Datos de prueba especÃ­ficos**:
- DeLorean: tiene bloque de cÃ³digo TypeScript + diagrama Mermaid â†’ probar CodeWidget y MermaidWidget
- Flux Capacitor: tiene diagrama Mermaid flowchart â†’ probar MermaidWidget
- Marty McFly: tiene tabla de habilidades + timeline Mermaid
- Doc Brown: tiene tabla de citas famosas

---

### 3. ðŸ§© Widget Registry â€” 14 Widgets

**QuÃ© probar**: Cada uno de los 14 widgets implementados se renderiza
correctamente segÃºn el tipo de field.

**Mapa field â†’ Widget**:

| Widget | Field a probar | DÃ³nde verlo |
|--------|---------------|-------------|
| **DateWidget** | `build_date: "1981-01-01"` | DeLorean fields |
| **UrlWidget** | `website: "https://bttf.fandom.com/..."` | Todas las entidades |
| **ColorWidget** | `color: "#C0C0C0"` | DeLorean / Hoverboard fields |
| **MultiSelectWidget** | `tags: ["time-machine", "dmc-12", ...]` | Todas las entidades |
| **TagsWidget** | `tags` (mismo campo, edit mode) | Cambiar a edit mode en FieldViewer |
| **RatingWidget** | `rating: 5` / `rating: 3` | DeLorean (5) / Hoverboard (3) |
| **ScaleWidget** | `hoverboard_skill: 9` / `times_traveled: 5` | Marty fields |
| **ToggleGroupWidget** | `fuel_type: "gasoline + mr_fusion"` | DeLorean fields |
| **CycleWidget** | `status: "published"` | DeLorean / FluxCapacitor fields |
| **CodeWidget** | Bloque \`\`\`typescript en body | DeLorean body |
| **MermaidWidget** | Bloque \`\`\`mermaid en body | DeLorean / FluxCapacitor / Marty body |
| **DiagramWidget** | Diagramas DSL | (crear concepto con diagrama simple) |
| **TimestampWidget** | `invention_date: "1955-11-05"` | FluxCapacitor / Hoverboard fields |
| **MarkdownWidget** | Cuerpo del contenido con **negritas**, > citas, tablas | Todas las entidades |
| **FallbackWidget** | Cualquier field sin registro especÃ­fico | `inventions_count: 47` en Doc Brown |

**CÃ³mo probar**:
1. Abrir cualquier entidad del KB en BlockSheet
2. En **Tab View**, los fields aparecen en FieldViewer con su widget correspondiente
3. Click "Edit" â†’ los widgets cambian a edit mode (inputs, selects, etc.)
4. Modificar un valor â†’ verificar que emite `update:modelValue`

---

### 4. ðŸ”„ Matrix Virtual Scrolling

**QuÃ© probar**: Scrolling virtual en matrices grandes (10k+ celdas).

**Datos de prueba**: `HillValleyTimeTravel_V_1-0-0_business_NN.md`
contiene una matriz **Stakeholder Ã— Service** de 16 filas Ã— 10 columnas
(160 celdas con 9 valores distintos: Accountable, Responsible, Consulted,
Informed, Min, Max, Neutral, Low, High).

**CÃ³mo probar**:
1. Cargar el modelo business
2. Navegar a la secciÃ³n de matrices (al final del documento)
3. La matriz "Stakeholder Ã— Service Impact" se renderiza con scroll virtual
4. **Probar scroll vertical** â†’ solo se renderizan las filas visibles
5. **Probar scroll horizontal** â†’ solo se renderizan las columnas visibles
6. **Verificar scroll persistence** â†’ scroll hacia abajo, cambiar de secciÃ³n,
   volver â†’ la posiciÃ³n se restaura
7. **Editar celda** â†’ click en una celda, cambiar valor, verificar que persiste

---

### 5. ðŸ“ File System Operations

**QuÃ© probar**: Directory Picker, URL loading, auto-backup.

**CÃ³mo probar**:
1. **Directory Picker**: BotÃ³n "Open Local Folder" â†’ seleccionar
   `sandbox/workspace-regreso-al-futuro/` â†’ se carga el workspace completo
2. **URL Loading**: BotÃ³n "Load from URL" â†’ pegar URL de un modelo â†’
   se parsea y carga correctamente
3. **Auto-backup**: Con backup activado, editar y guardar â†’ verificar que
   aparece un backup en `backups/` dentro de la carpeta del modelo

**Datos de prueba del workspace**:
- `workspace-regreso-al-futuro/personajes/` â†’ 4 personajes
- `workspace-regreso-al-futuro/vehiculos/` â†’ 2 vehÃ­culos con componentes
- `workspace-regreso-al-futuro/misiones/` â†’ 3 misiones
- `workspace-regreso-al-futuro/linea-temporal/` â†’ 4 lÃ­neas temporales + alternativas
- `workspace-regreso-al-futuro/artefactos/` â†’ artefactos

---

### 6. ðŸ·ï¸ Taxonomy Perspectives

**QuÃ© probar**: Panel de perspectiva de taxonomÃ­a con Parents/Children/Siblings,
navegaciÃ³n por clicks.

**Datos de prueba** (en KB root `_NN.md` frontmatter):

```yaml
taxonomy:
  roots:
    - concept: "Technology"      # colorHex: "#2563EB"
      children:
        - concept: "Vehicles"    # colorHex: "#059669"
        - concept: "Devices"     # colorHex: "#D97706"
        - concept: "Energy"      # colorHex: "#DC2626"
    - concept: "People"
      children:
        - concept: "Protagonists" # colorHex: "#0891B2"
        - concept: "Antagonists"  # colorHex: "#BE123C"
  community:
    label: "Back to the Future Universe"
    colorHex: "#4F46E5"
```

**Asignaciones por entidad**:

| Entidad | Perspectiva |
|---------|-------------|
| DeLorean | Vehicles |
| FluxCapacitor | Devices |
| Hoverboard | Devices |
| DocBrown | Protagonists |
| MartyMcFly | Protagonists |

**CÃ³mo probar**:
1. Abrir KB folder
2. Seleccionar "DeLorean" â†’ Panel de Perspectiva muestra:
   - **Parents**: Technology
   - **Children**: (ninguno)
   - **Siblings**: Hoverboard (mismo nivel en Technology?)
3. Click en un pill de perspectiva â†’ se navega a esa entidad
4. Vista vacÃ­a: Biff Tannen no estÃ¡ en ninguna perspectiva â†’ mensaje vacÃ­o

---

### 7. ðŸ’¾ Session Persistence

**QuÃ© probar**: IndexedDB guarda/restaura sesiÃ³n, tree state, sidebar widths.

**CÃ³mo probar**:
1. Abrir un modelo, expandir algunos nodos del tree, ajustar anchos de sidebar
2. **Recargar la pÃ¡gina** (F5)
3. Verificar que:
   - El Ãºltimo archivo abierto se restaura
   - Los nodos expandidos siguen expandidos
   - Los anchos de sidebar persisten

---

### 8. ðŸ”– Version Management

**QuÃ© probar**: Panel de versiones con bumps major/minor/patch.

**Datos de prueba**: Todos los modelos tienen `model_version: "V_1-0-0"`.

**CÃ³mo probar**:
1. Abrir cualquier modelo
2. En ModelInfoPanel (panel derecho, secciÃ³n info), expandir **Version Management**
3. Ver el version actual: `V_1-0-0`
4. Click **Major** â†’ preview muestra `V_2-0-0`
5. Click **Minor** â†’ preview muestra `V_1-1-0`
6. Click **Patch** â†’ preview muestra `V_1-0-1`
7. Guardar â†’ el archivo se guarda con el nuevo version en frontmatter
8. Botones disabled cuando no hay cambios pendientes

---

### 9. ðŸ“Š Matrices (BlockMatrixSummary)

**QuÃ© probar**: Resumen de participaciÃ³n en matrices con chips coloreados.

**Datos de prueba**: Ambos modelos tienen mÃºltiples matrices:
- HillValleyTimeTravel: problems-value propositions (4Ã—3) + stakeholder-service (16Ã—10)
- TimeTravelProtocol: work-roles (10Ã—4), positions-roles (3Ã—4), persons-positions (3Ã—2),
  work-tools (10Ã—5), work-artifacts (6Ã—4)

**CÃ³mo probar**:
1. Abrir HillValleyTimeTravel
2. Navegar a una secciÃ³n que participa en matrices (ej: Problems)
3. BlockMatrixSummary muestra chips con colores acento por concepto
4. Cada chip muestra el count de celdas no-vacÃ­as

---

### 10. ðŸ”— BlockRelationships

**QuÃ© probar**: Chips de relaciones clickables entre entidades.

**Datos de prueba**: Las entidades del KB tienen `graph_edges`:
- DeLorean â†’ DocBrown ("built-by"), FluxCapacitor ("core-component"), Marty ("driven-by")
- FluxCapacitor â†’ DocBrown ("invented-by"), DeLorean ("installed-in")
- DocBrown â†’ Marty ("mentor"), DeLorean ("created"), FluxCapacitor ("invented")
- Marty â†’ DocBrown ("student-mentor"), DeLorean ("drives"), Hoverboard ("uses")
- Hoverboard â†’ Marty ("used-by")

**CÃ³mo probar**:
1. Abrir DeLorean en el KB
2. BlockSheet â†’ View tab â†’ secciÃ³n Relationships
3. Ver chips: "DocBrown" (built-by), "FluxCapacitor" (core-component), "MartyMcFly" (driven-by)
4. Click en un chip â†’ navega a esa entidad

---

### 11. ðŸ–¼ï¸ NodeMedia

**QuÃ© probar**: GalerÃ­a de imÃ¡genes y descarga de archivos.

**CÃ³mo probar**:
1. Abrir una entidad con media attachments (si se configuran)
2. Ver galerÃ­a en grilla de 2-3 columnas
3. Click en imagen â†’ lightbox overlay
4. Archivos no-imagen â†’ lista de descarga con iconos por tipo

---

### Resumen RÃ¡pido

| # | Feature | DÃ³nde probarlo | Dato clave |
|---|---------|---------------|------------|
| 1 | Colored pills | Tree sidebar | colorHex en entidades KB |
| 2 | BlockSheet 4 tabs | Click entidad KB | Tab View/Visual/History/Compliance |
| 3 | Widgets (14 tipos) | FieldViewer en entidad | fields con tipos variados |
| 4 | Virtual scrolling | Matriz stakeholder-service (16Ã—10) | 160 celdas |
| 5 | File System | Open Local Folder | workspace-regreso-al-futuro/ |
| 6 | Taxonomy | Perspectiva en KB | taxonomy en KB root |
| 7 | Session | F5 reload | Persiste tree + sidebar |
| 8 | Version | ModelInfoPanel | Bump major/minor/patch |
| 9 | MatrixSummary | SecciÃ³n con matrices | Chips con count |
| 10 | Relationships | Entidad con graph_edges | NavegaciÃ³n click |
| 11 | NodeMedia | Entidad con attachments | Lightbox + descarga |
