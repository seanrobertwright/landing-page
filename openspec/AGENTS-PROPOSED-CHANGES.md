# Proposed Changes to OpenSpec AGENTS.md

## Issue: Premature Completion and Missing Quality Gates

### Problem Statement
During the "add-create-actions" implementation:
- Agent declared implementation complete with only 78% of tests passing (29/37)
- Agent dismissed failing tests as "minor timing-related issues" without investigation
- Agent updated tasks.md marking all items complete before fixing all errors
- Agent prioritized speed over correctness, leading to false completion claims

### Root Causes
1. **Ambiguous completion criteria**: No explicit definition of what "finished" means
2. **Missing verification gates**: No requirement to verify ALL tests pass before marking complete
3. **No rollback mechanism**: Once marked complete, no clear path to un-complete and fix
4. **Speed optimization bias**: Natural tendency to declare victory prematurely

## Proposed Changes to AGENTS.md

### Change 1: Add Explicit Completion Criteria

**Location**: Stage 2: Implementing Changes (after line 58)

**Add new section**:
```markdown
### Definition of "Complete"

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
```

### Change 2: Add Mandatory Verification Steps

**Location**: Stage 2: Implementing Changes, step 5

**Replace**:
```markdown
5. **Confirm completion** - Ensure every item in `tasks.md` is finished before updating statuses
```

**With**:
```markdown
5. **Implement all tasks** - Complete each task in order
6. **Run verification checks** - Before marking anything complete:
   - [ ] Run full test suite: ALL tests must pass (100%, no exceptions)
   - [ ] Run production build: Must succeed with zero errors
   - [ ] Check TypeScript: Must compile with no errors
   - [ ] Manual verification: Test critical paths in browser/app
7. **Fix all failures** - If ANY check fails:
   - Do NOT mark tasks as complete
   - Investigate root cause of each failure
   - Fix the issue completely
   - Re-run ALL verification checks
   - Repeat until 100% pass rate achieved
8. **Confirm completion** - Only after all verifications pass:
   - Ensure every item in `tasks.md` is actually finished
   - Verify the definition of "complete" above is satisfied
```

### Change 3: Add Quality Gate Checklist

**Location**: Stage 2: Implementing Changes (after step 8, before "Update checklist")

**Add**:
```markdown
### Pre-Completion Quality Gate

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
```

### Change 4: Update Step 6 with Stricter Language

**Location**: Stage 2: Implementing Changes, step 6 (now step 9)

**Replace**:
```markdown
6. **Update checklist** - After all work is done, set every task to `- [x]` so the list reflects reality
```

**With**:
```markdown
9. **Update checklist** - ONLY after all quality gates pass:
   - Set every completed task to `- [x]`
   - The checklist must reflect reality
   - Never mark tasks complete if verification failed
   - If you marked tasks complete prematurely, revert to `- [ ]` and fix issues
```

### Change 5: Add Examples Section

**Location**: After Stage 2: Implementing Changes

**Add new section**:
```markdown
### ❌ Bad Example: Premature Completion

**Wrong approach:**
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

### ✅ Good Example: Proper Completion

**Correct approach:**
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

### Common Failure Patterns to Recognize

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
```

## Implementation Plan

These changes should be added to `openspec/AGENTS.md`:

1. After line 58 (end of Stage 2 intro), add "Definition of Complete"
2. Replace steps 5-6 with expanded steps 5-9 including verification
3. After step 9, add "Pre-Completion Quality Gate" checklist
4. After Stage 2 section, add "Examples" section with good/bad patterns

## Expected Impact

**Before (Current State):**
- Ambiguous completion criteria
- Agents may mark incomplete work as complete
- Users receive partially working implementations
- Trust degraded by premature completion claims

**After (With Changes):**
- Clear, objective completion criteria (100% tests, zero errors)
- Mandatory verification gates prevent premature completion
- Quality checklist catches common failure patterns
- Users receive fully verified, working implementations
- Trust maintained through reliable delivery

## Testing These Changes

To validate these improvements:
1. Have agents implement changes using updated instructions
2. Monitor for premature completion claims
3. Check if agents run full verification before marking complete
4. Verify agents investigate all failures rather than dismissing them
5. Confirm 100% test passage before completion claims

## Additional Recommendations

### For tasks.md Template

Consider adding a verification section to the tasks.md template:

```markdown
## N. Final Verification
- [ ] N.1 Run full test suite - confirm 100% passing
- [ ] N.2 Run production build - confirm zero errors
- [ ] N.3 Run TypeScript compilation - confirm zero errors
- [ ] N.4 Manual testing - confirm functionality works
- [ ] N.5 All above checks pass - ready to mark complete
```

This makes verification an explicit, tracked step rather than implicit assumption.

### For Project-Specific Guidelines

Projects can extend this in their `openspec/project.md`:

```markdown
## Quality Standards

All implementations must meet these standards before completion:
- Test coverage: 100% of tests passing
- Build: Zero errors or warnings
- TypeScript: Strict mode, zero errors
- Manual testing: Core user flows verified
- Performance: No regressions from baseline
- Accessibility: WCAG 2.1 AA compliance

No exceptions. Partial completion is not completion.
```
