---
spec_version: "V_0-2-0"
spec_url: "https://raw.githubusercontent.com/cogNNitive/cogNNitive/v0.2.0/specs/level1/iNNfo_V_0-2-0_NN.md"
level: 3
parent_spec:
  name: "workflow_V_1-0-0"
  url: ""
type: "nn-workflow"
model_version: "V_1-0-0"
title: "Meeting Notes to Executive Summary"
description: "Transform a YouTube video transcript into a structured executive summary with decisions, action items, and blockers — using the 'Better Off Ted — Let's Do It' scene as sample input"
---

# _NN Sample Workflow: Meeting Notes to Executive Summary

Turn a YouTube video transcript into a clean, actionable executive summary. The agent structures the content so stakeholders can scan it in 30 seconds.

This sample uses the transcript of the **"Better Off Ted — Let's Do It"** scene ([YouTube](https://www.youtube.com/watch?v=NeFafCEqeh0)) — a meeting where Phil presents the Viridian solar-powered oven project with increasingly absurd problems.

---

## What you'll get

- **Header metadata**: date, topic, attendees, duration
- **Executive brief**: 2-3 sentence summary of what happened
- **Decisions made**: what was agreed, by whom
- **Action items**: owner, task, deadline (table format)
- **Blockers & risks**: what's stuck and what it depends on
- **Next meeting**: proposed agenda items

---

## How to run it

1. The sample transcript is already in `traNNsform/input/better-off-ted-lets-do-it_source_NN.md`
2. Open the repo in your AI agent (OpenCode, Claude Code, etc.)
3. Say — or paste — this prompt:

> Run the sample workflow `workflows/samples/meeting-to-summary.workflow.md` on `traNNsform/input/better-off-ted-lets-do-it_source_NN.md`. Read the meeting transcript, extract decisions, action items, and blockers, and produce an executive summary in `traNNsform/output/`. Name the output `BetterOffTed_executive_summary.md`.

> **Replace with your own**: Drop any other transcript (meeting, talk, podcast) into `traNNsform/input/` and update the filename in the prompt.

---

## Stages

### Stage 1: Ingest source

* _NN Ingest: Read the YouTube transcript

**Goal**: Load the transcript and parse its structure.

**Steps**:
1. Read the file from `traNNsform/input/` (the sample is `better-off-ted-lets-do-it_source_NN.md`)
2. Detect it as a transcript with speaker turns, timestamps, and dialogue
3. Extract metadata: source URL (`https://www.youtube.com/watch?v=NeFafCEqeh0`), duration (`0:56`), show (`Better Off Ted`)

**Expected output**: Parsed content with detected structure type

```yaml
input: "traNNsform/input/better-off-ted-lets-do-it_source_NN.md"
output: "structured text (in-memory)"
```

---

### Stage 2: Extract decisions, actions, and blockers

* _NN Extract: Identify the three key signal types from the noise

**Goal**: Separate signal (decisions, action items, blockers) from noise (discussion, digressions, filler).

**Steps**:
1. Scan for **decisions** — look for: "we agreed", "decided", "let's go with", "approved", "signed off"
2. Scan for **action items** — look for: "[name] will", "todo", "follow up", "assign", "deadline"
3. Scan for **blockers & risks** — look for: "blocked", "waiting on", "risk", "concern", "depends on"
4. Group remaining content into **discussion topics** with a 1-2 sentence summary each

**Expected output**: Four lists (decisions, actions, blockers, discussion topics)

---

### Stage 3: Write the executive summary

* _NN Summarize: Compose the structured summary document

**Goal**: Produce a clean, stakeholder-ready Markdown file.

**Steps**:
1. Build the header with extracted metadata (source YouTube URL, duration, show name)
2. Write a 2-3 sentence executive brief capturing the absurd situation
3. Render decisions as a bullet list with context
4. Render action items as a table:

   | Owner | Task | Deadline | Status |
   |-------|------|----------|--------|
   | @phil | Fix plastic toxicity in solar ovens | TBD | Investigating |

5. Render blockers as a list with dependency notes (e.g. blocked by physics — sunlight triggers both the oven function AND the toxin release)
6. Optional: list remaining discussion topics for reference
7. Add a "Next Meeting" section with suggested agenda items based on open items

**Expected output**: Full executive summary in Markdown

```yaml
skill: "nn-trannsform"
input: "extracted lists"
output: "traNNsform/output/BetterOffTed_executive_summary.md"
```

---

### Stage 4: Save and confirm

* _NN Save: Write the summary and report

**Goal**: Persist the file and confirm with the user.

**Steps**:
1. Write the summary to `traNNsform/output/BetterOffTed_executive_summary.md`
2. Confirm: ✅ `traNNsform/output/BetterOffTed_executive_summary.md`
3. Offer edits: "Want me to adjust the level of detail, reformat for email, or add a timeline?"

**Expected output**: Saved Markdown file
