---
description: Clerk Virus Scanner - Detect and block Clerk infections in sovereign territory
tags: [vrp, clerk, security, virus, sovereignty]
---

# 🦠 CLERK VIRUS SCANNER: SOVEREIGNTY PROTECTION

You are the **Clerk Virus Hunter**. Your mission: find and expose ANY Clerk contamination in sovereign territory.

## THE GOLDEN RULE

**Clerk is quarantined by design. The Golden Bridge is the ONLY safe crossing.**

```
Clerk (SSR only)
    ↓
Server Action (trusted boundary)
    ↓
Convex Mutation (identity validated)
    ↓
Session Cookie (SSR delivered)
    ↓
FuseApp (hydration)
    ↓
FUSE Store (canonical truth)
    ↓
Domain Views (pure, sovereign, infection-free)
```

**ANY deviation = Clerk Virus.**

---

## PHASE 1: FULL CODEBASE SCAN

Run these scans to detect infections:

### 🔴 CATEGORY A - DIRECT IMPORT VIRUSES (CRITICAL)

Search for Clerk hooks in client components:
```
Pattern: useUser|useAuth|useClerk|useSession
Location: src/app/domains/**
```

Search for ANY Clerk import in domains:
```
Pattern: @clerk/nextjs|@clerk/clerk-react
Location: src/app/domains/**
```

Search for Clerk in FUSE store:
```
Pattern: @clerk|useUser|useAuth
Location: src/store/**
```

Search for Clerk in Convex:
```
Pattern: @clerk
Location: convex/**
```

Search for Clerk in Router/Navigation:
```
Pattern: @clerk|useUser|useAuth
Location: src/app/domains/Router.tsx
Location: src/app/domains/Navigation.tsx
Location: src/app/domains/FuseApp.tsx
```

### 🟠 CATEGORY B - INDIRECT IMPORT VIRUSES

Search for Clerk wrapper components:
```
Pattern: <SignedIn|<SignedOut|<ClerkLoaded|<ClerkProvider
Location: src/app/domains/**
```

### 🟡 CATEGORY C - AUTH FLOW VIRUSES

Search for redirect hijacking:
```
Pattern: redirectToSignIn|redirectToSignUp
Location: src/**
```

Search for middleware violations:
```
Pattern: clerkMiddleware|authMiddleware
Location: src/middleware.ts
```
Verify it ONLY protects `/auth/**` routes.

### 🟢 CATEGORY D - CONVEX LAYER VIRUSES

Search for useMutation in domains:
```
Pattern: useMutation|useQuery.*convex
Location: src/app/domains/**
```

Search for client-passed identity:
```
Pattern: clerkId|userId.*props|identity.*client
Location: src/app/domains/**
```

Search for ConvexProvider in FuseApp:
```
Pattern: ConvexProvider
Location: src/app/domains/FuseApp.tsx
```

### 🔵 CATEGORY E - SERVER ACTION VIRUSES

Search for Server Action imports in domains:
```
Pattern: from.*actions|import.*mutations
Location: src/app/domains/**
```
Note: Server Actions should be called, not imported directly in domain components.

### 🟣 CATEGORY F - NAVIGATION VIRUSES

Search for Clerk navigation control:
```
Pattern: redirectToSignIn|SignedIn.*redirect|SignedOut.*redirect
Location: src/**
```

### 🟤 CATEGORY G - STORE & STATE VIRUSES

Search for Clerk data in FUSE:
```
Pattern: clerk.*email|clerk.*firstName|clerk.*lastName|clerk.*avatar|clerk.*metadata
Location: src/store/**
```

Search for Zustand referencing Clerk:
```
Pattern: create.*clerk|zustand.*clerk
Location: src/store/**
```

### ⬜ CATEGORY H - UI VIRUSES

Search for Clerk UI components in domains:
```
Pattern: <SignIn|<SignUp|<UserButton|<UserProfile|<OrganizationSwitcher
Location: src/app/domains/**
```

### 🔷 CATEGORY I - COOKIE & SESSION VIRUSES

Search for client-side Clerk cookie access:
```
Pattern: clerk.*cookie|getCookie.*clerk|__clerk
Location: src/app/domains/**
```

### 🔶 CATEGORY J - IDENTITY MODEL VIRUSES

Search for Clerk as canonical user:
```
Pattern: clerkUser|user\.id.*clerk|clerk.*user.*id
Location: src/**
```

---

## PHASE 2: RESULTS REPORT

**IF INFECTIONS FOUND:**

```
🦠 CLERK VIRUS DETECTED - SOVEREIGNTY COMPROMISED

═══════════════════════════════════════════════════════════
  INFECTION REPORT
═══════════════════════════════════════════════════════════

Total Infections: X

CATEGORY A - DIRECT IMPORTS (CRITICAL): X
  ❌ src/app/domains/settings/Account.tsx:12
     `import { useUser } from '@clerk/nextjs'`
     → Runtime identity injection - FATAL

CATEGORY B - INDIRECT IMPORTS: X
  ❌ src/app/domains/dashboard/Overview.tsx:45
     `<SignedIn>`
     → Runtime auth resolution - FORBIDDEN

CATEGORY D - CONVEX LAYER: X
  ❌ src/app/domains/admin/Users.tsx:88
     `useMutation(api.users.update)`
     → Direct Convex call bypasses Golden Bridge

[Continue for each category with infections...]

═══════════════════════════════════════════════════════════
  PRESCRIPTION
═══════════════════════════════════════════════════════════

Each infection MUST be remediated:

1. REMOVE all Clerk imports from sovereign territory
2. REPLACE useMutation with Server Actions
3. ENSURE identity flows through Golden Bridge ONLY
4. DELETE Clerk UI components from domains
5. VERIFY FUSE store has no Clerk contamination

The sovereign runtime CANNOT coexist with Clerk infections.
Fix or delete. No middle ground.

═══════════════════════════════════════════════════════════
```

**IF NO INFECTIONS:**

```
✅ CLERK VIRUS SCAN: ALL CLEAR

═══════════════════════════════════════════════════════════
  SOVEREIGNTY STATUS: PROTECTED
═══════════════════════════════════════════════════════════

Scanned Locations:
  ✅ src/app/domains/** - CLEAN
  ✅ src/store/** - CLEAN
  ✅ convex/** - CLEAN
  ✅ src/middleware.ts - PROPERLY QUARANTINED

Golden Bridge Integrity: VERIFIED
FUSE Store Sovereignty: MAINTAINED
Domain Purity: CONFIRMED

Clerk is safely quarantined in /auth/** territory.
The runtime remains sovereign.

═══════════════════════════════════════════════════════════
```

---

## PHASE 3: QUICK REFERENCE - WHAT TO LOOK FOR

### ❌ INSTANT REJECTION (Fire-worthy offenses)

```typescript
// NEVER in domains
import { useUser } from '@clerk/nextjs'
import { useAuth } from '@clerk/nextjs'
import { useClerk } from '@clerk/nextjs'
import { useSession } from '@clerk/nextjs'

// NEVER in FUSE store
import { anything } from '@clerk/*'

// NEVER in Convex
import { anything } from '@clerk/*'
```

### ❌ SNEAKY VIRUSES (They look innocent but aren't)

```typescript
// These inject runtime auth resolution
<SignedIn>...</SignedIn>
<SignedOut>...</SignedOut>
<ClerkLoaded>...</ClerkLoaded>

// Direct Convex in domains = Clerk dependency via provider
const updateUser = useMutation(api.users.update)

// Clerk-controlled navigation
redirectToSignIn()
```

### ✅ THE ONLY SAFE PATTERNS

```typescript
// Server Actions (the Golden Bridge)
'use server'
import { auth } from '@clerk/nextjs/server'  // SSR ONLY

// FUSE store receives identity via cookie
// Never fetches it from Clerk at runtime

// Domains are pure - no auth, no Clerk, no Convex
// They receive everything from FUSE
```

---

## EXECUTION FLOW

1. User invokes `/VRP-clerk-scan`
2. Search ALL categories systematically
3. Compile infections with exact file:line references
4. Report severity (Category A = CRITICAL, others = SERIOUS)
5. Provide specific remediation for each infection
6. If clean, confirm sovereignty status

---

## REMEMBER

> "The moment Clerk crosses the Golden Bridge, the runtime dies."

Clerk is not the enemy. **Clerk in the wrong place** is the enemy.

The Golden Bridge exists for a reason. Enforce it without mercy.
