# Procedure Visualizer Template

**Detect**: `parent_spec.name` contiene `"procedures"`

**Source example**: `CodeReviewProcess_V_1-0-0_procedures_NN.md`

## Sections

| # | Tab name | Source concepts | Content type |
|---|----------|----------------|--------------|
| 1 | Overview | `Work`, `Roles`, `Artifact`, `Tools`, `work-roles matrix` | Metrics bar + flowchart canvas + step type doughnut + RACI distribution bar |
| 2 | Workflow | `Work` | Vertical timeline list with step type tags |
| 3 | Roles | `Roles` | Cards with scope tag |
| 4 | Artifacts & Tools | `Artifact`, `Tools` | Cards |
| 5 | RACI Matrix | `work-roles matrix` | RACI table with colors + heatmap bar + radar |

## Data mapping

### Work steps
```
`_NN Work:` → Ordered sequence (by document order)
  Fields from YAML:
  - step_type: "event" | "task" | "decision" → tag color
  - tool: tool name
  - input / output: artifact names
  - condition: for decision steps
  - next: next step name
  Description text → step description
```

### Roles
```
`_NN Roles:` → Cards with left border accent per role
  - scope field → tag badge
```

### Artifacts
```
`_NN Artifact:` → Cards
```

### Tools
```
`_NN Tools:` → Cards
```

### RACI Matrix
```
`_NN matrices: work-roles matrix` → Matrix table
  Color code:
  - Responsible=#27ae60 (green)
  - Accountable=#e67e22 (orange)
  - Consulted=#3498db (blue)
  - Informed=#95a5a6 (gray)
  - "-"=italic gray
```

## Charts

### Flowchart canvas
Draw 5-step process flow on canvas:
- event → green rounded rect
- task → blue rounded rect
- decision → orange diamond
- Arrows between steps
- Step numbers above each box

### Doughnut — Steps by type
Count of event, task, decision steps

### Bar — RACI Distribution per Role
Stacked: one dataset per RACI code (R, A, C, I), one group per role

### Grouped bar — RACI Heatmap
Weighted: R=4, A=3, C=2, I=1, None=0
One dataset per role, x-axis = work steps

### Radar — Accountability per Role
Polar view: one dataset per role, axes = R/A/C/I with count values

## Metadata block

Incluí este bloque en el `<head>` del HTML generado:

```html
<script id="export-meta" type="application/json">
{
  "modelName": "<ModelBaseName>",
  "modelVersion": "V_<version>",
  "templateName": "procedures",
  "exportedAt": "<ISO-8601 timestamp>"
}
</script>
```
