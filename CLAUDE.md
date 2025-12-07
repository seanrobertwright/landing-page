<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

## OpenSpec Format Rules (Critical)

When creating spec deltas in `openspec/changes/*/specs/*/spec.md`, follow these **mandatory** format rules to pass validation:

### Requirement Descriptions MUST Include SHALL/MUST

Every requirement description **MUST** contain the normative keywords "SHALL" or "MUST":

**✅ CORRECT:**
```markdown
### Requirement: User Authentication
The system SHALL validate user credentials before granting access.
```

**❌ WRONG (fails validation):**
```markdown
### Requirement: User Authentication
Users must log in with credentials.  ❌ Missing SHALL/MUST
```

### Scenarios MUST Use Exactly 4 Hashtags

Every scenario **MUST** use exactly 4 hashtags (`####`), not bullets or other formats:

**✅ CORRECT:**
```markdown
#### Scenario: Valid login
- **WHEN** user provides valid credentials
- **THEN** access is granted
```

**❌ WRONG (fails validation):**
```markdown
- **Scenario: Valid login**  ❌ Uses bullet
**Scenario**: Valid login     ❌ Bold format
### Scenario: Valid login      ❌ Only 3 hashtags
```

### Every Requirement MUST Have ≥1 Scenario

Each requirement must include at least one scenario block demonstrating the behavior.

### Before Running openspec validate

Use this pre-validation checklist:
- [ ] All requirement descriptions include "SHALL" or "MUST"
- [ ] All scenarios use `#### Scenario:` format (exactly 4 hashtags)
- [ ] Every requirement has at least one scenario
- [ ] MODIFIED requirements include complete updated content (not partial deltas)

**Quick reference:** See `openspec/QUICK-REFERENCE.md` for detailed templates and examples.

**Always validate with:** `openspec validate <change-id> --strict`

---

## Testing Best Practices

When building components with multiple interactive elements:

1. **Write tests alongside component code** to catch selector conflicts early
2. **Use specific test selectors** like `data-testid` instead of ambiguous role + name queries
3. **Avoid nested elements with same role** - nested `role="button"` creates ambiguity for tests and assistive technologies
4. **Add `data-testid` attributes proactively** to interactive elements that need direct testing