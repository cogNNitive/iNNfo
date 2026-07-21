---
spec_version: "V_0-2-0"
spec_url: "https://raw.githubusercontent.com/cogNNitive/cogNNitive/v0.2.0/specs/level1/iNNfo_V_0-2-0_NN.md"
level: 3
parent_spec:
  name: "workflow_V_1-0-0"
  url: ""
type: "nn-workflow"
model_version: "V_1-0-0"
title: "PDF to iNNfo Model & Dashboard"
description: "Transform a film Wikipedia article (PDF) into an iNNfo model with specialization, then export an interactive visual dashboard — demonstrating the full traNNsform + iNNfo pipeline"
---

# _NN Sample Workflow: PDF to iNNfo Model & Dashboard

Take any Wikipedia article (saved as PDF) and run it through the full cogNNitive pipeline: normalize with **nn-trannsform**, model with **nn-innfo**, and export an interactive HTML dashboard.

This sample uses the Wikipedia article for **What's Up, Doc? (1972)** — a Peter Bogdanovich screwball comedy starring Barbra Streisand and Ryan O'Neal.

---

## What you'll get

- **Normalized Markdown** from the raw PDF source
- **iNNfo specialization** (level 2) with film-specific concepts: Film metadata, Cast & Crew, Plot, Production, Reception, Awards
- **iNNfo model** (level 3) with structured data from the article
- **Interactive HTML dashboard** with Charts.js visualizations (cast breakdown, awards timeline, box office metrics)

---

## How to run it

1. Save the Wikipedia article as PDF from [en.wikipedia.org/wiki/What's_Up,_Doc?_(1972_film)](https://en.wikipedia.org/wiki/What%27s_Up%2C_Doc%3F_%281972_film%29) and place it in `traNNsform/input/`
2. Open the repo in your AI agent (OpenCode, Claude Code, etc.)
3. Say — or paste — this prompt:

> Run the sample workflow `workflows/samples/pdf-to-innfo-dashboard.workflow.md` on the file in `traNNsform/input/`. Read the PDF, normalize it to Markdown, analyze the content to identify film-specific concepts and create an iNNfo specialization, generate a model, and export an interactive dashboard in `traNNsform/output/`. Name the specialization `WhatsUpDoc_1972_film_V_0-1-0_spec_NN.md`, the model `WhatsUpDoc_1972_V_0-1-0_film_NN.md`, and the dashboard `WhatsUpDoc_1972_dashboard.html`.

> **Replace with your own**: Drop any Wikipedia article PDF (film, person, event, etc.) into `traNNsform/input/`, update the filename in the prompt, and the pipeline adapts the specialization to the content.

---

## Stages

### Stage 1: Ingest & normalize PDF

* _NN Ingest: Read the Wikipedia PDF via pdf-parse

**Goal**: Extract full text from the PDF and normalize to clean Markdown.

**Steps**:
1. Detect the PDF in `traNNsform/input/<source>.pdf`
2. If the agent cannot read PDF natively, use the **pdf-parse** Node.js route (the nn-trannsform skill's Capability Assessment offers this as option [b])
3. Extract: article title, infobox data (director, cast, release date, budget, box office), plot summary, production details, reception, awards
4. Normalize to structured Markdown with YAML frontmatter (source URL, sha256 hash, extracted date)

**Expected output**: Normalized Markdown file in `traNNsform/md/` with source traceability

```yaml
skill: "nn-trannsform"
template: "import.workflow.md"
input: "traNNsform/input/<source>.pdf"
output: "traNNsform/md/<source>_normalized.md"
```

---

### Stage 2: Analyze & design specialization

* _NN Analyze: Extract film-specific concepts from the content

**Goal**: Identify the structural elements of a film article and design a level-2 iNNfo specialization.

**Steps**:
1. Scan the normalized Markdown for recurring entities: film metadata (title, year, director, budget, box office), cast members (actor, role), crew (cinematographer, editor, composer), plot beats, awards, critical reception
2. Map each entity to an iNNfo concept with typed fields
3. Design the specialization frontmatter extending from a base film template (or from scratch if none exists)
4. Present the concept proposal to the user for confirmation

**Expected output**: Concept map ready for specialization authoring

```yaml
skill: "nn-innfo"
input: "traNNsform/md/<source>_normalized.md"
output: "iNNfo model (in-memory concepts)"
```

---

### Stage 3: Author specialization & model

* _NN Author: Create the specialization and model files

**Goal**: Write the specialization (level 2) and model (level 3) to disk, then validate.

**Steps**:
1. Write the specialization file: `WhatsUpDoc_1972_film_V_0-1-0_spec_NN.md`
   - Frontmatter: level 2, concepts[], markers[], matrices[]
   - Body: concept definitions with element examples from the article
2. Write the model file: `WhatsUpDoc_1972_V_0-1-0_film_NN.md`
   - Frontmatter: level 3, `parent_spec` pointing to the specialization
   - Body: `_NN` markers with actual data from the article
3. Validate the model: `validate_model({ id: "WhatsUpDoc_1972_V_0-1-0_film" })`
4. If valid, ask user about version bump; if invalid, fix errors and re-validate

**Expected output**: Validated iNNfo files on disk

```yaml
skill: "nn-innfo"
input: "concept map + normalized content"
output: ["WhatsUpDoc_1972_film_V_0-1-0_spec_NN.md", "WhatsUpDoc_1972_V_0-1-0_film_NN.md"]
```

---

### Stage 4: Export interactive dashboard

* _NN Export: Generate HTML dashboard from the model

**Goal**: Produce a standalone HTML visualizer with Chart.js showing the film's data.

**Steps**:
1. Read the model via `innfo-mcp read_model({ id: "WhatsUpDoc_1972_V_0-1-0_film" })`
2. Resolve the specialization template to get the matrix and concept structure
3. Generate a **Mustache-compatible HTML dashboard** following the iNNfo Dashboard Renderer spec:
   - Cast card grid with actor photos and character names
   - Key metrics section (budget, box office, runtime, year)
   - Awards timeline or bar chart
   - Plot summary section
   - Production credits table
4. Embed all assets as Base64 data URIs
5. Write to `traNNsform/output/WhatsUpDoc_1972_dashboard.html`

**Expected output**: Interactive dashboard HTML

```yaml
skill: "nn-trannsform"
template: "export.workflow.md"
input: "WhatsUpDoc_1972_V_0-1-0_film_NN.md"
output: "traNNsform/output/WhatsUpDoc_1972_dashboard.html"
```

---

### Stage 5: Save and confirm

* _NN Save: Persist all artifacts and report

**Goal**: Confirm all files are written and show the result to the user.

**Steps**:
1. Verify all files exist:
   - `traNNsform/md/<source>_normalized.md` (optional, can be cleaned up)
   - `WhatsUpDoc_1972_film_V_0-1-0_spec_NN.md`
   - `WhatsUpDoc_1972_V_0-1-0_film_NN.md`
   - `traNNsform/output/WhatsUpDoc_1972_dashboard.html`
2. Confirm: ✅ All artifacts written
3. Offer: "Open the dashboard in your browser, or I can adjust the specialization, add more fields, or regenerate the dashboard with a different layout"

**Expected output**: Confirmation with file listing

---

## Pipeline architecture

```
PDF (Wikipedia article)
  → [nn-trannsform] Import & normalize
      → Normalized Markdown
  → [nn-innfo] Analyze & design
      → Concept map
  → [nn-innfo] Author specialization + model
      → *_spec_NN.md + *_NN.md
  → [nn-trannsform] Export dashboard
      → dashboard.html
```

## Skills referenced

- [nn-trannsform](https://github.com/cogNNitive/actioNN/tree/main/skills/nn-trannsform) — document ingestion, normalization, and HTML export
- [nn-innfo](https://github.com/cogNNitive/actioNN/tree/main/skills/nn-innfo) — iNNfo model authoring, validation, and MCP operations
- [innfo-mcp](https://github.com/cogNNitive/cogNNitive/tree/main/packages/innfo-mcp) — deterministic iNNfo engine (spec resolution, validation, mutation)
