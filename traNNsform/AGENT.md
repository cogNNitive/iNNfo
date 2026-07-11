# traNNsform — Agent Entry Point

When the user asks you to **generate an export** or **transform a model to HTML**:

1. **Scan the workspace root** for iNNfo model files (`*_NN.md`)
2. **If there are multiple**, ask the user which one to transform
3. **Read `README.md`** in this directory for the full transformation protocol
4. **Detect the template type** from the model filename (e.g., `business`, `procedures`, `catalog`), or from `parent_spec.name` in the frontmatter
5. **Apply the matching template** from `templates/`
6. **Use chart patterns** from `snippets/chart-patterns.md`
7. **Save the HTML** to `outputs/` following the naming convention in README.md
8. **Include the `export-meta` block** in `<head>` per README.md
9. **Confirm** to the user where the file was saved

## After generating

Follow the **post-generación** cycle documented in README.md — offer modifications, ask about template updates, and regenerate if needed.
