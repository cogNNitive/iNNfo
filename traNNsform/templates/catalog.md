# Catalog Visualizer Template

**Detect**: `parent_spec.name` contiene `"catalog"`

**Source**: Carpeta FOLDER mode con subcarpetas de elementos

## Estrategia especial

El modelo catalog es **FOLDER mode** — cada elemento es una subcarpeta con su `_NN.md`. No hay un solo archivo Markdown con `_NN` bullets. Hay que:

1. Escanear las subcarpetas de conceptos (Artist/, Album/, Genre/, Instrument/, etc.)
2. Leer cada `_NN.md` dentro de cada subcarpeta de elemento
3. Extraer `type`, `fields`, `markers`, `graph_edges`

## Sections

| # | Tab name | Source concepts | Content type |
|---|----------|----------------|--------------|
| 1 | Overview | All elements | Metrics bar + doughnut (elements per concept) + bar (top weights) |
| 2 | Artists | `Artist/` folders | Cards con bio, genre, country, members |
| 3 | Albums | `Album/` folders | Cards con artist, year, label, highlights |
| 4 | Genres | `Genre/` folders | Cards con era, description |
| 5 | Graph | All `graph_edges` | Visual graph or table of relationships |

## Data mapping

### Artist cards
```
fields.genre, fields.country, fields.members → tags/badges
fields.bio → card body
markers.weight → prominence indicator
graph_edges → link badges
```

### Album cards
```
fields.artist, fields.release_year → tags
fields.label → tag
fields.highlights → card body
```

## Charts

### Doughnut — Elements per concept type
Count of elements grouped by `type`

### Bar — Top elements by weight
Horizontal bar with elements sorted by markers.weight

### Relationship table
From graph_edges: source → target → label

## Metadata block

Incluí este bloque en el `<head>` del HTML generado:

```html
<script id="export-meta" type="application/json">
{
  "modelName": "<ModelBaseName>",
  "modelVersion": "V_<version>",
  "templateName": "catalog",
  "exportedAt": "<ISO-8601 timestamp>"
}
</script>
```
