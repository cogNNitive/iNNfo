---
specification_version: "V_0-1-0"
specification_url: "https://raw.githubusercontent.com/cogNNitive/cogNNitive/main/specs/v0.1.0/level1/iNNfo_V_0-1-0_NN.md"
level: 3
parent_spec:
  name: "procedures_V_0-1-2"
  url: "https://raw.githubusercontent.com/cogNNitive/cogNNitive/main/specs/v0.1.0/level2/procedures/procedures_V_0-1-2_NN.md"
model_version: "V_1-0-0"
title: "Use iNNfo with AI"
---

> [!NOTE]
> This is an **iNNfo document** â€” a plain-text Markdown file that carries its own schema in the YAML frontmatter. The template definition is resolved via the parent chain and cached in the `specs/` directory. You can view and edit this model online at [format.innv0.com/app](https://format.innv0.com/app/) or contribute via the [GitHub repository](https://github.com/cogNNitive/cogNNitive).

# _NN index

* _NN index: Work
* _NN index: Roles
* _NN index: Artifact
* _NN index: Tools

# _NN Work

* _NN Work: Use iNNfo with AI
  iNNfo lets you edit and view iNNfo models both from its graphical interface and through AI agents. This procedure describes how to use **OpenCode** (the supported AI agent) to work with your models via natural language conversation, leveraging the contextual prompts the application provides.

* _NN Work: Download and install OpenCode
  ```yaml
  parent: "Use iNNfo with AI"
  step_type: task
  tool: "OpenCode"
  ```
  Download OpenCode from https://github.com/anomalyco/opencode and install it. OpenCode is the supported AI agent for iNNfo â€” it reads project skills natively and discovers them automatically.
* _NN Work: Open the workspace folder in OpenCode
  ```yaml
  parent: "Use iNNfo with AI"
  step_type: task
  input: "Workspace Folder"
  tool: "OpenCode"
  ```
  Start OpenCode in the same workspace folder you use in iNNfo. You can find the exact path at the top of the header by clicking the info icon. OpenCode works directly on the file system.
* _NN Work: Configure MCP tools
  ```yaml
  parent: "Use iNNfo with AI"
  step_type: task
  requires: MCP Server
  ```
  The first time you work with models, tell OpenCode: *"innfo: Load the nn-innfo skill and check that innfo-mcp is configured"*. The skill detects if the MCP server is set up and guides you through any steps if needed. Reference: `docs/mcp-setup.md`.
* _NN Work: Edit models via chat
  ```yaml
  parent: "Use iNNfo with AI"
  step_type: task
  input: "Model File"
  output: "Edited Model File"
  tool: "OpenCode"
  ```
  Tell OpenCode what you want to do including a reference to the skill you need, for example: *"innfo: Load the nn-innfo skill â€” I need to edit the business model and add a new concept"*. The skill reference in your message helps OpenCode discover and activate the right skill automatically. The skill provides model validation, MCP activation, and change workflows.
* _NN Work: Import documents into iNNfo models
  ```yaml
  parent: "Use iNNfo with AI"
  step_type: task
  input: "Source Documents"
  output: "iNNfo Models"
  tool: "OpenCode"
  ```
  Place the documents you want to transform in **traNNsform/input/**. Then go to the **Import** panel in iNNfo and copy the generated prompt â€” it tells OpenCode exactly what to do. The **nn-trannsform** skill handles document ingestion, normalization, and conversion.
* _NN Work: Export models as HTML visualizers
  ```yaml
  parent: "Use iNNfo with AI"
  step_type: task
  input: "Model File"
  output: "HTML Visualizer"
  tool: "OpenCode"
  ```
  Open the model you want to visualize, then go to the **Export** panel in iNNfo and copy the generated prompt. It includes the model name and instructions for OpenCode. The **nn-innfo** skill handles visualizer generation. Results appear in **traNNsform/output/**. Tell OpenCode: *"innfo: Load the nn-innfo skill â€” I need to generate an HTML visualizer following traNNsform/AGENT.md"*.
* _NN Work: Use the suggested prompts
  ```yaml
  parent: "Use iNNfo with AI"
  step_type: task
  input: "Suggested Prompts"
  ```
  When viewing a model in iNNfo, the right sidebar shows **suggested prompts** for each concept. Copy them into OpenCode to explore a specific concept or element in more detail.

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
  `_NN.md` file containing the iNNfo model. The main artifact edited and viewed both in iNNfo and through the AI agent.
* _NN Artifact: Workspace Folder
  Local folder containing the model, its templates, and associated specs. The directory you share between iNNfo and your AI agent so both work on the same files.
* _NN Artifact: Suggested Prompts
  Text snippets that appear in the iNNfo right sidebar when you select a concept. Designed to be copied and pasted into your AI agent.

# _NN Tools

* _NN Tools: OpenCode
  Supported AI agent for iNNfo. Reads project skills natively and discovers them automatically. Download: https://github.com/anomalyco/opencode

# _NN matrices: work-roles matrix

| Work \ Roles | User | AI Agent |
| :--- | :---: | :---: |
| Download and install OpenCode | Responsible | - |
| Open the workspace folder in OpenCode | Responsible | - |
| Edit models via chat | Responsible | Accountable |
| Use right sidebar prompts | Responsible | Consulted |
