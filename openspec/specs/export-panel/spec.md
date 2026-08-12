# Export Panel Specification

## Purpose

The Export Panel provides a UI for selecting a model from the workspace and generating an HTML visualizer in `traNNsform/output/` via a copiable agent prompt. The panel does NOT execute the visualization — it only selects the model, presents the prompt, and shows output status.

## Requirements

### Requirement: Model Selector

The Export Panel MUST display a selector of available models in the workspace. Each model is shown by its title and version. If only one model exists, it MUST be pre-selected. If no models exist, the selector MUST be disabled with a message.

#### Scenario: Multiple models in selector

- GIVEN the workspace contains `MyModel_V_1-0-0` and `OtherModel_V_2-1-0`
- WHEN ExportPanel mounts
- THEN both models appear in the selector
- AND the user can switch between them

#### Scenario: Single model pre-selected

- GIVEN the workspace contains one model `MyModel_V_1-0-0`
- WHEN ExportPanel mounts
- THEN `MyModel_V_1-0-0` is pre-selected
- AND the prompt references that model

#### Scenario: No models available

- GIVEN the workspace has no models (empty or new workspace)
- WHEN ExportPanel mounts
- THEN the model selector is disabled
- AND a message "No models to export" is displayed

### Requirement: Copiable Export Prompt

The Export Panel MUST present a copiable prompt referencing the selected model. The prompt MUST specify output to `traNNsform/output/` with convention `<ModelBaseName>_V<version>_<templateName>_visualizer.html`.

#### Scenario: Prompt updates on model change

- GIVEN model A is selected
- WHEN the user switches to model B
- THEN the prompt text updates to reference model B
- AND the output path uses model B's base name and version

### Requirement: Prompt Starts with "innfo:" Prefix

The export prompt MUST begin with the literal string `innfo: ` followed by a space, then the instruction. This triggers the `nn-router` skill.

#### Scenario: Copied prompt starts with innfo:
- GIVEN a model is selected in ExportPanel
- WHEN the user copies the export prompt
- THEN the clipboard content starts with `innfo:`
- AND pasting it into the agent activates the nn-router

### Requirement: Prompt Uses source.path

The prompt MUST reference the model via its full `source.path` property, not just the filename. The path is the value of `selectedModel.value.source?.path`.

#### Scenario: source.path is used in prompt
- GIVEN a model at path `MyProject/Models/Ghostbusters_V_0-1-2_business_NN.md`
- WHEN the export prompt is generated
- THEN the prompt contains `model at "MyProject/Models/Ghostbusters_V_0-1-2_business_NN.md"`
- AND NOT `model at "Ghostbusters_V_0-1-2_business_NN.md"` (filename only)

#### Scenario: source.path is undefined
- GIVEN a model with no `source.path` (e.g., loaded from URL, not saved to disk)
- WHEN the export prompt is generated
- THEN the prompt falls back to `model at "{{modelFilename}}"` (the old display name behavior)
- AND the `innfo:` prefix is still present

### Requirement: Prompt References export.workflow.md

The prompt MUST reference `workflows/export.workflow.md` instead of `AGENT.md`. The reference is:

```
Open traNNsform/workflows/export.workflow.md and follow the export pipeline step by step.
```

### Requirement: Prompt Uses innfoPrompt() Utility

The prompt generation MUST call the shared `innfoPrompt(content)` utility from `src/ai-guide/prompt.ts` rather than manually prepending `"innfo: "`.

```typescript
// innfoPrompt() implementation
export function innfoPrompt(content: string): string {
  return `innfo: ${content}`
}
```

#### Scenario: innfoPrompt wraps the instruction
- GIVEN the raw instruction `"I need to generate..."`
- WHEN `innfoPrompt(instruction)` is called
- THEN the result is `"innfo: I need to generate..."`

### Requirement: Output Status

The Export Panel MUST list existing files in `traNNsform/output/` to show previously generated exports. It MUST provide a refresh button to re-scan.

#### Scenario: Previous exports displayed

- GIVEN `traNNsform/output/` contains `MyModel_V_1-0-0_template_visualizer.html`
- WHEN ExportPanel mounts or refreshes
- THEN the file is listed with its filename and timestamp
