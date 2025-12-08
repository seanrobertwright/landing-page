# Capability: [Capability Name]

<!-- Copy this template to specs/[capability-name]/spec.md -->
<!-- Replace [placeholders] with actual content -->
<!-- Delete sections you don't need (e.g., MODIFIED, REMOVED) -->

## ADDED Requirements

### Requirement: The system SHALL [do something specific]
[Add descriptive text here explaining what this requirement does and why it matters. This text is REQUIRED - you cannot skip directly to scenarios. Include "SHALL" or "MUST" in this description.]

#### Scenario: [Happy path description]
- **WHEN** [user or system performs an action]
- **THEN** [expected outcome occurs]
- **AND** [additional outcome]

#### Scenario: [Edge case or error handling]
- **WHEN** [edge condition occurs]
- **THEN** [system handles it appropriately]
- **AND** [error message or alternative flow]

---

### Requirement: The system SHALL [do another thing]
[Another descriptive paragraph. Remember: Must include SHALL or MUST, and must be present before scenarios.]

#### Scenario: [Scenario name]
- **WHEN** [condition]
- **THEN** [result]

---

## MODIFIED Requirements

<!-- Use this section when changing existing requirements -->
<!-- IMPORTANT: Include COMPLETE updated requirement text, not just changes -->

### Requirement: The system SHALL [updated behavior]
[Complete updated description of what the system must do. This replaces the old requirement entirely, so include all relevant details even if they didn't change.]

#### Scenario: [Updated scenario reflecting new behavior]
- **WHEN** [new condition]
- **THEN** [new expected outcome]

#### Scenario: [Backward compatibility case if needed]
- **WHEN** [old behavior is attempted]
- **THEN** [migration path or deprecation warning]

---

## REMOVED Requirements

<!-- Use this section when deprecating features -->

### Requirement: [Old requirement being removed]
**Reason:** [Explain why this requirement is being removed - e.g., superseded by new feature, no longer needed, security concern]

**Migration Path:** [How should users adapt? What replaces this functionality?]

**Deprecation Timeline:** [When will this be removed? Any grace period?]

---

## RENAMED Requirements

<!-- Rarely used - only when requirement name changes but behavior stays the same -->

### Requirement: The system SHALL [new name for same behavior]
[If behavior also changes, use RENAMED + MODIFIED sections instead]

**Old Name:** [Previous requirement name]
**Reason for Rename:** [Why the name is changing]

---

## Format Checklist (Delete before committing)

Before running `openspec validate --strict`, check:

- [ ] Every requirement heading includes "SHALL" or "MUST"
- [ ] Every requirement has description text between heading and first scenario
- [ ] Description text includes "SHALL" or "MUST" (uppercase)
- [ ] All scenarios use `#### Scenario:` (exactly 4 hashtags)
- [ ] Every requirement has at least one scenario
- [ ] MODIFIED requirements include complete updated text
- [ ] No typos in section headers ("Requirements" is plural, "Scenario" is singular)

---

## Example: Complete Requirement (Delete before committing)

```markdown
### Requirement: The system SHALL validate email addresses
The system SHALL validate email addresses using RFC 5322 format rules before allowing account registration or profile updates to prevent invalid email addresses in the database.

#### Scenario: Valid email address
- **WHEN** a user enters a correctly formatted email (e.g., "user@example.com")
- **THEN** the system accepts the email
- **AND** allows the user to proceed with registration

#### Scenario: Invalid email format
- **WHEN** a user enters an incorrectly formatted email (e.g., "notanemail")
- **THEN** the system rejects the email
- **AND** displays an error message explaining the correct format
- **AND** does not allow proceeding until corrected

#### Scenario: Email with special characters
- **WHEN** a user enters an email with valid special characters (e.g., "user+tag@example.com")
- **THEN** the system accepts the email
- **AND** preserves the special characters in storage
```

---

## Tips

1. **Be specific:** Don't write "System handles errors" - write "System displays validation error when input exceeds 255 characters"
2. **Cover edge cases:** Happy path + error handling + boundary conditions
3. **One concern per requirement:** If you find yourself using "AND" in the requirement title, split it
4. **Think scenarios first:** Write test cases, then derive the requirement from them
5. **Use active voice:** "System SHALL validate" not "Validation SHALL be performed"
