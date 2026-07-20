# traNNsform â€” iNNfo Model â†’ HTML Visualizer

**âš ï¸ Si `AGENT.md` no existe en este directorio, usÃ¡ ESTE archivo como entry point.** TenÃ©s que leerlo completo y seguirlo como protocolo. Si un paso referencia a `AGENT.md`, ignorÃ¡ esa referencia â€” este archivo es suficiente.

Instrucciones maestras para el agente. Cuando el usuario pase un modelo iNNfo (`.md`) y pida transformarlo, seguÃ­ este protocolo.

## Estructura del directorio

```
traNNsform/
â”œâ”€â”€ AGENT.md          â† entry point del agente
â”œâ”€â”€ README.md         â† este archivo (protocolo de transformaciÃ³n)
â”œâ”€â”€ input/            â† documentos fuente para import
â”œâ”€â”€ output/           â† visualizadores HTML generados
â”œâ”€â”€ templates/        â† plantillas HTML por tipo de modelo
â””â”€â”€ snippets/         â† patrones Chart.js reusables
```

## Importar documentos

Ver `traNNsform/AGENT.md` â†’ secciÃ³n **Import documents** para el flujo completo.
Pasos resumidos:
1. Colocar los archivos fuente en `traNNsform/input/`
2. El agente los detecta y guÃ­a el proceso de transformaciÃ³n a modelo iNNfo

## Flujo general

1. **LeÃ© el modelo fuente**. IdentificÃ¡ su tipo por `parent_spec.name` en el frontmatter YAML.
2. **BuscÃ¡ el template correspondiente** en `templates/`:
   - Si `parent_spec` contiene `"business"` â†’ `templates/business.md`
   - Si `parent_spec` contiene `"procedures"` â†’ `templates/procedures.md`
   - Si `parent_spec` contiene `"catalog"` â†’ `templates/catalog.md`
   - Si no hay match â†’ `templates/_generic.md`
3. **GenerÃ¡ un HTML** siguiendo el template:
   - UsÃ¡ los mismos patrones de Chart.js de `snippets/chart-patterns.md`
   - UsÃ¡ el mismo diseÃ±o CSS (header gradient con `--primary`, nav tabs sticky, cards, tablas responsive)
   - UsÃ¡ `Chart.js 4.4.7` via CDN
   - NombrÃ¡ el archivo: `<ModelBaseName>_V<version>_<templateName>_visualizer.html` (ej: `Ghostbusters_V0-1-2_business_visualizer.html`)
   - Guardalo en **`traNNsform/output/`** dentro del workspace
   - IncluÃ­ un bloque `<script id="export-meta" type="application/json">` en el `<head>` con `modelName`, `modelVersion`, `templateName`, y `exportedAt`
4. **Reglas estrictas**:
   - NO inventes datos. Solo lo que estÃ¡ en el modelo fuente.
   - Referencias estilo **Sencillo**: `â€” Source: <filename>, section <section-name>`
   - Cada claim â†’ su source reference abajo (tabla, card, etc.)
   - UsÃ¡ el `source-badge` en el header apuntando al filename
   - La fuente usa `_NN` markers y frontmatter YAML

## Post-generaciÃ³n â€” ciclo de feedback

DespuÃ©s de generar el HTML y confirmar al usuario:

1. **PreguntÃ¡**: "Â¿QuerÃ©s modificar algo? (layout, charts, secciones, coloresâ€¦)"
2. **Si el usuario pide cambios**:
   a) AplicÃ¡ las modificaciones al HTML
   b) **PreguntÃ¡**: "Â¿Actualizo la plantilla en `traNNsform/templates/` para que futuras exportaciones incluyan estos cambios?"
   c) **Si acepta**, mostrÃ¡ una lista numerada de los cambios, ej:
      ```
      1. Agregado radar chart a Overview
      2. Cambiada matriz de heatmap a bar chart
      3. Eliminado sidebar de navegaciÃ³n
      ```
      PreguntÃ¡: "Â¿QuÃ© cambios conservo en la plantilla? (ej: 1,2 / all / none)"
   d) AplicÃ¡ los cambios seleccionados al archivo `traNNsform/templates/<template>.md`
   e) RegenerÃ¡ el HTML con la plantilla actualizada
3. ConfirmÃ¡ la ruta final y ofrecÃ© repetir el ciclo si es necesario

## Versionado sugerido

Siempre que edites un modelo iNNfo (conceptos, elementos, matrices), **sugerile al usuario que guarde los cambios como una versiÃ³n incremental**:

> "ConsiderÃ¡ guardar esto como un patch (ej: V_1-0-0 â†’ V_1-0-1) para mantener el historial de versiones. El Export Navigator usa la versiÃ³n para mostrar si los exports estÃ¡n actualizados o desactualizados."

Esto aplica tanto si el usuario edita a travÃ©s del agente como si usa la interfaz de iNNfo.

## Estructura de templates

Cada template en `templates/` define:
- **Detect**: quÃ© `parent_spec` name activa este template
- **Sections**: quÃ© secciones HTML generar y en quÃ© orden
- **Data mapping**: cÃ³mo extraer cada concepto del modelo (`_NN <ConceptName>`) y convertirlo a cards, tablas, charts
- **Charts**: quÃ© grÃ¡ficos incluir con sus configs (tipo Chart.js, labels, datasets)
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

## NavegaciÃ³n y layout

- Nav tabs: sticky top, scroll horizontal en mobile
- Sections: `display: none` / `display: block` con `.active`
- Cards grid: `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`
- Charts row: `grid-template-columns: 1fr 1fr` â†’ `1fr` en mobile
- Tablas: overflow-x:auto en wrapper para scroll horizontal
- Metrics: `grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))`

## Assets

Si el modelo referencia assets (campo `asset:` en YAML de un elemento), el HTML debe incluir un link al archivo. La ruta es relativa al modelo:

```html
<a href="../assets/persona-juan-perez.pdf" target="_blank" class="asset-link">
  ðŸ“„ View Persona Sheet (PDF)
</a>
```

Los assets estÃ¡n en `assets/` junto al modelo.
