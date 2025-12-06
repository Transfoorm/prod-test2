# 🛑 99 WAYS CLERK CAN INFECT AND DESTROY A SOVEREIGN RUNTIME

(Use this to catch devs before they burn down your kingdom.)

⸻

⚠️ CATEGORY A — DIRECT IMPORT VIRUSES

These are instant nuclear violations. The moment a dev writes them, the runtime is compromised.

🔥 A1. Importing Clerk in ANY client component

import { useUser } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';
import { useClerk } from '@clerk/clerk-react';

Effect:
	•	Hydration mismatch
	•	Runtime identity resolution
	•	Loading states
	•	Sovereign Router corruption
	•	FUSE dethroned

🔥 A2. Importing Clerk in ANY Domain view

Path violation:

src/app/domains/**/*

Effect:
Foreign authority enters sovereign territory.

🔥 A3. Importing Clerk inside FUSE store

Effect:
Clerk gains influence over state shape → apocalypse.

🔥 A4. Importing Clerk inside Convex config

Effect:
Dual authority: Convex + Clerk → unstable identity model.

🔥 A5. Importing Clerk inside Router or Navigation

Effect:
Sovereign Router becomes subordinate → fatal.

⸻

⚠️ CATEGORY B — INDIRECT IMPORT VIRUSES

Sneaky devs use “nice-looking” helpers to bypass the ban.

🔥 B1. Using <SignedIn> or <SignedOut> wrappers

These look harmless.
They are NOT.
They require runtime auth → virus.

🔥 B2. Using <ClerkLoaded>

Triggers hydration + auth → virus.

🔥 B3. Using <ClerkProvider> inside FuseApp or Domains

Provider = runtime → virus spreads instantly.

🔥 B4. Using “clerk-react” instead of “clerk-nextjs”

This bypasses your SSR gating → VIRUS MASSACRE.

⸻

⚠️ CATEGORY C — AUTH FLOW VIRUSES

Clerk tries to OWN navigation or session.

🔥 C1. Using redirectToSignIn()

Hijacks Sovereign Router → fatal.

🔥 C2. Using Clerk middleware in /app instead of root

Middleware = navigation controller → virus.

🔥 C3. Using Clerk’s useSession on the client

Creates TWO session models → guaranteed meltdown.

🔥 C4. Relying on Clerk to store:
	•	firstName
	•	lastName
	•	email
	•	image
	•	username
	•	phone

Effect:
Two identities.
Two sources of truth.
Two worlds.
Runtime schizophrenia.

⸻

⚠️ CATEGORY D — CONVEX VIRUSES

Sneaky devs inject Clerk identity into Convex incorrectly.

🔥 D1. Calling Convex mutations from client via useMutation()

Mutation runs through ConvexProvider → ConvexProvider requires Clerk authentication →
Clerk virus injected into domain runtime.

🔥 D2. Passing clerkId from the client

NEVER allow devs to send identity from client → forgery vector.

🔥 D3. Using ctx.auth.getUserIdentity() in untrusted mutations

If unguarded → exploit gateway.

🔥 D4. Allowing ConvexHttpClient to “guess” identity

Impossible → leads to failure → dev tries hacks → virus.

⸻

⚠️ CATEGORY E — SERVER ACTION VIRUSES

Server Actions are safe ONLY if used correctly. They become viral when misused.

🔥 E1. Importing Server Actions inside Domain components

This executes server code inside client → Clerk runtime → virus.

🔥 E2. Calling Server Actions without updating FUSE afterwards

Creates dueling state machines → FUSE loses authority.

⸻

⚠️ CATEGORY F — NAVIGATION VIRUSES

If Clerk interferes with routing even ONCE → Sovereignty collapses.

🔥 F1. Using Clerk’s built-in redirect helpers

They assume Next.js App Router owns navigation → contradiction → runtime fracture.

🔥 F2. Using Clerk inside middleware that touches routes under /app

Middleware MUST only protect /auth — never /app.

🔥 F3. Allowing Clerk UI components to render before FuseApp

Clerk hydration + FUSE hydration = undefined behaviour → explosion.

⸻

⚠️ CATEGORY G — STORE & STATE VIRUSES

Clerk must never touch FUSE.

🔥 G1. Adding ANY Clerk field into FUSE store shape

FUSE loses sovereignty.

🔥 G2. Using Clerk hooks to populate initial FUSE state

Runtime fetch → delayed mount → breaks Mount Lifecycle.

🔥 G3. Letting devs store Clerk session data in Zustand

Nuclear violation.

⸻

⚠️ CATEGORY H — UI AND DESIGN SYSTEM VIRUSES

🔥 H1. Using Clerk UI components (SignIn, SignUp) INSIDE your domain styling

Clerk loads its OWN CSS → pollutes Platform CSS.

🔥 H2. Using Clerk modals

Modals assume full-react-context ownership → breaks FUSE layering.

⸻

⚠️ CATEGORY I — COOKIE AND SESSION VIRUSES

🔥 I1. Allowing devs to read Clerk cookies on the client

Client-side parsing of session cookie = hack = virus.

🔥 I2. Letting Clerk mutate cookies client-side

Only Server Actions or SSR can do this.

🔥 I3. Allowing a dev to bypass Golden Bridge

Cookie must be written:
Clerk → Server Action → Convex → Cookie → FUSE

Skipping ANY step = virus.

⸻

⚠️ CATEGORY J — IDENTITY MODEL VIRUSES

🔥 J1. Treating Clerk user fields as canonical

They are NOT.

🔥 J2. Storing business or profile information in Clerk metadata

Metadata looks safe → but it’s runtime & external → virus.

🔥 J3. Allowing devs to “sync” Clerk profile → Convex directly

This inverts your sovereignty model.

⸻

🩸 THE MOST DANGEROUS VIRUS OF ALL

“It works fine locally.”

This is how devs justify:
	•	pulling Clerk hooks into Domains
	•	using ConvexProvider client-side
	•	mutating identity on the client
	•	referencing Clerk session at runtime
	•	bypassing the Golden Bridge
	•	skipping server actions
	•	storing Clerk fields in FUSE
	•	injecting auth into the store

This is the most catastrophic intrusion vector because it disguises itself as convenience.

⸻

🛡️ THE IMMUNE SYSTEM (ANTI-VIRUS CHECKS)

✔ ESLint Rules
	•	ttts/no-clerk-in-domains
	•	vrp/no-foreign-auth
	•	srb/no-identity-in-views

✔ VRP Enforcement
	•	Zero Clerk imports in /src/app/domains
	•	Zero Convex client calls from Domains
	•	No useMutation() in Domain components

✔ Structural Patterns
	•	All identity → Server Actions
	•	All side effects → Server Actions
	•	All mutations → Server Actions
	•	All updates → Cookie → FUSE

✔ Runtime Principles
	•	FuseApp mounts once
	•	Sovereign Router owns navigation
	•	Clerk never crosses the Golden Bridge

⸻

🏆 FINAL PRODUCT: THE OFFICIAL DOCUMENT

* REFER to:
🔥 “CLERK VIRUS HIGH ALERT — DEV BLACKLIST”
/Users/ken/App/v1/_clerk-virus/TTT-CLERK-VIRUS-HIGH-ALERT.md