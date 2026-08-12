# traNNsform Folder Specification

## Purpose

The `traNNsform/` folder at the workspace root defines the contract between the editor UI and the agent for document transformation (Import) and model visualization (Export). It replaces the previous `.traNNsform/` (hidden) and `outputs/` (plural) conventions.

## Requirements

### Requirement: Folder Structure with Workflows Directory

The workspace MUST contain `traNNsform/` (visible, no dot) with subdirectories `input/` (empty, for raw documents), `output/` (singular, for generated visualizers), `workflows/` (for pipeline definitions), `templates/`, and `snippets/`, plus `AGENT.md` and `README.md`.

#### Scenario: Structure created on workspace init

- GIVEN SetupWizard creates a new workspace
- WHEN `initWorkspaceStructure()` completes
- THEN `traNNsform/` and all subdirectories exist
- AND `input/` and `output/` contain `.gitkeep`
- AND `workflows/` directory exists
- AND `AGENT.md` and `README.md` are present

#### Scenario: SetupWizard creates workflow files alongside existing files
- GIVEN a user creates a new workspace via SetupWizard
- WHEN the workspace is initialized
- THEN `traNNsform/workflows/` exists
- AND `traNNsform/workflows/export.workflow.md` exists with valid content
- AND `traNNsform/workflows/import.workflow.md` exists with valid content
- AND all existing transform files (AGENT.md, README.md, templates, snippets) still download correctly

#### Scenario: Old workspaces retain old AGENT.md
- GIVEN an existing workspace created before this change
- WHEN the workspace is opened
- THEN the old `AGENT.md` remains on disk (not modified)
- AND the agent can still operate with the old content
- AND the new workflow files are NOT created for old workspaces

### Requirement: AGENT.md Is a Pointer to Workflows

The `traNNsform/AGENT.md` file MUST be simplified from full procedural instructions to a short pointer document that directs the agent to the workflow files. The new content MUST include:

```markdown
# traNNsform — Agent Pointers

This directory uses **workflow files** for structured pipelines.
Open the appropriate workflow file in `workflows/`:

- **Import documents** → `workflows/import.workflow.md`
- **Export visualizers** → `workflows/export.workflow.md`

For setup instructions (workspace structure, templates, snippets):
see `README.md` in this directory.
```

#### Scenario: Agent reads pointer file
- GIVEN the agent opens `traNNsform/AGENT.md`
- WHEN it reads the content
- THEN it sees the pointer with 2 workflow references + README reference
- AND opens `workflows/export.workflow.md` or `workflows/import.workflow.md` as needed
- AND finds full pipeline instructions there

### Requirement: AGENT.md References defiNNe for Model Naming

`traNNsform/AGENT.md` (when in pointer form) MUST NOT duplicate the iNNfo model naming convention. It MUST reference the canonical defiNNe specification (`defiNNe_NN.md` §File Naming Convention) for naming imported models.

(Previously: the naming convention was inlined in AGENT.md, risking divergence from defiNNe.)

#### Scenario: defiNNe reference in workflow files

- GIVEN `traNNsform/workflows/import.workflow.md` is read
- WHEN inspecting the Import naming section
- THEN a URL to `defiNNe_NN.md` is present in the workflow stage notes
- AND the full naming pattern is NOT duplicated inline in AGENT.md

### Requirement: Export Naming Convention in AGENT.md

`traNNsform/AGENT.md` MUST define the visualizer export naming convention: `<ModelBaseName>_V<version>_<templateName>_visualizer.html`. This is specific to traNNsform outputs and is NOT referenced from defiNNe.

#### Scenario: Visualizer naming defined

- GIVEN `traNNsform/AGENT.md` is read
- WHEN inspecting the Export naming section
- THEN the `_visualizer.html` pattern is defined
- AND the output path references `traNNsform/output/` (singular)

### Requirement: AGENT.md Documents Incremental Import (PLOM)

`traNNsform/AGENT.md` MUST include a "FUTURO — no implementado" section documenting the planned behavior for incremental imports: read existing model, cross-reference new documents, produce updated version with bump.

#### Scenario: PLOM section present

- GIVEN `traNNsform/AGENT.md` is read
- WHEN inspecting the Import section
- THEN a "FUTURO — no implementado" subsection exists
- AND it describes the intended merge behavior
- AND it does not contain implementation-ready instructions

### Requirement: Workflow Files Preserve Old AGENT.md Content

The operational content removed from `AGENT.md` (import procedure, export procedure, naming conventions, feedback loop) MUST be preserved in the new workflow files:

- **Import documents procedure** (old 5 steps) → `workflows/import.workflow.md` stages 1-7
- **Export generation procedure** (old 11 steps) → `workflows/export.workflow.md` stages 1-7
- **Import naming convention** → `workflows/import.workflow.md` stage 5 notes
- **Post-generation feedback loop** → `workflows/export.workflow.md` stage 7 notes

#### Scenario: Agent gets same operational guidance from workflow files
- GIVEN an agent that previously worked with the old `AGENT.md`
- WHEN it reads `workflows/import.workflow.md` and `workflows/export.workflow.md`
- THEN it can perform the same import/export operations with the same outcomes
- AND the structured stage format may make execution more reliable (sequential, verifiable steps)

### Requirement: No Hidden or Plural Paths

No references to `.traNNsform/` (hidden) or `outputs/` (plural) SHALL exist in `traNNsform/AGENT.md`, workflow files, or `traNNsform/README.md`. All path references MUST use `traNNsform/`, `input/`, `output/`, and `workflows/`.

#### Scenario: README and workflows use new paths

- GIVEN `traNNsform/README.md` and `traNNsform/workflows/*.workflow.md` are read
- WHEN searching for path references
- THEN no `.traNNsform/` or `outputs/` references exist
- AND all paths use `traNNsform/`, `input/`, `output/`, `workflows/`

### Requirement: Supported Scanner File Extensions and Omission Warnings

The traNNsform document scanner MUST support `.xls` files for scanning and classification alongside `.xlsx`, `.docx`, and `.pdf` files. When scanning a target directory, any file with an unsupported extension MUST be omitted from the input document list and MUST generate an explicit warning message detailing the omitted file path and unsupported extension.

#### Scenario: Scanning directory with .xls spreadsheet file

- GIVEN a traNNsform input directory containing a `.xls` file
- WHEN the media scanner processes the directory
- THEN the `.xls` file MUST be recognized as a valid input document
- AND no omission warning MUST be emitted for that file

#### Scenario: Scanning directory with unsupported file extensions

- GIVEN a traNNsform input directory containing unsupported files such as `.txt` or `.zip`
- WHEN the media scanner processes the directory
- THEN the unsupported files MUST be omitted from the document list
- AND an explicit warning MUST be emitted listing each omitted file and its unsupported extension
