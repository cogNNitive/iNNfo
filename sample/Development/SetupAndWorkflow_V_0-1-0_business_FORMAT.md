---
specification_version: "V_0-1-0"
specification_url: "https://raw.githubusercontent.com/innV0/FORMAT/main/docs/spec/V_0-1-0/_format.md"
level: 3
parent:
  name: "business_V_0-1-0"
  url: "https://raw.githubusercontent.com/innV0/cogNNitive/v0.1.0/specs/business_V_0-1-0_FORMAT.md"
model_version: "V_0-1-0"
title: "cogNNitive — Dev Setup & Workflow"
mode: "FILE"
last_saved: "2026-07-01T00:00:00.000Z"
---

> [!NOTE]
> This is a **FILE-mode** FORMAT document (business template) nested inside a FOLDER-mode node. It describes the development setup using concepts and matrices.

# _F concepts: index

* [[Development]]
  * [[Tooling]]
  * [[Workflow]]
  * [[Quality Gates]]

# _F concepts: Development

cogNNitive is a TypeScript monorepo managed with npm workspaces, following conventional commits and SDD (Specification-Driven Development) processes.

# _F concepts: Tooling

* _F Tooling: npm Workspaces
  ```yaml
  category: build
  essential: true
  ```
  Monorepo orchestration across `apps/` and `packages/`.
* _F Tooling: TypeScript
  ```yaml
  category: language
  essential: true
  ```
  Primary language for all packages and applications.
* _F Tooling: Changesets
  ```yaml
  category: versioning
  essential: false
  ```
  Automated version management and changelog generation.
* _F Tooling: OpenCode
  ```yaml
  category: ai-agent
  essential: true
  ```
  Primary agent for FORMAT model authoring and SDD workflows.

# _F concepts: Workflow

* _F Workflow: SDD Cycle
  Propose → Spec → Design → Tasks → Apply → Verify → Archive. Each change follows this formal lifecycle.
* _F Workflow: Conventional Commits
  All commits follow `type(scope): description`. No AI attribution, no Co-Authored-By.
* _F Workflow: Branch + PR
  Feature branches with small, reviewable PRs. Chained PRs for large changes.

# _F concepts: Quality Gates

* _F Quality Gates: Spec Compliance
  Documents must pass FORMAT validation against their parent template.
* _F Quality Gates: No Hallucination
  All element content must trace to a verifiable source. `#AI` tag with source link required.
* _F Quality Gates: Small Commits
  Each commit is one reviewable unit. Tests and docs ship with code.

# _F matrices: tooling-workflow matrix

| Tooling \ Workflow | SDD Cycle | Conventional Commits | Branch + PR |
| :--- | :---: | :---: | :---: |
| npm Workspaces | Neutral | Very High | Max |
| TypeScript | Max | Neutral | Neutral |
| Changesets | Low | Very High | High |
| OpenCode | Max | Very High | High |

