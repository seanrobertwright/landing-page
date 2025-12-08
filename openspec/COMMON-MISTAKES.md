# Common OpenSpec Mistakes & Solutions

## ❌ Mistake #1: Using Non-Existent `openspec proposal` Command

### The Error:
```bash
$ openspec proposal add-my-feature
error: unknown command 'proposal'
```

### Why It Happens:
There is **NO `openspec proposal` command**. The OpenSpec CLI does not provide a scaffolding command for creating proposals.

### ✅ Solution:
Manually create the directory structure and files:

```bash
# Step 1: Create directory structure
mkdir -p "openspec/changes/add-my-feature/specs/my-capability"

# Step 2: Create required files (use your code editor or Write tool)
# - openspec/changes/add-my-feature/proposal.md
# - openspec/changes/add-my-feature/tasks.md
# - openspec/changes/add-my-feature/design.md (optional)
# - openspec/changes/add-my-feature/specs/my-capability/spec.md

# Step 3: Validate
openspec validate add-my-feature --strict
```

### Available Commands:
```bash
openspec list                    # List changes
openspec list --specs            # List specs
openspec validate <id> --strict  # Validate a change
openspec show <id>               # Show change details
openspec archive <id>            # Archive completed change
```

---

## ❌ Mistake #2: Missing Description Text in Requirements

### The Error:
```
Validation failed: Requirement heading must be followed by descriptive text
```

### Why It Happens:
Requirements need description text between the heading and the first scenario.

### ✅ Solution:
```markdown
### Requirement: The system SHALL validate email addresses
The system SHALL validate email addresses using RFC 5322 format before registration.

#### Scenario: Valid email
- **WHEN** user enters "user@example.com"
- **THEN** the system accepts it
```

---

## ❌ Mistake #3: Lowercase "must" Instead of "MUST" or "SHALL"

### The Error:
```
Validation failed: Requirement description must contain SHALL or MUST (uppercase)
```

### ✅ Solution:
Use uppercase "SHALL" or "MUST" in requirement descriptions:
```markdown
The system SHALL validate... ✅
The system MUST validate... ✅
The system must validate... ❌
```

---

## ❌ Mistake #4: Wrong Number of Hashtags for Scenarios

### The Error:
```
Validation failed: Scenarios must use exactly 4 hashtags (####)
```

### ✅ Solution:
```markdown
#### Scenario: Valid input  ✅
### Scenario: Valid input   ❌ (3 hashtags)
##### Scenario: Valid input ❌ (5 hashtags)
```

---

## ❌ Mistake #5: Trying to Run Implementation Before Validation

### The Error:
Implementing code before validating the proposal, leading to rework.

### ✅ Solution:
Always follow the correct sequence:
1. Create proposal files manually
2. Run `openspec validate <id> --strict`
3. Fix all validation errors
4. **Then** start implementation with `/openspec:apply <id>`

---

## Quick Reference: Correct Workflow

```bash
# 1. Create proposal (MANUAL - no command for this!)
mkdir -p "openspec/changes/<id>/specs/<capability>"
# Use Write tool to create proposal.md, tasks.md, design.md, spec.md

# 2. Validate early and often
openspec validate <id> --strict

# 3. Fix errors and re-validate
openspec validate <id> --strict

# 4. After approval, implement
# Use slash command: /openspec:apply <id>

# 5. After completion, archive
openspec archive <id>
```

---

## Common Command Mistakes

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `openspec proposal <id>` | Manually create files |
| `openspec create <id>` | Manually create files |
| `openspec new <id>` | Manually create files |
| `openspec scaffold <id>` | Manually create files |
| `openspec init <id>` | `mkdir -p openspec/changes/<id>` |

**Remember**: OpenSpec is a **validation and tracking tool**, not a scaffolding tool. You create files manually, then validate them.
