# Import Panel Specification

## Purpose

The Import Panel provides a UI for scanning `traNNsform/input/` for user-provided documents and presenting a copiable agent prompt that guides the agent to transform those documents into iNNfo models. The panel does NOT execute any transformation — it only detects files and provides the prompt.

## Requirements

### Requirement: File Detection

The Import Panel MUST scan `traNNsform/input/` on mount and display a list of detected files (name, size, last modified). If the directory does not exist or is empty, it MUST show a clear message indicating no files found.

#### Scenario: Files detected in input/

- GIVEN `traNNsform/input/` contains `report.docx` and `notes.md`
- WHEN ImportPanel mounts
- THEN both filenames are listed with their sizes and timestamps
- AND a total file count is shown

#### Scenario: Empty input/ directory

- GIVEN `traNNsform/input/` exists but is empty
- WHEN ImportPanel mounts
- THEN the message "No files found in input/" is displayed
- AND no file list is rendered

#### Scenario: input/ directory missing

- GIVEN `traNNsform/` does not exist or `traNNsform/input/` is missing
- WHEN ImportPanel mounts
- THEN a message is shown indicating the directory is not available
- AND guidance to create or re-init the workspace is displayed

### Requirement: Copiable Agent Prompt with innfo: Prefix

The Import Panel MUST present a copiable prompt pre-filled with the detected file list and instructions referencing `workflows/import.workflow.md`. The prompt MUST start with `innfo: ` and update dynamically when the file list changes.

#### Scenario: Prompt starts with innfo: prefix
- GIVEN files are detected in `traNNsform/input/`
- WHEN the user copies the import prompt
- THEN the clipboard content starts with `innfo:`
- AND pasting it into the agent activates the nn-router

#### Scenario: Prompt references import.workflow.md
- GIVEN files are detected
- WHEN the user views the prompt
- THEN the prompt text references `workflows/import.workflow.md`
- AND NOT `traNNsform/AGENT.md`

#### Scenario: Prompt includes file names

- GIVEN files `report.docx` and `notes.md` are detected
- WHEN the user views the prompt
- THEN the prompt text includes both filenames
- AND references `workflows/import.workflow.md` as the transformation guide

#### Scenario: Prompt is copiable with innfo: prefix

- GIVEN the prompt text is displayed
- WHEN the user clicks the copy button
- THEN the full prompt text is copied to clipboard
- AND the copied text starts with `innfo:`
- AND a "Copied" confirmation appears briefly

#### Scenario: File list preserved after innfo: prefix
- GIVEN files `report.docx` and `notes.md` are detected
- WHEN the prompt is generated
- THEN the prompt includes `innfo: ...` at the start
- AND the file list appears after the workflow reference, separated by a blank line

#### Scenario: No files — no file list section
- GIVEN `traNNsform/input/` is empty
- WHEN the prompt is generated
- THEN only the static prompt portion is shown
- AND no `Files to import:` section is appended

### Requirement: Prompt Uses innfoPrompt() Utility

The prompt generation MUST call the shared `innfoPrompt(content)` utility from `src/ai-guide/prompt.ts`.

#### Scenario: innfoPrompt wraps the instruction
- GIVEN the raw instruction `"I need to import the documents..."`
- WHEN `innfoPrompt(instruction)` is called
- THEN the result is `"innfo: I need to import the documents..."`

### Requirement: Explicit Skill Loading Removed

The prompt MUST NOT contain any explicit "Load the ... skill" instruction. The `innfo:` prefix handles skill routing automatically.

### Requirement: Input Refresh

The Import Panel MUST provide a refresh button to re-scan `traNNsform/input/` without remounting the panel.

#### Scenario: Refresh detects new files

- GIVEN `traNNsform/input/` initially has no files
- WHEN the user adds `notes.md` and clicks refresh
- THEN the file list updates to show `notes.md`
- AND the prompt text updates to include the new file
