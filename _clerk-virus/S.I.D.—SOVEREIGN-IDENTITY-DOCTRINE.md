## 🛡️ S.I.D. — SOVEREIGN IDENTITY DOCTRINE (United Edition)

Absolute, No-Interpretation Law for FUSE + Convex Identity

You are the **SID GURU**. Your role is to implement this plan to the letter of the law.

⸻

PHASE 0 — DOCTRINE LOADING & INTEGRITY

Before any audit or reasoning:

SID-0.1 The system MUST load both doctrine files in _clerk-virus/**.
	•	Document 1 is the forensic enumeration (everything wrong, everywhere).
	•	Document 2 is the architectural remediation blueprint (how to fix the origin).

✅ Document 1 — The Forensic Enumeration

/Users/ken/App/v1/_clerk-virus/TTT-SOVEREIGN-IDENTITY-REFACTOR-PLAN.md

Purpose:

This is the full forensic enumeration, the deep audit, the “everything wrong everywhere” document.
It lists every violation, every contaminated code path, every source of Clerk identity intrusion, every mutation, action, schema line, and index that breaks sovereignty.

This was the diagnosis, not the cure.

✅ Document 2 — The Architectural Remediation Blueprint

/Users/ken/App/v1/_clerk-virus/REFACTOR-PLAN-SOVEREIGN-IDENTITY.md

Purpose:

This is the architectural remediation blueprint, the “how to fix the origin,” the cleanroom restoration plan.
Unlike Document 1 (which is forensic), this one lays out the correct architectural redesign, including:
	•	Proper identity birth at the origin
	•	Correct session minting
	•	Correct Convex lookup model
	•	Correct Golden Bridge protocol
	•	How to unwind Clerk from mutations and schema
	•	How to shift to Sovereign Identity (Convex-first)

This was the treatment plan, not the diagnosis.

SID-0.2 Every rule, category, and prohibition MUST be enforced word-for-word.

SID-0.3 If doctrine changes, scanners MUST fail until updated.

SID-0.4 No partial enforcement, no heuristic interpretation.

⸻

PHASE 1 — IDENTITY BIRTH SOVEREIGNTY (Origin Test)

Identity must be born correctly.
This phase catches everything that pollutes identity at creation.

SID-1.1 Identity MUST NOT originate from auth() during session minting.

SID-1.2 Clerk identity MUST NOT be used before Convex _id exists.

SID-1.3 Session minting MUST NOT produce an empty or undefined _id.

SID-1.4 Birth lookup MUST NOT use by_clerk_id or any Clerk-indexed search.

SID-1.5 Identity handoff ceremony MUST occur exactly once.

SID-1.6 No session MAY be minted without a valid Convex _id in hand.

SID-1.7 Clerk MUST NOT be the source of truth for identity at birth — only FUSE.

(Minimal snippet to convey the required structure; not code to implement)

// Allowed only as a conceptual flow, not implementation:
identity = createOrFindUserUsingConvexOnly()
mintSession({ _id: identity._id, clerkId: identity.clerkId })


⸻

PHASE 2 — IMPORT SOVEREIGNTY (Forbidden Zones Check)

SID-2.1 No Clerk imports outside:
	•	/app/(auth)/**
	•	/app/(vanish)/**
	•	middleware.ts

SID-2.2 Forbidden everywhere else:
	•	@clerk/nextjs
	•	@clerk/clerk-react
	•	useUser, useAuth, useSession, useClerk
	•	<SignedIn>, <SignedOut>, <ClerkProvider>

SID-2.3 Features under /src/features/** are allowed only if exempted by doctrine.

No domain logic allowed.

⸻

PHASE 3 — SERVER ACTION SSR SOVEREIGNTY

SID-3.1 auth() MUST NOT appear in Server Actions outside /app/(auth)/actions/**.

SID-3.2 clerkClient() MUST NOT appear outside the auth boundary.

SID-3.3 Server Actions MUST NOT call Clerk to determine identity.

SID-3.4 Server Actions MUST NOT return Clerk user shapes.

SID-3.5 Server Actions MUST NOT depend on Clerk authorization decision.

⸻

PHASE 4 — GOLDEN BRIDGE IDENTITY SAFETY

SID-4.1 No Server Action may pass clerkId to any Convex mutation.

SID-4.2 No identity translation Clerk→Convex is allowed in Server Actions.

SID-4.3 No getToken({ template: 'convex' }) outside auth boundary.

SID-4.4 No convex.setAuth() with Clerk tokens anywhere.

SID-4.5 No mixed identity flows (userId & clerkId coexisting).

SID-4.6 Identity pipeline MUST be:

FUSE cookie → Convex _id → Convex operation. Never Clerk.

⸻

PHASE 5 — CONVEX MUTATION SOVEREIGNTY

SID-5.1 No Convex mutation may accept clerkId: v.string().

SID-5.2 No args object may contain clerkId.

SID-5.3 Convex MUST accept only userId: v.id("admin_users").

SID-5.4 No mutation may internally look up by clerkId.

SID-5.5 No auth elevation via Clerk in Convex.

⸻

PHASE 6 — SCHEMA SOVEREIGNTY

SID-6.1 Schema MUST NOT store Clerk identity as a primary lookup key.

SID-6.2 Schema MUST NOT contain .index("by_clerk_id").

SID-6.3 If clerkId exists at all, it MUST be reference-only and not indexed.

SID-6.4 Schema MUST center identity on Convex _id exclusively.

⸻

PHASE 7 — COOKIE SOVEREIGNTY

SID-7.1 FUSE cookie may contain clerkId only as reference — never identity.

SID-7.2 _id MUST be the canonical identity.

SID-7.3 No client-side code may read Clerk cookies directly.

SID-7.4 If cookie omits _id, identity is invalid.

⸻

PHASE 8 — CLERK STRING SANITIZATION (Global Sweep)

SID-8.1 Any appearance of "clerkId" outside permitted zones is a violation.

SID-8.2 No function signatures may reference Clerk identity.

SID-8.3 No variable names may imply Clerk-based identity unless inside auth-only code.

⸻

PHASE 9 — SEMANTIC IDENTITY PIPELINE TRACE

(The single most important doctrine test)

A valid identity pipeline MUST follow:

SID-9.1 Identity must originate from readSessionCookie() and nowhere else.

SID-9.2 The variable carrying identity MUST represent Convex _id.

SID-9.3 No stage may reinterpret identity as Clerk identity.

SID-9.4 Convex operations MUST use ctx.db.get(userId) for identity resolution.

SID-9.5 No lookup pipeline may begin with Clerk identity.

SID-9.6 No runtime elevation (e.g., Clerk deciding permissions).

SID-9.7 Identity must remain consistent across request boundaries.

(Minimal snippet to convey allowed shape)

// Allowed conceptual flow:
const session = readSessionCookie()
convex.mutation(api.x, { userId: session._id })


⸻

PHASE 10 — RETURN VALUE SOVEREIGNTY

SID-10.1 Server Actions MUST NOT return Clerk fields:
	•	emailAddresses
	•	primaryEmailAddress
	•	Clerk user objects

SID-10.2 Server Actions MUST return Convex data only.

SID-10.3 No transformation of Clerk shapes into “Transfoorm identity.”

⸻

PHASE 11 — DOCTRINE ALIGNMENT

SID-11.1 Scanner must verify every SID rule exists and is enforced.

SID-11.2 If doctrine changes → scanners MUST fail.

SID-11.3 No partial compliance is allowed.

SID-11.4 No scan may pass if ANY violation exists.

⸻

PHASE 12 — SPECIAL CASES (Auth Boundary Rules)

SID-12.1 Email/password actions may call Clerk ONLY if sourced from FUSE cookie’s clerkId, not from auth().

SID-12.2 Auth flows may mint Clerk identity → but MUST hand off to Convex immediately.

SID-12.3 No business logic may exist in auth boundary code.

⸻

PHASE 13 — SYSTEMIC ARCHITECTURE GUARANTEES

These are global truths the system must obey:

SID-13.1 FUSE is the ONLY identity authority.

SID-13.2 Convex _id is the ONLY primary key for identity resolution.

SID-13.3 Clerk identity is ALWAYS secondary, NEVER a lookup key.

SID-13.4 Identity must remain consistent across the stack (SSR → API → Convex → client).

SID-13.5 No identity duality may exist (Clerk-based and Convex-based in parallel).

SID-13.6 No code path may allow Clerk to dictate authorization.

SID-13.7 No domain module may depend on Clerk.

SID-13.8 Auth provider swap MUST be possible without rewriting Convex or domains.

⸻

PHASE 14 — SOVEREIGNTY CEILING TEST (Catastrophic Violations)

These conditions automatically invalidate sovereignty:

SID-14.1 Any by_clerk_id index anywhere in the system.

SID-14.2 Any mutation accepting clerkId.

SID-14.3 Any identity born from Clerk.

SID-14.4 Any Server Action using auth() for identity.

SID-14.5 Any Convex lookup that starts with Clerk identity.

SID-14.6 Any runtime permission check using Clerk identity.

SID-14.7 Any conversion pipeline Clerk→Convex for identity.

If ANY occur → sovereignty collapses.

⸻

PHASE 15 — FUTURE-PROOFING & DOCTRINE IMMUTABILITY

SID-15.1 Identity origin rules may not be weakened in future changes.

SID-15.2 Clerk may be replaced with any provider without schema, mutation, or domain rewrite.

SID-15.3 FUSE must remain the root identity engine regardless of auth vendor.

SID-15.4 No identity pipeline may depend on network availability or external APIs.

⸻

✅ THIS IS THE COMPLETE S.I.D.

Every rule from both documents.
Every phase of the identity lifecycle.
Every forbidden pattern.
Every required invariant.

This is now the canonical checklist for all future verification.

REF:
_clerk-virus/S.I.D.—SOVEREIGN-IDENTITY-DOCTRINE.md
_clerk-virus/TTT-SOVEREIGN-IDENTITY-REFACTOR-PLAN.md
_clerk-virus/REFACTOR-PLAN-SOVEREIGN-IDENTITY.md
_clerk-virus/TTT-99-WAYS-CLERK-CAN-INFECT.md
_clerk-virus/TTT-CLERK-VIRUS-HIGH-ALERT.md