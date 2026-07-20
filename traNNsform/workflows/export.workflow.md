---
spec_version: "V_0-2-0"
spec_url: "https://raw.githubusercontent.com/innV0/iNNfo/v0.2.0/specs/level1/iNNfo_V_0-2-0_NN.md"
level: 3
parent_spec:
  name: "workflow_V_1-0-0"
  url: ""
type: "nn-workflow"
model_version: "V_1-0-0"
title: "Export Visualizer â€” 7-stage pipeline"
description: "Scan iNNfo models, generate HTML visualizers with charts and matrices, and save to output/"
---

# _F Workflow: traNNsform Export Pipeline

Generate an HTML visualizer from an iNNfo model file. Follow stages sequentially â€” each stage depends on the previous.

**âš ï¸ PRE-FLIGHT**: Before starting, ensure innfo-mcp tools are available (run MCP Activation Protocol via nn-innfo skill). Reference: `docs/mcp-setup.md`.

**Rule**: Do NOT invent data not in the source model. Every claim must reference its source section. Do NOT offer unrelated output formats (Mustache, JSON, etc.) â€” only HTML visualizers.

---

## Stage 1: Scan Workspace

* _F Scan: Find iNNfo model files

**Goal**: Discover available iNNfo model files (`*_NN.md`) in the workspace.

**Steps**:
1. Scan the workspace root for files matching `*_NN.md`
2. If multiple models are found, present them to the user and ask which one to transform
3. If no models found, prompt the user to open or create one first

**Expected output**: Selected model file path + detected template type (business, procedures, catalog, organization, or generic)

---

## Stage 2: Read Template

* _F ReadTemplate: Load matching template from templates/

**Goal**: Read the correct HTML template for the detected model type.

**Steps**:
1. Detect template type from filename (e.g., `_business_NN.md`, `_procedures_NN.md`) or from `parent_spec.name` in the model's frontmatter YAML
2. Map to the matching file in `templates/`:
   - `business` â†’ `templates/business.md`
   - `procedures` â†’ `templates/procedures.md`
   - `catalog` â†’ `templates/catalog.md`
   - `organization` â†’ `templates/organization.md`
   - No match â†’ `templates/_generic.md`
3. Read `README.md` for the full transformation protocol (HTML base structure, CSS patterns)
4. Read `snippets/chart-patterns.md` for reusable Chart.js configurations

**Expected output**: Template content loaded + protocol understood

```yaml
skill: "nn-trannsform"
template: "<detected-template>"
input: "<model-file-path>"
output: "traNNsform/output/"
```

---

## Stage 3: Generate HTML Visualizer

* _F Generate: Build HTML from model data + template

**Goal**: Produce a complete HTML file following the template structure.

**Steps**:
1. Parse the model's `_NN` sections â€” extract concepts, elements, fields, matrices
2. Apply the matching template structure:
   - Header with gradient (`--primary`), title, source-badge linking to the model file
   - Sticky nav tabs for section navigation
   - Section cards, metrics grids, tables, charts
3. Follow the base HTML structure from `README.md`:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head><!-- Chart.js CDN, CSS --></head>
   <body>
     <header class="header"><!-- with source-badge --></header>
     <nav class="nav-tabs" id="navTabs"><!-- tabs --></nav>
     <div class="container"><!-- sections with model data --></div>
     <footer class="footer"><!-- attribution --></footer>
     <script><!-- Tab nav + Chart.js instances --></script>
   </body>
   </html>
   ```
4. Include the `export-meta` block in `<head>`:
   ```html
   <script id="export-meta" type="application/json">
   {
     "modelName": "<ModelBaseName>",
     "modelVersion": "<version>",
     "templateName": "<templateName>",
     "exportedAt": "<ISO timestamp>"
   }
   </script>
   ```
5. Name the file exactly: `<ModelBaseName>_V<version>_<templateName>_visualizer.html`
   - Example: `Ghostbusters_V0-1-2_business_visualizer.html`
   - **This naming is required** â€” the Export Navigator depends on it

**Expected output**: Raw HTML string with all model data rendered

---

## Stage 4: Handle Charts and Matrices

* _F Charts: Apply Chart.js configurations and matrix rendering

**Goal**: Add interactive charts and matrix tables using Chart.js 4.4.7.

**Steps**:
1. For each matrix in the model (`_NN matrices:` sections):
   - Render as an HTML table with `<table class="matrix-table">`
   - Add Chart.js heatmap or bar chart visualization alongside the table
2. For metrics/concepts with numeric data:
   - Add metric cards using `.metrics` grid (`repeat(auto-fill, minmax(160px, 1fr))`)
3. Use Chart.js 4.4.7 from CDN with configurations from `snippets/chart-patterns.md`
4. Layout rules:
   - Charts row: `grid-template-columns: 1fr 1fr` â†’ `1fr` on mobile
   - Cards grid: `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`
   - Tables: wrap in `overflow-x: auto` for horizontal scroll

**Expected output**: HTML with rendered charts, matrices, and metric cards

```yaml
skill: "nn-trannsform"
template: "snippets/chart-patterns.md"
input: "<model-file-path>"
output: "<in-memory HTML>"
```

---

## Stage 5: Write Output File

* _F Write: Save the visualizer to traNNsform/output/

**Goal**: Persist the generated HTML to the output directory.

**Steps**:
1. Ensure `traNNsform/output/` exists (create if missing)
2. Write the HTML file with the correct naming convention
3. Verify the file was written and is valid HTML (basic check: starts with `<!DOCTYPE html>`)

**Expected output**: File saved at `traNNsform/output/<ModelBaseName>_V<version>_<templateName>_visualizer.html`

```yaml
skill: "nn-trannsform"
template: ""
input: "<in-memory HTML>"
output: "traNNsform/output/<filename>.html"
```

---

## Stage 6: Embed Base64 Assets

* _F EmbedAssets: Convert asset references to inline base64

**Goal**: Make the HTML fully standalone by embedding asset references as base64 Data URIs.

**Steps**:
1. Scan the generated HTML for asset references (`asset:` field in YAML elements, or `<a href="../assets/..."`)
2. For each asset file, read and convert to base64
3. Replace the relative path with `data:<mime-type>;base64,<encoded-data>`
4. If an asset file is missing, leave the original path and add a comment in the HTML

**Expected output**: Self-contained HTML with all assets inlined (no external dependencies)

---

## Stage 7: Confirm and Suggest Next Steps

* _F Confirm: Show completion report and offer feedback loop

**Goal**: Confirm the result to the user and offer the post-generation cycle.

**Steps**:
1. Report the saved file path: âœ… `traNNsform/output/<filename>.html`
2. Ask: "Open the Navigator view in iNNfo to see your export."
3. Ask: "Would you like to modify anything? (layout, charts, sections, colors...)"
4. **If user requests changes**:
   a. Apply modifications to the HTML
   b. Ask: "Should I update the template in `traNNsform/templates/` so future exports include these changes?"
   c. If yes, list changes (numbered), ask which to keep in the template
   d. Apply selected changes to `traNNsform/templates/<template>.md`
   e. Regenerate the HTML with the updated template
5. Suggest version tracking: "Consider saving this as a patch version (e.g., bump the version number in the filename) to track this change. The Export Navigator uses version comparison."

```yaml
skill: ""
template: ""
input: "traNNsform/output/<filename>.html"
output: "confirmed"
```

---

## Stage-Skill Matrix

| Stage \ Skill | nn-trannsform |
| :--- | :---: |
| 1 â€” Scan Workspace | X |
| 2 â€” Read Template | X |
| 3 â€” Generate HTML | X |
| 4 â€” Charts & Matrices | X |
| 5 â€” Write Output | X |
| 6 â€” Embed Assets | X |
| 7 â€” Confirm | |

## Stage-Artifact Matrix

| Stage \ Artifact | Model File | Template | HTML String | Saved File |
| :--- | :---: | :---: | :---: | :---: |
| 1 â€” Scan Workspace | input | | | |
| 2 â€” Read Template | | input | | |
| 3 â€” Generate HTML | input | input | output | |
| 4 â€” Charts & Matrices | | input | output | |
| 5 â€” Write Output | | | input | output |
| 6 â€” Embed Assets | | | output | output |
| 7 â€” Confirm | | | | verified |
