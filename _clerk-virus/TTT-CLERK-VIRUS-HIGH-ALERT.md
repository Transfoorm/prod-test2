🚨 CLERK VIRUS HIGH ALERT — DEV BLACKLIST

Transfoorm Sovereignty Security Protocol — Version 1.0

“The moment Clerk crosses the Golden Bridge, the runtime dies.”

⸻

🟥 OVERVIEW

Clerk is not the problem.
Where Clerk is used is the problem.

The following document lists every known intrusion vector through which Clerk can infect:
	•	FUSE Store
	•	Domain Views
	•	Sovereign Router
	•	Convex Layer
	•	Runtime Sovereignty
	•	Session Identity
	•	Navigation Engine
	•	Golden Bridge Pipeline

If ANY of these appear in PRs, commits, diffs, or local changes:
→ DEV BLOCKED
→ VRP ALARM
→ SRB VIOLATION
→ AUTO-REJECT

This list is exhaustive and non-negotiable.

⸻

🛑 CATEGORY A — DIRECT IMPORT VIRUSES

If a dev writes any of this, you fire them instantly.

❌ A1. Clerk hooks in client components

import { useUser, useAuth, useClerk } from '@clerk/nextjs';
import { useUser } from '@clerk/clerk-react';

Effect: Runtime identity → loading states → sovereignty collapse.

⸻

❌ A2. Any Clerk import inside /src/app/domains/**

Effect: External authority enters sovereign territory.

⸻

❌ A3. Clerk import inside FUSE store

Effect: FUSE loses sovereignty → state poisoned.

⸻

❌ A4. Clerk import inside Convex code

Effect: Dual identity model → catastrophic breach.

⸻

❌ A5. Clerk inside Router, Navigation, FuseApp

Effect: Router ownership compromised → runtime fragmentation.

⸻

🟧 CATEGORY B — INDIRECT IMPORT VIRUSES

The sneaky ones devs think are “fine.” They are NOT.

❌ B1. <SignedIn>, <SignedOut>, <ClerkLoaded>

These inject runtime auth resolution → forbidden.

❌ B2. <ClerkProvider> anywhere except App Router shell

Provider = runtime = failure.

❌ B3. Mixing “clerk-nextjs” and “clerk-react”

Creates dual-react-context → hydration poison.

⸻

🟨 CATEGORY C — AUTHENTICATION FLOW VIRUSES

❌ C1. Using redirectToSignIn()

Hijacks navigation → breaks Sovereign Router.

❌ C2. Middleware that touches /app/**

Middleware must protect /auth/** ONLY.

❌ C3. Using useSession() or useAuth() in client

Ensures loading states and delayed render → fatal.

⸻

🟩 CATEGORY D — CONVEX LAYER VIRUSES

❌ D1. Calling Convex mutations via useMutation() in Domains

Why?
	•	ConvexProvider requires Clerk auth
	•	Domain now depends on Clerk
	•	Sovereignty violation

❌ D2. Passing clerkId from client

Identity must NEVER be client-provided.

❌ D3. Using ctx.auth.getUserIdentity() in mutations called by ConvexHttpClient

ConvexHttpClient has no auth → mismatch → dev hack attempts → virus.

❌ D4. Using ConvexProvider inside FuseApp

Imports Clerk via auth context.

⸻

🟦 CATEGORY E — SERVER ACTION VIRUSES

❌ E1. Importing Server Actions inside Domain components

Executes server logic inside CSR → breaks Golden Bridge.

❌ E2. Calling Server Actions without updating FUSE store after success

Two state machines drift → runtime desync → chaos.

⸻

🟪 CATEGORY F — NAVIGATION VIRUSES

❌ F1. Clerk controlling navigation

Examples:
	•	redirectToSignIn
	•	SignedIn wrappers
	•	Clerk middleware redirects
	•	Using Clerk UI that conditionally appears based on session

Effect: Sovereign Router dethroned.

❌ F2. Putting Clerk inside layout or shared providers

Breaks the “FuseApp mounts once” law.

⸻

🟫 CATEGORY G — STORE & STATE VIRUSES

❌ G1. Storing Clerk fields inside FUSE state

Never store:
	•	email
	•	firstName
	•	lastName
	•	avatar
	•	metadata

EXCEPT via Golden Bridge cookie.

❌ G2. Using Clerk to hydrate FUSE on the client

Runtime fetch → mount delay → sovereignty death.

❌ G3. Zustand store referencing Clerk

State ownership violation.

⸻

🟩 CATEGORY H — UI & DESIGN VIRUSES

❌ H1. Embedding Clerk UI components (SignIn, SignUp) inside Domain UI

These bring:
	•	Runtime CSS
	•	Shadow DOM
	•	Modals
	•	External state

Unacceptable.

❌ H2. Using Clerk modals/popups

Hijack focus + routing.

⸻

🟦 CATEGORY I — COOKIE & SESSION VIRUSES

❌ I1. Reading Clerk cookies on the client

Identity must enter through the Golden Bridge, not runtime.

❌ I2. Letting Clerk mutate cookies client-side

Auth must stay on the server.

❌ I3. Injecting Clerk session objects into FUSE store

Two sources of truth → instability.

⸻

🟥 CATEGORY J — IDENTITY MODEL VIRUSES

❌ J1. Treating Clerk user as canonical

Clerk user ≠ Transfoorm user.

❌ J2. Storing business/profile data in Clerk metadata

Metadata seems convenient → but it enslaves your identity model to an external API.

❌ J3. Syncing Clerk <→ Convex identity directly

Golden Bridge bypass → sovereignty breach.

⸻

🧨 THE SINGLE MOST DANGEROUS VIRUS OF ALL

“It works fine locally.”

This phrase ALWAYS precedes:
	•	importing Clerk in Domains
	•	calling useMutation in client
	•	bypassing Server Actions
	•	storing Clerk data in FUSE
	•	mixing identity models
	•	copying examples from Clerk docs
	•	breaking Sovereign Router

This is how junior devs burn kingdoms.

⸻

🛡 THE ONLY SAFE PATTERN — GOLDEN BRIDGE (MANDATORY)

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

ANY deviation → Clerk Virus.

⸻

🧱 VRP ENFORCEMENT RULES (TO BLOCK THE VIRUS AUTOMATICALLY)

🔒 1. No Clerk import allowed under /src/app/domains/**

🔒 2. No useMutation() in Domain components

🔒 3. No direct Convex calls from Domains

🔒 4. No auth in FUSE store

🔒 5. No Clerk UI outside /app/auth/**

🔒 6. All mutations must run through Server Actions

🔒 7. All identity must enter through cookies

🔒 8. FuseApp must remain sovereign (mount once)

⸻

📝 FINAL NOTE

Transfoorm is a sovereign runtime.
Clerk is an external identity provider.
The two must NEVER mix at runtime.

Clerk is quarantined by design.
The Golden Bridge is the ONLY safe way across.
Devs MUST NOT improvise.
