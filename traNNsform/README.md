# traNNsform — iNNfo Model → HTML Visualizer

**⚠️ Si `AGENT.md` no existe en este directorio, usá ESTE archivo como entry point.** Tenés que leerlo completo y seguirlo como protocolo. Si un paso referencia a `AGENT.md`, ignorá esa referencia — este archivo es suficiente.

Instrucciones maestras para el agente. Cuando el usuario pase un modelo iNNfo (`.md`) y pida transformarlo, seguí este protocolo.

## Flujo general

1. **Leé el modelo fuente**. Identificá su tipo por `parent_spec.name` en el frontmatter YAML.
2. **Buscá el template correspondiente** en `templates/`:
   - Si `parent_spec` contiene `"business"` → `templates/business.md`
   - Si `parent_spec` contiene `"procedures"` → `templates/procedures.md`
   - Si `parent_spec` contiene `"catalog"` → `templates/catalog.md`
   - Si no hay match → `templates/_generic.md`
3. **Generá un HTML** siguiendo el template:
   - Usá los mismos patrones de Chart.js de `snippets/chart-patterns.md`
   - Usá el mismo diseño CSS (header gradient con `--primary`, nav tabs sticky, cards, tablas responsive)
   - Usá `Chart.js 4.4.7` via CDN
   - Nombrá el archivo: `<ModelBaseName>_V<version>_<templateName>_visualizer.html` (ej: `Ghostbusters_V0-1-2_business_visualizer.html`)
   - Guardalo en **`traNNsform/outputs/`** dentro del workspace
   - Incluí un bloque `<script id="export-meta" type="application/json">` en el `<head>` con `modelName`, `modelVersion`, `templateName`, y `exportedAt`
4. **Reglas estrictas**:
   - NO inventes datos. Solo lo que está en el modelo fuente.
   - Referencias estilo **Sencillo**: `— Source: <filename>, section <section-name>`
   - Cada claim → su source reference abajo (tabla, card, etc.)
   - Usá el `source-badge` en el header apuntando al filename
   - La fuente usa `_NN` markers y frontmatter YAML

## Post-generación — ciclo de feedback

Después de generar el HTML y confirmar al usuario:

1. **Preguntá**: "¿Querés modificar algo? (layout, charts, secciones, colores…)"
2. **Si el usuario pide cambios**:
   a) Aplicá las modificaciones al HTML
   b) **Preguntá**: "¿Actualizo la plantilla en `traNNsform/templates/` para que futuras exportaciones incluyan estos cambios?"
   c) **Si acepta**, mostrá una lista numerada de los cambios, ej:
      ```
      1. Agregado radar chart a Overview
      2. Cambiada matriz de heatmap a bar chart
      3. Eliminado sidebar de navegación
      ```
      Preguntá: "¿Qué cambios conservo en la plantilla? (ej: 1,2 / all / none)"
   d) Aplicá los cambios seleccionados al archivo `traNNsform/templates/<template>.md`
   e) Regenerá el HTML con la plantilla actualizada
3. Confirmá la ruta final y ofrecé repetir el ciclo si es necesario

## Versionado sugerido

Siempre que edites un modelo iNNfo (conceptos, elementos, matrices), **sugerile al usuario que guarde los cambios como una versión incremental**:

> "Considerá guardar esto como un patch (ej: V_1-0-0 → V_1-0-1) para mantener el historial de versiones. El Export Navigator usa la versión para mostrar si los exports están actualizados o desactualizados."

Esto aplica tanto si el usuario edita a través del agente como si usa la interfaz de cogNNitive.

## Estructura de templates

Cada template en `templates/` define:
- **Detect**: qué `parent_spec` name activa este template
- **Sections**: qué secciones HTML generar y en qué orden
- **Data mapping**: cómo extraer cada concepto del modelo (`_NN <ConceptName>`) y convertirlo a cards, tablas, charts
- **Charts**: qué gráficos incluir con sus configs (tipo Chart.js, labels, datasets)
- **Special**: manejo especial de matrices (`_NN matrices:`)

## Plantilla base HTML

Siempre usar esta estructura:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Chart.js CDN -->
  <!-- CSS: header, nav-tabs, .section, .card-grid, .card, table, .metrics, .charts-row, .flowchart-wrapper, .matrix-table -->
</head>
<body>
  <header class="header"><!-- con source-badge --></header>
  <nav class="nav-tabs" id="navTabs"><!-- tabs --></nav>
  <div class="container">
    <!-- sections con data del modelo -->
  </div>
  <footer class="footer"><!-- attribution --></footer>
  <script>
    // Tab navigation
    // Flowchart canvas (si aplica)
    // Chart.js instances
  </script>
</body>
</html>
```

## Navegación y layout

- Nav tabs: sticky top, scroll horizontal en mobile
- Sections: `display: none` / `display: block` con `.active`
- Cards grid: `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`
- Charts row: `grid-template-columns: 1fr 1fr` → `1fr` en mobile
- Tablas: overflow-x:auto en wrapper para scroll horizontal
- Metrics: `grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))`

## Assets

Si el modelo referencia assets (campo `asset:` en YAML de un elemento), el HTML debe incluir un link al archivo. La ruta es relativa al modelo:

```html
<a href="../assets/persona-juan-perez.pdf" target="_blank" class="asset-link">
  📄 View Persona Sheet (PDF)
</a>
```

Los assets están en `assets/` junto al modelo.
