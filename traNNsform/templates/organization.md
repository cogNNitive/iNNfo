# Organization Visualizer Template

**Detect**: `parent_spec.name` contiene `"organization"`

**Source example**: `EngineeringTeam_V_1-0-0_organization_NN.md`

## Sections

| # | Tab name | Source concepts | Content type |
|---|----------|----------------|--------------|
| 1 | Overview | `Organization`, `Roles`, `Position`, `Person`, matrices | Metrics bar + org chart canvas + doughnut (people per position) + bar (roles per position) |
| 2 | Roles | `Roles` | Cards with scope tag |
| 3 | Positions | `Position` | Cards, each linked to its assumed roles |
| 4 | People | `Person` | Cards, each linked to its occupied position |
| 5 | Matrices | `positions-roles matrix`, `persons-positions matrix` | Assignment tables with colors + heatmap bar |

## Data mapping

### Organization
```
`_NN Organization:` (or the `# _NN Organization` body) → header/summary block
  - Description text → org mission/summary line under the title
```

### Roles
```
`_NN Roles:` → Cards with left border accent per role
  Fields from YAML:
  - scope: "internal" | "external" → tag badge color
  Description text → card body
```

### Position
```
`_NN Position:` → Cards
  - Element name → card title
  - Description → card body
  - Cross-reference `positions-roles matrix` to list assumed roles as badges
```

### Person
```
`_NN Person:` → Cards
  - Element name → card title
  - Description → card body
  - Cross-reference `persons-positions matrix` to show occupied position as a badge
```

### Positions–Roles matrix
```
`_NN matrices: positions-roles matrix` → Assignment table
  Color code cells:
  - Assumes=#2d6a4f (green)
  - "-"=italic gray
```

### Persons–Positions matrix
```
`_NN matrices: persons-positions matrix` → Assignment table
  Color code cells:
  - Occupies=#1d3557 (navy)
  - "-"=italic gray
```

## Charts

### Org chart canvas
Draw the reporting structure on canvas from the two matrices:
- Position boxes (blue rounded rect), Person chips (gray) attached to their occupied position
- Group positions by the roles they assume (Tech Lead on top, Developers/QA below)
- Connect positions to people with lines

### Doughnut — People per position
Count of persons occupying each position (from `persons-positions matrix`)

### Bar — Roles per position
One group per position, count of assumed roles (from `positions-roles matrix`)

### Heatmap bar — Role coverage
Weighted view: Assumes=1, None=0. One dataset per role, x-axis = positions

## Metadata block

Incluí este bloque en el `<head>` del HTML generado:

```html
<script id="export-meta" type="application/json">
{
  "modelName": "<ModelBaseName>",
  "modelVersion": "V_<version>",
  "templateName": "organization",
  "exportedAt": "<ISO-8601 timestamp>"
}
</script>
```
