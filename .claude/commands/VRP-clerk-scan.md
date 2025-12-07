---
description: Clerk Virus Scanner - Detect and block Clerk infections in sovereign territory
tags: [vrp, clerk, security, virus, sovereignty]
---

# 🛡️ CLERK KNOX SOVEREIGN DOCTRINE — TOTAL LOCKDOWN

Clerk is permitted **ONLY** in:
  • `/app/(auth)/**`
  • `/app/(vanish)/**`
  • `middleware.ts` (SSR boundary only)

Everywhere else:
  ❌ ZERO Clerk imports
  ❌ ZERO auth() calls
  ❌ ZERO getToken()
  ❌ ZERO clerkClient()
  ❌ ZERO Clerk UI components
  ❌ ZERO Clerk identity entering Golden Bridge
  ❌ ZERO Clerk tokens passed to Convex
  ❌ ZERO dual-identity models

FUSE is the ONE TRUE IDENTITY SOURCE.
Golden Bridge must remain IDENTITY-STERILE.
Convex must ONLY receive FUSE-derived identity.

Any deviation MUST be treated as a CRITICAL SOVEREIGN BREACH.

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
Pattern: import\s*{\s*useUser\s*}\s*from\s*['"]@clerk/nextjs['"]|
         import\s*{\s*useAuth\s*}\s*from\s*['"]@clerk/nextjs['"]|
         import\s*{\s*useClerk\s*}\s*from\s*['"]@clerk/nextjs['"]|
         import\s*{\s*useSession\s*}\s*from\s*['"]@clerk/nextjs['"]
Location: src/app/domains/**
```

Search for ANY Clerk import in domains:
```
Pattern: import.*from\s*['"]@clerk/.*['"]
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

### 🟪 CATEGORY K - GOLDEN BRIDGE IDENTITY BREACHES

Search for:
```
Pattern: getToken\(|setAuth|sessions\.revokeSession|clerkClient.*session
Location: src/app/actions/**
```

Description:
```
These patterns indicate Clerk identity crossing into the Golden Bridge layer. 
Only /app/(auth)/actions/** may call Clerk identity APIs. 
Any Server Action outside the Auth Boundary must NOT generate Clerk tokens, 
set Convex auth directly, or perform identity translation.
```

---
### 🟥 CATEGORY L — SSR AUTH BREACHES

Search for:
```
Pattern: auth\(|clerkClient\(
Location: src/app/actions/**
```

These indicate SSR identity entering business logic:
  • Server Actions acting as identity brokers
  • Unauthorized Clerk identity retrieval
  • Leakage of Clerk user fields into runtime

---
### 🟦 CATEGORY M — HYDRATION & PRELOAD CONTAMINATION

Search for timing-based identity issues:
```
Pattern: FuseApp|hydrate|requestIdleCallback|PRISM|WARP
Location: src/**
```

These suggest:
  • Hydrating FuseApp before FUSE_5.0 cookie is read  
  • WARP/PRISM preloading before identity is stable  
  • Router rendering while identity is undefined  

---
### 🟪 CATEGORY N — RUNTIME ELEVATION VIRUSES

Search for UI elevation leaks:
```
Pattern: router|navigate|setCookie|sessionStorage|localStorage
Location: src/**
```

These reveal:
  • Any UI element influencing identity state  
  • Clerk-dependent logic indirectly altering router/session  
  • Dual identity systems forming inside components  
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

## 🚨 NEVER AGAIN FALSE NEGATIVES — SCANNER REQUIREMENTS

A scan MUST FAIL if ANY of the following are detected:

• Clerk identity inside ANY Server Action outside /app/(auth)
• getToken(), auth(), or clerkClient() used for business logic
• Convex receiving Clerk-derived identity or tokens
• Identity translation happening inside Golden Bridge
• Hydration BEFORE FUSE cookie lock
• Any Clerk reference in FuseApp, Shell, Domains, Features, or Convex
• Domain logic referencing Clerk metadata or Clerk user shapes
• Dual identity detected in params, cookies, or store

If the scanner passes while any of these exist,
**then the scanner is invalid and MUST be updated immediately.**

All Sovereign Documents — 99 Ways, High Alert, VRP Scanner —
must remain in PERFECT doctrinal alignment.

---

## PHASE 3: QUICK REFERENCE - WHAT TO LOOK FOR

### ❌ INSTANT REJECTION (Fire-worthy offenses)

```typescript
// NEVER in domains — Clerk imports ONLY (FUSE.useUser is permitted)
import { useUser } from '@clerk/nextjs'
import { useAuth } from '@clerk/nextjs'
import { useClerk } from '@clerk/nextjs'
import { useSession } from '@clerk/nextjs'

// NEVER in FUSE store
import { anything } from '@clerk/*'

// NEVER in Convex
import { anything } from '@clerk/*'
```

⚠️ IMPORTANT  
The scanner must distinguish FUSE identity hooks from Clerk hooks.  
Only imports originating from the @clerk/* namespace constitute a virus.  
Identifiers such as useFuse, useFuseUser, FuseUser, or FUSE user selectors  
MUST NOT trigger false positives. The patterns above enforce exact matching.
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
