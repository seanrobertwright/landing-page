---
name: OpenSpec: Proposal
description: Scaffold a new OpenSpec change and validate strictly.
category: OpenSpec
tags: [openspec, change]
---
<!-- OPENSPEC:START -->
**Guardrails**
- Favor straightforward, minimal implementations first and add complexity only when it is requested or clearly required.
- Keep changes tightly scoped to the requested outcome.
- Refer to `openspec/AGENTS.md` (located inside the `openspec/` directory—run `ls openspec` or `openspec update` if you don't see it) if you need additional OpenSpec conventions or clarifications.
- Identify any vague or ambiguous details and ask the necessary follow-up questions before editing files.
- Do not write any code during the proposal stage. Only create design documents (proposal.md, tasks.md, design.md, and spec deltas). Implementation happens in the apply stage after approval.

**Steps**
1. Review `openspec/project.md`, run `openspec list` and `openspec list --specs`, and inspect related code or docs (e.g., via `rg`/`ls`) to ground the proposal in current behaviour; note any gaps that require clarification.
2. **Read templates first**: Review `openspec/PROPOSAL-TEMPLATE.md`, `openspec/SPEC-TEMPLATE.md`, and `openspec/TASKS-TEMPLATE.md` to understand required format and sections.
3. Choose a unique verb-led `change-id` and scaffold `proposal.md`, `tasks.md`, and `design.md` (when needed) under `openspec/changes/<id>/`. Use PROPOSAL-TEMPLATE.md as the starting point.
4. Map the change into concrete capabilities or requirements, breaking multi-scope efforts into distinct spec deltas with clear relationships and sequencing.
5. Capture architectural reasoning in `design.md` when the solution spans multiple systems, introduces new patterns, or demands trade-off discussion before committing to specs.
6. Draft spec deltas in `changes/<id>/specs/<capability>/spec.md` (one folder per capability) using `## ADDED|MODIFIED|REMOVED Requirements` with at least one `#### Scenario:` per requirement and cross-reference related capabilities when relevant. Use SPEC-TEMPLATE.md as the starting point.
7. **Validate early**: After completing the first requirement in your spec, run `openspec validate <id> --strict` to catch format errors before writing more requirements.
8. Draft `tasks.md` as an ordered list of small, verifiable work items that deliver user-visible progress, include validation (tests, tooling), and highlight dependencies or parallelizable work. Use TASKS-TEMPLATE.md as the starting point.
9. **Final validation**: Run `openspec validate <id> --strict` and resolve every issue before sharing the proposal.

**Reference**
- Use `openspec show <id> --json --deltas-only` or `openspec show <spec> --type spec` to inspect details when validation fails.
- Search existing requirements with `rg -n "Requirement:|Scenario:" openspec/specs` before writing new ones.
- Explore the codebase with `rg <keyword>`, `ls`, or direct file reads so proposals align with current implementation realities.
<!-- OPENSPEC:END -->
