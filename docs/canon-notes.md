# Canon Integration Notes

This document tracks issues encountered while building Howard on Canon, to inform Canon's development.

## Installation Issues

### Postinstall Script Failures
**Issue**: Canon's postinstall script attempts to run `husky` which may not be installed in downstream projects.

```bash
npm error command sh -c husky
npm error sh: husky: command not found
```

**Workaround**: Install with `npm install --ignore-scripts`

**Recommendation**:
- Make husky setup optional or detect if it exists
- Or move git hooks setup to a separate opt-in script
- Document that downstream projects need `--ignore-scripts` if not using git hooks

## Development Dependencies

### Missing Script Dependencies
**Issue**: Canon's script patterns (as documented in Canon's own package.json) depend on `tsx` and `npm-run-all`, but these aren't automatically available to projects using Canon.

**What I should have done**:
```bash
npm install --save-dev npm-run-all tsx --ignore-scripts
```

This would have automatically determined versions and updated package.json correctly.

**Additional Issue**: `npm-run-all` binary has permission issues after install:
```bash
> npm run check:all
> npm-run-all check:lint check:types check:test

sh: /Users/bahulneel/Projects/RelationalFabric/howard/node_modules/.bin/npm-run-all: Permission denied
```

**Workaround**: May need to run `chmod +x node_modules/.bin/npm-run-all` or use `npx npm-run-all` instead.

**Recommendation**:
- Either bundle these as dependencies if they're part of Canon's "way of doing things"
- Or provide an init script: `npx @relational-fabric/canon init` that scaffolds package.json with the right scripts and dependencies
- Consider if `npm-run-all` is worth the friction - could use `&&` chains or native npm script features instead
- Document in Canon's README that these are peer/dev dependencies for the script patterns

### No Package.json Scaffolding
**Issue**: Canon provides config exports (`@relational-fabric/canon/tsconfig`, `@relational-fabric/canon/eslint`) but doesn't scaffold a working package.json with scripts.

**What I had to do**: Manually copy Canon's script patterns and adapt them.

**Recommendation**:
- Provide `npx canon init` or similar that:
  - Creates package.json with Canon's standard scripts
  - Installs required dev dependencies
  - Sets up tsconfig.json, eslint.config.js
  - Creates docs/adrs/ structure
  - Creates examples/ structure
- Or provide a template repo: `@relational-fabric/canon-template`

## Type Safety Issues

### TypeScript Errors in Canon's Own Code
**Issue**: Canon's `src/kit.ts` has TypeScript errors that leak into downstream projects:

```
node_modules/@relational-fabric/canon/src/kit.ts(2,31): error TS7016:
  Could not find a declaration file for module '../eslint.js'

node_modules/@relational-fabric/canon/src/kit.ts(17,39): error TS7016:
  Could not find a declaration file for module 'object-hash'
```

**Impact**:
- Downstream projects must use `skipLibCheck: true` in tsconfig
- This reduces type safety for the entire project
- Type errors in our own code might be masked

**Workaround**: Added `"skipLibCheck": true` to tsconfig.json

**Actual Experience**: Even with `skipLibCheck: true` in tsconfig.json, running `tsc --noEmit` still shows Canon's type errors:
```bash
> tsc --noEmit

node_modules/@relational-fabric/canon/src/kit.ts(2,31): error TS7016: Could not find a declaration file for module '../eslint.js'
node_modules/@relational-fabric/canon/src/kit.ts(17,39): error TS7016: Could not find a declaration file for module 'object-hash'
node_modules/@relational-fabric/canon/src/kit.ts(18,15): error TS7016: Could not find a declaration file for module 'object-hash'
ERROR: "check:types:src" exited with 2.
```

This means `skipLibCheck` doesn't fully suppress Canon's type errors, making it impossible to have clean type checks in CI/CD without working around Canon's issues.

**Recommendation**:
- Add proper type declarations for eslint.js export
- Add `@types/object-hash` to Canon's dependencies or dev dependencies
- Ensure Canon itself type checks cleanly without skipLibCheck
- Consider not exporting `object-hash` directly from kit.ts if it doesn't have types
- Test that downstream projects can run `tsc --noEmit` without errors

## Documentation Gaps

### Script Pattern Documentation
**Issue**: Canon's README shows the export structure but doesn't document how to set up the script patterns that Canon's own package.json uses.

**What I needed**:
- How to structure scripts for ADR generation
- What dependencies are needed for the script patterns
- How to integrate with CI/CD

**Recommendation**: Add a "Getting Started" guide showing a complete project setup, not just the exports.

## Positive Notes

What worked well:
- ✅ TypeScript config extension works perfectly
- ✅ ESLint config creation works well
- ✅ The Predicate/TypeGuard types are excellent
- ✅ Example documentation pattern is clear and well-designed
- ✅ The axioms/canons pattern is elegant
- ✅ Direct access to underlying libraries via `_/*` exports is smart

## Summary

Canon is a solid foundation but feels like it's at "0.x" maturity for developer experience. The primitives are excellent, but the scaffolding and initialization story needs work.

**Priority improvements**:
1. Fix TypeScript errors in Canon's own code
2. Provide init/scaffolding tooling
3. Document the full "Canon way" end-to-end
4. Handle postinstall scripts gracefully

These are all fixable and don't reflect on Canon's core design, which is sound.
