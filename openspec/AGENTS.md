# OpenSpec Instructions

Instructions for AI coding assistants using OpenSpec for spec-driven development.

## TL;DR Quick Checklist

- Search existing work: `openspec spec list --long`, `openspec list` (use `rg` only for full-text search)
- Decide scope: new capability vs modify existing capability
- Pick a unique `change-id`: kebab-case, verb-led (`add-`, `update-`, `remove-`, `refactor-`)
- Scaffold: `proposal.md`, `tasks.md`, `design.md` (only if needed), and delta specs per affected capability
- Write deltas: use `## ADDED|MODIFIED|REMOVED|RENAMED Requirements`; include at least one `#### Scenario:` per requirement
- Validate: `openspec validate [change-id] --strict` and fix issues
- Request approval: Do not start implementation until proposal is approved

## Three-Stage Workflow

### Stage 1: Creating Changes
Create proposal when you need to:
- Add features or functionality
- Make breaking changes (API, schema)
- Change architecture or patterns  
- Optimize performance (changes behavior)
- Update security patterns

Triggers (examples):
- "Help me create a change proposal"
- "Help me plan a change"
- "Help me create a proposal"
- "I want to create a spec proposal"
- "I want to create a spec"

Loose matching guidance:
- Contains one of: `proposal`, `change`, `spec`
- With one of: `create`, `plan`, `make`, `start`, `help`

Skip proposal for:
- Bug fixes (restore intended behavior)
- Typos, formatting, comments
- Dependency updates (non-breaking)
- Configuration changes
- Tests for existing behavior

**Workflow**
1. Review `openspec/project.md`, `openspec list`, and `openspec list --specs` to understand current context.
2. Choose a unique verb-led `change-id` and scaffold `proposal.md`, `tasks.md`, optional `design.md`, and spec deltas under `openspec/changes/<id>/`.
3. Draft spec deltas using `## ADDED|MODIFIED|REMOVED Requirements` with at least one `#### Scenario:` per requirement.
4. **Validate early and often:**
   - After writing the FIRST requirement, run `openspec validate <id> --strict` immediately
   - If validation fails, fix the format pattern once (this prevents repeating errors across all requirements)
   - Apply the correct pattern to remaining requirements
   - Validate again after completing all requirements
5. **Verify format** - Check that all requirements include "SHALL" or "MUST" and scenarios use `#### Scenario:` format.
6. Run final `openspec validate <id> --strict` and resolve any issues before sharing the proposal.

### Stage 2: Implementing Changes
Track these steps as TODOs and complete them one by one.
1. **Read proposal.md** - Understand what's being built
2. **Read design.md** (if exists) - Review technical decisions
3. **Read tasks.md** - Get implementation checklist
4. **Implement tasks sequentially** - Complete in order
5. **Run verification checks** - Before marking anything complete:
   - [ ] Run full test suite: ALL tests must pass (100%, no exceptions)
   - [ ] Run production build: Must succeed with zero errors
   - [ ] Check TypeScript: Must compile with no errors
   - [ ] Manual verification: Test critical paths in browser/app
6. **Fix all failures** - If ANY check fails:
   - Do NOT mark tasks as complete
   - Investigate root cause of each failure
   - Fix the issue completely
   - Re-run ALL verification checks
   - Repeat until 100% pass rate achieved
7. **Confirm completion** - Only after all verifications pass:
   - Ensure every item in `tasks.md` is actually finished
   - Verify the definition of "complete" below is satisfied
8. **Update checklist** - ONLY after all quality gates pass:
   - Set every completed task to `- [x]`
   - The checklist must reflect reality
   - Never mark tasks complete if verification failed
   - If you marked tasks complete prematurely, revert to `- [ ]` and fix issues
9. **Approval gate** - Do not start implementation until the proposal is reviewed and approved

#### Definition of "Complete"

A task is ONLY complete when ALL of the following are true:
1. ✅ Code is written and implements the requirement
2. ✅ All tests pass (100% - no exceptions for "minor" failures)
3. ✅ Build succeeds with zero errors
4. ✅ TypeScript compilation passes with no errors
5. ✅ Linting passes (if project has linting)
6. ✅ No console errors during manual testing (if applicable)

**CRITICAL**: Never mark a task as complete if ANY test is failing, even if:
- The test "seems minor"
- The test "might be timing-related"
- "Most tests pass"
- "The build works anyway"

A single failing test indicates incomplete work that must be fixed.

#### Pre-Completion Quality Gate

Before updating `tasks.md` to mark items complete, verify:

**Required Checks (ALL must pass):**
- [ ] `npm test` or equivalent: **100% tests passing**
- [ ] `npm run build` or equivalent: **Zero errors**
- [ ] TypeScript compilation: **Zero errors**
- [ ] Manual testing: **Core functionality works**
- [ ] No regressions: **Existing features still work**

**Red Flags (If ANY are true, DO NOT mark complete):**
- ❌ "Most tests pass" (if not 100%, it's not done)
- ❌ "Build works but tests fail" (tests must pass)
- ❌ "Minor timing issues" (investigate and fix)
- ❌ "Probably not important" (every failure is important)
- ❌ "Will fix later" (fix now, before marking complete)

**If any check fails:**
1. Stop and investigate the root cause
2. Fix the issue completely
3. Re-run ALL checks
4. Only proceed when everything passes

#### Examples: Wrong vs. Right Completion

**❌ Bad Example: Premature Completion**
```
Agent: "The build passes and most tests work. I'll mark the implementation
complete. The 4 failing tests seem minor and timing-related."

✗ Only 29/37 tests passing (78%)
✗ Dismissed failures without investigation
✗ Marked all tasks complete anyway
✗ Told user implementation was ready
```

**Why this is wrong:**
- 78% is not acceptable (100% is the standard)
- "Timing-related" is an assumption, not a diagnosis
- Marking complete before fixing creates false impression
- User receives broken implementation

**✅ Good Example: Proper Completion**
```
Agent: "Build passes but 4 tests are failing. Let me investigate..."

✓ Investigates each failure
✓ Finds root causes (invalid UUID, missing DialogDescription, etc.)
✓ Fixes all issues
✓ Re-runs tests: 37/37 passing (100%)
✓ Re-runs build: Success
✓ THEN marks tasks complete
```

**Why this is right:**
- Every failure investigated and fixed
- 100% verification before completion claim
- User receives fully working implementation
- Builds trust through reliability

**Common Failure Patterns to Recognize:**

**Pattern: "Most tests pass"**
- If you think "29/37 is pretty good": STOP
- 78% is failure, not success
- Every failing test must be fixed

**Pattern: "Probably just timing"**
- If you assume cause without investigating: STOP
- Always investigate actual root cause
- Fix the real issue, don't dismiss

**Pattern: "Minor failures"**
- If you think some failures don't matter: STOP
- All failures matter equally
- Fix everything before claiming done

### Stage 3: Archiving Changes
After deployment, create separate PR to:
- Move `changes/[name]/` → `changes/archive/YYYY-MM-DD-[name]/`
- Update `specs/` if capabilities changed
- Use `openspec archive <change-id> --skip-specs --yes` for tooling-only changes (always pass the change ID explicitly)
- Run `openspec validate --strict` to confirm the archived change passes checks

## Before Any Task

**Context Checklist:**
- [ ] Read relevant specs in `specs/[capability]/spec.md`
- [ ] Check pending changes in `changes/` for conflicts
- [ ] Read `openspec/project.md` for conventions
- [ ] Run `openspec list` to see active changes
- [ ] Run `openspec list --specs` to see existing capabilities

**Before Creating Specs:**
- Always check if capability already exists
- Prefer modifying existing specs over creating duplicates
- Use `openspec show [spec]` to review current state
- If request is ambiguous, ask 1–2 clarifying questions before scaffolding

### Search Guidance
- Enumerate specs: `openspec spec list --long` (or `--json` for scripts)
- Enumerate changes: `openspec list` (or `openspec change list --json` - deprecated but available)
- Show details:
  - Spec: `openspec show <spec-id> --type spec` (use `--json` for filters)
  - Change: `openspec show <change-id> --json --deltas-only`
- Full-text search (use ripgrep): `rg -n "Requirement:|Scenario:" openspec/specs`

## Quick Start

### CLI Commands

```bash
# Essential commands
openspec list                  # List active changes
openspec list --specs          # List specifications
openspec show [item]           # Display change or spec
openspec validate [item]       # Validate changes or specs
openspec archive <change-id> [--yes|-y]   # Archive after deployment (add --yes for non-interactive runs)

# Project management
openspec init [path]           # Initialize OpenSpec
openspec update [path]         # Update instruction files

# Interactive mode
openspec show                  # Prompts for selection
openspec validate              # Bulk validation mode

# Debugging
openspec show [change] --json --deltas-only
openspec validate [change] --strict
```

### Command Flags

- `--json` - Machine-readable output
- `--type change|spec` - Disambiguate items
- `--strict` - Comprehensive validation
- `--no-interactive` - Disable prompts
- `--skip-specs` - Archive without spec updates
- `--yes`/`-y` - Skip confirmation prompts (non-interactive archive)

## Directory Structure

```
openspec/
├── project.md              # Project conventions
├── specs/                  # Current truth - what IS built
│   └── [capability]/       # Single focused capability
│       ├── spec.md         # Requirements and scenarios
│       └── design.md       # Technical patterns
├── changes/                # Proposals - what SHOULD change
│   ├── [change-name]/
│   │   ├── proposal.md     # Why, what, impact
│   │   ├── tasks.md        # Implementation checklist
│   │   ├── design.md       # Technical decisions (optional; see criteria)
│   │   └── specs/          # Delta changes
│   │       └── [capability]/
│   │           └── spec.md # ADDED/MODIFIED/REMOVED
│   └── archive/            # Completed changes
```

## Creating Change Proposals

### Decision Tree

```
New request?
├─ Bug fix restoring spec behavior? → Fix directly
├─ Typo/format/comment? → Fix directly  
├─ New feature/capability? → Create proposal
├─ Breaking change? → Create proposal
├─ Architecture change? → Create proposal
└─ Unclear? → Create proposal (safer)
```

### Proposal Structure

1. **Create directory:** `changes/[change-id]/` (kebab-case, verb-led, unique)

2. **Write proposal.md:**
```markdown
# Change: [Brief description of change]

## Why
[1-2 sentences on problem/opportunity]

## What Changes
- [Bullet list of changes]
- [Mark breaking changes with **BREAKING**]

## Impact
- Affected specs: [list capabilities]
- Affected code: [key files/systems]
```

3. **Create spec deltas:** `specs/[capability]/spec.md`

**⚠️ CRITICAL FORMAT RULES (validated by `openspec validate --strict`):**
- Every requirement description **MUST** include "SHALL" or "MUST" (normative keywords)
- Every requirement **MUST** have at least one `#### Scenario:` block (exactly 4 hashtags)
- Scenarios describe behavior, not implementation

**CORRECT FORMAT:**
```markdown
## ADDED Requirements
### Requirement: User Authentication
The system SHALL validate user credentials before granting access.

#### Scenario: Valid login
- **WHEN** user provides valid credentials
- **THEN** access is granted
```

**INCORRECT FORMAT (will fail validation):**
```markdown
## ADDED Requirements
### Requirement: User Authentication
Users must log in with credentials.  ❌ Missing SHALL/MUST

- **Scenario: Valid login**  ❌ Wrong format (uses bullet)
```

**Full Template:**
```markdown
## ADDED Requirements
### Requirement: New Feature
The system SHALL provide...

#### Scenario: Success case
- **WHEN** user performs action
- **THEN** expected result

## MODIFIED Requirements
### Requirement: Existing Feature
[Complete modified requirement]

## REMOVED Requirements
### Requirement: Old Feature
**Reason**: [Why removing]
**Migration**: [How to handle]
```
If multiple capabilities are affected, create multiple delta files under `changes/[change-id]/specs/<capability>/spec.md`—one per capability.

4. **Create tasks.md:**

Use the template at `openspec/TASKS-TEMPLATE.md` or follow this structure:

```markdown
## 1. Implementation
- [ ] 1.1 Create database schema
- [ ] 1.2 Implement API endpoint
- [ ] 1.3 Add frontend component

## 2. Testing
- [ ] 2.1 Write unit tests
- [ ] 2.2 Write integration tests

## 3. Documentation
- [ ] 3.1 Add JSDoc comments
- [ ] 3.2 Update relevant docs

## N. Final Verification (REQUIRED)
- [ ] N.1 Run full test suite: 100% tests passing
- [ ] N.2 Run production build: Zero errors
- [ ] N.3 Run TypeScript compiler: Zero errors
- [ ] N.4 Manual testing: Core functionality works
- [ ] N.5 All verification checks pass
```

**IMPORTANT**: The final verification section (N) is mandatory. Always include it to ensure proper quality gates before marking tasks complete. See `openspec/TASKS-TEMPLATE.md` for the complete template with detailed verification checklist.

5. **Pre-validation checklist (before running `openspec validate`):**

Before validating your proposal, verify these common format requirements:

- [ ] **Requirement descriptions include SHALL/MUST** - Every requirement under `## ADDED/MODIFIED Requirements` must contain "SHALL" or "MUST"
- [ ] **Scenario format is correct** - Use `#### Scenario: Name` (exactly 4 hashtags, not bullets or bold)
- [ ] **Every requirement has scenarios** - At least one scenario per requirement
- [ ] **MODIFIED requirements are complete** - Include full updated content, not just changes
- [ ] **Delta headers are correct** - Use `## ADDED Requirements`, `## MODIFIED Requirements`, etc.

**Quick self-check command:**
```bash
# Manually scan your spec files to verify SHALL/MUST appears
# in the line immediately after each "### Requirement:" header
cat openspec/changes/your-change-id/specs/*/spec.md
```

6. **Create design.md when needed:**
Create `design.md` if any of the following apply; otherwise omit it:
- Cross-cutting change (multiple services/modules) or a new architectural pattern
- New external dependency or significant data model changes
- Security, performance, or migration complexity
- Ambiguity that benefits from technical decisions before coding

Minimal `design.md` skeleton:
```markdown
## Context
[Background, constraints, stakeholders]

## Goals / Non-Goals
- Goals: [...]
- Non-Goals: [...]

## Decisions
- Decision: [What and why]
- Alternatives considered: [Options + rationale]

## Risks / Trade-offs
- [Risk] → Mitigation

## Migration Plan
[Steps, rollback]

## Open Questions
- [...]
```

## Spec File Format

### Critical: Scenario Formatting

**CORRECT** (use #### headers):
```markdown
#### Scenario: User login success
- **WHEN** valid credentials provided
- **THEN** return JWT token
```

**WRONG** (don't use bullets or bold):
```markdown
- **Scenario: User login**  ❌
**Scenario**: User login     ❌
### Scenario: User login      ❌
```

Every requirement MUST have at least one scenario.

### Requirement Wording
- Use SHALL/MUST for normative requirements (avoid should/may unless intentionally non-normative)

### Delta Operations

- `## ADDED Requirements` - New capabilities
- `## MODIFIED Requirements` - Changed behavior
- `## REMOVED Requirements` - Deprecated features
- `## RENAMED Requirements` - Name changes

Headers matched with `trim(header)` - whitespace ignored.

#### When to use ADDED vs MODIFIED
- ADDED: Introduces a new capability or sub-capability that can stand alone as a requirement. Prefer ADDED when the change is orthogonal (e.g., adding "Slash Command Configuration") rather than altering the semantics of an existing requirement.
- MODIFIED: Changes the behavior, scope, or acceptance criteria of an existing requirement. Always paste the full, updated requirement content (header + all scenarios). The archiver will replace the entire requirement with what you provide here; partial deltas will drop previous details.
- RENAMED: Use when only the name changes. If you also change behavior, use RENAMED (name) plus MODIFIED (content) referencing the new name.

Common pitfall: Using MODIFIED to add a new concern without including the previous text. This causes loss of detail at archive time. If you aren’t explicitly changing the existing requirement, add a new requirement under ADDED instead.

Authoring a MODIFIED requirement correctly:
1) Locate the existing requirement in `openspec/specs/<capability>/spec.md`.
2) Copy the entire requirement block (from `### Requirement: ...` through its scenarios).
3) Paste it under `## MODIFIED Requirements` and edit to reflect the new behavior.
4) Ensure the header text matches exactly (whitespace-insensitive) and keep at least one `#### Scenario:`.

Example for RENAMED:
```markdown
## RENAMED Requirements
- FROM: `### Requirement: Login`
- TO: `### Requirement: User Authentication`
```

## Troubleshooting

### Common Errors

**"Change must have at least one delta"**
- Check `changes/[name]/specs/` exists with .md files
- Verify files have operation prefixes (## ADDED Requirements)

**"Requirement must have at least one scenario"**
- Check scenarios use `#### Scenario:` format (4 hashtags)
- Don't use bullet points or bold for scenario headers

**Silent scenario parsing failures**
- Exact format required: `#### Scenario: Name`
- Debug with: `openspec show [change] --json --deltas-only`

### Validation Tips

```bash
# Always use strict mode for comprehensive checks
openspec validate [change] --strict

# Debug delta parsing
openspec show [change] --json | jq '.deltas'

# Check specific requirement
openspec show [spec] --json -r 1
```

## Happy Path Script

```bash
# 1) Explore current state
openspec spec list --long
openspec list
# Optional full-text search:
# rg -n "Requirement:|Scenario:" openspec/specs
# rg -n "^#|Requirement:" openspec/changes

# 2) Choose change id and scaffold
CHANGE=add-two-factor-auth
mkdir -p openspec/changes/$CHANGE/{specs/auth}
printf "## Why\n...\n\n## What Changes\n- ...\n\n## Impact\n- ...\n" > openspec/changes/$CHANGE/proposal.md
printf "## 1. Implementation\n- [ ] 1.1 ...\n" > openspec/changes/$CHANGE/tasks.md

# 3) Add deltas (example)
cat > openspec/changes/$CHANGE/specs/auth/spec.md << 'EOF'
## ADDED Requirements
### Requirement: Two-Factor Authentication
Users MUST provide a second factor during login.

#### Scenario: OTP required
- **WHEN** valid credentials are provided
- **THEN** an OTP challenge is required
EOF

# 4) Validate
openspec validate $CHANGE --strict
```

## Multi-Capability Example

```
openspec/changes/add-2fa-notify/
├── proposal.md
├── tasks.md
└── specs/
    ├── auth/
    │   └── spec.md   # ADDED: Two-Factor Authentication
    └── notifications/
        └── spec.md   # ADDED: OTP email notification
```

auth/spec.md
```markdown
## ADDED Requirements
### Requirement: Two-Factor Authentication
...
```

notifications/spec.md
```markdown
## ADDED Requirements
### Requirement: OTP Email Notification
...
```

## Best Practices

### Simplicity First
- Default to <100 lines of new code
- Single-file implementations until proven insufficient
- Avoid frameworks without clear justification
- Choose boring, proven patterns

### Complexity Triggers
Only add complexity with:
- Performance data showing current solution too slow
- Concrete scale requirements (>1000 users, >100MB data)
- Multiple proven use cases requiring abstraction

### Clear References
- Use `file.ts:42` format for code locations
- Reference specs as `specs/auth/spec.md`
- Link related changes and PRs

### Capability Naming
- Use verb-noun: `user-auth`, `payment-capture`
- Single purpose per capability
- 10-minute understandability rule
- Split if description needs "AND"

### Change ID Naming
- Use kebab-case, short and descriptive: `add-two-factor-auth`
- Prefer verb-led prefixes: `add-`, `update-`, `remove-`, `refactor-`
- Ensure uniqueness; if taken, append `-2`, `-3`, etc.

## Tool Selection Guide

| Task | Tool | Why |
|------|------|-----|
| Find files by pattern | Glob | Fast pattern matching |
| Search code content | Grep | Optimized regex search |
| Read specific files | Read | Direct file access |
| Explore unknown scope | Task | Multi-step investigation |

## Shell Commands on Windows

This project runs on Windows with a bash-compatible shell (Git Bash or similar). Follow these rules to avoid common errors:

1. **Recognize the environment**: The platform is `win32` but the shell is `/usr/bin/bash`. Assume Git Bash or similar Unix-like shell, NOT `cmd.exe` or PowerShell.

2. **Never use `cd /d`**: The `/d` flag is Windows `cmd.exe` syntax and will cause "too many arguments" errors in bash. Use `cd "path"` instead.

3. **Always quote paths with backslashes**: Wrap Windows-style paths in double quotes to prevent bash from interpreting `\` as escape characters.
   ```bash
   # Correct
   cd "E:\codebase\landing-page" && openspec list

   # Wrong - will error
   cd /d E:\codebase\landing-page && openspec list
   ```

4. **Prefer forward slashes when possible**: Bash handles forward slashes more reliably than backslashes.
   ```bash
   # More reliable
   cd "E:/codebase/landing-page" && openspec list
   ```

## Testing Best Practices

When building components with multiple interactive elements:

1. **Write tests alongside component code** to catch selector conflicts early
2. **Use specific test selectors** like `data-testid` instead of ambiguous role + name queries
3. **Avoid nested elements with same role** - having `role="button"` inside another `role="button"` creates ambiguity for tests and assistive technologies
4. **Add `data-testid` attributes proactively** to interactive elements that need direct testing

## Error Recovery

### Change Conflicts
1. Run `openspec list` to see active changes
2. Check for overlapping specs
3. Coordinate with change owners
4. Consider combining proposals

### Validation Failures
1. Run with `--strict` flag
2. Check JSON output for details
3. Verify spec file format
4. Ensure scenarios properly formatted

### Missing Context
1. Read project.md first
2. Check related specs
3. Review recent archives
4. Ask for clarification

## Quick Reference

### Stage Indicators
- `changes/` - Proposed, not yet built
- `specs/` - Built and deployed
- `archive/` - Completed changes

### File Purposes
- `proposal.md` - Why and what
- `tasks.md` - Implementation steps
- `design.md` - Technical decisions
- `spec.md` - Requirements and behavior

### CLI Essentials
```bash
openspec list              # What's in progress?
openspec show [item]       # View details
openspec validate --strict # Is it correct?
openspec archive <change-id> [--yes|-y]  # Mark complete (add --yes for automation)
```

Remember: Specs are truth. Changes are proposals. Keep them in sync.
