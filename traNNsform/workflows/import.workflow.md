---
spec_version: "V_0-2-0"
spec_url: "https://raw.githubusercontent.com/innV0/cogNNitive/v0.2.0/specs/level1/iNNfo_V_0-2-0_NN.md"
level: 3
parent_spec:
  name: "workflow_V_1-0-0"
  url: ""
type: "innv0-workflow"
model_version: "V_1-0-0"
title: "Import Documents — 7-stage pipeline"
description: "Scan source documents, normalize to Markdown, detect template match, and generate iNNfo models"
---

# _F Workflow: traNNsform Import Pipeline

Import external documents and transform them into structured iNNfo models. Follow stages sequentially.

**⚠️ PRE-FLIGHT**: Before starting, ensure innfo-mcp tools are available (run MCP Activation Protocol via innv0-innfo skill). Reference: `docs/mcp-setup.md`.

**Rule**: Do NOT guess or invent data not present in the source document. Every concept and element must trace back to the source.

---

## Stage 1: Scan Input Directory

* _F ScanInput: Discover source documents in traNNsform/input/

**Goal**: Find all source documents placed in the input directory.

**Steps**:
1. Scan `traNNsform/input/` for files of supported types (txt, md, csv, json, docx, pdf, xlsx)
2. If no files found, ask the user to place source files in `traNNsform/input/`
3. If multiple files found, list them and ask which to process (or offer to process all)
4. Copy selected files to `traNNsform/input/raw/` for processing

**Expected output**: List of source file paths, copied to `traNNsform/input/raw/`

```yaml
skill: "innv0-trannsform"
template: ""
input: "traNNsform/input/"
output: "traNNsform/input/raw/"
```

---

## Stage 2: Classify by Document Type

* _F Classify: Determine file type and routing

**Goal**: Identify the format of each source document to select the correct normalization handler.

**Steps**:
1. Check file extension for each source:
   - `.txt` / `.md` — plain text, minimal processing needed
   - `.csv` / `.json` — structured data, parse and extract fields
   - `.docx` / `.pdf` / `.xlsx` — requires conversion; check if conversion tools are available
2. If a format requires tools not available (e.g., pandoc, python libs), inform the user and offer alternatives
3. Group files by type for batch processing where possible

**Expected output**: Per-file classification with processing strategy

---

## Stage 3: Normalize to Markdown

* _F Normalize: Convert source content to clean Markdown

**Goal**: Produce normalized Markdown from each source document, preserving structure and content.

**Steps**:
1. For `.txt` / `.md` files: read directly, clean up formatting (trim whitespace, normalize line endings)
2. For `.csv` / `.json`: parse structured data, generate Markdown tables and sections
3. For `.docx` / `.pdf` / `.xlsx`: if conversion tools are available, convert to Markdown; otherwise, ask the user to provide a Markdown version
4. Save normalized content to `traNNsform/input/md/` with the same base name
5. Preserve section hierarchy, headings, lists, and tables from the original

**Expected output**: Clean Markdown files in `traNNsform/input/md/`

```yaml
skill: "innv0-trannsform"
template: ""
input: "traNNsform/input/raw/"
output: "traNNsform/input/md/"
```

---

## Stage 4: Detect Domain and Template Match

* _F DetectDomain: Analyze content to find the best iNNfo template

**Goal**: Determine which iNNfo template type best fits the normalized content.

**Steps**:
1. Analyze the normalized Markdown for domain indicators:
   - Business concepts (revenue, customers, products, market, team, metrics) → `business`
   - Procedures (steps, workflow, process, validation, checklist) → `procedures`
   - Catalog items (entries, categories, attributes, inventory) → `catalog`
   - Organization structure (roles, hierarchy, departments, reporting) → `organization`
   - No clear match → `_generic`
2. Present the detected template type to the user for confirmation
3. Allow the user to override if the detected type is incorrect

**Expected output**: Confirmed template type for model generation

```yaml
skill: "innv0-trannsform"
template: "templates/<detected>.md"
input: "traNNsform/input/md/<normalized>.md"
output: "<template-type>"
```

---

## Stage 5: Generate iNNfo Model

* _F GenerateModel: Create the _NN.md model file from normalized content

**Goal**: Produce a valid iNNfo model file following the detected template and defiNNe naming conventions.

**Steps**:
1. Apply the detected template structure to the normalized content:
   - Extract top-level concepts as `# _NN <ConceptName>` sections
   - Extract fields and attributes as `* _NN <FieldName>: <value>` entries
   - Extract relationships and matrices as `# _NN matrices:` tables
2. Follow the naming convention from defiNNe (§6 — File Naming Convention):
   `<Model>_V_x-y-z_<Template>_NN.md`
   → https://raw.githubusercontent.com/innV0/cogNNitive/main/specs/latest/level0/defiNNe_NN.md
3. Apply standard version `V_1-0-0` for new models
4. Generate appropriate frontmatter YAML with:
   - `parent_spec` referencing the matching template spec URL
   - Model `title` based on content domain
5. Save the model to the workspace root (or user-specified location)

**Expected output**: Saved `_NN.md` model file

```yaml
skill: "innv0-trannsform"
template: "templates/<detected>.md"
input: "traNNsform/input/md/<normalized>.md"
output: "<Model>_V_1-0-0_<Template>_NN.md"
```

---

## Stage 6: Validate Generated Model

* _F Validate: Run iNNfo validation against template spec

**Goal**: Confirm the generated model is structurally valid and follows the template.

**Steps**:
1. Use innfo-mcp tools to validate the model against its template
2. Check for:
   - Required frontmatter fields present
   - All required concept sections exist
   - Field types match template expectations
   - Matrix dimensions are consistent
3. If validation errors are found:
   - List each error with the offending line/section
   - Offer to fix automatically where possible
   - Ask the user for guidance on ambiguous fields

**Expected output**: Validation result (pass or actionable error list)

```yaml
skill: "innfo-mcp"
template: "templates/<detected>.md"
input: "<model-file-path>"
output: "validation-status"
```

---

## Stage 7: Confirm and Suggest Next Steps

* _F ConfirmImport: Show completion report and next actions

**Goal**: Confirm the import result and suggest follow-up actions.

**Steps**:
1. Report the saved model path: ✅ `<Model>_V_1-0-0_<Template>_NN.md`
2. If validation passed: "The model is valid and ready to use."
3. If validation had warnings: "The model was created with warnings (see above). You may want to review specific sections."
4. Ask: "Would you like to add more source documents, or start working with the model in the editor?"
5. Suggest exporting a visualizer: "You can generate an HTML visualizer from this model — open the export workflow in `workflows/export.workflow.md`."

**Expected output**: Confirmed completion

```yaml
skill: ""
template: ""
input: "<model-file-path>"
output: "confirmed"
```

---

## Stage-Skill Matrix

| Stage \ Skill | innv0-trannsform | innfo-mcp |
| :--- | :---: | :---: |
| 1 — Scan Input | X | |
| 2 — Classify | X | |
| 3 — Normalize | X | |
| 4 — Detect Template | X | |
| 5 — Generate Model | X | |
| 6 — Validate | | X |
| 7 — Confirm | | |

## Stage-Artifact Matrix

| Stage \ Artifact | Source File | Raw Copy | Normalized MD | Template Type | Model File | Validation |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 — Scan Input | input | output | | | | |
| 2 — Classify | input | | | output | | |
| 3 — Normalize | | input | output | | | |
| 4 — Detect Domain | | | input | output | | |
| 5 — Generate Model | | | input | input | output | |
| 6 — Validate | | | | input | input | output |
| 7 — Confirm | | | | | verified | verified |
