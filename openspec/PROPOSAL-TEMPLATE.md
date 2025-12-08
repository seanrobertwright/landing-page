# Proposal: [Feature Name]

<!-- Copy this template when creating new change proposals -->
<!-- Replace [placeholders] with actual content -->
<!-- Delete instructional comments before finalizing -->

## Change ID
`[verb-led-kebab-case-id]`

Examples: `add-context-menus`, `update-authentication`, `remove-deprecated-api`, `refactor-database-layer`

## Why
[2-3 sentences explaining the user need or business problem this solves. Answer: Why is this change necessary? What pain point does it address? What happens if we don't do this?]

**Required**: This section is mandatory for validation. Explain the "why" before the "what".

## Summary
[1-2 sentence high-level summary of what this change adds, modifies, or removes. This should be clear enough for stakeholders who won't read the full proposal.]

## Motivation
[Detailed explanation of the current state and why it's problematic]

Currently:
- [What users have to do now]
- [Pain points or limitations]
- [Workarounds required]

This change will:
- [Primary benefit 1]
- [Primary benefit 2]
- [Primary benefit 3]

## Goals
- [Specific, measurable goal 1]
- [Specific, measurable goal 2]
- [Specific, measurable goal 3]

## Non-Goals
[What this proposal explicitly will NOT do. This helps scope the work.]

- [Out of scope item 1]
- [Out of scope item 2]
- [Future enhancement that can wait]

## Affected Components
[List the areas of the codebase or specs that will change]

- **[Component/Area 1]**: [Brief description of changes]
- **[Component/Area 2]**: [Brief description of changes]
- **[New Spec/Capability]**: [If adding new capability]

## User Impact
**Positive**:
- [Benefit 1]
- [Benefit 2]

**Neutral**:
- [Change that's neither good nor bad]

**Negative** (if any):
- [Breaking change or regression]
- [Migration required]

## Implementation Approach
[High-level technical approach - not detailed code, but the strategy]

1. [Phase 1 or major step 1]
2. [Phase 2 or major step 2]
3. [Phase 3 or major step 3]

## Testing Strategy
- **Unit Tests**: [What will be unit tested]
- **Integration Tests**: [What will be integration tested]
- **E2E Tests**: [What user flows will be tested end-to-end]
- **Manual Testing**: [What requires human verification]

## Risks and Mitigations
**Risk**: [Potential problem 1]
**Mitigation**: [How to prevent or handle it]

**Risk**: [Potential problem 2]
**Mitigation**: [How to prevent or handle it]

## Dependencies
[External dependencies, library updates, or prerequisite changes]

- [Dependency 1]
- [Dependency 2]
- [Note if no breaking changes to existing APIs]

## Success Criteria
[Checklist of outcomes that define success]

- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]
- [ ] [Measurable outcome 3]
- [ ] All tests pass (100%)
- [ ] Build succeeds with zero errors

---

## Checklist Before Submitting

Before running `openspec validate`, ensure:

- [ ] "Why" section clearly explains the user need or business problem
- [ ] Change ID follows verb-led kebab-case convention
- [ ] Summary is clear and concise (1-2 sentences)
- [ ] Goals are specific and measurable
- [ ] Non-goals explicitly scope out future work
- [ ] Affected components list is complete
- [ ] User impact (positive/neutral/negative) is considered
- [ ] Risks have mitigations
- [ ] Success criteria are measurable
- [ ] `tasks.md` created with detailed work items
- [ ] `design.md` created if architectural decisions needed
- [ ] Spec deltas created in `specs/[capability]/spec.md`
- [ ] All spec deltas follow SPEC-TEMPLATE.md format
- [ ] Ran `openspec validate [change-id] --strict` and all checks pass

---

## Examples

### Good "Why" Section
```markdown
## Why
Users currently cannot organize their bookmarks without manual database editing,
which is error-prone and doesn't persist visual order. The sort_order field exists
but has no UI to change it. This prevents users from maintaining a logical structure
as their collection grows, leading to frustration and reduced app usability.
```

### Bad "Why" Section (Too Vague)
```markdown
## Why
We should add drag and drop because it's a common feature.
```

### Good Change ID
- `add-context-menus` ✅
- `update-drag-drop-performance` ✅
- `remove-deprecated-api-v1` ✅

### Bad Change ID
- `context-menus` ❌ (missing verb)
- `feature123` ❌ (not descriptive)
- `AddContextMenus` ❌ (not kebab-case)

---

## See Also

- `openspec/SPEC-TEMPLATE.md` - Format for spec deltas
- `openspec/TASKS-TEMPLATE.md` - Format for tasks breakdown
- `openspec/AGENTS.md` - Complete OpenSpec workflow guide
- `openspec/QUICK-REFERENCE.md` - Quick reference for OpenSpec commands
