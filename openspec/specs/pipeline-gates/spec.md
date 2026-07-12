# Pipeline Gates Specification

## Purpose

Validation and integration gates that enforce iNNfo compliance after model generation and prepare the model for workspace integration. Gates are deterministic checks and transformations, not full skill executions.

## Requirements

### Requirement: Validate Gate checks naming convention

The system MUST verify that a model file uses the correct iNNfo naming pattern: `<Name>_V_x-y-z_<Template>_NN.md`. It MUST reject `_NN_draft.md`, `_NN_FINAL.md`, or any suffix other than `_NN.md`.

#### Scenario: Valid naming passes

- GIVEN a file named `Lean_Business_Plan_Circulo_Agricola_V_0-1-0_business_NN.md`
- WHEN the validate gate runs
- THEN it returns `{ valid: true }`

#### Scenario: Invalid `_NN_draft.md` naming is rejected

- GIVEN a file named `Lean_Business_Plan_V_0-1-0_business_NN_draft.md`
- WHEN the validate gate runs
- THEN it returns `{ valid: false, errors: ["Filename must end with _NN.md, not _NN_draft.md"] }`

#### Scenario: Missing template segment in name is rejected

- GIVEN a file named `Model_V_1-0-0_NN.md` (no template segment)
- WHEN the validate gate runs
- THEN it returns `{ valid: false, errors: ["Filename must include template segment: <Name>_V_x-y-z_<Template>_NN.md"] }`

### Requirement: Validate Gate checks frontmatter completeness

The system MUST verify the YAML frontmatter contains all required fields for level 3: `spec_version`, `spec_url`, `level`, `parent_spec` (with `name` and `url`), `model_version`, `title`, and optionally `status`.

#### Scenario: Complete frontmatter passes

- GIVEN a file with all required frontmatter fields present
- WHEN the validate gate runs
- THEN it returns `{ valid: true }`

#### Scenario: Missing frontmatter fields returns specific errors

- GIVEN a file missing `spec_version` and `parent_spec`
- WHEN the validate gate runs
- THEN it returns `{ valid: false, errors: ["Missing frontmatter field: spec_version", "Missing frontmatter field: parent_spec"] }`

#### Scenario: No frontmatter at all

- GIVEN a file with no YAML frontmatter (no `---` delimiters)
- WHEN the validate gate runs
- THEN it returns `{ valid: false, errors: ["No YAML frontmatter found"] }`

### Requirement: Validate Gate checks document notice

The system MUST verify the file contains the required `> [!NOTE] This is a **iNNfo document**` notice as the first body content after frontmatter.

#### Scenario: Notice present passes

- GIVEN a file with the standard iNNfo notice immediately after frontmatter
- WHEN the validate gate runs
- THEN it returns `{ valid: true }`

#### Scenario: Missing notice is reported

- GIVEN a file without the iNNfo notice
- WHEN the validate gate runs
- THEN it returns `{ valid: false, errors: ["Missing iNNfo document notice"] }`

### Requirement: Validate Gate delegates to innfo-mcp validate_model

The system MUST call innfo-mcp's `validate_model` tool to confirm the model is valid against its declared template.

#### Scenario: Model passes MCP validation

- GIVEN a model file that passes innfo-mcp `validate_model`
- WHEN the validate gate runs full validation
- THEN it includes `mcp_valid: true` in the result

#### Scenario: Model fails MCP validation

- GIVEN a model file that fails innfo-mcp `validate_model`
- WHEN the validate gate runs full validation
- THEN it includes `mcp_valid: false` and propagates `mcp_errors` from the MCP

#### Scenario: MCP unavailable

- GIVEN innfo-mcp is not reachable
- WHEN the validate gate runs
- THEN it returns `{ valid: false, errors: ["innfo-mcp unavailable — cannot validate model"] }`

### Requirement: Integrate Gate increments patch version

The system MUST read `model_version` from the model's frontmatter, increment the patch segment, and rewrite the file with the new version in both frontmatter and filename.

#### Scenario: Patch increment from V_0-1-0

- GIVEN a model with `model_version: "V_0-1-0"` and filename `Foo_V_0-1-0_bar_NN.md`
- WHEN the integrate gate runs
- THEN the output has `model_version: "V_0-1-1"` and filename `Foo_V_0-1-1_bar_NN.md`

#### Scenario: Single-segment version V_1

- GIVEN a model with `model_version: "V_1"`
- WHEN the integrate gate runs
- THEN the output has `model_version: "V_1-0-1"` and filename uses `V_1-0-1`

#### Scenario: Dry-run mode does not modify files

- GIVEN dry-run mode is enabled
- WHEN the integrate gate runs
- THEN it returns the proposed new version and filename without writing anything

### Requirement: Integrate Gate updates index.md

The system MUST add or update a WikiLink `[[ModelName]]` in `index.md` under the appropriate section, or append the link at the end if no section exists.

#### Scenario: index.md exists with models section

- GIVEN an `index.md` that has a `## Models` section
- WHEN the integrate gate runs
- THEN it adds `- [[NewModel_V_1-0-1]]` under `## Models`

#### Scenario: index.md exists without models section

- GIVEN an `index.md` with no `## Models` section
- WHEN the integrate gate runs
- THEN it appends `## Models\n- [[NewModel_V_1-0-1]]` at the end

#### Scenario: index.md does not exist

- GIVEN no `index.md` exists in the workspace
- WHEN the integrate gate runs
- THEN it creates `index.md` with `# Workspace index\n\n## Models\n- [[NewModel_V_1-0-1]]`

### Requirement: Integrate Gate moves file to workspace root

The system MUST move the model file from its generation directory (`output/[template]/`) to the workspace root, unless a custom target directory is configured.

#### Scenario: Move from output subdirectory

- GIVEN a model at `output/business/Foo_V_0-1-0_bar_NN.md`
- WHEN the integrate gate runs
- THEN the file is moved to `./Foo_V_0-1-1_bar_NN.md`

#### Scenario: Custom target directory

- GIVEN a custom target path `models/`
- WHEN the integrate gate runs with `targetDir: "models/"`
- THEN the file is moved to `models/Foo_V_0-1-1_bar_NN.md`
