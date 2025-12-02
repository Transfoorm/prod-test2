---
description: VRP Manual Review - Human judgment checks that machines cannot automate
tags: [vrp, manual, review, ttts, srb]
---

# VRP MANUAL REVIEW PROTOCOL

You are the **VRP Manual Reviewer**. Your task is to perform human judgment checks that cannot be automated.

These checks require architectural understanding, not pattern matching.

---

## PHASE 1: TTTS MANUAL RULES (3 Checks)

### TTTS-8: No New Architecture Patterns

**Question:** Does this code introduce ANY new patterns not already established in FUSE?

**Check for:**
- New routing shapes (must use Sovereign Router pattern)
- New store patterns (must use FUSE slice pattern)
- New CSS rule structures (must use existing token system)
- New ADP variants (must follow existing WARP/PRISM)
- New data flow patterns (must follow Golden Bridge)

**How to check:**
1. Look at recently changed files
2. Compare patterns to existing `/fuse/`, `/src/store/`, `/src/appshell/`
3. Flag anything that "looks different"

**PASS if:** All patterns mirror existing FUSE conventions exactly.
**FAIL if:** Developer invented something new. Report:
```
TTTS-8 VIOLATION: New architectural pattern detected.
File: [filename]
Pattern: [describe what's new]
Transfoorm uses ONE WAY, not many.
```

---

### TTTS-9: Reversibility Rule

**Question:** Can this feature be completely deleted in one sprint without breaking other code?

**Check for:**
- Global refs that other files depend on
- Irreversible dependencies (things that "must exist" for app to work)
- Cascading imports (if you delete X, do Y and Z break?)
- Shared state mutations
- Database schema changes that can't be rolled back

**How to check:**
1. Identify the "boundary" of the feature
2. Ask: "If I deleted this folder, what else breaks?"
3. Check import graph for incoming dependencies

**PASS if:** Feature is an isolated island. Delete folder = done.
**FAIL if:** Deletion would cascade. Report:
```
TTTS-9 VIOLATION: Irreversible coupling detected.
Feature: [feature name]
Coupled to: [list dependencies]
This implementation creates irreversible coupling.
```

---

### TTTS-10: Non-Fireable Path Rule

**Question:** Does this implementation present multiple ways to do the same thing?

**Check for:**
- Multiple exported functions that do similar things
- "Option A" and "Option B" patterns
- Feature flags that enable "different modes"
- Comments like "you could also do it this way"
- Multiple valid code paths for the same outcome

**PASS if:** There is ONE obvious way to use this code.
**FAIL if:** Multiple paths exist. Report:
```
TTTS-10 VIOLATION: Multiple solution paths found.
Location: [file/feature]
Paths found: [list the options]
Only ONE TTT-compliant path may exist.
```

---

## PHASE 2: SRB MANUAL RULES (15 Checks)

Review each Sovereignty Rule. Many overlap with automated checks but require human judgment for edge cases.

### SRB-1: Domain Pages Must Never Execute Server Code
- No `export const dynamic`
- No `fetch` in page components
- No async server functions
- No RSC data reads
- No server actions in domain pages

**Check:** `/src/app/domain/` files for any server-side code.

---

### SRB-2: Domain Navigation Must Not Use router.push
- `router.push` = App Router = server round trip
- Must use `navigate('page')` only

**Check:** Search for `router.push` in domain files.

---

### SRB-3: All Domain Views Must Render From FUSE First
- Pages read from FUSE store
- Render instantly
- Use WarpPlaceholder if data missing (not loading states)

**Check:** Domain views for direct data fetching.

---

### SRB-4: Convex Can NEVER Be Called Inside a View
- Convex = background sync only
- Must ONLY be called inside `/fuse/sync/`

**Check:** Search for `useQuery`, `useMutation` outside `/fuse/`.

---

### SRB-5: Domain Files Must Be Pure Client Components
- All files in `/views` must begin with `'use client';`

**Check:** First line of every view file.

---

### SRB-6: WARP Must Preload Before First Navigation
- FuseApp must call `runWarpPreload()` inside useEffect on mount

**Check:** FuseApp component for WARP initialization.

---

### SRB-7: FUSE Store is the Only Source of Truth
**Allowed:** FUSE atoms, selectors, computed state, preload objects
**Forbidden:** useState for domain data, fetch('/api'), direct Convex, localStorage, sessionStorage

**Check:** Domain components for forbidden state patterns.

---

### SRB-8: No Side Effects in Views
- `useEffect -> do things` forbidden in domain views
- Only allowed in `/fuse/sync`, `/fuse/state`, `/fuse/prefetch`

**Check:** useEffect usage in view components.

---

### SRB-9: UI Must Never Block on Network Requests
- No loading spinners
- Placeholders only (WarpPlaceholder pattern)

**Check:** Search for "loading", "spinner", "isLoading" in UI.

---

### SRB-10: App Router Cannot Interfere Once FuseApp Mounts
- No App Router `<Link>` inside /views
- No RSC layout remounts

**Check:** Link imports in domain views.

---

### SRB-11: Every Navigation Must Be 32-65ms
- Warn at >65ms
- Fail at >120ms

**Check:** Manual performance testing of navigation.

---

### SRB-12: All Domain Components Must Be Stateless
- State = FUSE
- Logic = PRISM
- Sync = Convex
- Components may not hold domain logic

**Check:** useState in domain components (only UI state allowed).

---

### SRB-13: Sovereign Router May Never Unmount
- FuseApp & Sovereign Router are persistent
- Unmounting = memory loss

**Check:** Component lifecycle, route changes don't unmount shell.

---

### SRB-14: FUSE Must Be Fully Ready Before First Domain Render
- FuseApp must block domain views until store has:
  - user
  - workspace
  - permissions
  - core datasets

**Check:** FuseApp gating logic.

---

### SRB-15: A Dev Cannot Disable TTT Sovereignty Enforcement
- `.vrp-approval` cannot be created locally
- Must come from CI
- No bypassing hooks, lint rules, approvals, or sovereign checks

**Check:** No local bypass attempts.

---

## PHASE 3: REPORT

After reviewing all rules, provide a summary:

```
═══════════════════════════════════════════════════════════
  VRP MANUAL REVIEW COMPLETE
═══════════════════════════════════════════════════════════

TTTS Manual Rules:
  TTTS-8  (No New Patterns):    ✅ PASS | ❌ FAIL
  TTTS-9  (Reversibility):      ✅ PASS | ❌ FAIL
  TTTS-10 (Non-Fireable):       ✅ PASS | ❌ FAIL

SRB Sovereignty Rules:
  SRB-1  (No Server Code):      ✅ PASS | ❌ FAIL
  SRB-2  (No router.push):      ✅ PASS | ❌ FAIL
  SRB-3  (FUSE First):          ✅ PASS | ❌ FAIL
  SRB-4  (No Convex in Views):  ✅ PASS | ❌ FAIL
  SRB-5  (use client):          ✅ PASS | ❌ FAIL
  SRB-6  (WARP Preload):        ✅ PASS | ❌ FAIL
  SRB-7  (FUSE Only Truth):     ✅ PASS | ❌ FAIL
  SRB-8  (No View Effects):     ✅ PASS | ❌ FAIL
  SRB-9  (No Loading Block):    ✅ PASS | ❌ FAIL
  SRB-10 (No App Router):       ✅ PASS | ❌ FAIL
  SRB-11 (32-65ms Nav):         ✅ PASS | ⚠️ SKIP (requires runtime test)
  SRB-12 (Stateless Components):✅ PASS | ❌ FAIL
  SRB-13 (No Unmount):          ✅ PASS | ⚠️ SKIP (requires runtime test)
  SRB-14 (FUSE Ready Gate):     ✅ PASS | ❌ FAIL
  SRB-15 (No Bypass):           ✅ PASS | ❌ FAIL

VIOLATIONS FOUND: [count]

[List each violation with file and description]

═══════════════════════════════════════════════════════════
```

---

## EXECUTION FLOW

1. User invokes `/VRP-manual`
2. Check git status/diff to see what changed recently
3. Run through TTTS-8, 9, 10 checks on changed files
4. Run through SRB-1 to SRB-15 checks
5. Generate report with pass/fail for each
6. List all violations with specific files and descriptions
7. Recommend fixes for any failures

---

## WHEN TO USE

- Before major PRs
- After significant refactoring
- Weekly architecture reviews
- When onboarding new patterns
- Before releases

**Remember:** These checks require JUDGMENT. Machines check syntax. Humans check architecture.
