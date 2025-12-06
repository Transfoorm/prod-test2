# 🟩 CATEGORY D — CONVEX LAYER VIRUSES

🟦 SCOPE CLARIFICATION — FEATURE ROOT EXEMPTION

D1 applies **ONLY** to Domain code located in:

  /src/app/domains/**
  /convex/**
  /server/**
  /app/actions/** (when invoking Convex)

Feature components under:

  /src/features/**

are **EXEMPT** from this rule.

Rationale:
• Feature Roots are allowed to call useMutation()
• Feature Roots trigger Golden Bridge flows
• Feature Roots do NOT run inside the Sovereign Runtime
• Feature Roots do NOT import Clerk hooks
• Feature Roots do NOT threaten sovereignty

Therefore:
✔ useMutation() IN FEATURES = SAFE  
✔ useConvex() IN FEATURES = SAFE  
❌ useMutation() IN DOMAINS = VIRUS  
❌ useConvex() IN DOMAINS = VIRUS  

This clarification overrides all previous ambiguity and MUST be respected by scanners, auditors, and developers.

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

# 🟦 CATEGORY E — SERVER ACTION VIRUSES

❌ E1. Importing Server Actions inside Domain components

Executes server logic inside CSR → breaks Golden Bridge.

❌ E2. Calling Server Actions without updating FUSE store after success

Two state machines drift → runtime desync → chaos.

⸻

# 🟪 CATEGORY F — NAVIGATION VIRUSES

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

# 🟫 CATEGORY G — STORE & STATE VIRUSES

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

# 🟩 CATEGORY H — UI & DESIGN VIRUSES

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

# 🟦 CATEGORY I — COOKIE & SESSION VIRUSES

❌ I1. Reading Clerk cookies on the client

Identity must enter through the Golden Bridge, not runtime.

❌ I2. Letting Clerk mutate cookies client-side

Auth must stay on the server.

❌ I3. Injecting Clerk session objects into FUSE store

Two sources of truth → instability.

⸻

# 🟥 CATEGORY J — IDENTITY MODEL VIRUSES

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
