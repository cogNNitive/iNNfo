---
specification_version: "V_0-3-0"
specification_url: "https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level1/iNNfo_NN.md"
level: 3
parent_spec:
  name: "trannsform_V_0-1-0"
  url: "https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level2/trannsform/trannsform_NN.md"
model_version: "V_0-1-0"
title: "Acme Workspace Provenance"
---

> [!NOTE]
> This is an **iNNfo document** — a plain-text Markdown file. Open it with any text editor or view and edit it with [cogNNitive](https://innfo.cognnitive.com/app/innfo-doc).

# NN index

* [[Sources]]
* [[Procedures]]
* [[Models]]
* [[Artifacts]]

# NN Sources

## NN Sources: market-report.docx
raw_filename:: raw/market-report.docx
raw_hash:: sha256:1f3a9c0b7d2e4f61a8c5b0e2d3f4a5b6c7d8e9f0a1b2c3d4e5f60718293a4b5c6
size:: 48213
source_format:: docx
normalized_at:: 2026-08-01T10:12:00Z
normalized_by:: traNNsform v1.5
normalized_content:: market-report.md
Q3 market study covering segments, competitors, and pricing benchmarks.

## NN Sources: customer-interviews.pdf
raw_filename:: raw/customer-interviews.pdf
raw_hash:: sha256:9a8b7c6d5e4f30211f2e3d4c5b6a79880f1e2d3c4b5a69788f0e1d2c3b4a59687
size:: 132904
source_format:: pdf
normalized_at:: 2026-08-01T10:12:40Z
normalized_by:: traNNsform v1.5
normalized_content:: customer-interviews.md
Twelve onboarding interviews transcribed and normalized for analysis.

# NN Procedures

## NN Procedures: Business ingest 2026-08-01
procedure_ref:: procedures/Document_Ingest_V_1-0-0_procedures_NN.md
agent:: actioNN nn-trannsform + Claude
run_at:: 2026-08-01T10:15:00Z
Ingests the two raw sources and produces the Acme Business Plan model.

## NN Procedures: Deliverables build 2026-08-01
procedure_ref:: procedures/Deliverables_Build_V_1-0-0_procedures_NN.md
agent:: actioNN nn-trannsform + Claude
run_at:: 2026-08-01T11:40:00Z
Generates the deliverables: an executive summary from the model and a metrics board from a source.

# NN Models

## NN Models: Acme Business Plan
model_ref:: ./Acme%20Business%20Plan_V_0-1-0_business_NN.md
model_template:: business
model_version:: V_0-1-0
derived_from:: [market-report.docx, customer-interviews.pdf]
generated_by:: [Business ingest 2026-08-01]
The structured level-3 business model produced from both sources.

# NN Artifacts

## NN Artifacts: Executive Summary
artifact_format:: document
artifact_version:: V_0-1-0
location:: artifacts/Executive_Summary_V_0-1-0.md
artifact_hash:: sha256:0011223344556677889900aabbccddeeff00112233445566778899aabbccddee
derived_from_inputs:: [Acme Business Plan]
produced_by:: [Deliverables build 2026-08-01]
A clean executive summary derived from the business model.

## NN Artifacts: Onboarding Metrics Board
artifact_format:: board
artifact_version:: V_0-1-0
location:: artifacts/Onboarding_Metrics_Board_V_0-1-0.md
derived_from_inputs:: [customer-interviews.pdf]
produced_by:: [Deliverables build 2026-08-01]
A metrics board derived directly from the interview source (bypassing the model) — illustrating the lineage DAG.

# NN matrices: Artifact-Source Lineage

| Artifacts \ Sources | market-report.docx | customer-interviews.pdf |
| :--- | :---: | :---: |
| Executive Summary | - | - |
| Onboarding Metrics Board | - | X |

# NN matrices: item-markers matrix

| Item \ Marker | verified |
| :--- | :---: |
| market-report.docx | X |
| customer-interviews.pdf | X |
| Acme Business Plan | X |
