# THE FUSE BIBLE
## Complete Doctrine for New Developers

**One Document. All Knowledge. Zero Confusion.**

---

# PART 1: THE VISION

## What We're Building

Transfoorm is not another SaaS app. It's the **iPhone moment of web applications**.

Remember when every phone had 47 buttons, a stylus, and a 400-page manual? Then Apple released ONE button. Everyone said it was too simple. Now every phone looks like an iPhone.

That's what FUSE is to web apps.

### The Core Promise

**ZERO LOADING STATES. FOREVER.**

When you click a link on your desktop, does Windows show you a spinner? No. The window just appears.

That's our standard.

- Not "fast loading"
- Not "optimized spinners"
- NO SPINNERS

Every spinner is a bug. Every skeleton loader is an admission of defeat. Every "Loading..." is a broken promise.

### The Instant Principle

```
User thinks → User clicks → User sees
                    ↑
                0 milliseconds
```

Not 100ms. Not 50ms. ZERO.

How? The data is already there. We fetched it while they were reading the previous page. By the time they click, we're not fetching — we're revealing.

---

# PART 2: THE SCALE PHILOSOPHY (TTT)

## Triple Ton Test (100K → 10K → 1K)

Every decision, pattern, and pixel is designed for:
- **100K Users** - Total platform users
- **10K Subscribers** - Paying customers
- **1K Monthly Joins** - New users per month

**These aren't "someday" numbers. They're day-one architecture decisions.**

### The 6 Core Tenets

1. **Simplicity Over Sophistication** - Complexity fails at scale
2. **Consistency Over Preference** - One clear way beats ten clever ones
3. **Predictability Over Magic** - If it surprises someone, it's not FUSE-grade
4. **Reversibility Over Perfection** - Any design must be reversible in one sprint
5. **Static Over Runtime** - Push computation to build time
6. **Temporal Stability** - Works today, tomorrow, and at 100K scale

### The TTT God Protocol

Before presenting options, ask:

> "Which is the ONLY TTT-compliant pathway?"

**NOT:**
```
"We could do X, Y, or Z..."
"Here are 5 different ways..."
```

**BUT:**
```
"This is the solution because it passes all TTT tests."
```

One pathway. Zero alternatives. Instant recognition.

---

# PART 3: THE ARCHITECTURE (FUSE)

## What is FUSE?

**Fetch-Update-Store-Everything** - A zero-loading-state architecture where data flows from server cookies through a central Zustand store to components.

### The Flow

```
Server Cookie (<1ms) → FUSE Store (Zustand) → Components
        ↓                      ↓                    ↓
   "Truth Source"        "Single Brain"      "Pure Display"
```

### The 3 Rules (NEVER BREAK THESE)

1. **NO loading states in components** - Data arrives before render
2. **NO fetch() calls in components** - All fetching via FUSE/WARP
3. **NO axios or external HTTP libraries** - Only Convex + cookies

### The Data Flow Pattern

```
1. Server fetches user data from cookie (<1ms)
2. Server passes to ClientHydrator
3. ClientHydrator hydrates FUSE Store
4. Components read from FUSE Store
5. Result: Zero loading states
```

---

# PART 4: STORE ARCHITECTURE

## The FUSE Store Brain

One Zustand store. Five domains. Everything connected.

### The 5 Domains

| Domain | Purpose | Data |
|--------|---------|------|
| **Session** | Current user | user, rank, preferences |
| **Clients** | Business data | people, sessions, notes |
| **Finances** | Money matters | invoices, transactions |
| **Productivity** | Work tools | calendar, email, pipeline |
| **Settings** | Configuration | theme, notifications |

### The ADP Pattern (Always-Data-Present)

Two complementary systems work together:

1. **WARP** (Write And Read Pattern) - Server-side preloading via cookies
2. **PRISM** (Provider-Rich Intelligent State Management) - Client-side hydration via Providers

```
Layout.tsx (Server)                    Provider (Client)
       ↓                                     ↓
  Read Cookie                         Hydrate from Cookie
       ↓                                     ↓
  Pass to Provider                    Write to FUSE Store
       ↓                                     ↓
  Zero Loading States ←←←←←←←←←← Components Read FUSE
```

---

# PART 5: STYLING (FUSE-STYLE)

## The Style Architecture

Pure CSS. CSS Variables. Zero runtime.

### The CSS Files (in `/styles/`)

1. **tokens.css** - Design system primitives (spacing, colors, typography)
2. **layout.css** - Layout dimensions and z-index scale
3. **globals.css** - Global resets and base styles
4. **prebuilts.css** - VRS component base styles
5. **features.css** - Feature-specific styles
6. **themes/** - Theme-specific color values (light/dark)

### CSS Variable Naming Convention

```css
--[namespace]-[property]-[modifier]

Examples:
--space-md
--color-text-primary
--font-size-lg
--radius-sm
```

### The Universal Law: No Inline Styles

**ISV (Inline Style Virus)** - The use of `style={{}}` props.

```tsx
// ❌ ISV INFECTION - NEVER DO THIS
<div style={{color: 'red', fontSize: '16px'}} />

// ✅ ISV-FREE - Always use classes
<div className="vr-button vr-button--primary" />
```

**Only Exception - Dynamic Values:**
```tsx
// ✅ ALLOWED - Runtime-calculated positioning
<Tooltip style={{ top: `${position.y}px` }} />

// ✅ ALLOWED - CSS variable bridges
<div style={{ '--rank-color': meta.color } as React.CSSProperties} />
```

---

# PART 6: COMPONENT SYSTEM (VRS)

## Variant Robot System

Each component variant is a **first-class citizen** with its own file.

### The Pattern

Components live in `/src/prebuilts/`:

```
/src/prebuilts/
└── button/
    ├── index.tsx          # Exports the robot registry
    ├── Primary.tsx        # Variant: primary
    ├── Secondary.tsx      # Variant: secondary
    ├── Ghost.tsx          # Variant: ghost
    ├── Danger.tsx         # Variant: danger
    ├── Link.tsx           # Variant: link
    ├── Fire.tsx           # Variant: fire (CTA)
    ├── Outline.tsx        # Variant: outline
    └── button.css         # Shared styles
```

### Usage

```tsx
import { Button } from '@/prebuilts/button';

// Use variants via dot notation
<Button.primary onClick={...}>Save</Button.primary>
<Button.secondary onClick={...}>Cancel</Button.secondary>
<Button.danger onClick={...}>Delete</Button.danger>
<Button.fire onClick={...}>Complete Setup</Button.fire>
```

### Architecture Benefits

- Each variant evolves independently
- No conditional rendering mess
- Tree-shakeable - unused variants aren't bundled
- Testable in isolation
- Self-documenting structure
- AI/CLI friendly: "Give me a primary button" → `Button.primary`

### CSS Pattern

```css
/* Base class */
.vr-button {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
}

/* Variant modifiers */
.vr-button--primary {
  background: var(--color-primary);
  color: white;
}

.vr-button--danger {
  background: var(--color-danger);
  color: white;
}
```

---

# PART 7: RANK SYSTEM

## The 4 Ranks

| Rank | Role | Access |
|------|------|--------|
| **Admiral** | Platform owner | Everything + impersonation |
| **Commodore** | White-label operators | Own domain, full features |
| **Captain** | Organization owners | Full org control |
| **Crew** | Team members | Limited access |

### Rank Logic Location

Rank-specific logic lives in `/src/rank/`:

```
/src/rank/
├── admiral/      # Admiral-specific utilities
├── captain/      # Captain-specific utilities
├── commodore/    # Commodore-specific utilities (future)
├── crew/         # Crew-specific utilities
└── utils/        # Shared rank utilities
```

### Admiral's Secret Law

All rank terminology is for **internal (Admiral-level) comprehension only**.

Production interfaces must abstract rank into experience-based capability. Users see "Dashboard" not "Captain Mode".

---

# PART 8: GOLDEN BRIDGE PATTERN

## Clean Abstraction Hooks

Bridges hide complexity and provide clean interfaces to components.

### The Contract

Every bridge hook returns:

```typescript
{
  data,      // Raw domain data
  computed,  // Derived/calculated values
  actions,   // Functions to modify data
  flags      // Boolean states (isEmpty, hasError)
}
```

### Example

```typescript
// useClientsBridge.ts
export function useClientsBridge() {
  const clients = useFuse((state) => state.clients.people);
  const sessions = useFuse((state) => state.clients.sessions);

  return {
    data: { clients, sessions },
    computed: {
      activeClients: clients.filter(c => c.status === 'active'),
      totalSessions: sessions.length
    },
    actions: {
      updateClient: (id, data) => { /* ... */ },
      deleteClient: (id) => { /* ... */ }
    },
    flags: {
      isEmpty: clients.length === 0,
      hasActiveSessions: sessions.some(s => s.status === 'active')
    }
  };
}
```

---

# PART 9: PROVIDER ECOSYSTEM

## The Provider Hierarchy

Providers hydrate FUSE store domains in layouts.

```tsx
// Layout hierarchy
<RootLayout>           // Session hydration
  <ModesLayout>        // Mode-specific providers
    <CaptainLayout>    // Rank-specific providers
      <FinancesLayout> // Domain-specific: FinancesProvider
        {children}
      </FinancesLayout>
    </CaptainLayout>
  </ModesLayout>
</RootLayout>
```

### Provider Pattern

```tsx
'use client';

import { useFuse } from '@/store/fuse';
import type { FinancesServerData } from '@/fuse/store/server/fetchFinances';

interface FinancesProviderProps {
  children: React.ReactNode;
  data: FinancesServerData;
}

export function FinancesProvider({ children, data }: FinancesProviderProps) {
  const setFinances = useFuse((state) => state.setFinances);

  useEffect(() => {
    setFinances(data);
  }, [data, setFinances]);

  return <>{children}</>;
}
```

---

# PART 10: DATABASE CONVENTIONS

## Three-Level Naming

```
[domain]_[area]_[Entity]
```

- **domain**: Lowercase, 3-6 chars (fin, admin, prod)
- **area**: Lowercase, 2-5 chars (rec, ar, gl)
- **Entity**: PascalCase (Transactions, Invoices)

### Examples

```typescript
admin_users              // Admin → Users (core table)
admin_users_DeletionLogs // Admin → Users → Deletion Logs
fin_rec_Transactions     // Finance → Reconciliation → Transactions
fin_ar_Invoices         // Finance → Accounts Receivable → Invoices
prod_cal_Events         // Productivity → Calendar → Events
client_team_Members     // Clients → Teams → Members
```

### Domain Prefixes

| Prefix | Domain |
|--------|--------|
| `admin_` | User management, tenant admin |
| `fin_` | All financial modules |
| `client_` | Client/customer management |
| `prod_` | Email, calendar, pipeline |
| `proj_` | Project management |

---

# PART 11: SMAC ARCHITECTURE

## Static Manifest Access Control

Four-layer authorization system:

### Layer 1: Route Manifests

```json
// /src/app/(domains)/finance/manifest.json
{
  "domain": "finance",
  "minRank": "captain",
  "features": ["invoices", "transactions"]
}
```

### Layer 2: Middleware Guards

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const rank = getUserRank(request);
  const manifest = getRouteManifest(request.pathname);

  if (!hasAccess(rank, manifest.minRank)) {
    return NextResponse.redirect('/unauthorized');
  }
}
```

### Layer 3: Component Guards

```tsx
// RankGuard.tsx
export function RankGuard({ minRank, children }) {
  const userRank = useFuse(state => state.session.rank);

  if (!hasMinRank(userRank, minRank)) {
    return null;
  }

  return <>{children}</>;
}
```

### Layer 4: Query Scoping

```typescript
// Convex query
export const getClients = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    // Data automatically scoped by rank
    return ctx.db
      .query("clients")
      .filter(q => q.eq(q.field("businessId"), user.businessId))
      .collect();
  }
});
```

---

# PART 12: VIRGIN-REPO PROTOCOL (VRP)

## Zero-Tolerance Code Quality

**One violation = FAIL. No compromises. No exceptions.**

### The 7 Layers of Protection

| Layer | What | Tool |
|-------|------|------|
| 1 | TypeScript Compiler | `tsc --noEmit` |
| 2 | ESLint (TAV + ISV) | `eslint . --max-warnings=0` |
| 3 | Next.js Build | `npm run build` |
| 4 | FUSE Architecture | Pattern verification |
| 5 | Naming Conventions | File scans |
| 6 | Build Integrity | Output analysis |
| 7 | Random Sampling | Manual inspection |

### The 3 Sacred Commands

| Command | Purpose | When |
|---------|---------|------|
| `/purecommit` | Create VRP-compliant commit | Every commit |
| `/purepush` | Push with VRP verification | When sharing |
| `/vrpaudit` | Full 70-point audit | Weekly |

### TAV Protection (Type Any Virus)

```typescript
// ❌ TAV INFECTION
function process(data: any) { ... }
const result = value as any;

// ✅ TAV-FREE
function process(data: UserData) { ... }
const result = value as User;
```

### Ground Zero

A **virgin repository** has **zero violations** across all 7 layers.

**The Golden Rule:**
> Never commit without `/purecommit`. Never push without `/purepush`.

---

# PART 13: TECH STACK

## What We Use

```json
{
  "framework": "Next.js 15",
  "react": "React 19",
  "state": "Zustand",
  "database": "Convex",
  "auth": "Clerk",
  "language": "TypeScript",
  "styling": "Pure CSS (FUSE-STYLE)",
  "deployment": "Vercel"
}
```

## What We DON'T Use

- ❌ Tailwind CSS (we use FUSE-STYLE)
- ❌ CSS-in-JS (we use platform CSS)
- ❌ Redux (we use Zustand)
- ❌ REST APIs (we use Convex)
- ❌ Loading spinners (we use FUSE)

---

# PART 14: PROJECT STRUCTURE

```
v1/                         # Project root
├── convex/                 # Convex backend
│   └── schema.ts          # Database schema
│
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/        # Authentication pages (sign-in, sign-up)
│   │   ├── (dashboard)/   # Main dashboard layout
│   │   ├── (domains)/     # Domain routes
│   │   │   ├── admin/     # Admin domain (users, tenant, plans, feature)
│   │   │   ├── clients/   # Clients domain (people, sessions, pipeline, teams, reports)
│   │   │   ├── finance/   # Finance domain (invoices, payments, overview)
│   │   │   ├── productivity/  # Productivity (calendar, booking, meeting, email)
│   │   │   ├── projects/  # Projects domain (charts, locations, tracking)
│   │   │   ├── settings/  # Settings domain (account, preferences, security, billing, plan)
│   │   │   └── system/    # System domain (ai, ranks)
│   │   ├── actions/       # Server actions
│   │   ├── api/           # API routes (user, warp)
│   │   └── layout.tsx     # Root layout
│   │
│   ├── fuse/              # FUSE Infrastructure
│   │   ├── constants/     # FUSE constants
│   │   ├── domains/       # Domain-specific FUSE logic
│   │   ├── hooks/         # FUSE hooks
│   │   ├── hydration/     # Hydration utilities
│   │   └── warp/          # WARP (server preloading)
│   │
│   ├── store/             # Zustand state
│   │   └── domains/       # Domain slices
│   │
│   ├── prebuilts/         # VRS Component System
│   │   ├── button/        # Button variants
│   │   ├── card/          # Card variants
│   │   ├── modal/         # Modal variants
│   │   ├── table/         # Table variants
│   │   ├── input/         # Input variants
│   │   ├── form/          # Form components
│   │   ├── tabs/          # Tab components
│   │   └── ...            # Other prebuilts
│   │
│   ├── features/          # Feature components
│   │   ├── UserButton/
│   │   ├── UserSetup/
│   │   ├── ThemeToggle/
│   │   └── ...
│   │
│   ├── shell/             # App shell components
│   │   ├── Sidebar/
│   │   ├── Topbar/
│   │   ├── Footer/
│   │   ├── PageHeader/
│   │   └── PageArch/
│   │
│   ├── rank/              # Rank-specific logic
│   │   ├── admiral/
│   │   ├── captain/
│   │   ├── commodore/
│   │   ├── crew/
│   │   └── utils/
│   │
│   ├── providers/         # React providers
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities
│   └── types/             # TypeScript types
│
├── styles/                # Global CSS (FUSE-STYLE)
├── vanish/                # VANISH Protocol (deletion)
├── scripts/               # Build/dev scripts
└── eslint-custom-rules/   # Custom ESLint rules
```

---

# PART 15: QUICK REFERENCE

## The 7 TTT Tests

1. **Architecture** - Will it survive 100K users?
2. **Design** - Does it remain clear at 10K?
3. **Maintainability** - Can 1K devs join the project?
4. **Performance** - Zero runtime debt?
5. **Reversibility** - Can we undo it in one sprint?
6. **Consistency** - Does it follow the doctrine?
7. **Clarity** - Could a non-coder maintain this?

## The FUSE Laws

| Law | Statement |
|-----|-----------|
| **No Loading** | Data arrives before render |
| **No Fetch** | All data via FUSE/WARP |
| **No Inline** | All styles via CSS classes |
| **No Any** | All types must be explicit |
| **No Magic** | Everything predictable |

## The Commit Workflow

```bash
# Make changes
git add .

# Commit with VRP enforcement
/purecommit

# Choose to push (1) or not (2)
# If 2, push later with:
/purepush

# Periodic audit
/vrpaudit
```

---

# PART 16: THE FINAL OATH

> "I design for scale, not for now.
> I choose clarity over cleverness.
> I honor reversibility, respect simplicity, and obey consistency.
> I serve the Triple Ton — for systems that never collapse under their own weight.
> I present the ONE pathway, not a menu of options.
> I maintain Ground Zero with every commit."

---

**This is FUSE. This is the way.**

---

# APPENDIX: SOURCE DOCTRINE FILES

This Bible consolidates the following 16 SDK documents. Reference them for deep dives:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        THE 16 DOCTRINE FILES                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📖 FOUNDATION                                                              │
│  ├── 00-THE-TRANSFOORM-STORY.md      Vision, mission, why we exist          │
│  └── 15-TTT-SUPPLEMENT.md            TTT philosophy, 7 tests, God Protocol  │
│                                                                             │
│  ⚡ CORE ARCHITECTURE                                                        │
│  ├── 01-FUSE-CORE-ARCHITECTURE.md    Zero loading states, data flow         │
│  ├── 04-ADP-PATTERN.md               WARP + PRISM (server + client)         │
│  ├── 07-GREAT-PROVIDER-ECOSYSTEM.md  Domain providers, hydration            │
│  └── 08-GOLDEN-BRIDGE-PATTERN.md     { data, computed, actions, flags }     │
│                                                                             │
│  🎨 STYLING                                                                 │
│  ├── 02-FUSE-STYLE-ARCHITECTURE.md   CSS philosophy, ISV protection         │
│  └── 03-FUSE-STYLE-IMPLEMENTATION.md Tactical CSS rules, tokens             │
│                                                                             │
│  🤖 COMPONENTS                                                              │
│  └── 05-VRS-COMPONENT-SYSTEM.md      Variant Robot System, dot notation     │
│                                                                             │
│  ⚓ ACCESS CONTROL                                                           │
│  ├── 06-RANK-SYSTEM.md               Admiral/Commodore/Captain/Crew         │
│  └── 13-SMAC-ARCHITECTURE.md         4-layer authorization, manifests       │
│                                                                             │
│  🗄️ DATABASE                                                                │
│  └── 14-DATABASE-NAMING-CONVENTION.md  [domain]_[area]_[Entity] pattern     │
│                                                                             │
│  🛡️ QUALITY                                                                 │
│  └── 12-VIRGIN-REPO-PROTOCOL.md      7 layers, /purecommit, Ground Zero     │
│                                                                             │
│  🚀 IMPLEMENTATION                                                          │
│  ├── 09-IMPLEMENTATION-QUICKSTART.md Build first FUSE app in 30 min         │
│  ├── 10-ADVANCED-PATTERNS.md         Optimistic updates, error handling     │
│  └── 11-DEPLOYMENT-SCALING.md        Vercel, Convex, 100K scaling           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Quick Lookup: "I need to understand..." 
-For the layman:
| I need to understand...     | Read this doc                | Bible section |
|-----------------------------|------------------------------|---------------|
| Why no loading spinners?    | 01-FUSE-CORE-ARCHITECTURE    | Part 1, 3     |
| The 100K scale philosophy   | 15-TTT-SUPPLEMENT            | Part 2.       |
| How data gets to components | 04-ADP-PATTERN               | Part 3, 4     |
| How to style things         | 02, 03-FUSE-STYLE            | Part 5        |
| How to build a component    | 05-VRS-COMPONENT-SYSTEM      | Part 6        |
| Who can access what         | 06-RANK-SYSTEM               | Part 7        |
| How to read from the store  | 08-GOLDEN-BRIDGE-PATTERN     | Part 8        |
| How data hydrates on load   | 07-GREAT-PROVIDER-ECOSYSTEM  | Part 9        |
| How to name database tables | 14-DATABASE-NAMING-CONVENTION| Part 10       |
| How routes are protected    | 13-SMAC-ARCHITECTURE         | Part 11       |
| How to commit clean code    | 12-VIRGIN-REPO-PROTOCOL      | Part 12       |

-For the Pro
| I need understanding| Read this doc         | Bible    |
|         Topic       |      Primary Doc      | Section  |
|---------------------|-----------------------|----------|
| Why zero loading?   | 01-FUSE-CORE          | Part 1, 3|
| TTT 100K/10K/1K     | 15-TTT-SUPPLEMENT     | Part 2   |
| WARP + PRISM        | 04-ADP-PATTERN        | Part 3, 4|
| CSS tokens          | 02, 03-FUSE-STYLE     | Part 5   |
| VRS components      | 05-VRS-COMPONENT      | Part 6   |
| Rank hierarchy      | 06-RANK-SYSTEM        | Part 7   |
| Bridge hooks        | 08-GOLDEN-BRIDGE      | Part 8   |
| Providers           | 07-PROVIDER-ECOSYSTEM | Part 9   |
| DB naming           | 14-DATABASE-NAMING    | Part 10  |
| SMAC auth           | 13-SMAC-ARCHITECTURE  | Part 11  |
| VRP quality         | 12-VIRGIN-REPO        | Part 12  |

---

*Version: 1.0*
*Consolidated from 16 SDK doctrine files*
*Last Updated: 2025-11-30*
