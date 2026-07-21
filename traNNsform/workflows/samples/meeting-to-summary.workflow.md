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
description: "Transform raw meeting notes or transcripts into a structured executive summary with decisions, action items, and blockers"
---

# _NN Sample Workflow: Meeting Notes to Executive Summary

Turn messy meeting notes (or a transcript) into a clean, actionable executive summary. The agent structures the content so stakeholders can scan it in 30 seconds.

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

1. Place your raw notes or transcript in `traNNsform/input/`
2. Open the repo in your AI agent (OpenCode, Claude Code, etc.)
3. Say — or paste — this prompt:

> Run the sample workflow `workflows/samples/meeting-to-summary.workflow.md` on the file in `traNNsform/input/`. Read the meeting notes, extract decisions, action items, and blockers, and produce an executive summary in `traNNsform/output/`. Name the output `<MeetingTopic>_executive_summary.md`.

---

## Stages

### Stage 1: Ingest source

* _NN Ingest: Read the raw notes or transcript

**Goal**: Load the source document and parse its structure.

**Steps**:
1. Read the file from `traNNsform/input/` (supports `.txt`, `.md`, `.docx`, `.pdf`)
2. Detect if it's a transcript (speaker turns) or raw notes (bullet points, free text)
3. Extract any metadata present: date, attendees, topic, duration

**Expected output**: Parsed content with detected structure type

```yaml
input: "traNNsform/input/<source>"
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
1. Build the header with extracted metadata (or `[Unknown]` placeholders)
2. Write a 2-3 sentence executive brief
3. Render decisions as a bullet list with context
4. Render action items as a table:

   | Owner | Task | Deadline | Status |
   |-------|------|----------|--------|
   | @alice | Ship v2.1 migration plan | 2026-08-01 | Pending |

5. Render blockers as a list with dependency notes
6. Optional: list remaining discussion topics for reference
7. Add a "Next Meeting" section with suggested agenda items based on open items

**Expected output**: Full executive summary in Markdown

```yaml
skill: "nn-trannsform"
input: "extracted lists"
output: "traNNsform/output/<MeetingTopic>_executive_summary.md"
```

---

### Stage 4: Save and confirm

* _NN Save: Write the summary and report

**Goal**: Persist the file and confirm with the user.

**Steps**:
1. Write the summary to `traNNsform/output/<MeetingTopic>_executive_summary.md`
2. Confirm: ✅ `traNNsform/output/<MeetingTopic>_executive_summary.md`
3. Offer edits: "Want me to adjust the level of detail, reformat for email, or add a timeline?"

**Expected output**: Saved Markdown file
