---
specification_version: "V_0-1-0"
specification_url: "https://raw.githubusercontent.com/innV0/cogNNitive/main/specs/v0.1.0/level1/iNNfo_V_0-1-0_NN.md"
level: 3
parent_spec:
  name: "procedures_V_0-1-2"
  url: "https://raw.githubusercontent.com/innV0/cogNNitive/main/specs/v0.1.0/level2/procedures/procedures_V_0-1-2_NN.md"
model_version: "V_1-0-0"
title: "Use cogNNitive with AI"
---

> [!NOTE]
> This is an **iNNfo document** — a plain-text Markdown file that carries its own schema in the YAML frontmatter. The template definition is resolved via the parent chain and cached in the `specs/` directory.

# _NN index

* _NN index: Work
* _NN index: Roles
* _NN index: Artifact
* _NN index: Tools

# _NN Work

* _NN Work: Use cogNNitive with AI
  cogNNitive lets you edit and view iNNfo models both from its graphical interface and through AI agents. This procedure describes how to set up and use tools like anti-gravity, Claude Code, or OpenCode to work with your models via natural language conversation, leveraging the contextual prompts the application provides.

* _NN Work: Download and choose an AI agent
  ```yaml
  parent: "Use cogNNitive with AI"
  step_type: task
  tool: "anti-gravity"
  ```
  Download and choose one of these tools: **anti-gravity**, **Claude Code**, or **OpenCode**. You can use their desktop, CLI, or TUI versions. Pick the one you know best. We recommend Claude Code by default — it has a generous free tier.
* _NN Work: Open the workspace folder in your AI agent
  ```yaml
  parent: "Use cogNNitive with AI"
  step_type: task
  input: "Workspace Folder"
  tool: "Claude Code"
  ```
  Add a workspace pointing to the same folder you use in cogNNitive. You can find the exact path at the top of the header by clicking the info icon. All mentioned agents work directly on the file system.
* _NN Work: Configure MCP tools
  ```yaml
  parent: "Use cogNNitive with AI"
  step_type: task
  requires: MCP Server
  ```
  Your agent needs the **innfo-mcp** server to validate model structure and apply changes correctly. When you say *"I want to edit a model"*, the agent will run the MCP Activation Protocol: check if the tools are available, locate or create the config for your client, and guide you through any reload steps if needed. Reference: `docs/mcp-setup.md`.
* _NN Work: Edit models via chat
  ```yaml
  parent: "Use cogNNitive with AI"
  step_type: task
  input: "Model File"
  output: "Edited Model File"
  tool: "Claude Code"
  ```
  Once configured, just say: *"I want to edit a model in the chat"*. The agent will activate and you can request modifications in natural language: add concepts, change fields, restructure sections, and more.
* _NN Work: Use right sidebar prompts to go deeper
  ```yaml
  parent: "Use cogNNitive with AI"
  step_type: task
  input: "Suggested Prompts"
  ```
  When viewing a model in cogNNitive, the right sidebar shows **suggested prompts** for each concept. Copy and paste them into your AI agent to dive deeper into that specific concept or element.

# _NN Roles

* _NN Roles: User
  ```yaml
  scope: internal
  ```
  Person who directs model editing. Describes the changes they want in natural language and the agent executes them.
* _NN Roles: AI Agent
  ```yaml
  scope: external
  ```
  AI agent that interprets user instructions and modifies model files directly on the file system.

# _NN Artifact

* _NN Artifact: Model File
  `_NN.md` file containing the iNNfo model. The main artifact edited and viewed both in cogNNitive and through the AI agent.
* _NN Artifact: Workspace Folder
  Local folder containing the model, its templates, and associated specs. The directory you share between cogNNitive and your AI agent so both work on the same files.
* _NN Artifact: Suggested Prompts
  Text snippets that appear in the cogNNitive right sidebar when you select a concept. Designed to be copied and pasted into your AI agent.

# _NN Tools

* _NN Tools: anti-gravity
  AI tool for model editing. Download: https://docs.antigravity.ai
* _NN Tools: Claude Code
  Recommended AI agent for working with iNNfo models. Generous free tier. Download: https://docs.anthropic.com/en/docs/claude-code/overview
* _NN Tools: OpenCode
  AI TUI/CLI client for editing code and models. Download: https://github.com/anomalyco/opencode

# _NN matrices: work-roles matrix

| Work \ Roles | User | AI Agent |
| :--- | :---: | :---: |
| Download and choose an AI agent | Responsible | - |
| Open the workspace folder in your AI agent | Responsible | - |
| Edit models via chat | Responsible | Accountable |
| Use right sidebar prompts | Responsible | Consulted |
