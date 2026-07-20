---
specification_version: "V_0-2-0"
specification_url: "https://raw.githubusercontent.com/innV0/iNNfo/main/specs/v0.2.0/level1/iNNfo_V_0-2-0_NN.md"
level: 3
parent_spec:
  name: "organization_V_0-2-0"
  url: "https://raw.githubusercontent.com/innV0/iNNfo/main/specs/v0.2.0/level2/organization/organization_V_0-2-0_NN.md"
model_version: "V_1-0-0"
title: "Engineering Team"
---

> [!NOTE]
> This is an **iNNfo document** â€” a plain-text Markdown file that carries its own schema in the YAML frontmatter. The template definition is resolved via the parent chain and cached in the `specs/` directory. You can view and edit this model online at [format.innv0.com/app](https://format.innv0.com/app/) or contribute via the [GitHub repository](https://github.com/innV0/iNNfo).

# _NN index

* [[Organization]]
* [[Roles]]
* [[Position]]
* [[Person]]

# _NN Organization

The Core Engineering Team at Acme Corp, responsible for building and maintaining the primary platform APIs, databases, and frontend interfaces.

# _NN Roles

* _NN Roles: Developer
  ```yaml
  scope: internal
  ```
  Writes code, builds features, and maintains software services.
* _NN Roles: QA Engineer
  ```yaml
  scope: internal
  ```
  Designs test plans, executes tests, and verifies releases.
* _NN Roles: Tech Lead
  ```yaml
  scope: internal
  ```
  Architects solutions, conducts code reviews, and guides engineering decisions.

# _NN Position

* _NN Position: Senior Developer
  Senior software engineering seat focused on core backend services.
* _NN Position: Junior Developer
  Associate software engineering seat assisting with feature delivery.
* _NN Position: Lead Tester
  Senior QA seat responsible for overall quality control and validation strategies.
* _NN Position: Team Tech Lead
  Leadership seat responsible for technical architecture and delivery of the team.

# _NN Person

* _NN Person: Alice Smith
  Senior engineer with extensive experience in distributed systems.
* _NN Person: Bob Jones
  Junior engineer who recently joined the platform team.
* _NN Person: Charlie Brown
  Experienced tester specializing in automated end-to-end testing.
* _NN Person: Diana Prince
  Senior architect and team technical leader.

# _NN matrices: positions-roles matrix

| Position \ Roles | Developer | QA Engineer | Tech Lead |
| :--- | :---: | :---: | :---: |
| Senior Developer | Assumes | - | - |
| Junior Developer | Assumes | - | - |
| Lead Tester | - | Assumes | - |
| Team Tech Lead | Assumes | - | Assumes |

# _NN matrices: persons-positions matrix

| Person \ Position | Senior Developer | Junior Developer | Lead Tester | Team Tech Lead |
| :--- | :---: | :---: | :---: | :---: |
| Alice Smith | Occupies | - | - | - |
| Bob Jones | - | Occupies | - | - |
| Charlie Brown | - | - | Occupies | - |
| Diana Prince | - | - | - | Occupies |
