# Guide Prompts Specification

## Purpose

The AI Guide provides copyable prompt templates for common iNNfo operations (edit, import, export). All guide prompts MUST use the `innfo:` prefix to trigger automatic skill routing via the `nn-router` skill.

## Requirements

### Requirement: Guide Prompts Use innfo: Prefix

The `extractPrompt()` function in `guide.ts` MUST wrap all three return values (edit model, import, export) with the `innfoPrompt()` utility. This is done by modifying the `return` statements — no structural changes to the function.

#### Scenario: All three guide prompts have innfo: prefix
- GIVEN a model is open and the Guide tab is active
- WHEN the user expands an edit/import/export step
- THEN the copyable prompt starts with `innfo:`
- AND clicking Copy copies the `innfo:` prefixed text

### Requirement: innfoPrompt() Utility Wraps Instructions

All guide prompt return values MUST be wrapped with `innfoPrompt()` from `src/ai-guide/prompt.ts`. The implementation is:

```typescript
// innfoPrompt() implementation
export function innfoPrompt(content: string): string {
  return `innfo: ${content}`
}
```

### Requirement: Inline Guide Examples Use innfo: Prefix

The `procedure_NN.md` source file at `src/ai-guide/procedure_NN.md` MUST have its three example instruction lines updated with the `innfo:` prefix at the beginning of the instruction text. This is a direct string replacement — no structural changes to the markdown.

#### Scenario: Line 48 - Configuration Example
- GIVEN line 48 contains an example about loading the nn-innfo skill
- WHEN the procedure is read
- THEN the example text starts with `innfo: Load the nn-innfo skill and check that innfo-mcp is configured`

#### Scenario: Line 57 - Model Edit Example
- GIVEN line 57 contains an example about editing the business model
- WHEN the procedure is read
- THEN the example text starts with `innfo: Load the nn-innfo skill — I need to edit the business model and add a new concept`

#### Scenario: Line 75 - Export Example
- GIVEN line 75 contains an example about generating a visualizer
- WHEN the procedure is read
- THEN the example text starts with `innfo: Load the nn-innfo skill — I need to generate an HTML visualizer following traNNsform/AGENT.md`

### Requirement: Guide Renders Prefixed Examples

The Guide tab MUST render `procedure_NN.md` content with the updated inline `innfo:` prefixed examples visible to the user.

#### Scenario: Guide renders innfo:-prefixed examples
- GIVEN the Guide tab renders procedure_NN.md content
- WHEN the user reads the step descriptions
- THEN the example instruction texts show `"innfo: Load..."` instead of `"Load..."`

## File Paths Affected

| File | Action | Notes |
|------|--------|-------|
| `apps/innfo-editor/src/ai-guide/guide.ts` | Modify | Wrap 3 `return` values in `extractPrompt()` with `innfoPrompt()` |
| `apps/innfo-editor/src/ai-guide/prompt.ts` | Create | Shared `innfoPrompt()` utility |
| `apps/innfo-editor/src/ai-guide/procedure_NN.md` | Modify | Add `innfo:` prefix to 3 instruction lines (48, 57, 75) |

## Acceptance Criteria

- [ ] `guide.ts` `extractPrompt()` return values all use `innfoPrompt()`
- [ ] Line 48 of `procedure_NN.md` starts with `innfo:`
- [ ] Line 57 of `procedure_NN.md` starts with `innfo:`
- [ ] Line 75 of `procedure_NN.md` starts with `innfo:`
- [ ] All three prompt strings in `guide.ts` produce `innfo: ...` when copied from the Guide tab
- [ ] The `innfo:` prefix is applied at the source (not at render time)
