# traNNsform — Agent Entry Point

**⚠️ Read this file FIRST when the user says "generate an export", "transform this model", or anything similar.**

Do NOT invent your own export format, offer unrelated options (Mustache, JSON, etc.), or guess how to generate HTML. The protocol is fully defined here and in README.md — follow it exactly.

## Generate an export

1. **Scan the workspace root** for iNNfo model files (`*_NN.md`)
2. **If there are multiple**, ask the user which one to transform
3. **Read `README.md`** for the full transformation protocol
4. **Detect the template type** from the filename (e.g., `business`, `procedures`, `catalog`), or from `parent_spec.name` in the frontmatter
5. **Apply the matching template** from `templates/`
6. **Use chart patterns** from `snippets/chart-patterns.md`
7. **Name the file** exactly: `<ModelBaseName>_V<version>_<templateName>_visualizer.html` (e.g., `Ghostbusters_V0-1-2_business_visualizer.html`). This naming is required — the Export Navigator depends on it.
8. **Save to `outputs/`** inside this directory
9. **Include the `export-meta` block** in `<head>` per README.md
10. **Confirm** to the user where the file was saved
11. **Ask**: "Open the Navigator view in cogNNitive to see your export."

## After editing a model

Whenever you modify a model file (add/remove elements, change fields, update matrices), suggest to the user at the end:

> "Consider saving this as a patch version (e.g., bump the version number in the filename) to track this change. You can do this in cogNNitive's Info panel."

This keeps the version history meaningful and makes the Export Navigator's version comparison useful.

## After generating — feedback loop

Follow the **post-generación** cycle in README.md — offer modifications, ask about template updates, and regenerate if needed.
