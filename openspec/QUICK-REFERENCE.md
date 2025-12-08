# OpenSpec Quick Reference

**One-page cheat sheet for creating valid proposals**

---

## 📋 Workflow Checklist

```
□ 1. Review context (openspec list, openspec list --specs)
□ 2. Create change directory (changes/your-change-id/)
□ 3. Write proposal.md (Why, What, Impact)
□ 4. Write spec deltas (specs/capability/spec.md)
□ 5. Write tasks.md (implementation steps)
□ 6. Write design.md (if needed - see criteria below)
□ 7. PRE-VALIDATE (checklist below)
□ 8. Run: openspec validate your-change-id --strict
□ 9. Fix errors and repeat until valid
```

---

## ⚠️ Critical Format Rules

### Every Requirement MUST Have Description Text

**✅ CORRECT:**
```markdown
### Requirement: User Authentication
The system SHALL validate user credentials before granting access.
↑ Required descriptive text between heading and scenario

#### Scenario: Valid login
- **WHEN** user provides credentials
- **THEN** access is granted
```

**❌ WRONG (will fail validation):**
```markdown
### Requirement: User Authentication

#### Scenario: Valid login  ❌ ERROR: Missing description text!
- **WHEN** user provides credentials
- **THEN** access is granted
```

**The Fix:** Always add at least one sentence describing the requirement after the heading, before any scenarios.

---

### Requirement Descriptions MUST Include SHALL/MUST

**✅ CORRECT:**
```markdown
### Requirement: User Authentication
The system SHALL validate user credentials before granting access.
↑ Includes "SHALL"
```

**❌ WRONG (will fail validation):**
```markdown
### Requirement: User Authentication
Users must log in with credentials.  ❌ Missing SHALL (lowercase "must" doesn't count)
```

### Scenarios MUST Use Exactly 4 Hashtags

**✅ CORRECT:**
```markdown
#### Scenario: Valid login
- **WHEN** user provides valid credentials
- **THEN** access is granted
```

**❌ WRONG (will fail validation):**
```markdown
- **Scenario: Valid login**  ❌ Uses bullet, not ####
**Scenario**: Valid login     ❌ Bold format, not ####
### Scenario: Valid login      ❌ Only 3 hashtags
```

---

## 📝 Spec Delta Template

```markdown
# Spec: capability-name

## Overview
Brief description of what this capability does.

## ADDED Requirements

### Requirement: Feature Name
The system SHALL/MUST provide [capability].

#### Scenario: Success case
- **WHEN** [action]
- **THEN** [expected result]

#### Scenario: Error case
- **WHEN** [invalid action]
- **THEN** [error handling]

---

## MODIFIED Requirements

### Requirement: Existing Feature Name
[FULL updated requirement text - include everything, not just changes]

#### Scenario: Updated behavior
- **WHEN** [action]
- **THEN** [new expected result]

---

## REMOVED Requirements

### Requirement: Deprecated Feature
**Reason**: [Why removing]
**Migration**: [How users should adapt]
```

---

## ✓ Pre-Validation Checklist

**Run this BEFORE `openspec validate --strict`:**

- [ ] **Requirement has description text** - Every `### Requirement:` heading MUST be followed by descriptive text before first scenario
- [ ] **Requirement descriptions have SHALL/MUST** - Every description line includes "SHALL" or "MUST" (uppercase)
- [ ] **Scenario format correct** - Use `#### Scenario: Name` (exactly 4 hashtags, not 3, not bullets)
- [ ] **Every requirement has ≥1 scenario** - At least one scenario block per requirement
- [ ] **MODIFIED requirements are complete** - Full updated content, not partial deltas
- [ ] **Delta headers correct** - Use `## ADDED Requirements`, `## MODIFIED Requirements`, etc.
- [ ] **No typos in headers** - Check spelling of "Requirements" (plural), "Scenario" (singular)

**Quick scan command:**
```bash
# Review your spec files
cat openspec/changes/your-change-id/specs/*/spec.md
```

---

## 🎯 Normative Keywords

| Keyword | Meaning | Use When |
|---------|---------|----------|
| **SHALL** | Mandatory requirement | System capabilities, features |
| **MUST** | Mandatory requirement | Validation rules, constraints |
| **SHOULD** | Recommended (optional) | Best practices, preferences |
| **MAY** | Truly optional | Nice-to-have features |

**Validation requirement:** Every `## ADDED` or `## MODIFIED` requirement MUST include SHALL or MUST.

---

## 📂 File Structure

```
openspec/changes/your-change-id/
├── proposal.md          # Required: Why, What, Impact
├── tasks.md            # Required: Implementation checklist
├── design.md           # Optional: See criteria below
└── specs/              # Required: At least one spec delta
    ├── capability-1/
    │   └── spec.md     # ADDED/MODIFIED/REMOVED requirements
    └── capability-2/
        └── spec.md
```

---

## 🤔 When to Create design.md

Create `design.md` if **ANY** of these apply:
- ✓ Cross-cutting change (multiple services/modules)
- ✓ New architectural pattern
- ✓ New external dependency
- ✓ Significant data model changes
- ✓ Security, performance, or migration complexity
- ✓ Ambiguity that needs technical decisions before coding

**Otherwise:** Skip it. Keep proposals simple.

---

## 🔍 Common Validation Errors

### Error: "ADDED requirement is missing requirement text"
**Cause:** No descriptive text between requirement heading and first scenario
**Fix:** Add at least one sentence describing the requirement:
```markdown
### Requirement: The system SHALL do X
Add this text here describing what it does!  ← Fix: Add description

#### Scenario: First scenario
```

### Error: "ADDED requirement must contain SHALL or MUST"
**Cause:** Requirement description missing normative keyword (uppercase)
**Fix:** Add "The system SHALL..." or "Users MUST..." to requirement description
```markdown
### Requirement: Authentication
The system SHALL validate credentials.  ← Fix: Add "SHALL"
```

### Error: "Requirement must have at least one scenario"
**Cause:** No `#### Scenario:` block under requirement
**Fix:** Add at least one scenario with `#### Scenario: Name`

### Error: "Invalid scenario header"
**Cause:** Scenario not using exactly 4 hashtags
**Fix:** Use `#### Scenario: Name` (not bullets, bold, or 3 hashtags)
```markdown
❌ - **Scenario: Test**   (bullet)
❌ ### Scenario: Test      (3 hashtags)
✅ #### Scenario: Test     (4 hashtags)
```

### Error: "Change must have at least one delta"
**Cause:** No spec.md files in `specs/` directory
**Fix:** Create at least one `specs/capability/spec.md` with delta operations

---

## 🚀 Quick Commands

```bash
# List active changes
openspec list

# List existing specs
openspec list --specs

# Show change details
openspec show your-change-id

# Show spec details
openspec show capability-name --type spec

# Validate (always use --strict)
openspec validate your-change-id --strict

# Debug delta parsing
openspec show your-change-id --json --deltas-only

# Archive after deployment
openspec archive your-change-id --yes
```

---

## 🎨 Change ID Naming

**Format:** `verb-noun-noun` (kebab-case)

**Good examples:**
- ✅ `add-two-factor-auth`
- ✅ `update-password-policy`
- ✅ `remove-legacy-api`
- ✅ `refactor-user-service`

**Bad examples:**
- ❌ `TwoFactorAuth` (PascalCase)
- ❌ `two_factor_auth` (snake_case)
- ❌ `auth` (not descriptive)
- ❌ `add authentication feature` (spaces)

---

## 📚 Delta Operations

| Operation | Use When | Notes |
|-----------|----------|-------|
| **ADDED** | New capability/requirement | Creates new entry in spec |
| **MODIFIED** | Changing behavior | Include FULL updated requirement |
| **REMOVED** | Deprecating feature | Include reason + migration path |
| **RENAMED** | Name change only | If changing behavior too, use RENAMED + MODIFIED |

**Critical:** MODIFIED requirements must include complete text, not just changes. At archive time, the old requirement is replaced entirely.

---

## 🎓 Example: Complete Change

**Directory structure:**
```
openspec/changes/add-password-reset/
├── proposal.md
├── tasks.md
└── specs/
    └── user-auth/
        └── spec.md
```

**specs/user-auth/spec.md:**
```markdown
## ADDED Requirements

### Requirement: Password Reset Flow
The system SHALL provide a secure password reset mechanism via email.

#### Scenario: User requests password reset
- **WHEN** user clicks "Forgot Password"
- **AND** enters registered email address
- **THEN** system sends reset link to email
- **AND** link expires after 1 hour

#### Scenario: User completes password reset
- **WHEN** user clicks valid reset link
- **AND** enters new password meeting requirements
- **THEN** password is updated
- **AND** user is redirected to login page
```

**Validate:**
```bash
openspec validate add-password-reset --strict
```

**Expected output:**
```
Change 'add-password-reset' is valid ✓
```

---

## 💡 Pro Tips

1. **Start simple** - Don't over-engineer. Add complexity only when needed.
2. **Use examples** - Copy from `add-main-ui` or `add-folder-tree-navigation` changes
3. **Validate early** - Run `openspec validate --strict` after each spec file
4. **Check existing specs** - Run `openspec list --specs` to avoid duplicates
5. **One capability per spec** - If description needs "AND", split into multiple specs
6. **Scenarios are behaviors** - Focus on user/system interaction, not implementation
7. **SHALL for capabilities** - "System SHALL display..." (features)
8. **MUST for rules** - "Input MUST be validated..." (constraints)

---

## 📞 Getting Help

- **Full docs**: `openspec/AGENTS.md`
- **Project context**: `openspec/project.md`
- **Validation errors**: `openspec validate your-change-id --strict`
- **Delta debugging**: `openspec show your-change-id --json --deltas-only`

---

**Remember:** The validator is your friend! It catches errors before code is written. ✨
