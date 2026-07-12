# AiWorkflowModal Specification

## Purpose

Replace three full-page panel views (AIGuidePanel, ImportPanel, ExportPanel) and their three header buttons with a single "Use AI" button that opens a tabbed modal overlay. The modal keeps Guide, Import, and Export as independent tabs with local state, so the user stays in the editor context while copying prompts.

## Requirements

### R-AWM-01: Single Header Button

The workspace header MUST show a single "Use AI" button instead of three separate buttons for AI Guide, Import, and Export. Clicking it opens the modal. The button label is "Use AI" with a Sparkles icon.

#### Scenario: Click opens modal on Guide tab
- GIVEN the workspace is open
- WHEN the user clicks "Use AI" in the header
- THEN the AiWorkflowModal appears
- AND the Guide tab is active by default
- AND the editor context behind the modal remains visible (dimmed)

#### Scenario: Button is always enabled (no workspace dependency)
- GIVEN no model is open (no workspace handle)
- WHEN the user clicks "Use AI"
- THEN the modal opens on the Guide tab
- AND the user sees AI setup instructions without needing a workspace

### R-AWM-02: Three Tabs — Guide, Import, Export

The modal MUST present three tabs: **Guide**, **Import**, **Export**. Each tab renders the respective panel content inline. The tab bar is pinned at the top of the modal.

- **Guide tab**: Renders the same content as AIGuidePanel.vue — the procedure guide parsed from `procedure_NN.md`, including Tools, Steps (accordions with copyable prompts), and Roles matrix.
- **Import tab**: Renders ImportPanel content — file list from `traNNsform/input/`, refresh button, and copiable agent prompt referencing `workflows/import.workflow.md`.
- **Export tab**: Renders ExportPanel content — model selector, copiable agent prompt referencing `source.path` + `workflows/export.workflow.md`, and previous exports list.

#### Scenario: Tab switch preserves other tab state
- GIVEN the Import tab has detected 3 files in `input/`
- WHEN the user switches to Export and back to Import
- THEN the Import tab still shows the same 3 files (no re-scan needed)

#### Scenario: Guide tab shows steps with copyable prompts
- GIVEN the modal is open on the Guide tab
- WHEN the user clicks on a step to expand it
- THEN the step description and a copyable prompt (prefixed with "innfo:") are shown
- AND the Copy button copies the full prefixed prompt to clipboard

### R-AWM-03: Local Tab State

Each tab MUST maintain its own local reactive state. No shared Pinia store for tab-internal data. The only shared state via `uiStore` is:

```typescript
interface AiModalState {
  showAiModal: boolean    // new — controls modal visibility
  activeAiTab: 'guide' | 'import' | 'export'  // new — remembers last active tab
}
```

#### Scenario: Tab remembers last selection across open/close
- GIVEN the user opens the modal, switches to Export, then closes
- WHEN the user clicks "Use AI" again
- THEN the modal opens on the Export tab (last used)
- AND Import tab retains its file list from the previous scan

### R-AWM-04: Modal Closes on Escape, Click-Outside, and Close Button

The modal MUST close when:
- The user presses the Escape key
- The user clicks outside the modal (on the backdrop overlay)
- The user clicks a visible Close (X) button in the modal header

Closing the modal MUST NOT change `uiStore.activeView` — the editor view stays as it was.

#### Scenario: Escape closes modal, editor unchanged
- GIVEN the modal is open on the Export tab
- WHEN the user presses Escape
- THEN the modal closes
- AND `uiStore.activeView` remains unchanged (e.g., `'editor'`)
- AND the editor is fully interactive again

### R-AWM-05: Copy Behavior Preserved Per Tab

Each tab's Copy button MUST copy the full prefixed prompt (starting with "innfo:") to clipboard and show a brief "Copied" confirmation. The three panels' independent copy state (`copied` boolean per tab) is preserved.

#### Scenario: Copy from Import, then Export, then Import shows "Copied" on last
- GIVEN Import and Export tabs both have prompts
- WHEN the user copies Import's prompt → "Copied" shows on Import
- THEN switches to Export, copies → "Copied" shows on Export
- AND switches back to Import → "Copied" has faded (2s timeout respected per tab)

### R-AWM-06: Modal Renders Within WorkspaceView Layout

`AiWorkflowModal.vue` is rendered inside `WorkspaceView.vue` as a child component, not via router. The modal uses a fixed overlay (z-index above the layout) with a backdrop.

The three old `activeView` slots (`ai-guide`, `import`, `export`) in `WorkspaceView.vue` are removed. Their lazy imports (`defineAsyncComponent`) remain importable for backward compatibility but are no longer rendered as full-page views.

#### Scenario: Old view routes redirect or no-op
- GIVEN external code calls `uiStore.setActiveView('ai-guide')`
- WHEN the view switches
- THEN the main area shows the editor (or a no-op — the modal does not auto-open)
- AND `'ai-guide' | 'import' | 'export'` remain in the `ActiveView` union type as deprecated members

### R-AWM-07: Close Restores Visual Context

When the modal closes, the workspace behind it (editor, graph, etc.) appears exactly as it was before the modal opened. No scroll position loss, no active node de-selection, no view switch.

### R-AWM-08: Keyboard Tab Navigation

Within the modal, the user MUST be able to navigate between tabs using the keyboard:
- **Tab / Shift+Tab** moves focus between the modal's interactive elements (tabs, copy buttons, model selector, refresh button, close button)
- Focus is trapped inside the modal while it is open (Tab on the last element moves back to the first)

#### Scenario: Focus trap keeps Tab inside modal
- GIVEN the modal is open
- WHEN the user presses Tab repeatedly
- THEN focus cycles through all modal interactive elements
- AND never reaches the workspace elements behind the backdrop

## Acceptance Criteria

- [ ] Single "Use AI" button replaces 3 header buttons (Guide, Import, Export)
- [ ] Clicking "Use AI" opens `AiWorkflowModal.vue` as an overlay
- [ ] Modal has 3 tabs: Guide, Import, Export — each renders correct panel content
- [ ] Tab state is remembered per session (`activeAiTab` in uiStore)
- [ ] Modal closes on Escape, backdrop click, or X button
- [ ] Closing modal does not change `activeView`
- [ ] Copy button in each tab copies "innfo:"-prefixed prompt and shows "Copied"
- [ ] Focus is trapped inside modal while open
- [ ] Old `ai-guide`, `import`, `export` view slots removed from `WorkspaceView.vue`
- [ ] `'ai-guide' | 'import' | 'export'` kept in `ActiveView` union as deprecated (removed in next release)
- [ ] `uiStore.showAiModal` and `uiStore.activeAiTab` are the only new store fields

## File Paths Affected

| File | Action | Notes |
|------|--------|-------|
| `apps/innfo-editor/src/components/editor/AiWorkflowModal.vue` | **Create** | Tabbed modal container |
| `apps/innfo-editor/src/components/layout/Header.vue` | Modify | 3 buttons → 1 "Use AI" button |
| `apps/innfo-editor/src/views/WorkspaceView.vue` | Modify | Remove `ai-guide`, `import`, `export` view slots; render AiWorkflowModal |
| `apps/innfo-editor/src/stores/uiStore.ts` | Modify | Add `showAiModal`, `activeAiTab` refs |
