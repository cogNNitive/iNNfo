# Business Model Visualizer Template

**Detect**: `parent_spec.name` contiene `"business"`

**Source example**: `Ghostbusters_V_0-1-2_business_NN.md`

## Sections

| # | Tab name | Source concepts | Content type |
|---|----------|----------------|--------------|
| 1 | Overview | All concepts | Metrics bar + radar chart (problems avg) + bar chart (weight×certainty) |
| 2 | Stakeholders | `Stakeholders` | Table (Stakeholder, Role, Details) |
| 3 | Market | `Segments`, `Profiles`, `Problems` | 3 tables with sub-headings |
| 4 | Value & Competition | `Value propositions`, `Competition` | Cards (value props) + table (competition) |
| 5 | Products & Services | `Products and services` | Cards |
| 6 | Risks & Assumptions | `Risks`, `Assumptions` | Table (risks) + styled list (assumptions) |
| 7 | Matrices | `_NN matrices:` | Matrix heatmap table + grouped bar chart + doughnut |

## Data mapping

### Stakeholders
```
`_NN Stakeholders:` → Table columns: Stakeholder, Role, Details
  - Title (before colon) → Stakeholder
  - Description → Details
  - Extract role from description context
```

### Segments, Profiles, Problems
```
`_NN Segments:`, `_NN Profiles:`, `_NN Problems:` → Tables
  - Element name → first col
  - Description → second col
```

### Value propositions
```
`_NN Value propositions:` → Cards
  - Card title = element name
  - Card body = description
```

### Products and services
```
`_NN Products and services:` → Cards
  - Same pattern as value propositions
```

### Competition
```
`_NN Competition:` → Table
  - Competitor name → first col
  - Description → second col
```

### Risks
```
`_NN Risks:` → Table
  - Risk name → first col
  - Description → second col
```

### Assumptions
```
`_NN Assumptions:` → Styled list with left border accent
  - Each bullet = one assumption
```

### Matrices
```
`_NN matrices: problems-value propositions matrix` → Matrix table
  - Color code cells: Max=#2d6a4f, VeryHigh=#40916c, High=#52b788, SlightlyHigh=#95d5b2, Neutral=#e9ecef, SlightlyLow=#ffd6a5, Low=#ffb4a2

`_NN matrices: item-markers matrix` → Table
  - Color code weight column: 10=#e63946, 9=#e76f51, 8=#f4a261, 7=#e9c46a, 6=#8ab17d
  - Chart: bar chart with weight and certainty as two datasets
```

## Charts

### Radar — Problems vs Value Propositions alignment
Mapping: Max=7, VeryHigh=6, High=5, SlightlyHigh=4, Neutral=3, SlightlyLow=2, Low=1

### Bar — Item weight & certainty
Grouped bar with weights and certainties per item

### Grouped bar — Problems × Value Propositions
One bar group per problem, one dataset per value proposition

### Doughnut — Coverage per problem
Summed alignment score per problem across all value propositions

## Metadata block

Incluí este bloque en el `<head>` del HTML generado:

```html
<script id="export-meta" type="application/json">
{
  "modelName": "<ModelBaseName>",
  "modelVersion": "V_<version>",
  "templateName": "business",
  "exportedAt": "<ISO-8601 timestamp>"
}
</script>
```
