# Workflow Definitions Specification

## Purpose

Define two standardized pipeline workflow files (`export.workflow.md` and `import.workflow.md`) in the `traNNsform/workflows/` directory. These replace the monolithic procedure instructions previously embedded in `AGENT.md` and provide a staged pipeline format consumable by both the `nn-workflow-orchestrator` (for direct execution) and the AI agent (for manual step-by-step execution).

## Format Reference

Workflow files follow the `_NN` pipeline format defined in `nn-workflow-orchestrator/reference/workflow-format.md`. Each file defines a named pipeline with sequential stages. Each stage declares:

- **Stage name** and step number
- **Input** required (files, directories, context)
- **Action** or operation to perform
- **Output** produced
- **Verification** criteria (optional)

## Requirements

### R-WD-01: export.workflow.md — Export Pipeline

The `traNNsform/workflows/export.workflow.md` file MUST define a pipeline named "Export Model Visualizer" with the following stages:

| # | Stage | Input | Action | Output |
|---|-------|-------|--------|--------|
| 1 | Scan workspace for iNNfo models | Workspace root (`*_NN.md` files) | List all model files and let the user select one | Selected model file path |
| 2 | Read model and detect template | Selected model file | Parse frontmatter; extract `parent_spec.name` for template type | Template type (e.g., business, procedures) |
| 3 | Apply template | Model + matching template from `templates/` | Generate HTML visualizer using template structure and model data | HTML content |
| 4 | Include chart patterns | Model numeric/rating fields | Embed Chart.js 4.4.7 visualizations from `snippets/chart-patterns.md` | Enhanced HTML with charts |
| 5 | Write output file | Generated HTML | Save to `traNNsform/output/` as `<ModelBaseName>_V<version>_<templateName>_visualizer.html` | Visualizer file on disk |
| 6 | Embed export-meta | Generated HTML | Insert `<script id="export-meta">` block in `<head>` with model name, version, template, timestamp | Validated HTML with metadata |
| 7 | Confirm and suggest next step | Output file path | Tell user where the file was saved and suggest opening Export Navigator | User confirmation |

#### Scenario: Full export pipeline executes successfully
- GIVEN the workspace contains `MyModel_V_1-0-0_business_NN.md`
- WHEN the agent follows `export.workflow.md`
- THEN stage 1 detects the model
- AND stage 2 resolves template type `business`
- AND stages 3-6 generate, enhance, and save the visualizer
- AND stage 7 confirms the output path

#### Scenario: Multiple models — user selects one
- GIVEN the workspace contains `ModelA_V_1-0-0_business_NN.md` and `ModelB_V_2-0-0_procedures_NN.md`
- WHEN the agent reaches stage 1
- THEN the user is prompted to choose which model to export
- AND only the selected model proceeds through stages 2-7

#### Scenario: Output file already exists
- GIVEN `traNNsform/output/` already contains `MyModel_V_1-0-0_business_visualizer.html`
- WHEN the pipeline runs
- THEN the existing file is overwritten (no confirmation required — the user explicitly requested export)
- AND a note is shown that the previous file was replaced

### R-WD-02: import.workflow.md — Import Pipeline

The `traNNsform/workflows/import.workflow.md` file MUST define a pipeline named "Import Documents to iNNfo Models" with the following stages:

| # | Stage | Input | Action | Output |
|---|-------|-------|--------|--------|
| 1 | Scan input directory | `traNNsform/input/` | List all files with name, size, type | File list |
| 2 | Classify file types | File list | Detect format (txt, md, csv, json, docx, pdf, xlsx) | Per-file processing strategy |
| 3 | Normalize to Markdown | Source files | Run the appropriate normalizer: copy `txt`/`md`, convert `docx`/`pdf`/`xlsx` via the nn-trannsform pipeline | Raw Markdown in `traNNsform/raw/` |
| 4 | Detect template and structure | Normalized Markdown | Analyze content to determine the most likely iNNfo template (business, procedures, catalog, etc.) | Template type + extracted concepts |
| 5 | Generate iNNfo model | Template + extracted data | Apply template to produce a valid `_NN.md` file | Model file in workspace root |
| 6 | Validate output model | Generated model file | Run `innfo-mcp validate` to check structural correctness | Validation report |
| 7 | Confirm and clean up | Validation result | Tell user where the model was saved; optionally clean `raw/` temp files | User confirmation |

#### Scenario: Single file import successful
- GIVEN `traNNsform/input/` contains `report.docx`
- WHEN the agent follows `import.workflow.md`
- THEN stage 1 detects 1 file
- AND stage 2 classifies it as docx
- AND stage 3 converts to Markdown
- AND stages 4-5 generate and validate the model
- AND stage 7 confirms the model filename

#### Scenario: Empty input directory
- GIVEN `traNNsform/input/` exists but is empty
- WHEN the agent reaches stage 1
- THEN the pipeline pauses with a message: "No files found in input/. Place source documents there and re-run the import workflow."
- AND no further stages execute

#### Scenario: Multiple files — one model output
- GIVEN `traNNsform/input/` contains `specs.pdf` and `notes.md` describing the same system
- WHEN the import pipeline runs
- THEN stages 3 normalizes both
- AND stage 4 merges content to produce a single coherent model
- AND stage 5 writes one model file

### R-WD-03: Pipeline Format Compliance

Both workflow files MUST:
- Be valid `_NN` format documents with YAML frontmatter containing `specification_version`, `model_version`, `title`, and `parent_spec`
- Include `# _NN index` entries for pipeline, stages, artifacts
- Follow the stage schema defined in `workflow-format.md`
- Be consumable by both `nn-workflow-orchestrator` (direct-execution mode) and a human agent reading the file

### R-WD-04: SetupWizard Downloads Workflow Files

The SetupWizard's `initWorkspaceStructure()` MUST create the `traNNsform/workflows/` directory and download `export.workflow.md` and `import.workflow.md` alongside existing transform files.

#### Scenario: New workspace includes workflow files
- GIVEN a user creates a new workspace via SetupWizard
- WHEN `initWorkspaceStructure()` completes
- THEN `traNNsform/workflows/export.workflow.md` exists
- AND `traNNsform/workflows/import.workflow.md` exists
- AND both files have valid `_NN` frontmatter

#### Scenario: Existing workspace not affected
- GIVEN an existing workspace from before this change
- WHEN the user opens it in the updated editor
- THEN `traNNsform/workflows/` does not exist (no migration runs)
- AND the old `AGENT.md` is still present and functional
- AND the agent can still operate without the workflow files

## Acceptance Criteria

- [ ] `traNNsform/workflows/export.workflow.md` exists with 7 stages in pipeline format
- [ ] `traNNsform/workflows/import.workflow.md` exists with 7 stages in pipeline format
- [ ] Both files have valid `_NN` frontmatter with `specification_version`, `model_version`, `title`, `parent_spec`
- [ ] SetupWizard creates `workflows/` dir and downloads both files on workspace init
- [ ] Workflow format matches `nn-workflow-orchestrator/reference/workflow-format.md`
- [ ] Agent can read and execute the pipelines manually step-by-step
- [ ] Orchestrator can read and execute the pipelines in direct-execution mode

## File Paths Affected

| File | Action | Notes |
|------|--------|-------|
| `traNNsform/workflows/export.workflow.md` | **Create** | Export pipeline — 7 stages |
| `traNNsform/workflows/import.workflow.md` | **Create** | Import pipeline — 7 stages |
| `apps/innfo-editor/src/components/layout/SetupWizard.vue` | Modify | Add `workflows/` dir creation; download 2 workflow files |
