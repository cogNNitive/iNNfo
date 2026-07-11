# Generic Visualizer Template (Fallback)

**Detect**: Ningún otro template matcheó. Usar para cualquier modelo iNNfo no reconocido.

## Estrategia

1. **Leé el frontmatter** para obtener metadata (title, model_version, parent_spec, level)
2. **Escaneá el body** en busca de:
   - `# _NN index` → estructura de taxonomía (ignorar, no se renderiza directamente)
   - `# _NN <ConceptName>` → bloques de concepto
   - `# _NN matrices:` → matrices
3. **Identificá el tipo de cada concepto**:
   - Si tiene subtítulos con elementos (`* _NN <Concept>: Value`) → es multi-instancia → Cards o tabla
   - Si es texto plano sin bullets → es text-type → párrafo en Overview
4. **Generá secciones en este orden**:

| # | Tab name | Source | Content |
|---|----------|--------|---------|
| 1 | Overview | Frontmatter + resumen | Metrics bar + primer concepto text-type como summary |
| 2 | [Conceptos list/weight] | Conceptos multi-instancia | Cards grid |
| 3 | Matrices | `_NN matrices:` | Tablas con colores |

## Reglas generales

- Cada concepto multi-instancia (`_NN <Name>:`) se convierte en una sección de cards o tabla
- Usá cards cuando la descripción es larga, tabla cuando es corta y estructurada
- Las matrices se renderizan como tablas con color coding: si tienen valores ordinales (Max, High, etc.), aplicar colores como en business template
- Si detectás un concepto de tipo `sequence` o `steps`, renderizalo como timeline vertical numerado

## Charts (genéricos)

- Si hay una matriz item-markers → bar chart con weight y certainty
- Si hay matrices evaluables → grouped bar chart
- Si hay 3+ conceptos multi-instancia → doughnut de counts
- Si hay un concepto tipo sequence/steps → no charts, solo timeline

## Fallback

Si no se puede determinar estructura, generar:
- Header con metadata
- Tabla de contenidos con links a cada `# _NN` heading
- Cada sección raw como preformateado

## Metadata block

Incluí este bloque en el `<head>` del HTML generado:

```html
<script id="export-meta" type="application/json">
{
  "modelName": "<ModelBaseName>",
  "modelVersion": "V_<version>",
  "templateName": "generic",
  "exportedAt": "<ISO-8601 timestamp>"
}
</script>
```
