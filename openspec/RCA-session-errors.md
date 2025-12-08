# Root Cause Analysis: Session Errors

**Date**: 2025-12-08
**Session**: Context menu proposal creation and port configuration

---

## Executive Summary

Three categories of errors occurred during this session:
1. **Proposal Format Error** - Missing required "Why" section
2. **Test Infrastructure Error** - E2E tests failing due to missing test data
3. **Configuration Discovery Error** - Port configuration scattered across files

All errors stem from **insufficient guardrails in system documentation** and **lack of automated validation/setup**.

---

## Error 1: Missing "Why" Section in Proposal

### What Happened
1. Created `proposal.md` with sections: Change ID, Summary, Motivation, Goals, etc.
2. Ran `openspec validate add-context-menus --strict`
3. Validation failed: `Error: Change must have a Why section`
4. Had to manually add "Why" section and re-validate

### Root Cause Analysis

**Immediate Cause**: I didn't include a "Why" section in the proposal.

**Contributing Factors**:
1. **Incomplete Slash Command Instructions**: The `/openspec:proposal` command instructions list steps but don't show required proposal sections
2. **No Proposal Template Reference**: Instructions mention checking `openspec/AGENTS.md` but don't reference a proposal template
3. **Validation Too Late**: I created all content before validating, rather than validating structure first

**Systemic Issues**:
1. **Missing Proposal Template**: There's `SPEC-TEMPLATE.md` and `TASKS-TEMPLATE.md` but no `PROPOSAL-TEMPLATE.md`
2. **Insufficient Examples**: Had to search archived proposals to find the format
3. **No Pre-Creation Checklist**: No checklist of required sections before starting

### Impact
- **Time**: ~2 minutes wasted creating invalid proposal + time to fix
- **Confidence**: Reduced confidence in proposal structure
- **Risk**: Could have missed other required sections

### Severity: Medium
- Caught by validation (good!)
- Easy to fix (good!)
- But shouldn't happen in the first place (bad)

---

## Error 2: E2E Tests Failing Due to Missing Test Data

### What Happened
1. Ran `npm run test:e2e` after configuring port 5050
2. 13 tests failed with errors like:
   - `expect(page.getByText("GitHub")).toBeVisible()` → Element not found
   - `page.locator('[data-testid^="tree-node-"]').first()` → Timeout waiting
3. Database was empty (only 1 default "Bookmarks" folder, 0 links)
4. Created `scripts/seed-db.ts` to populate test data
5. Tests still failed because they expected specific data structure

### Root Cause Analysis

**Immediate Cause**: Tests were written expecting specific data ("GitHub" link) but database was empty.

**Contributing Factors**:
1. **No Test Database Seeding**: Playwright config doesn't seed database before tests
2. **Tests Coupled to Data**: Tests use hardcoded strings like `getByText("GitHub")` instead of data-agnostic selectors
3. **No Test Setup Documentation**: No documentation on running E2E tests locally
4. **Shared Database**: Tests use same database as development, not isolated test DB

**Systemic Issues**:
1. **Missing Playwright Setup Hook**: `playwright.config.ts` has `webServer` but no `globalSetup` for database
2. **No Test Data Factory**: No mechanism to create consistent test data
3. **Tests Written Before Implementation**: E2E tests from previous features expect data that may not exist
4. **No Database Isolation**: Dev database (`data/links.db`) used for tests, not separate test database

### Impact
- **Time**: ~10 minutes creating seed script and debugging test failures
- **Confidence**: Can't trust E2E test results without manual setup
- **Risk**: Tests give false negatives, may mask real bugs

### Severity: High
- Blocks reliable testing
- Requires manual intervention every time
- Could cause regression detection failures

---

## Error 3: Port Configuration Discovery

### What Happened
1. User requested: "I want the server to run on port 5050"
2. Had to manually discover where port is configured:
   - `package.json` → `"dev": "next dev"`
   - `playwright.config.ts` → `baseURL: "http://localhost:3000"`
   - `playwright.config.ts` → `webServer.url: "http://localhost:3000"`
3. Updated three locations with hardcoded port values
4. No environment variable usage

### Root Cause Analysis

**Immediate Cause**: Port configuration scattered across multiple files without centralized config.

**Contributing Factors**:
1. **No Environment Variables**: Port hardcoded instead of using `process.env.PORT`
2. **No Configuration Documentation**: No file documenting where configuration lives
3. **Framework Defaults**: Next.js defaults to port 3000, Playwright config created with hardcoded values

**Systemic Issues**:
1. **No `.env.example` File**: No template showing available configuration options
2. **No Centralized Config**: No single source of truth for app configuration
3. **Poor Discoverability**: Had to search codebase to find all port references

### Impact
- **Time**: ~3 minutes finding and updating all port references
- **Maintainability**: Future config changes require updating multiple files
- **Risk**: Easy to miss one location and have inconsistent configuration

### Severity: Medium
- Not blocking, but creates friction
- Increases cognitive load
- Makes configuration changes error-prone

---

## System Improvements Needed

### 1. Proposal Template and Validation

**Problem**: Missing proposal sections not caught early enough.

**Solution**:
- Create `openspec/PROPOSAL-TEMPLATE.md` with all required sections
- Update `/openspec:proposal` command to reference template
- Add validation step BEFORE creating any files
- Add pre-creation checklist in slash command

**Files to Update**:
- **NEW**: `openspec/PROPOSAL-TEMPLATE.md`
- **UPDATE**: `.claude/commands/openspec-proposal.md` (slash command)
- **UPDATE**: `openspec/AGENTS.md` (reference template in workflow)

### 2. E2E Test Database Setup

**Problem**: Tests fail without manual database seeding.

**Solution**:
- Create separate test database (`data/links.test.db`)
- Add Playwright global setup to seed test database
- Make tests data-agnostic (test behavior, not specific content)
- Add test data factory for creating fixtures

**Files to Update**:
- **NEW**: `tests/setup/global-setup.ts` (Playwright global setup)
- **NEW**: `tests/setup/seed-test-db.ts` (Test database seeding)
- **NEW**: `tests/factories/test-data.ts` (Test data factory)
- **UPDATE**: `playwright.config.ts` (add globalSetup, use test DB)
- **UPDATE**: `lib/db/index.ts` (support TEST_DB environment variable)
- **UPDATE**: Test files to be data-agnostic where possible

### 3. Centralized Configuration

**Problem**: Configuration scattered across multiple files.

**Solution**:
- Create `.env.example` with all configuration options
- Use environment variables for runtime configuration
- Create centralized config module
- Document all configuration options

**Files to Update**:
- **NEW**: `.env.example` (template with PORT, DB_PATH, etc.)
- **NEW**: `lib/config.ts` (centralized configuration module)
- **UPDATE**: `package.json` (use `PORT` env var: `next dev -p ${PORT:-3000}`)
- **UPDATE**: `playwright.config.ts` (use env var for baseURL)
- **UPDATE**: `openspec/project.md` (document configuration)

### 4. Enhanced Slash Command Instructions

**Problem**: Slash command doesn't provide sufficient guidance.

**Solution**:
- Add template references to slash command
- Include validation checklist
- Add "validate early and often" reminders
- Show example of checking templates first

**Files to Update**:
- **UPDATE**: `.claude/commands/openspec-proposal.md`
- **UPDATE**: `openspec/AGENTS.md` (strengthen "check templates first" guidance)

---

## Recommended Priority

### Priority 1 (High Impact, Quick Wins)
1. ✅ Create `openspec/PROPOSAL-TEMPLATE.md`
2. ✅ Update `/openspec:proposal` command to reference template
3. ✅ Create `.env.example` file

### Priority 2 (High Impact, Medium Effort)
4. ✅ Create Playwright global setup for test database
5. ✅ Add TEST_DB environment variable support
6. ✅ Create test data seeding script

### Priority 3 (Medium Impact, Ongoing)
7. ⚠️ Refactor tests to be data-agnostic
8. ⚠️ Create test data factory
9. ⚠️ Document configuration in project.md

---

## Success Metrics

After implementing these improvements:

1. **Proposal Creation**:
   - ✅ Zero validation errors on first attempt (template followed)
   - ✅ Time to create proposal reduced by 50%

2. **E2E Testing**:
   - ✅ Tests pass out of the box without manual setup
   - ✅ Test database automatically seeded
   - ✅ Zero false negatives from missing data

3. **Configuration**:
   - ✅ Port changes require updating single `.env` file
   - ✅ All configuration options documented
   - ✅ Zero hardcoded values in code

---

## Prevention Strategy

### Immediate Actions (This Session)
1. Create proposal template
2. Create .env.example
3. Update slash command
4. Create Playwright global setup

### Process Changes
1. **Always check templates first** before creating new documents
2. **Validate early** - run validation after first section, not at the end
3. **Use environment variables** for all runtime configuration
4. **Write data-agnostic tests** that create their own fixtures

### Documentation Updates
1. Add "Configuration" section to project.md
2. Add "Running Tests" section to project.md
3. Link templates in slash commands
4. Add troubleshooting guide for common issues

---

## Conclusion

All three errors share a common theme: **insufficient guardrails and automation in the development workflow**. The fixes are straightforward:

1. **Templates** → Prevent format errors
2. **Test automation** → Eliminate manual setup
3. **Centralized config** → Reduce discovery time

These improvements will make the system more robust and reduce cognitive load for future sessions.
