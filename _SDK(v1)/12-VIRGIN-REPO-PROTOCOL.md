# 11. VIRGIN-REPO PROTOCOL (VRP)

**The Ultimate Code Quality Enforcement System**

---

## Table of Contents
1. [What is VRP?](#what-is-vrp)
2. [The 7 Layers of Protection](#the-7-layers)
3. [The 3 Sacred Commands](#the-3-commands)
4. [TAV & ISV Protection](#tav-isv-protection)
5. [Ground Zero Certification](#ground-zero)
6. [Integration with FUSE](#integration)
7. [Philosophy & Principles](#philosophy)

---

## What is VRP?

**Virgin-Repo Protocol (VRP)** is a zero-tolerance code quality enforcement system that ensures **every commit** maintains architectural purity across 7 critical layers.

### The Core Principle

> **"One violation = FAIL. No compromises. No exceptions."**

VRP treats code quality violations like security vulnerabilities - they must be fixed **before** they enter the repository, not after.

### Why "Virgin"?

A **virgin repository** is one that has never been contaminated with:
- Type errors
- ESLint violations
- Build failures
- Architectural drift
- Inline style viruses (ISV)
- Type Any viruses (TAV)
- FUSE pattern violations

Once contaminated, a repository loses its virgin status. VRP maintains this purity through **continuous enforcement**.

---

## The 7 Layers of Protection

VRP enforces quality across 7 distinct layers:

### Layer 1: TypeScript Compiler (10 points)
- Zero type errors in `src/` and `fuse/`
- Zero implicit `any` types
- All hooks have proper return types exported
- All components have proper prop types
- No `@ts-ignore` or `@ts-expect-error` comments
- Strict mode enabled
- All imports resolve correctly
- No unused type declarations

**Tool:** `tsc --noEmit`

### Layer 2: ESLint (TAV + ISV + FUSE) (15 points)
- Zero `@typescript-eslint/no-explicit-any` violations (TAV protection)
- Zero `react/forbid-dom-props` violations (ISV protection)
- Zero loading state violations (FUSE Rule 1)
- Zero fetch() violations in components (FUSE Rule 2)
- Zero axios import violations (FUSE Rule 3)
- Zero relative import violations (architectural cancer)
- Proper React patterns (keys, dependencies, accessibility)

**Tool:** `eslint . --max-warnings=0`

### Layer 3: Next.js Build (10 points)
- Build completes successfully
- No build warnings (except FUSE Cookie dynamic route warnings - expected)
- Bundle size under reasonable limits
- Static pages generate successfully
- All Server Actions use `"use server"`
- No client components use `cookies()` directly
- Environment variables properly configured

**Tool:** `npm run build`

### Layer 4: FUSE Architecture (15 points)
- `fuse/store/` structure exists and is valid
- `useFuse` hook properly exported
- Provider pattern in layout files
- All domains have hydration flags
- Cookie client exists with proper polling
- Domain registry complete (5 domains)
- WRAP hooks follow `{ data, computed, actions, flags }` contract
- No loading states in components
- No fetch() in components
- Golden Bridge pattern enforced

**Tool:** File system checks + pattern verification

### Layer 5: Naming Conventions (10 points)
- PascalCase for components
- camelCase for hooks
- kebab-case for utilities
- SCREAMING_SNAKE_CASE for constants
- CSS tokens follow `--prefix-property-modifier` pattern
- No raw color values in components
- All tokens defined in CSS files

**Tool:** File naming scans + grep patterns

### Layer 6: Build & Runtime Integrity (10 points)
- `.next/` output exists and is valid
- No massive bundle chunks (>1MB warning)
- Server Actions properly marked
- Cascade coverage verified (Vanish Protocol)
- Environment variables loaded
- No runtime errors in build logs
- Static generation working
- No conflicting route definitions

**Tool:** Build output analysis

### Layer 7: Random Sampling (Pass/Fail)
- Pick 10 random files
- Deep inspect for: proper imports, no hardcoded values, accessibility, error boundaries, TypeScript compliance, CSS token usage

**Tool:** Manual inspection of random samples

---

## The 3 Sacred Commands

VRP provides 3 slash commands for enforcement:

### 1. `/purecommit` - Sacred Commit Ritual

**Purpose:** Enforce VRP compliance before creating commits

**Flow:**
```
/purecommit
   ↓
Run virgin-check (TypeScript + ESLint + Build)
   ↓
If CLEAN → Create commit with VRP-Compliant tag
   ↓
Ask: "Push to remote? 1=YES, 2=NO"
   ↓
If YES → Push immediately (no re-check)
If NO → Exit gracefully
```

**Features:**
- Runs `npm run virgin-check` once
- Rejects commit if any violations found
- Tags all commits as "VRP-Compliant"
- Interactive push option with proper UI
- Uses AskUserQuestion tool (not text input)

**Example Commit Message:**
```
VRP-Compliant: Add user profile feature

Implemented complete user profile system with:
- Profile editing
- Avatar upload
- Settings management

Benefits:
- Centralized user data management
- Improved UX with real-time updates
- Type-safe profile interface

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 2. `/purepush` - Sacred Push Ritual

**Purpose:** Enforce VRP compliance before pushing to remote

**Flow:**
```
/purepush
   ↓
Run virgin-check
   ↓
Check branch status & working tree
   ↓
If CLEAN → Push to origin
   ↓
Confirm push succeeded with purity declaration
```

**Features:**
- Full virgin-check before push
- Branch analysis and working tree validation
- Force push protection (blocks main/master)
- Remote contamination prevention
- Post-push purity certification

**Use Case:**
- When you have existing commits to push
- When you want push-only enforcement
- When you skipped push in `/purecommit`

### 3. `/vrpaudit` - 70-Point Compliance Audit

**Purpose:** Complete FUSE Stack compliance audit (100% self-sufficient)

**Flow:**
```
/vrpaudit
   ↓
Phase 1: Virgin-Check (Points 1-35)
   ↓
Phase 2: FUSE Architecture (Points 36-50)
   ↓
Phase 3: Naming Conventions (Points 51-60)
   ↓
Phase 4: Build Integrity (Points 61-70)
   ↓
Phase 5: Random Sampling (10 files)
   ↓
Calculate total score (70 points max)
   ↓
Display final result with TTTG voice
```

**Features:**
- 100% self-sufficient (no external docs required)
- All 70 points embedded in command
- Trusts tools as source of truth (ESLint, TSC, Build)
- No markdown file dependencies
- Clear pass/fail output
- TTTG voice for declarations

**Output Example (PASS):**
```
═══════════════════════════════════════════════════════════
  VRP AUDIT: FUSE STACK 70-POINT COMPLIANCE
═══════════════════════════════════════════════════════════

🔍 Phase 1: Virgin-Check (Points 1-35)
   ✅ TypeScript: 0 errors (10/10 points)
   ✅ ESLint: 0 violations (15/15 points)
   ✅ Build: SUCCESS (10/10 points)
   Score: 35/35 ✅

🔍 Phase 2: FUSE Architecture (Points 36-50)
   ✅ Store structure: Valid
   ✅ Cookie client: Exists
   ✅ WRAP hooks: Compliant
   Score: 15/15 ✅

[... additional phases ...]

═══════════════════════════════════════════════════════════
  FINAL RESULT
═══════════════════════════════════════════════════════════

Total Score: 70/70 ✅

Status: VIRGIN ✅
Violations: 0
FUSE Stack Integrity: 100%
Ground Zero Status: PRESERVED
═══════════════════════════════════════════════════════════
```

---

## TAV & ISV Protection

VRP includes two critical virus protection systems:

### TAV (Type Any Virus) Protection

**What is TAV?**
- The use of explicit `any` types in TypeScript
- Disables type checking and creates runtime errors
- Spreads through the codebase like a virus

**Enforcement:**
```js
// eslint.config.mjs
"@typescript-eslint/no-explicit-any": "error"
```

**Examples:**
```typescript
// ❌ TAV INFECTION
function process(data: any) { ... }
const result = value as any;
const obj: Record<string, any> = {};

// ✅ TAV-FREE
function process(data: UserData) { ... }
const result = value as User;
const obj: Record<string, User> = {};
```

**Exception Handling:**
- Exceptions configured in `eslint.config.mjs`
- If ESLint passes → TAV is CLEAN
- Trust ESLint as source of truth

### ISV (Inline Style Virus) Protection

**What is ISV?**
- The use of inline `style={{}}` props in React components
- Destroys design system consistency
- Prevents performance optimizations
- Creates maintenance nightmares

**Enforcement:**
```js
// eslint.config.mjs
"react/forbid-dom-props": [
  "error",
  {
    forbid: [
      {
        propName: "style",
        message: "⛔ INLINE STYLE VIRUS DETECTED! Use CSS classes..."
      }
    ]
  }
]
```

**Examples:**
```tsx
// ❌ ISV INFECTION
<div style={{color: 'red', fontSize: '16px'}} />

// ✅ ISV-FREE (Use CSS classes)
<div className="text-error text-base" />

// ✅ ISV-FREE (Use CSS tokens)
<div className="vr-button vr-button--primary" />
```

**Legitimate Exceptions (Dynamic Law):**
```tsx
// ✅ ALLOWED - Runtime-calculated positioning
<Tooltip style={{
  top: `${position.y}px`,
  left: `${position.x}px`
}} />

// ✅ ALLOWED - CSS variable bridges
<div style={{
  '--rank-color': meta.color,
  '--rank-bg': meta.bgColor
} as React.CSSProperties} />

// ✅ ALLOWED - Runtime percentage for sliders
<input style={{
  background: `linear-gradient(...${percentage}%...)`
}} />
```

**Exception Handling:**
- Exceptions configured in `eslint.config.mjs` (lines 150-176)
- If ESLint passes → ISV is CLEAN
- Trust ESLint as source of truth

---

## Ground Zero Certification

**Ground Zero** is the state of a repository with **zero violations** across all 7 layers.

### Achieving Ground Zero

1. Run `/vrpaudit` to baseline current state
2. Fix all violations one layer at a time
3. Run `npm run virgin-check` to verify
4. Commit with `/purecommit`
5. Push with `/purepush`
6. Maintain with VRP commands for all future work

### Maintaining Ground Zero

**The Golden Rule:**
> **Never commit without `/purecommit`. Never push without `/purepush`.**

**The Workflow:**
```bash
# Make changes to code
git add .

# Commit with VRP enforcement
/purecommit

# Choose to push (1) or not (2)
# If 2, push later with:
/purepush

# Periodic audit
/vrpaudit
```

### Ground Zero Benefits

- ✅ Zero technical debt accumulation
- ✅ Always production-ready
- ✅ Onboarding new devs is instant (no cleanup needed)
- ✅ Refactoring is safe (type safety guaranteed)
- ✅ Performance is predictable (no inline style bloat)
- ✅ Architecture stays pure (FUSE patterns enforced)

---

## Integration with FUSE

VRP is not separate from FUSE - it's **FUSE enforcement**.

### FUSE Without VRP

Without VRP, FUSE patterns can drift:
- Developers might add loading states "just this once"
- Someone might use fetch() "for this one case"
- Inline styles creep in "temporarily"
- Type safety erodes over time

### VRP + FUSE = Architectural Integrity

VRP enforces the FUSE principles:

| FUSE Principle | VRP Enforcement |
|----------------|-----------------|
| No loading states | ESLint blocks `useState` with `loading` variables |
| No client-side fetch | ESLint blocks `fetch()` in components |
| Golden Bridge pattern | Checks for mutation → cookie → hydration flow |
| WRAP hooks | Validates `{ data, computed, actions, flags }` structure |
| CSS tokens only | ESLint blocks inline styles (ISV protection) |
| Type safety | TypeScript + TAV protection |

### The VRP-FUSE Loop

```
Write Code
   ↓
/purecommit (VRP enforcement)
   ↓
If violations → Fix immediately
   ↓
If clean → Commit tagged "VRP-Compliant"
   ↓
FUSE patterns preserved ✅
   ↓
Repository stays virgin ✅
   ↓
Continue development with confidence
```

---

## Philosophy & Principles

### The TTTG Voice (Transfoorm Technical Truth-Telling Guy)

VRP output uses **TTTG voice** - direct, precise, no-nonsense declarations:

**Good TTTG:**
```
❌ VIRGIN STATUS: VIOLATED
❌ TypeScript: 3 errors
🚫 COMMIT REJECTED

Virgin-Repo Protocol demands: FIX FIRST, COMMIT SECOND.
```

**Bad (Non-TTTG):**
```
Oops! Looks like there are a few type errors.
Maybe you could fix them when you get a chance? 😊
```

### Zero Tolerance Philosophy

**Why zero tolerance?**

1. **Violations Compound**
   - One `any` type spreads to 10 files in a week
   - One inline style becomes "the pattern" everyone copies
   - One loading state becomes "how we do things"

2. **Cognitive Load**
   - "Some violations allowed" = developers waste time deciding
   - Zero violations = clear, simple rule

3. **Trust**
   - If build passes, code is production-ready
   - No "it builds but..." scenarios

### The Sacred Oath

Every developer using VRP takes the sacred oath:

> **"I commit to writing code that passes virgin-check on the first try. I will not bypass, workaround, or --no-verify. I will fix violations immediately. I will maintain Ground Zero."**

### Enforcement Without Exceptions

**The Rule:**
```
IF npm run virgin-check passes:
  THEN commit is blessed
ELSE:
  THEN commit is rejected
```

No special cases. No "but this is urgent". No "I'll fix it later".

**One violation = FAIL.**

---

## Quick Reference

### Commands Summary

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/purecommit` | Create VRP-compliant commit | Every commit |
| `/purepush` | Push with VRP verification | When ready to share |
| `/vrpaudit` | Full 70-point audit | Weekly/before releases |

### Violation Checklist

If VRP fails, check:
- [ ] TypeScript errors? → Fix types
- [ ] ESLint violations? → Fix lint errors
- [ ] Build failures? → Fix build issues
- [ ] TAV infections? → Replace `any` with proper types
- [ ] ISV infections? → Replace inline styles with CSS classes
- [ ] FUSE violations? → Remove loading states/fetch calls
- [ ] Naming violations? → Fix file/variable names

### Emergency Recovery

If you accidentally committed violations:

```bash
# Option 1: Amend the commit
git reset --soft HEAD~1
# Fix violations
/purecommit

# Option 2: Revert and recommit
git revert HEAD
/purecommit
```

---

## Conclusion

Virgin-Repo Protocol is not bureaucracy - it's **architectural self-defense**.

Every violation you prevent is:
- Hours saved debugging later
- Performance issues avoided
- Onboarding friction eliminated
- Technical debt prevented

**The cost of enforcement:** 30 seconds per commit to run virgin-check

**The cost of no enforcement:** Weeks of cleanup, migration projects, "refactoring sprints", architecture drift, team confusion

Choose virgin. Choose VRP.

---

**Status:** Production-Ready
**Version:** 2.0 (Ground Zero Certified)
**Last Updated:** 2025-11-04
**Maintained By:** VRP Audit Master (Claude)
