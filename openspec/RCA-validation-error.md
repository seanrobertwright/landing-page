# Root Cause Analysis: OpenSpec Validation Error

**Date:** 2025-12-07
**Error:** "ADDED requirement must contain SHALL or MUST"
**Change ID:** add-create-actions
**Analyst:** Claude (Sonnet 4.5)

---

## Executive Summary

The validation error occurred because requirement descriptions did not include the normative keywords "SHALL" or "MUST" as required by OpenSpec's validation rules. While the `AGENTS.md` file contains this rule (line 258), it is buried in a large document and was not surfaced at the point of need during the proposal creation workflow.

**Impact:** 10 requirements had to be manually corrected, adding ~5 minutes of rework.

**Severity:** Low (caught before merge, easy fix)

**Recurrence Risk:** High (documentation gap will affect future proposals)

---

## Timeline of Events

1. **Initial State:** User requested proposal creation for add/create functionality
2. **Proposal Phase:** AI agent created spec files with requirement descriptions like:
   - "Users must be able to create new folders..." ❌
   - "Folder names must be validated..." ❌
3. **Validation Attempt:** Ran `openspec validate add-create-actions --strict`
4. **Error Discovered:** 10 validation errors for missing SHALL/MUST keywords
5. **Correction:** Manually edited each requirement to use "The system SHALL/MUST..."
6. **Re-validation:** Successful after corrections

---

## Root Cause Analysis (5 Whys)

### Why did the validation error occur?
**Because** requirement descriptions used informal language ("Users must...") instead of the required normative keywords ("The system SHALL/MUST...").

### Why was informal language used?
**Because** the AI agent wasn't aware of the specific SHALL/MUST requirement when drafting specs.

### Why wasn't the agent aware of this requirement?
**Because** while the rule exists in `AGENTS.md` (line 258), it's not prominently surfaced in the proposal workflow instructions.

### Why isn't it surfaced in the workflow?
**Because** the `AGENTS.md` file is organized as reference documentation, not a step-by-step checklist. The SHALL/MUST rule is under "Spec File Format" → "Requirement Wording" subsection.

### Why doesn't the workflow include format validation checks?
**Because** the proposal creation instructions (lines 143-235) focus on structure and content, but don't include inline reminders about formatting rules that will be validated later.

---

## Evidence

### Current Documentation Structure

**Location of Rule:** `openspec/AGENTS.md:258`
```markdown
### Requirement Wording
- Use SHALL/MUST for normative requirements (avoid should/may unless intentionally non-normative)
```

**Location in Workflow:** `openspec/AGENTS.md:177-195` (Creating Change Proposals → Proposal Structure → Create spec deltas)
```markdown
3. **Create spec deltas:** `specs/[capability]/spec.md`
```markdown
## ADDED Requirements
### Requirement: New Feature
The system SHALL provide...
```

**Gap Identified:** The example shows "SHALL" but doesn't explicitly state it's mandatory or explain the validation rule.

### Successful Examples (from add-main-ui)

All existing specs in `add-main-ui/specs/main-ui/spec.md` correctly use SHALL:
- "The application SHALL display a three-panel layout..." ✅
- "The sidebar SHALL be resizable..." ✅
- "The sidebar content area SHALL display..." ✅

This proves the pattern exists in the codebase, but wasn't consistently applied.

---

## Contributing Factors

### 1. Documentation Organization
- **Issue:** Rule is in "Spec File Format" section (lines 237-288), separate from workflow steps (lines 143-235)
- **Impact:** Easy to miss when following workflow sequentially

### 2. Example Clarity
- **Issue:** Example shows "SHALL" but doesn't explain it's a validation requirement
- **Impact:** Agent copied structure but used natural language instead

### 3. No Pre-Validation Guidance
- **Issue:** No checklist reminding authors of format rules before running validate
- **Impact:** Errors only caught after writing, requiring rework

### 4. Large File Size
- **Issue:** `AGENTS.md` is 489 lines, rule is at line 258
- **Impact:** Hard to scan/remember all rules when context-switching

---

## Prevention Strategy

### Immediate Actions (Must Fix)

#### 1. Add Inline Reminder in Workflow Section
**File:** `openspec/AGENTS.md`
**Location:** Lines 177-195 (Create spec deltas section)
**Change:** Add explicit callout before the example

```markdown
3. **Create spec deltas:** `specs/[capability]/spec.md`

**IMPORTANT:** Every requirement description MUST include "SHALL" or "MUST" (normative keywords). This is validated by `openspec validate --strict`.

```markdown
## ADDED Requirements
### Requirement: New Feature
The system SHALL provide...  <!-- ✅ Correct: Uses SHALL -->

#### Scenario: Success case
...
```

**Rationale:** Places the rule at the point of need during proposal creation.

---

#### 2. Enhance the Example with Anti-Pattern
**File:** `openspec/AGENTS.md`
**Location:** Lines 177-195
**Change:** Show both correct and incorrect examples

```markdown
**CORRECT:**
```markdown
### Requirement: User Authentication
The system SHALL validate credentials before granting access.
```

**INCORRECT (will fail validation):**
```markdown
### Requirement: User Authentication
Users must log in with valid credentials.  <!-- ❌ Missing SHALL/MUST -->
```

**Rationale:** Explicit anti-patterns prevent common mistakes.

---

#### 3. Add Pre-Validation Checklist
**File:** `openspec/AGENTS.md`
**Location:** After line 206 (end of tasks.md section), before design.md section
**Change:** Insert checklist

```markdown
5. **Validate spec format (before running openspec validate):**
   - [ ] Every requirement description contains "SHALL" or "MUST"
   - [ ] Every requirement has at least one `#### Scenario:` block
   - [ ] Scenario headers use exactly 4 hashtags (####)
   - [ ] All MODIFIED requirements include complete updated content
```

**Rationale:** Catch-all checklist before validation prevents wasted cycles.

---

### Long-Term Improvements (Should Consider)

#### 4. Create Quick Reference Card
**New File:** `openspec/QUICK-REFERENCE.md`
**Content:** One-page cheat sheet with:
- Mandatory keywords: SHALL, MUST
- Scenario format: `#### Scenario: Name`
- Delta operations: ADDED, MODIFIED, REMOVED, RENAMED
- Validation command: `openspec validate <id> --strict`

**Rationale:** Easy-to-scan reference for common rules.

---

#### 5. Improve Error Messages (Tooling Change)
**Tool:** `openspec` CLI validation
**Current Error:** `"ADDED requirement must contain SHALL or MUST"`
**Suggested Error:**
```
✗ [ERROR] folder-management/spec.md:
  Requirement "Users can create new folders via UI dialog" missing normative keyword

  Current:  "Users must be able to create new folders..."
  Required: "The system SHALL provide..." or "Users MUST be able to..."

  ℹ Normative keywords: SHALL, MUST (required for validation)
```

**Rationale:** Error shows exactly what to fix and how.

---

#### 6. Add Linter/Pre-Commit Hook
**Tool:** Git pre-commit hook or CI check
**Action:** Run `openspec validate --strict` on changed proposals before allowing commit
**Rationale:** Catch errors before they enter version control.

---

## Recommended File Updates

### Priority 1: Documentation Fixes (Do Now)

1. **openspec/AGENTS.md** - Lines 177-195
   - Add inline SHALL/MUST reminder
   - Add correct/incorrect example comparison
   - Add pre-validation checklist

### Priority 2: New Reference Document (Do Soon)

2. **openspec/QUICK-REFERENCE.md** (new file)
   - Create one-page spec format guide
   - Include SHALL/MUST rule prominently

### Priority 3: CLAUDE.md Enhancement (Optional)

3. **CLAUDE.md** - Add to OpenSpec section
   ```markdown
   ## OpenSpec Spec Format Rules

   When creating spec deltas, ALL requirements MUST include:
   - Normative keyword: SHALL or MUST in the requirement description
   - At least one scenario: `#### Scenario: Name` (exactly 4 hashtags)

   Run `openspec validate <change-id> --strict` before submitting proposals.
   ```

---

## Lessons Learned

### What Went Well
1. ✅ Validation caught the error before code was written
2. ✅ Existing examples (`add-main-ui`) showed correct pattern
3. ✅ Error message was clear about what was missing
4. ✅ Fix was straightforward once identified

### What Could Be Better
1. ❌ Rule wasn't surfaced during proposal creation workflow
2. ❌ No checklist to verify format before validation
3. ❌ Large documentation file makes rules hard to find
4. ❌ No proactive enforcement (only reactive validation)

### Process Improvements
1. Separate "How to Create" (workflow) from "Format Rules" (reference) in documentation
2. Add inline validation hints at point of need
3. Create quick-reference card for common rules
4. Consider automated checks (linter/pre-commit hooks)

---

## Action Items

| Priority | Action | Owner | File(s) | Status |
|----------|--------|-------|---------|--------|
| P0 | Add SHALL/MUST reminder to workflow section | User | `openspec/AGENTS.md:177-195` | Pending |
| P0 | Add correct/incorrect example | User | `openspec/AGENTS.md:177-195` | Pending |
| P0 | Add pre-validation checklist | User | `openspec/AGENTS.md:206` | Pending |
| P1 | Create quick reference card | User | `openspec/QUICK-REFERENCE.md` (new) | Pending |
| P2 | Enhance CLAUDE.md with spec rules | User | `CLAUDE.md` | Pending |
| P3 | Consider linter/pre-commit hook | User | `.git/hooks/pre-commit` | Future |

---

## Conclusion

The validation error was caused by a **documentation gap** where the SHALL/MUST requirement exists but isn't surfaced at the point of need during proposal creation. The fix is straightforward: add inline reminders and examples in the workflow section of `AGENTS.md` where spec deltas are created.

**Risk of Recurrence:** High without changes, Low after implementing P0 action items.

**Estimated Effort:** 15 minutes to update documentation, prevents 5+ minutes of rework per proposal.

**ROI:** High - one-time fix prevents recurring issue on every future proposal.

---

## Appendix: Error Details

### Original Error Output
```
Change 'add-create-actions' has issues
✗ [ERROR] folder-management/spec.md: ADDED "Users can create new folders via UI dialog" must contain SHALL or MUST
✗ [ERROR] folder-management/spec.md: ADDED "Folder name validation" must contain SHALL or MUST
✗ [ERROR] folder-management/spec.md: ADDED "Parent folder selection" must contain SHALL or MUST
✗ [ERROR] folder-management/spec.md: ADDED "Create button accessibility" must contain SHALL or MUST
✗ [ERROR] link-management/spec.md: ADDED "Users can create new links via UI dialog" must contain SHALL or MUST
✗ [ERROR] link-management/spec.md: ADDED "Link title validation" must contain SHALL or MUST
✗ [ERROR] link-management/spec.md: ADDED "URL validation" must contain SHALL or MUST
✗ [ERROR] link-management/spec.md: ADDED "Target folder indication" must contain SHALL or MUST
✗ [ERROR] link-management/spec.md: ADDED "Create button accessibility" must contain SHALL or MUST
✗ [ERROR] link-management/spec.md: ADDED "Link creation refreshes content area" must contain SHALL or MUST
```

### Corrections Applied
All 10 requirements were updated from:
- "Users must be able to..." → "The system SHALL provide..."
- "Folder names must be..." → "The system MUST validate..."
- "The dialog must..." → "The dialog MUST..."

### Validation After Fix
```
Change 'add-create-actions' is valid ✓
```
