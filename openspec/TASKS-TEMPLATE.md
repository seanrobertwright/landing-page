# Tasks: [Change Name]

## Instructions
Complete tasks in order. Mark each task as `- [x]` only after it fully passes the completion criteria defined in `openspec/AGENTS.md`.

## 1. [Implementation Category]
- [ ] 1.1 [Specific task description]
- [ ] 1.2 [Specific task description]
- [ ] 1.3 [Specific task description]

## 2. [Implementation Category]
- [ ] 2.1 [Specific task description]
- [ ] 2.2 [Specific task description]

## 3. Testing
- [ ] 3.1 Write unit tests for [component/utility]
- [ ] 3.2 Write integration tests for [feature]
- [ ] 3.3 Ensure test coverage meets project standards

## 4. Documentation
- [ ] 4.1 Add JSDoc comments to public APIs
- [ ] 4.2 Update relevant documentation files (only if explicitly required)
- [ ] 4.3 Add inline code comments for complex logic

## N-1. Quality Assurance
- [ ] (N-1).1 Review code for security vulnerabilities
- [ ] (N-1).2 Check for accessibility compliance
- [ ] (N-1).3 Verify performance meets requirements
- [ ] (N-1).4 Ensure code follows project conventions

## N. Final Verification (REQUIRED - DO NOT SKIP)

**CRITICAL**: Complete ALL verification checks before marking ANY tasks as complete.

### Test Suite Verification
- [ ] N.1 Run full test suite: `npm test` (or project equivalent)
  - **Required**: 100% tests passing (not 99%, not "most")
  - **If failing**: Stop, investigate, fix, re-run
  - **Status**: ___ / ___ tests passing

### Build Verification
- [ ] N.2 Run production build: `npm run build` (or project equivalent)
  - **Required**: Zero errors, zero warnings (if strict)
  - **If failing**: Stop, investigate, fix, re-run
  - **Status**: ☐ Pass ☐ Fail

### Type Checking
- [ ] N.3 Run TypeScript compiler (if applicable)
  - **Required**: Zero type errors
  - **If failing**: Stop, investigate, fix, re-run
  - **Status**: ☐ Pass ☐ Fail

### Linting (if applicable)
- [ ] N.4 Run linter: `npm run lint` (or project equivalent)
  - **Required**: Zero errors (warnings acceptable if project allows)
  - **If failing**: Stop, investigate, fix, re-run
  - **Status**: ☐ Pass ☐ Fail

### Manual Testing
- [ ] N.5 Test critical user paths manually
  - **Required**: All core functionality works
  - **Test cases completed**:
    - [ ] [Critical path 1]
    - [ ] [Critical path 2]
    - [ ] [Critical path 3]

### Regression Testing
- [ ] N.6 Verify existing features still work
  - **Required**: No regressions introduced
  - **Tested**: ☐ Yes ☐ No

### Final Checklist
- [ ] N.7 All above verification checks pass (100%, no exceptions)
- [ ] N.8 No "minor" failures dismissed without investigation
- [ ] N.9 No "will fix later" items remaining
- [ ] N.10 Ready to mark all tasks as complete

## Completion Criteria

Before marking this change as complete, verify:

✅ **All verification checks pass** (Section N above)
✅ **All implementation tasks complete** (Sections 1-4 above)
✅ **All quality checks pass** (Section N-1 above)
✅ **Definition of "Complete" satisfied** (see `openspec/AGENTS.md`)

**If ANY verification fails**:
1. ❌ DO NOT mark tasks as complete
2. 🔍 Investigate root cause
3. 🔧 Fix the issue completely
4. 🔄 Re-run ALL verifications
5. ✅ Only proceed when everything passes

## Notes

- Add any implementation notes, decisions, or blockers here
- Track any deviations from the original plan
- Document any assumptions or dependencies
