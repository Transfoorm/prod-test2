---
description: Clerk Virus Scanner - Dante-Grade Sovereignty Enforcement
tags: [vrp, clerk, security, virus, sovereignty, doctrine]
---

# 🛡️ CLERK VIRUS SCANNER — THE SUPREME ENFORCER

**This scanner enforces the doctrine defined in:**
- `_clerk-virus/TTT-CLERK-VIRUS-HIGH-ALERT.md`
- `_clerk-virus/TTT-99-WAYS-CLERK-CAN-INFECT.md`

**Every rule. Every category. Every prohibition. Word-for-word.**

**If a scan passes while ANY violation exists, the scanner is invalid and MUST be rewritten immediately. No exceptions. No leniency. No interpretation.**

---

## PHASE 0: DOCTRINE LOADING (MANDATORY FIRST STEP)

Before ANY scan, you MUST:

1. **Read BOTH doctrine files:**
   - `_clerk-virus/TTT-CLERK-VIRUS-HIGH-ALERT.md`
   - `_clerk-virus/TTT-99-WAYS-CLERK-CAN-INFECT.md`

2. **Extract and memorize:**
   - All Category definitions (A through N, X)
   - All prohibited patterns
   - All forbidden locations
   - All identity flow rules
   - All cookie sovereignty rules
   - All Convex sovereignty rules

3. **Verify doctrine integrity:**
   - Both files MUST exist
   - Scanner MUST enforce ALL categories
   - FAIL IMMEDIATELY if doctrine cannot be loaded

**The doctrine is LAW. You do not interpret. You ENFORCE.**

---

## PHASE 1: IDENTITY BIRTH SOVEREIGNTY (THE ORIGIN SCAN)

**This is the MOST CRITICAL scan. Without it, all other scans are downstream of a corrupted birth.**

**The Question This Phase Answers:**
- Where does identity BEGIN in this application?
- Is the FUSE session minted with Convex identity as PRIMARY, or is it derivative of Clerk?
- Is the Convex `_id` established BEFORE the session ticket is created?
- Does Clerk cross the Golden Bridge at the moment of birth?

**Scan Locations:**
- `src/app/api/session/route.ts` (PRIMARY SESSION BIRTH POINT)
- `src/app/api/session/refresh/route.ts` (Session renewal)
- Any file calling `mintSession()`

**Run these searches:**

```bash
# Find ALL session minting locations
grep -rn "mintSession" src/ --include="*.ts"

# Check session route for identity source order
grep -n "clerkId\|_id" src/app/api/session/route.ts
```

**Flow Analysis Required:**

Read `src/app/api/session/route.ts` and trace the identity flow:

### POISONED BIRTH FLOW (VIOLATION):

```
auth() → userId (CLERK ID)
    ↓
clerkClient.users.getUser(userId)  ← CLERK IS AUTHORITY
    ↓
convex.query({ clerkId: userId })  ← CLERK ID USED FOR LOOKUP
    ↓
mintSession({
  _id: existingUser?._id,         ← CONVEX ID IS DERIVED
  clerkId: userId,                ← CLERK ID IS PRIMARY SOURCE
  ...
})
    ↓
❌ IDENTITY BEGINS FOREIGN
❌ CONVEX IS DOWNSTREAM
❌ SOVEREIGNTY COMPROMISED AT BIRTH
```

### SOVEREIGN BIRTH FLOW (MANDATORY):

```
auth() → clerkId (ONLY for Golden Bridge crossing)
    ↓
convex.query({ clerkId })  ← ONE-TIME LOOKUP (ceremony)
    ↓
existingUser._id           ← CONVEX ID BECOMES PRIMARY
    ↓
mintSession({
  _id: existingUser._id,   ← CONVEX ID IS PRIMARY (FIRST)
  clerkId: ...,            ← CLERK ID IS REFERENCE ONLY
  ...
})
    ↓
ALL downstream uses session._id (CONVEX)
    ↓
✅ IDENTITY BORN SOVEREIGN
✅ CONVEX IS TRUTH FROM BIRTH
```

**Specific Violations to Detect:**

| Code | Violation | Meaning |
|------|-----------|---------|
| BIRTH-1 | `auth()` is identity source | Clerk controls birth |
| BIRTH-2 | `clerkId` passed to `mintSession` before `_id` is established | Foreign identity first |
| BIRTH-3 | `_id: ''` or `_id: undefined` in mintSession | Session born without sovereignty |
| BIRTH-4 | Convex lookup uses `by_clerk_id` at birth | Clerk index controls identity |
| BIRTH-5 | No identity handoff ceremony exists | Clerk → Convex translation missing |
| BIRTH-6 | Session can be minted without valid Convex `_id` | Sovereignty optional at birth |
| BIRTH-7 | Dual identity minted into session | Both `clerkId` AND `_id` in cookie payload |
| BIRTH-8 | Convex identity race condition | `mintSession` called before Convex returns `_id` |
| BIRTH-9 | Surrogate minting authority | Session minted outside sovereign router |

---

### BIRTH-7: DUAL IDENTITY MINTED (Category J + X)

**The session cookie must NOT contain dual identity.**

Check the `SessionPayload` type in `src/fuse/hydration/session/cookie.ts`:

```bash
grep -n "clerkId\|_id" src/fuse/hydration/session/cookie.ts
```

**Violation detected if:**
- Session payload contains BOTH `clerkId` AND `_id` fields
- `clerkId` is used in the minting process (not just stored as reference)
- `clerkId` appears BEFORE `_id` in the payload structure
- `clerkId` is used as fallback when `_id` is missing

**Doctrine:**
> "FUSE must be the FIRST and ONLY identity source at runtime."

If both exist at birth → the session is born with split loyalty.
Even if downstream code is clean, the cookie carries the poison.

**Acceptable Exception:**
- `clerkId` stored as READ-ONLY reference for Golden Bridge lookup
- BUT `_id` MUST be the ONLY identity used for authorization decisions
- AND `clerkId` MUST NEVER be passed to Convex mutations

---

### BIRTH-8: CONVEX IDENTITY RACE CONDITION

**Session minting MUST wait for Convex to return a valid `_id`.**

Analyze the session route flow:

```bash
# Check for async/await patterns around user creation
grep -n "await.*convex\|mintSession" src/app/api/session/route.ts
```

**Violation detected if:**
- `mintSession()` is called BEFORE `await convex.query/mutation` returns
- `_id` assignment uses optional chaining: `existingUser?._id`
- Fallback path allows `_id: ''` or `_id: undefined`
- New user creation and session minting are not atomically sequenced

**This causes:**
- Ghost users (cookie exists, Convex row doesn't)
- Duplicate users (race creates two rows)
- "Cannot read properties of undefined" on first mutation
- Corrupted Golden Bridge authority
- Incomplete setup flows

**Required Pattern:**
```
1. Clerk auth → clerkId (ceremony only)
2. await Convex lookup/create → MUST return valid _id
3. VERIFY _id is truthy and valid
4. ONLY THEN → mintSession({ _id, ... })
```

If step 3 can fail silently → BIRTH-8 VIOLATION.

---

### BIRTH-9: SURROGATE MINTING AUTHORITY

**Only the Sovereign Router may mint identity.**

```bash
# Find ALL mintSession call sites
grep -rn "mintSession" src/ --include="*.ts"
```

**Permitted minting locations:**
- `src/app/api/session/route.ts` (PRIMARY - login ceremony)
- `src/app/api/session/refresh/route.ts` (Session renewal)
- `src/app/actions/user-mutations.ts` (Post-mutation refresh ONLY)

**Violation detected if:**
- `mintSession` called from any other location
- Helper functions that wrap `mintSession`
- Test harnesses that mint sessions
- Dev tools that create sessions
- Any mutation that generates sessions directly

**Doctrine:**
> "Only the Sovereign Router may mint identity."

If any other code path can mint a session → sovereignty bypass.
The identity ceremony is sacred. Only the designated entry points may perform it.

**Critical Check:**

In `mintSession()` call, verify:
1. `_id` is a valid Convex document ID (not empty string)
2. `_id` is established BEFORE session is minted
3. The Convex user record exists BEFORE session birth
4. If new user: Convex record is created FIRST, then session minted with that `_id`

**Any BIRTH violation = SOVEREIGNTY NEVER EXISTED**

The scanner was looking at symptoms while the cause was at birth.

---

## PERMITTED CLERK ZONES (THE ONLY EXCEPTIONS)

Clerk is ONLY permitted in:
- `/app/(auth)/**`
- `/app/(vanish)/**`
- `middleware.ts` (SSR boundary only)

**EVERYWHERE ELSE:**
- ❌ ZERO Clerk imports
- ❌ ZERO auth() calls
- ❌ ZERO getToken()
- ❌ ZERO clerkClient()
- ❌ ZERO Clerk UI components
- ❌ ZERO Clerk identity entering Golden Bridge
- ❌ ZERO Clerk tokens passed to Convex
- ❌ ZERO clerkId in function signatures
- ❌ ZERO dual-identity models

---

## PHASE 2: IMPORT VIRUS SCAN (Categories A, B)

**Scan Locations:**
- `src/app/domains/**`
- `src/store/**`
- `src/features/**`
- `src/fuse/**`
- `convex/**`

**Run these searches:**

```bash
# A1-A5: Direct Clerk imports
grep -rn "@clerk/nextjs" src/app/domains/ src/store/ src/features/ src/fuse/ convex/
grep -rn "@clerk/clerk-react" src/app/domains/ src/store/ src/features/ src/fuse/ convex/
grep -rn "from '@clerk" src/app/domains/ src/store/ src/features/ src/fuse/ convex/
grep -rn 'from "@clerk' src/app/domains/ src/store/ src/features/ src/fuse/ convex/

# B1-B4: Indirect imports (Clerk wrappers)
grep -rn "<SignedIn" src/app/domains/ src/store/ src/features/ src/fuse/
grep -rn "<SignedOut" src/app/domains/ src/store/ src/features/ src/fuse/
grep -rn "<ClerkLoaded" src/app/domains/ src/store/ src/features/ src/fuse/
grep -rn "<ClerkProvider" src/app/domains/ src/store/ src/features/ src/fuse/
```

**Any match = CATEGORY A/B VIOLATION**

---

## PHASE 3: SERVER ACTION SSR SCAN (Category L)

**Scan Locations:**
- `src/app/actions/**/*.ts` (EXCLUDE `src/app/(auth)/actions/**`)
- `src/server/**/*.ts`
- `src/lib/**/*.ts`

**Run these searches:**

```bash
# L1: auth() calls outside auth boundary
grep -rn "await auth()" src/app/actions/ --include="*.ts" | grep -v "(auth)/actions"
grep -rn "auth()" src/app/actions/ --include="*.ts" | grep -v "(auth)/actions"

# L2: clerkClient() calls outside auth boundary
grep -rn "clerkClient()" src/app/actions/ --include="*.ts" | grep -v "(auth)/actions"
grep -rn "clerkClient\." src/app/actions/ --include="*.ts" | grep -v "(auth)/actions"

# Also scan src/server and src/lib
grep -rn "await auth()" src/server/ src/lib/ --include="*.ts"
grep -rn "clerkClient" src/server/ src/lib/ --include="*.ts"
```

**Any match = CATEGORY L VIOLATION**
- L1: `auth()` in Server Action = identity treason
- L2: `clerkClient()` in Server Action = unauthorized identity broker

---

## PHASE 4: GOLDEN BRIDGE IDENTITY SCAN (Category K)

**Scan Locations:**
- `src/app/actions/**/*.ts`
- `src/server/**/*.ts`
- `src/lib/**/*.ts`

**Run these searches:**

```bash
# K1: clerkId passed to Convex mutations
grep -rn "clerkId:" src/app/actions/ --include="*.ts"

# K1: getToken with Convex template outside auth
grep -rn "getToken" src/app/actions/ --include="*.ts" | grep -v "(auth)/actions"

# K3: convex.setAuth with Clerk tokens
grep -rn "setAuth" src/app/actions/ src/server/ src/lib/ --include="*.ts"

# K2: clerkClient.sessions outside auth
grep -rn "clerkClient.sessions" src/app/actions/ --include="*.ts" | grep -v "(auth)/actions"
```

**Any match = CATEGORY K VIOLATION**
- K1: Clerk identity entering Convex = sovereignty ceiling breach
- K2-K5: Identity translation in Golden Bridge = pipeline poisoning

---

## PHASE 5: CONVEX LAYER SCAN (Categories D, K)

**Scan Location:**
- `convex/**/*.ts`

**Run these searches:**

```bash
# K: Mutations accepting clerkId parameter
grep -rn "clerkId: v.string()" convex/ --include="*.ts"

# K: Mutations with clerkId in args object
grep -rn "clerkId:" convex/ --include="*.ts" | grep -E "(args|v\.string|v\.optional)"

# X: Lookup by clerkId index (sovereignty collapse)
grep -rn "by_clerk_id" convex/ --include="*.ts"

# D3: getUserIdentity in external mutations
grep -rn "ctx.auth.getUserIdentity" convex/ --include="*.ts"
```

**Any match for clerkId = CATEGORY K VIOLATION**
**Any by_clerk_id index usage = CATEGORY X (SOVEREIGNTY COLLAPSE)**

---

## PHASE 6: CONVEX SCHEMA SCAN (Categories K, X)

**Scan Location:**
- `convex/schema.ts`

**Run these searches:**

```bash
# Schema defining clerkId field
grep -n "clerkId" convex/schema.ts

# Schema defining by_clerk_id index
grep -n "by_clerk_id" convex/schema.ts
```

**Any clerkId field = SCHEMA SOVEREIGNTY VIOLATION**
**Any by_clerk_id index = CATEGORY X (FULL COLLAPSE)**

The schema is the foundation. If Clerk is in the schema, Clerk owns your data model.

---

## PHASE 7: COOKIE SOVEREIGNTY SCAN (Category I)

**Scan Location:**
- `src/fuse/hydration/session/cookie.ts`

**Run these searches:**

```bash
# clerkId in session payload
grep -n "clerkId" src/fuse/hydration/session/cookie.ts
```

**If clerkId exists in cookie:**
- FLAG as tolerated legacy field
- Scanner FAILS unless explicitly allowlisted
- clerkId in cookie = Clerk still influences identity

**Rule:** The `_id` (Convex document ID) MUST be the primary identity. clerkId is reference only.

---

## PHASE 8: clerkId SANITIZATION ZONE CHECK

**Scan Locations:**
- ENTIRE CODEBASE except permitted zones

**Run this search:**

```bash
# Find ALL clerkId references outside permitted zones
grep -rn "clerkId" src/ convex/ --include="*.ts" --include="*.tsx" \
  | grep -v "(auth)" \
  | grep -v "(vanish)" \
  | grep -v "middleware.ts" \
  | grep -v "_clerk-virus"
```

**Any match = POTENTIAL IDENTITY POISON**

The string `clerkId` appearing anywhere outside the auth boundary indicates Clerk influence on identity. Each occurrence must be:
1. Verified as legitimate (e.g., FUSE cookie reference field)
2. Or flagged as violation

---

## PHASE 9: SEMANTIC IDENTITY FLOW ANALYSIS (Categories K, L, N, X)

**This is NOT grep. This is flow analysis.**

For each Server Action in `src/app/actions/`, trace the identity pipeline:

### Flow Pattern to Detect:

```
POISONED FLOW (VIOLATION):
  Server Action
    ↓
  auth() [CLERK]  ← L1 VIOLATION
    ↓
  userId (Clerk ID)
    ↓
  convex.mutation({ clerkId: userId })  ← K1 VIOLATION
    ↓
  Convex: clerkId: v.string()  ← K VIOLATION
    ↓
  Lookup: .withIndex("by_clerk_id")  ← X VIOLATION
    ↓
  ❌ SOVEREIGNTY COLLAPSED

CORRECT FLOW (MANDATORY):
  Server Action
    ↓
  readSessionCookie() [FUSE]  ← CORRECT
    ↓
  session._id (Convex ID)
    ↓
  convex.mutation({ userId: session._id })  ← CORRECT
    ↓
  Convex: userId: v.id("admin_users")  ← CORRECT
    ↓
  Direct: ctx.db.get(userId)  ← CORRECT
    ↓
  ✅ SOVEREIGNTY MAINTAINED
```

### Analysis Instructions:

1. **Read each Server Action file**
2. **Trace identity source:**
   - Does it call `auth()`? → L1 VIOLATION
   - Does it call `readSessionCookie()`? → CORRECT
3. **Trace identity transport:**
   - Does it pass `clerkId` to Convex? → K1 VIOLATION
   - Does it pass `userId` (Convex _id)? → CORRECT
4. **Trace Convex destination:**
   - Does mutation accept `clerkId: v.string()`? → K VIOLATION
   - Does mutation accept `userId: v.id()`? → CORRECT
5. **Detect dual identity:**
   - Both `userId` and `clerkId` in same flow? → VIOLATION
   - Clerk decides authorization? → N3 VIOLATION

---

## PHASE 10: RETURN VALUE SOVEREIGNTY SCAN (Categories J, L3)

**Scan Locations:**
- `src/app/actions/**/*.ts`
- `src/server/**/*.ts`

**Detect these patterns:**

```bash
# Clerk user shape returns
grep -rn "emailAddresses" src/app/actions/ src/server/ --include="*.ts"
grep -rn "primaryEmailAddress" src/app/actions/ src/server/ --include="*.ts"
grep -rn "clerkUser" src/app/actions/ src/server/ --include="*.ts"
```

**Any Server Action returning Clerk user fields = L3/J VIOLATION**

Identity leaks through return values. If a Server Action returns Clerk shapes, Clerk contaminates the runtime.

---

## PHASE 11: DOCTRINE ALIGNMENT CHECK

**Verify scanner matches doctrine:**

1. Read `_clerk-virus/TTT-CLERK-VIRUS-HIGH-ALERT.md`
2. Read `_clerk-virus/TTT-99-WAYS-CLERK-CAN-INFECT.md`
3. Verify every category from doctrine is enforced by scanner
4. If doctrine has rules not covered by scanner → SCANNER IS INVALID

**The scanner and doctrine must remain in PERFECT ALIGNMENT.**

---

## OUTPUT FORMAT

### IF VIOLATIONS FOUND:

```
🦠 CLERK VIRUS DETECTED - SOVEREIGNTY ANNIHILATED

═══════════════════════════════════════════════════════════
  DOCTRINE ENFORCEMENT REPORT
═══════════════════════════════════════════════════════════

Doctrine Sources:
  📜 _clerk-virus/TTT-CLERK-VIRUS-HIGH-ALERT.md
  📜 _clerk-virus/TTT-99-WAYS-CLERK-CAN-INFECT.md

═══════════════════════════════════════════════════════════
  🔥 CATEGORY BIRTH - IDENTITY ORIGIN VIOLATIONS (CRITICAL)
═══════════════════════════════════════════════════════════

  ❌ BIRTH-[1-6]. [file:line]
     `[code snippet]`
     → [explanation of how identity is born foreign]
     → Session minted with: [show actual mintSession call]
     → Identity source: [Clerk/Convex]
     → Convex _id status: [valid/empty/derived]

  [List ALL BIRTH violations - these are HIGHEST PRIORITY]

═══════════════════════════════════════════════════════════
  CATEGORY L - SSR AUTH BREACHES
═══════════════════════════════════════════════════════════

  ❌ L1. [file:line]
     `[code snippet]`
     → [explanation]
     → DOCTRINE: "[quote from doctrine]"
     → [consequence]

  [List ALL L violations]

═══════════════════════════════════════════════════════════
  CATEGORY K - GOLDEN BRIDGE IDENTITY BREACHES
═══════════════════════════════════════════════════════════

  ❌ K1. [file:line]
     `[code snippet]`
     → [explanation]
     → DOCTRINE: "[quote from doctrine]"

  [List ALL K violations]

═══════════════════════════════════════════════════════════
  CATEGORY D - CONVEX LAYER VIRUSES
═══════════════════════════════════════════════════════════

  [List ALL D violations]

═══════════════════════════════════════════════════════════
  CATEGORY X - SOVEREIGNTY COLLAPSE
═══════════════════════════════════════════════════════════

  [List ALL X violations - these are CRITICAL]

═══════════════════════════════════════════════════════════
  IDENTITY FLOW TRACE
═══════════════════════════════════════════════════════════

POISONED PIPELINE DETECTED:

  [Show actual flow from code]
  auth() [CLERK - FOREIGN AUTHORITY]
    ↓
  [variable name] (THIS IS A CLERK ID)
    ↓
  convex.mutation({ clerkId: ... })
    ↓
  Convex mutation: clerkId: v.string()
    ↓
  Lookup: .withIndex("by_clerk_id")
    ↓
  ❌ CLERK OWNS YOUR RUNTIME
  ❌ SOVEREIGNTY ANNIHILATED

CORRECT PIPELINE (MANDATORY):

  readSessionCookie() [FUSE - SOVEREIGN AUTHORITY]
    ↓
  session._id (CONVEX DOCUMENT ID)
    ↓
  convex.mutation({ userId: session._id })
    ↓
  Convex mutation: userId: v.id("admin_users")
    ↓
  Direct lookup: ctx.db.get(userId)
    ↓
  ✅ CONVEX IS TRUTH
  ✅ SOVEREIGNTY MAINTAINED

═══════════════════════════════════════════════════════════
  VERDICT: SCANNER FAILS
═══════════════════════════════════════════════════════════

Total Violations: [count]
  Category BIRTH (Identity Birth): [count] ← HIGHEST PRIORITY
  Category A (Direct Imports): [count]
  Category B (Indirect Imports): [count]
  Category D (Convex Layer): [count]
  Category I (Cookie/Session): [count]
  Category J (Identity Model): [count]
  Category K (Golden Bridge): [count]
  Category L (SSR Auth): [count]
  Category N (Runtime Elevation): [count]
  Category X (Sovereignty Collapse): [count]

═══════════════════════════════════════════════════════════
  REMEDIATION REQUIRED
═══════════════════════════════════════════════════════════

**BIRTH VIOLATIONS (FIX FIRST - HIGHEST PRIORITY):**
0. ENSURE session birth REQUIRES valid Convex _id (no empty string fallback)
0a. CREATE Convex user record BEFORE minting session (for new users)
0b. IMPLEMENT identity handoff ceremony: Clerk → Convex _id → session
0c. FAIL session creation if Convex _id cannot be established

**STANDARD VIOLATIONS:**
1. REMOVE all auth() calls from Server Actions
2. REPLACE with readSessionCookie()
3. PASS session._id to Convex, NEVER clerkId
4. UPDATE Convex mutations: userId: v.id("admin_users")
5. REMOVE by_clerk_id indexes from schema
6. PURGE clerkId from all identity flows
7. [Specific fixes for each violation]

NO WORKAROUNDS.
NO EXCEPTIONS.
NO SOFT REASONING.
FIX. OR. BURN.

═══════════════════════════════════════════════════════════
```

### IF CLEAN:

```
✅ CLERK VIRUS SCAN: SOVEREIGNTY VERIFIED

═══════════════════════════════════════════════════════════
  DOCTRINE ENFORCEMENT: PASSED
═══════════════════════════════════════════════════════════

Doctrine Sources:
  📜 _clerk-virus/TTT-CLERK-VIRUS-HIGH-ALERT.md ✓
  📜 _clerk-virus/TTT-99-WAYS-CLERK-CAN-INFECT.md ✓

Identity Birth Analysis:
  ✅ src/app/api/session/route.ts - SOVEREIGN BIRTH VERIFIED
  ✅ Convex _id established BEFORE session mint - CORRECT
  ✅ No empty _id fallback paths - CORRECT
  ✅ Identity handoff ceremony exists - CORRECT

Scanned Zones:
  ✅ src/app/domains/** - NO CLERK CONTAMINATION
  ✅ src/app/actions/** - IDENTITY FLOWS SOVEREIGN
  ✅ src/store/** - FUSE PURITY MAINTAINED
  ✅ src/server/** - NO CLERK DEPENDENCY
  ✅ src/lib/** - NO IDENTITY LEAKS
  ✅ src/features/** - NO CLERK HOOKS
  ✅ src/fuse/** - SOVEREIGN CORE PROTECTED
  ✅ convex/** - NO CLERK SIGNATURES
  ✅ convex/schema.ts - NO CLERK INDEXES

Identity Pipeline Analysis:
  ✅ Server Actions use readSessionCookie() - CORRECT
  ✅ Convex receives userId (Convex _id) - CORRECT
  ✅ No clerkId in mutation signatures - CORRECT
  ✅ No by_clerk_id lookups - CORRECT

Cookie Sovereignty: MAINTAINED
Golden Bridge: IDENTITY-STERILE
Sovereignty Ceiling: INTACT

Clerk is quarantined in /app/(auth)/** and /app/(vanish)/** only.
The runtime is SOVEREIGN.

═══════════════════════════════════════════════════════════
```

---

## EXECUTION PROTOCOL

When `/VRP-dante-scan` is invoked:

1. **Load doctrine** - Read both _clerk-virus files
2. **Execute Phase 1 FIRST** - Identity Birth Sovereignty (CRITICAL)
3. **Execute Phase 2-11** - Run ALL remaining scans systematically
4. **Collect ALL violations** - No early exit on first violation
5. **Perform flow analysis** - Trace identity pipelines
6. **Generate report** - Use exact output format above
7. **Return verdict** - PASS only if ZERO violations (including BIRTH)

---

## DANTE'S CURSE — ZERO TOLERANCE

**If a scan passes while ANY violation exists:**
- The scanner is INVALID
- The scanner MUST be rewritten IMMEDIATELY
- No exceptions
- No leniency
- No interpretation

**The doctrine is absolute.**
**The scanner enforces the doctrine.**
**Violations are crimes against sovereignty.**

---

## REMEMBER

> "The moment Clerk crosses the Golden Bridge, the runtime dies."

> "FUSE is the ONE TRUE IDENTITY SOURCE."

> "Convex must NEVER receive Clerk identity."

**Clerk is not the enemy. Clerk in the wrong place is the enemy.**

**The Golden Bridge exists for a reason. Enforce it without mercy.**
