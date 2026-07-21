---
spec_version: "V_0-2-0"
spec_url: "https://raw.githubusercontent.com/cogNNitive/cogNNitive/v0.2.0/specs/level1/iNNfo_V_0-2-0_NN.md"
level: 3
parent_spec:
  name: "workflow_V_1-0-0"
  url: ""
type: "nn-workflow"
model_version: "V_1-0-0"
title: "Scientific Paper to YouTube Video Script"
description: "Transform a scientific PDF into a compelling YouTube video script with hook, explanation, and call to action"
---

# _NN Sample Workflow: Paper to YouTube Script

Take any scientific paper (PDF) and generate a ready-to-record YouTube video script. The agent reads the paper, extracts the core narrative, and structures it for a general audience.

**Source example**: [What makes a video go viral? — Munz et al. 2009](https://pdodds.w3.uvm.edu/files/papers/others/2009/munz2009a.pdf)

---

## What you'll get

- A **hook** that grabs attention in the first 15 seconds
- **Context** — why the research matters, framed for a non-specialist
- **Key findings** explained with analogies and visuals
- **Limitations & open questions** for intellectual honesty
- **Call to action** (subscribe, comment, related video)

---

## How to run it

1. Place the PDF (or any source document) in `traNNsform/input/`
2. Open the repo in your AI agent (OpenCode, Claude Code, etc.)
3. Say — or paste — this prompt:

> Run the sample workflow `workflows/samples/paper-to-youtube.workflow.md` on the file in `traNNsform/input/`. Read the source PDF, extract its core findings, and produce a YouTube video script in `traNNsform/output/`. The script should include: a hook, context for a general audience, key findings explained with analogies, limitations, and a call to action. Name the output `<PaperName>_youtube_script.md`.

---

## Stages

### Stage 1: Ingest source

* _NN Ingest: Read the source document

**Goal**: Load the PDF and extract its full text content.

**Steps**:
1. Read the PDF from `traNNsform/input/`
2. If the PDF is not text-extractable, ask the user to paste the text manually or provide a Markdown version
3. Extract: title, authors, abstract, paper body (introduction, methods, results, discussion, conclusion)

**Expected output**: Full text content in memory, structured by section

```yaml
input: "traNNsform/input/<source>.pdf"
output: "structured text (in-memory)"
```

---

### Stage 2: Analyze for narrative

* _NN Analyze: Extract the core narrative for a general audience

**Goal**: Identify what makes this paper interesting to a non-specialist viewer.

**Steps**:
1. Identify the **central question** the paper asks
2. Extract **key findings** (2-5 points max) — what surprised the researchers?
3. Note **methodology** at a high level (avoid jargon)
4. Identify **real-world implications** — why should the viewer care?
5. Note **limitations** — what the study doesn't prove

**Expected output**: Narrative outline with 5-7 bullet points

---

### Stage 3: Write the script

* _NN Script: Compose the YouTube script

**Goal**: Produce a ready-to-record script following YouTube conventions.

**Steps**:
1. **Hook** (0:00–0:15): Start with a provocative question or surprising stat from the paper
2. **Intro** (0:15–0:45): What is this paper about, who wrote it, why does it matter
3. **Body** (0:45–5:00): Walk through key findings with analogies and examples
   - One finding per segment (~60 seconds each)
   - Suggest visual aids (charts, comparisons, on-screen text) in `[brackets]`
4. **Limitations** (5:00–5:30): What the paper doesn't claim
5. **Outro** (5:30–6:00): Summary + call to action

**Expected output**: Full script in Markdown with timestamps and visual cues

```yaml
skill: "nn-trannsform"
input: "narrative outline"
output: "traNNsform/output/<PaperName>_youtube_script.md"
```

---

### Stage 4: Save and confirm

* _NN Save: Write the script file and report

**Goal**: Persist the script and show the result to the user.

**Steps**:
1. Write the script to `traNNsform/output/<PaperName>_youtube_script.md`
2. Confirm: ✅ `traNNsform/output/<PaperName>_youtube_script.md`
3. Offer: "Want me to adjust tone, length, or add/remove sections?"

**Expected output**: Saved Markdown file

---

## Source reference

This workflow was designed with the paper:
> Munz, P., Morin, D., & McClelland, D. (2009). *What makes a video go viral? An analysis of emotional contagion and Internet memes.*
> https://pdodds.w3.uvm.edu/files/papers/others/2009/munz2009a.pdf

You can use any other PDF or article as input — the structure works for any scientific paper.
