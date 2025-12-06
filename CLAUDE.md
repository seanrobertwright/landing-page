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

## Testing Best Practices

When building components with multiple interactive elements:

1. **Write tests alongside component code** to catch selector conflicts early
2. **Use specific test selectors** like `data-testid` instead of ambiguous role + name queries
3. **Avoid nested elements with same role** - nested `role="button"` creates ambiguity for tests and assistive technologies
4. **Add `data-testid` attributes proactively** to interactive elements that need direct testing