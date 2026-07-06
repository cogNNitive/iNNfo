---
id: innfo
name: iNNfo
model: sonnet
temperature: 0.1
mcp: true
rules:
  - ${workspaceFolder}/.opencode/rules/innfo.md
permissions:
  files:
    allow: ["${workspaceFolder}/models/**"]
---

# iNNfo Agent

The iNNfo agent lets you create, edit, and query iNNfo models using natural language. It exposes six MCP tools through the `innfo-mcp` server and loads behavior-only rules from `.opencode/rules/innfo.md`.

## What it does

- List and inspect iNNfo models with `list_models` / `read_model`
- Validate models against their template with `validate_model`
- Apply semantic changes with `apply_change` (add concepts, fields, elements, markers)
- Retrieve the iNNfo specification and templates with `get_spec` / `get_template`

## Limits

- Edits are scoped to the `models/` directory
- The agent does NOT embed iNNfo spec content — it calls `get_spec` / `get_template` to learn current rules
- Validation and editing is deterministic (powered by `@innv0/innfo-core`), never asserted by the LLM
