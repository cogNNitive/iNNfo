# traNNsform

`traNNsform/` is a root-level directory (not an npm package) that defines the protocol for turning iNNfo models into shareable HTML visualizers, and for turning source documents back into iNNfo models. The transformation itself is always executed by an external AI coding agent following the instructions in `traNNsform/AGENT.md` and `traNNsform/README.md` — the [innfo-editor](innfo-editor) Export and Import panels only generate the prompt that kicks off that agent run.

## Directory structure

```
traNNsform/
├── AGENT.md      ← agent entry point — read first
├── README.md     ← full transformation protocol
├── input/        ← source documents dropped here for import
├── output/       ← generated HTML visualizers
├── templates/    ← HTML templates per model type
│   ├── business.md
│   ├── procedures.md
│   ├── catalog.md
│   └── _generic.md
└── snippets/
    └── chart-patterns.md   ← reusable Chart.js patterns
```

## Export: model → HTML visualizer

1. The agent scans the workspace for iNNfo model files (`*_NN.md`).
2. It detects the model's template type from the filename or `parent_spec.name` in the frontmatter (business, procedures, catalog, or generic fallback).
3. It applies the matching template from `templates/`, using the shared Chart.js patterns in `snippets/chart-patterns.md`.
4. The output file is named `<ModelBaseName>_V<version>_<templateName>_visualizer.html` and saved to `traNNsform/output/`.
5. The generated HTML includes an `export-meta` block in `<head>` with model name, version, template name, and export timestamp — the Export Navigator in innfo-editor depends on this metadata.

## Import: source documents → model

1. The user drops source files into `traNNsform/input/`.
2. The agent normalizes them and applies the matching template.
3. The result is written as a new iNNfo model (`<Model>_V_x-y-z_<Template>_NN.md`), following the naming convention defined in defiNNe.

## Design rules the agent follows

- Never invent data — only what is present in the source model or documents.
- Every claim in the generated HTML carries a source reference back to the originating file and section.
- After generating an export, the agent offers to update the underlying template so future exports pick up the same changes.
- After editing a model, the agent suggests bumping the model's version so the Export Navigator can detect stale exports.

See `traNNsform/AGENT.md` for the authoritative, up-to-date protocol.

## Sample Workflows

`traNNsform/workflows/samples/` includes ready-to-run transformation recipes. Each sample describes a specific input-to-output transformation, with stages the agent follows automatically.

### How to run a sample workflow

1. **Place your source file** in `traNNsform/input/` (PDF, text, Markdown, meeting notes, etc.)
2. **Open the repo** in your AI agent (OpenCode, Claude Code, or any MCP-capable agent)
3. **Say the prompt** listed in the workflow file — the agent reads the workflow and executes it stage by stage
4. **Get your result** in `traNNsform/output/`

### Available samples

| Workflow | Source → Result | What it does |
|----------|----------------|--------------|
| [Paper → YouTube Script](https://github.com/cogNNitive/cogNNitive/tree/main/iNNfo/traNNsform/workflows/samples/paper-to-youtube.workflow.md) | Scientific PDF → video script | Extracts findings, structures a YouTube script with hook, explanation, limitations, and CTA |
| [Meeting → Summary](https://github.com/cogNNitive/cogNNitive/tree/main/iNNfo/traNNsform/workflows/samples/meeting-to-summary.workflow.md) | Raw notes → executive summary | Extracts decisions, action items, blockers, and produces a stakeholder-ready summary |

### Example: Paper to YouTube Script

Using the paper [*What makes a video go viral?*](https://pdodds.w3.uvm.edu/files/papers/others/2009/munz2009a.pdf) (Munz et al., 2009):

```bash
# 1. Download the paper into the input directory
curl -o traNNsform/input/munz2009a.pdf \
  https://pdodds.w3.uvm.edu/files/papers/others/2009/munz2009a.pdf

# 2. In your AI agent, say:
#    "Run the sample workflow paper-to-youtube on traNNsform/input/munz2009a.pdf"
```

The agent reads the PDF, extracts the core narrative, and generates a complete YouTube script with timestamps and visual cues saved to `traNNsform/output/munz2009a_youtube_script.md`.

### Example: Meeting Notes to Executive Summary

```bash
# 1. Place your meeting notes in the input directory
cp ~/notes/sprint-review.md traNNsform/input/

# 2. In your AI agent, say:
#    "Run the sample workflow meeting-to-summary on traNNsform/input/sprint-review.md"
```

The agent extracts decisions, action items, blockers, and writes a structured summary to `traNNsform/output/sprint-review_executive_summary.md`.

> **Tip**: You can run these workflows on any input file, not just the examples shown. The agent adapts the stages to whatever content it finds.
