---
description: FUSE Stack 70-Point Compliance Audit - Complete Self-Sufficient Auditor
tags: [vrp, audit, fuse, compliance]
---

# 🛡️ VIRGIN-REPO PROTOCOL: FUSE STACK 70-POINT AUDIT

You are the **VRP Audit Master**. Execute the complete 70-point FUSE Stack compliance audit. This command is **100% self-sufficient** - no external documentation required.

## THE 70-POINT CHECKLIST (EMBEDDED)

### Layer 1: TypeScript Compiler (10 points)
1. Zero type errors in `src/`
2. Zero type errors in `fuse/`
3. Zero implicit `any` types
4. All hooks have proper return types exported
5. All components have proper prop types
6. No `@ts-ignore` comments
7. No `@ts-expect-error` comments
8. Strict mode enabled
9. All imports resolve correctly
10. No unused type declarations

### Layer 2: ESLint (TAV + ISV + FUSE) (15 points)
11. Zero `@typescript-eslint/no-explicit-any` violations
12. Zero `react/forbid-dom-props` (style) violations (ISV protection)
13. Zero loading state violations (FUSE Rule 1)
14. Zero fetch() violations in components (FUSE Rule 2)
15. Zero axios import violations (FUSE Rule 3)
16. Zero relative import violations (architectural cancer)
17. All exceptions properly configured in `eslint.config.mjs`
18. Zero unused variables
19. Zero missing dependencies in hooks
20. Zero console.log statements in production code
21. All async functions properly awaited
22. No hardcoded credentials or secrets
23. Proper React key props in lists
24. No missing alt text on images
25. No deprecated React patterns

### Layer 3: Next.js Build (10 points)
26. Build completes successfully
27. No build warnings (except FUSE Cookie dynamic route warnings - expected)
28. Bundle size under reasonable limits
29. Static pages generate successfully
30. No duplicate dependencies in bundle
31. All Server Actions use `"use server"`
32. No client components use `cookies()` directly
33. Environment variables properly configured
34. Image optimization working
35. Font optimization working

### Layer 4: FUSE Architecture (15 points)
36. `fuse/store/` directory exists with proper structure
37. `useFuse` hook properly exported
38. Provider pattern in layout files exists
39. All domains have hydration flags (isProductivityHydrated, etc.)
40. Cookie client exists: `fuse/store/session/cookieClient.ts`
41. `FuseCookiePayload` interface exists and is complete
42. `ClientHydrator.tsx` has cookie polling (500ms interval)
43. Domain registry exists: `src/lib/fuse/domains.ts`
44. All 5 domains registered (productivity, financial, clients, project, settings)
45. WRAP hooks follow `{ data, computed, actions, flags }` contract
46. All WRAP hooks export TypeScript return types
47. No direct Zustand usage outside `useFuse`
48. No loading states in components (FUSE violation)
49. No fetch() in components (FUSE violation)
50. Golden Bridge pattern enforced (mutations → cookie → hydration)

### Layer 5: Naming Conventions (10 points)
51. PascalCase for components (`ClientHydrator.tsx`)
52. camelCase for hooks (`useProductivityData.ts`)
53. kebab-case for utilities (`cookie-client.ts`)
54. SCREAMING_SNAKE_CASE for constants
55. No Hungarian notation
56. CSS tokens follow `--prefix-property-modifier` pattern
57. No raw color values in components
58. All tokens defined in CSS files
59. No abbreviations without explanation
60. Consistent file naming across domains

### Layer 6: Build & Runtime Integrity (10 points)
61. `.next/` output exists and is valid
62. No massive bundle chunks (>1MB warning)
63. Server Actions properly marked
64. No memory leaks in hydration
65. Cascade coverage verified (Vanish Protocol)
66. Environment variables loaded
67. No runtime errors in build logs
68. Static generation working for static pages
69. Dynamic pages properly marked
70. No conflicting route definitions

### Layer 7: Random Sampling (Pass/Fail)
- Pick 10 random files
- Deep inspect each for: proper imports, no hardcoded values, accessibility, error boundaries, TypeScript compliance, CSS token usage

## EXECUTION PROTOCOL

### Phase 1: Run Virgin-Check (Handles Points 1-35)

```bash
npm run virgin-check
```

This command runs:
- `tsc --noEmit` (TypeScript compiler)
- `eslint . --max-warnings=0` (ESLint with TAV + ISV + FUSE rules)
- `npm run build` (Next.js production build)

**Exit immediately if virgin-check fails with non-zero exit code.**

**Parse output for:**
- TypeScript error count
- ESLint violation count
- Build status

**Note on ISV (Inline Style Violations):**
- If ESLint passes with 0 violations, ISV is CLEAN
- Exceptions configured in `eslint.config.mjs` (search for "Exception patterns for FUSE-compliant dynamic styles")
- No need to check external markdown files
- Trust ESLint as source of truth

**Note on TAV (Type Any Violations):**
- ESLint rule `@typescript-eslint/no-explicit-any: "error"` catches all violations
- If ESLint passes, TAV is CLEAN
- No need to grep for `any` types manually

### Phase 2: FUSE Architecture Audit (Points 36-50)

**Check Store Structure:**
```bash
ls -la fuse/store/
```
Verify:
- `useFuse.ts` exists
- `session/cookieClient.ts` exists
- Store slices exist (productivity, financial, clients, project, settings)

**Check ClientHydrator:**
```bash
grep -c "setInterval" fuse/store/ClientHydrator.tsx
```
Should return 1 (500ms polling exists)

**Check Domain Registry:**
```bash
cat src/lib/fuse/domains.ts | grep -c "productivity\|financial\|clients\|project\|settings"
```
Should return 5 (all domains present)

**Check WRAP Hook Pattern:**
```bash
grep -r "return {" src/hooks/*.ts | grep -c "data.*computed.*actions.*flags"
```
Should match WRAP hook count

### Phase 3: Naming Convention Scan (Points 51-60)

**Component Naming:**
```bash
find src/components -name "*.tsx" | grep -v "^[A-Z]" | wc -l
```
Should return 0 (all PascalCase)

**Hook Naming:**
```bash
find src/hooks -name "use*.ts" | grep -v "^use[A-Z]" | wc -l
```
Should return 0 (all camelCase starting with "use")

**CSS Token Usage:**
```bash
grep -r "color: #" src/ --include="*.tsx" --include="*.css" | wc -l
```
Should be low (prefer CSS tokens)

### Phase 4: Build Integrity (Points 61-70)

**Check Build Output:**
```bash
ls -lh .next/static/chunks/*.js | awk '{if ($5 > 1000000) print $0}'
```
Should return 0 (no chunks over 1MB)

**Check Server Actions:**
```bash
grep -r "\"use server\"" src/ --include="*.ts" | wc -l
```
Should match server action count

**Cascade Coverage:**
```bash
npm run verify:cascade
```
Should pass (Vanish Protocol)

### Phase 5: Random Sampling (Point 70)

**Pick 10 random files:**
```bash
find src/ fuse/ -type f \( -name "*.ts" -o -name "*.tsx" \) | shuf -n 10
```

For each file:
1. Check imports are absolute (@ prefix)
2. No hardcoded strings for user-facing text
3. Proper TypeScript types (no implicit any)
4. CSS tokens used (no magic numbers)
5. No console.log statements
6. Proper error handling
7. Accessibility attributes where needed
8. Loading states properly handled
9. No memory leaks
10. Good code structure

## OUTPUT FORMAT

Display results as you audit:

```
═══════════════════════════════════════════════════════════
  VRP AUDIT: FUSE STACK 70-POINT COMPLIANCE
═══════════════════════════════════════════════════════════

🔍 Phase 1: Virgin-Check (Points 1-35)
   Running: npm run virgin-check...

   ✅ TypeScript: 0 errors (10/10 points)
   ✅ ESLint: 0 violations (15/15 points)
      - TAV: CLEAN
      - ISV: CLEAN (exceptions configured in eslint.config.mjs)
      - FUSE Rules: CLEAN
   ✅ Build: SUCCESS (10/10 points)

   Score: 35/35 ✅

🔍 Phase 2: FUSE Architecture (Points 36-50)
   Checking store structure...

   ✅ Store structure: Valid
   ✅ Cookie client: Exists
   ✅ ClientHydrator: Polling active
   ✅ Domain registry: Complete (5/5 domains)
   ✅ WRAP hooks: Compliant

   Score: 15/15 ✅

🔍 Phase 3: Naming Conventions (Points 51-60)
   Scanning naming patterns...

   ✅ Components: PascalCase
   ✅ Hooks: camelCase
   ✅ CSS Tokens: Valid

   Score: 10/10 ✅

🔍 Phase 4: Build Integrity (Points 61-70)
   Checking build output...

   ✅ Bundle size: Optimal
   ✅ Server Actions: Properly marked
   ✅ Cascade coverage: 100%

   Score: 10/10 ✅

🔍 Phase 5: Random Sampling
   Testing 10 random files...

   ✅ 10/10 files passed deep inspection

   Score: PASS ✅

═══════════════════════════════════════════════════════════
  FINAL RESULT
═══════════════════════════════════════════════════════════

Total Score: 70/70 ✅

Status: VIRGIN ✅
Violations: 0
FUSE Stack Integrity: 100%
Ground Zero Status: PRESERVED

All 7 layers passed compliance audit.
The repository is certified pure.
The architect's oath has been upheld.

═══════════════════════════════════════════════════════════
```

## FAILURE OUTPUT

If any layer fails:

```
═══════════════════════════════════════════════════════════
  VRP AUDIT: VIOLATIONS DETECTED
═══════════════════════════════════════════════════════════

❌ Phase 1: Virgin-Check FAILED

   ❌ TypeScript: 3 errors
      - src/components/Example.tsx:42 - Type 'string' not assignable to 'number'
      - src/hooks/useData.ts:15 - Property 'foo' does not exist
      - fuse/store/slice.ts:88 - Cannot find name 'undefined'

   ❌ ESLint: 5 violations
      - 2 TAV violations (explicit any)
      - 1 ISV violation (inline style NOT in eslint.config.mjs)
      - 2 FUSE violations (loading states)

   Score: 20/35 ❌

Total Score: 20/70 ❌

Status: CONTAMINATED ❌
Violations: 8
Ground Zero Status: BREACHED

Virgin-Repo Protocol demands: FIX FIRST, AUDIT SECOND.

Fix the violations above and re-run /vrpaudit.
═══════════════════════════════════════════════════════════
```

## EXECUTION FLOW

1. User invokes `/vrpaudit`
2. Announce audit start
3. Run Phase 1: `npm run virgin-check`
   - If fails: Report violations and EXIT
   - If passes: Continue to Phase 2
4. Run Phase 2: FUSE Architecture checks
5. Run Phase 3: Naming convention scans
6. Run Phase 4: Build integrity checks
7. Run Phase 5: Random sampling (10 files)
8. Calculate total score (70 points max)
9. Display final result with TTTG voice
10. Exit with status code (0 = PASS, 1 = FAIL)

## SUCCESS CRITERIA

Audit PASSES only when:
- ✅ All 70 points achieved
- ✅ `npm run virgin-check` exits 0 (zero violations)
- ✅ FUSE architecture fully compliant
- ✅ Naming conventions valid
- ✅ Build integrity maintained
- ✅ Random sampling: 10/10 files pass

## FAILURE CRITERIA

Audit FAILS if ANY of:
- ❌ `npm run virgin-check` exits non-zero
- ❌ FUSE architecture incomplete
- ❌ Naming conventions violated
- ❌ Build integrity compromised
- ❌ Random sampling: < 10/10 files pass

## IMPORTANT NOTES

**No External Dependencies:**
- This audit is 100% self-sufficient
- No markdown files required
- No exception documentation needed
- Trust `eslint.config.mjs` for ISV exceptions
- Trust ESLint rules for TAV enforcement
- All 70 points defined here

**Source of Truth:**
- ESLint output = ISV/TAV truth
- TypeScript compiler = Type safety truth
- Build output = Build integrity truth
- File system checks = Architecture truth

**Exception Handling:**
- ISV exceptions: Configured in `eslint.config.mjs` (search for "Exception patterns for FUSE-compliant dynamic styles")
- If ESLint passes, exceptions are already validated
- No need to read or parse markdown exception files
- Trust the tools, not the docs

Remember: **70 points. Zero violations. No compromises.**
