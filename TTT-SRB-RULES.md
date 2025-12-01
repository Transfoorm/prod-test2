🔱 TTT ENFORCEMENT RULES FOR FUSE SOVEREIGNTY

The TTT Enforcement Rules for FUSE Sovereignty — not theory, not fluff, not “best practices”, but hard rules with code checks, lint checks, VRP checks, and architectural invariants that guarantee FUSE purity and protect you from future dev drift or sabotage.

These rules cannot be broken without the VRP screaming, lint failing, build breaking, or the Sovereign Router refusing to cooperate.

This is the constitution of Transfoorm. (The immutable laws of the sovereign client-state)

Each rule includes:
	•	Doctrine (why it exists)
	•	Rule (the law devs must obey)
	•	Lint / VRP enforcement (how we prevent betrayal)
	•	Penalty (what breaks if violated)

⸻

⚔️ RULE 1 — Domain Pages Must Never Execute Server Code

Doctrine

FUSE = client sovereignty.
Any server code in domain pages breaks sovereignty.

Rule

No export const dynamic
No fetch
No async server functions
No RSC data reads
No server actions

Lint Enforcement

ESLint rule:

"no-restricted-syntax": [
  "error",
  {
    "selector": "ImportDeclaration[source.value=/^next\\/server$/]",
    "message": "Domain pages cannot import server modules. FUSE sovereignty rule."
  }
]

Penalty

Build fails.

⸻

⚔️ RULE 2 — Domain Navigation Must Not Use router.push

Doctrine

router.push = App Router = server round trip.
FUSE must own routing.

Rule

router.push, redirect, useRouter().push, or <Link href> inside /app/app is forbidden.

Only:

navigate('page')

Lint Enforcement

{
  "selector": "CallExpression[callee.property.name='push']",
  "message": "Use navigate() instead of router.push. Sovereign Router rule."
}

Penalty

Lint error + VRP block.

⸻

⚔️ RULE 3 — All Domain Views Must Render From FUSE First

Doctrine

Pages should never wait for data.
Navigation should be 32–65ms.

Rule

Every domain view:
	•	Reads from FUSE store
	•	Renders instantly
	•	Uses WarpPlaceholder if data is missing

Code Pattern Enforcement

Require:

const data = useX();
if (!data) return <WarpPlaceholder />;

Lint Enforcement

Custom ESLint plugin: detect hooks in domain views that call useQuery, useEffect(fetch), or fetch().

Penalty

VRP “FUSE First” violation.

⸻

⚔️ RULE 4 — Convex Can NEVER Be Called Inside a View

Doctrine

UI must be backed by FUSE, not Convex.
Convex = background sync only.

Rule

No Convex queries inside:
	•	Pages
	•	Components inside /views
	•	UI elements

Convex must ONLY be called inside:

/fuse/sync/

Lint Enforcement

{
  "selector": "CallExpression[callee.name=/useQuery|useMutation/]",
  "message": "Convex operations forbidden inside domain views."
}

Penalty

Build fails + VRP denies commit.

⸻

⚔️ RULE 5 — Domain Files Must Be Pure Client Components

Doctrine

SSR adds latency + complexity + kills sovereignty.

Rule

All files in /views must begin with:

'use client';

Lint Enforcement

Regex check:

{
  "selector": "Program",
  "message": "Domain views must be client components. Missing 'use client'."
}

Penalty

VRP halts build.

⸻

⚔️ RULE 6 — WARP Must Preload Before First Navigation

Doctrine

WARP = FUSE hydration engine
Without preload → first nav slow.

Rule

FuseApp must call:

runWarpPreload();

Inside:

useEffect(() => { ... }, []);

Test Enforcement

VRP test:
	•	Mount FuseApp
	•	Navigate immediately
	•	Assert WARP was triggered before nav

Penalty

Runtime assertion failure.

⸻

⚔️ RULE 7 — FUSE Store is the Only Source of Truth

Doctrine

FUSE must reflect state instantly.

Rule

Allowed data sources:
	•	FUSE atoms
	•	FUSE selectors
	•	FUSE computed state
	•	FUSE preload objects

Forbidden:
	•	useState for domain data
	•	fetch('/api')
	•	“just grab it from Convex”
	•	local storage
	•	session storage

Penalty

Architectural violation flagged by VRP.

⸻

⚔️ RULE 8 — No Side Effects in Views

Doctrine

Views render.
Sync happens elsewhere.

Rule

“useEffect → do things” is forbidden inside domain views.

Allowed only in:
	•	/fuse/sync
	•	/fuse/state
	•	/fuse/prefetch

Penalty

VRP flags “Side-Effect in View Layer”.

⸻

⚔️ RULE 9 — UI Must Never Block on Network Requests

Doctrine

TTT: “No loading spinners”
FUSE: “We preload before the click.”

Rule

Any visible loading indicator is forbidden.
Placeholders only.

Penalty

TTT visual violation. Visual tests fail.

⸻

⚔️ RULE 10 — App Router Cannot Interfere Once FuseApp Mounts

Doctrine

Sovereign Router = single source of navigation.
App Router = outer shell only.

Rule

No App Router <Link> inside /views.
No RSC layout remounts allowed.

Penalty

VRP flags “App Router Intrusion”.

⸻

⚔️ RULE 11 — Every Navigation Must Be 32–65ms

Doctrine

This is the heart of FUSE.

Rule

Navigation time tests run automatically:
	•	navigate(‘ledger’)
	•	measure render time
	•	enforce < 100ms
	•	warn at > 65ms
	•	fail at > 120ms

Penalty

Performance gate fails; build blocked.

⸻

⚔️ RULE 12 — All Domain Components Must Be Stateless

Doctrine

State = FUSE
Logic = PRISM
Sync = Convex

Rule

Components may not hold domain logic or mutable state.

Exceptions:
	•	transient UI state (toggle, modal open/close)

Penalty

Linter flags “State Leakage.”

⸻

⚔️ RULE 13 — Sovereign Router May Never Unmount

Doctrine

FuseApp & Sovereign Router are persistent.
Unmounting = memory loss.

Rule

FuseApp must sit in a persistent Next.js boundary.

Penalty

End-to-end test fails.

⸻

⚔️ RULE 14 — FUSE Must Be Fully Ready Before First Domain Render

Doctrine

No waiting.
No fetching.
No hydration cost.

Rule

FuseApp must block domain views until the store has:
	•	user
	•	workspace
	•	permissions
	•	core datasets

Penalty

“Early Render Violation” VRP error.

⸻

⚔️ RULE 15 — A Dev Cannot Disable TTT Sovereignty Enforcement

Doctrine

Self-protection against rogue developers.

Rule

A .vrp-approval file cannot be created locally.
Must come from CI.

No dev can bypass:
	•	hooks
	•	lint rules
	•	approvals
	•	sovereign checks

Penalty

Commit rejected. PR denied. Report to Ken.

⸻

👑 THE GOLDEN LAW (The One Rule Above All Others)

**“The Domain Belongs to FUSE. App Router Belongs to the Shell. Navigation Belongs to the Sovereign Router.”**

Everything else is detail.

