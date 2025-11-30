# 🛡️ SMAC ARCHITECTURE
## Static Manifest Access Control: Routing + Authorization Infrastructure

---

## THE PARADIGM EVOLUTION

The Rank System gave us **perfect access control**. But it had architectural limitations:

**OLD LEGACY Structure (REPLACED):**
- `/app/(modes)/(captain)/finances` → URLs contained rank names ❌ LEGACY
- `/app/(modes)/(shared)/clients/@captain` → Complex parallel route syntax ❌ LEGACY
- `/app/(modes)/(admiral)/admin` → No clean domain organization ❌ LEGACY

**NEW Production Structure (CURRENT):**
- `/(domains)/clients/*` → Clean domain-based URLs ✅ CURRENT
- `/(domains)/finance/*` → Rank-agnostic routes ✅ CURRENT
- `/(domains)/admin/*` → Domain-first organization ✅ CURRENT

**Routes coupled to ranks (LEGACY PROBLEM):**
- Captain finances in one folder tree
- Admiral admin in another folder tree
- Shared routes needed `@slots` for rank variants

**Navigation was complex:**
- Rank-based navigation required parallel route switching
- URLs weren't clean or shareable
- Route organization didn't match domain logic

**We needed evolution, not revolution.**

Enter SMAC: **Static Manifest Access Control**.

---

## WHAT SMAC IS (AND ISN'T)

### What SMAC Is

**SMAC is routing + authorization infrastructure** that sits ABOVE FUSE data patterns.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        THE STACK INTEGRATION                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ SMAC LAYER (Architecture)                                         │ │
│  │ • Middleware: Edge gate checks rank + manifest                    │ │
│  │ • Routes: Domains-as-routes (rank-agnostic URLs)                  │ │
│  │ • Data: Convex scopes by effectiveRank                            │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                           ↓ (passes control to)                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ FUSE LAYER (Data Flow)                                            │ │
│  │ • WARP: Server preloads domain data                               │ │
│  │ • Providers: Hydrate with initialData                             │ │
│  │ • Bridges: Client hooks expose { data, computed, actions }        │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                           ↓ (provides data to)                          │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ VR LAYER (UI Rendering)                                           │ │
│  │ • VRs: Self-contained prebuilt components                         │ │
│  │ • Props: Behavior handlers (onEdit, onDelete, etc.)               │ │
│  │ • NO classNames, NO external styling, NO custom CSS               │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**The Integration:**
- **SMAC** determines WHO can access WHAT (authorization layer)
- **FUSE** determines HOW data flows (preload → hydrate → expose)
- **VR** determines HOW UI renders (self-sufficient components)

**Simple Architecture:**
```
┌─────────────────────────────────────┐
│  SMAC (Routing + Authorization)     │ ← Determines WHO can access
├─────────────────────────────────────┤
│  FUSE (Data + State + UI)           │ ← Determines HOW data flows
├─────────────────────────────────────┤
│  Convex + Cookie + Zustand          │ ← Backend + Session + State
└─────────────────────────────────────┘
```

**Four Layers:**
1. **Routes** - Domain-based URLs (`/domain/client`, `/domain/finance`)
2. **Manifests** - Compile-time rank allowlists (`manifest.json` per domain)
3. **Edge Gate** - Middleware authorization enforcement at request time
4. **Data Scoping** - Convex queries filtered by rank/org (query-level filters)

### What SMAC Is NOT

**SMAC is NOT a replacement for FUSE data patterns:**
- ❌ SMAC does NOT change how data is fetched (still client-side `useQuery`)
- ❌ SMAC does NOT change WARP (still zero loading states)
- ❌ SMAC does NOT change Golden Bridge (still Server Actions → Convex → Cookie)
- ❌ SMAC does NOT change session management (still cookie-based <1ms auth)

**SMAC is ADDITIVE architecture:**
- ✅ Adds clean domain-based routing structure
- ✅ Adds compile-time access control via manifests
- ✅ Adds runtime authorization via middleware
- ✅ Adds data-level scoping in queries

---

## THE FOUR LAYERS OF SMAC

### Layer 1: Domain-Based Routes

**ACTUAL Production Routes (Current Implementation):**

```
/(domains)/
├── clients/              # Client management domain
│   ├── page.tsx          # List all clients
│   ├── people/           # People view
│   ├── pipeline/         # Sales pipeline
│   ├── sessions/         # Session tracking
│   ├── teams/            # Team management
│   └── reports/          # Client reports
│
├── finance/              # Financial domain
│   ├── page.tsx          # Dashboard
│   ├── overview/         # Financial overview
│   ├── invoices/         # Invoice management
│   └── payments/         # Payment tracking
│
├── projects/             # Project management domain
│   ├── page.tsx          # Project list
│   ├── tracking/         # Progress tracking
│   ├── charts/           # Gantt charts
│   └── locations/        # Location management
│
├── productivity/         # Productivity domain
│   ├── page.tsx          # Productivity dashboard
│   ├── calendar/         # Calendar features
│   ├── email/            # Email management
│   ├── booking/          # Appointment booking
│   └── meeting/          # Meeting management
│
├── settings/             # Settings domain (self-scoped)
│   ├── page.tsx          # Settings root
│   ├── account/          # Account settings
│   ├── preferences/      # User preferences
│   ├── security/         # Security settings
│   ├── billing/          # Billing management
│   └── plan/             # Plan selection
│
├── admin/                # Admin domain (admiral-only)
│   ├── users/            # User management
│   │   └── [userId]/     # User details
│   ├── tenant/           # Tenant management
│   │   └── [tenantId]/   # Tenant details
│   ├── plans/            # Plan management
│   └── feature/          # Feature flags
│
└── system/               # System domain (admiral-only)
    ├── page.tsx          # System dashboard
    ├── ranks/            # Rank management
    └── ai/               # AI configuration
```

**Benefits:**
- Clean, shareable URLs: `transfoorm.com/clients/people`
- Domain-first organization (not rank-first)
- RESTful structure that matches business logic
- Easy to understand, easy to navigate

### Layer 2: Static Manifests

**Compile-time rank allowlists** define who can access each route:

```json
// /src/app/domain/client/manifest.json
{
  "route": "/domain/client",
  "allowedRanks": ["crew", "captain", "commodore", "admiral"],
  "description": "Client management domain",
  "domain": "client"
}

// /src/app/domain/finance/manifest.json
{
  "route": "/domain/finance",
  "allowedRanks": ["captain", "commodore", "admiral"],
  "description": "Financial management domain",
  "domain": "finance"
}

// /src/app/domain/admin/manifest.json
{
  "route": "/domain/admin",
  "allowedRanks": ["admiral"],
  "description": "Platform administration domain",
  "domain": "admin"
}
```

**Manifest aggregation at build time:**

```typescript
// Generated: /src/manifests/domain-manifest-aggregated.json
[
  { "route": "/domain/client", "allowedRanks": ["crew", "captain", "commodore", "admiral"] },
  { "route": "/domain/finance", "allowedRanks": ["captain", "commodore", "admiral"] },
  { "route": "/domain/project", "allowedRanks": ["captain", "commodore", "admiral"] },
  { "route": "/domain/work", "allowedRanks": ["crew", "captain", "commodore", "admiral"] },
  { "route": "/domain/settings", "allowedRanks": ["crew", "captain", "commodore", "admiral"] },
  { "route": "/domain/admin", "allowedRanks": ["admiral"] }
]
```

**Why manifests matter:**
- Compile-time validation (catch errors at build, not runtime)
- Single source of truth for access control
- Self-documenting (read manifest to understand access)
- Type-safe (TypeScript types generated from manifests)

### Layer 3: Edge Gate (Middleware)

**Runtime authorization enforcement** at the edge:

```typescript
// /src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { readSessionCookie } from '@/fuse/store/session/cookie';
import { DOMAIN_MANIFESTS } from '@/manifests/domain-manifest-aggregated.json';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if this is a protected domain route
  const manifest = DOMAIN_MANIFESTS.find(m =>
    pathname.startsWith(m.route)
  );

  if (!manifest) {
    // Not a domain route, allow through
    return NextResponse.next();
  }

  // Read user session from cookie
  const session = await readSessionCookie();

  if (!session) {
    // Not authenticated, redirect to sign-in
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Check if user's rank is allowed
  if (!manifest.allowedRanks.includes(session.rank)) {
    // Rank not allowed, redirect to unauthorized
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Authorized, allow through
  return NextResponse.next();
}

export const config = {
  matcher: ['/domain/:path*']
};
```

**Edge Gate enforcement:**
- ⚡ **Fast** - Cookie read <1ms, manifest lookup O(1)
- 🔒 **Secure** - Authorization before page renders
- 🚀 **Edge-ready** - Runs on Vercel Edge (not Node.js)
- ✅ **Fail-safe** - Default deny (not authenticated = redirect)

### Layer 4: Data Scoping

**Convex queries filter by rank and organization:**

```typescript
// /convex/domains/client/queries.ts
import { query } from './_generated/server';
import { v } from 'convex/values';

export const listClients = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('clerkId'), identity.subject))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    // RANK-BASED DATA SCOPING
    switch (user.rank) {
      case 'crew':
        // Crew: Only assigned clients
        return await ctx.db
          .query('clients')
          .filter(q => q.eq(q.field('assignedTo'), user._id))
          .collect();

      case 'captain':
      case 'commodore':
        // Captain/Commodore: All clients in organization
        return await ctx.db
          .query('clients')
          .filter(q => q.eq(q.field('orgId'), user.orgId))
          .collect();

      case 'admiral':
        // Admiral: All clients across platform
        return await ctx.db
          .query('clients')
          .collect();

      default:
        throw new Error('Invalid rank');
    }
  }
});
```

**Data scoping patterns:**

| Rank | Client Domain | Finance Domain | Project Domain | Settings Domain |
|------|---------------|----------------|----------------|-----------------|
| **Crew** | Assigned only | No access | Org-scoped | Self-only |
| **Captain** | Org-scoped | Org-scoped | Org-scoped | Self-only |
| **Commodore** | Org-scoped | Org-scoped | Org-scoped | Self-only |
| **Admiral** | All (platform-wide) | All (platform-wide) | All (platform-wide) | Self-only |

**Why data scoping matters:**
- 🔒 **Security at query level** - Cannot bypass via API manipulation
- 🎯 **Precise access control** - Different scoping per domain
- ⚡ **Performance** - Database indexes on orgId/assignedTo
- ✅ **Consistent** - Same patterns across all domains

---

## THE DOMAIN ARCHITECTURE

### Five Production Domains

**1. Client Domain** - Client relationship management
```typescript
// Routes: 5
/domain/client              # List clients
/domain/client/new          # Add client
/domain/client/[id]         # Client details
/domain/client/[id]/edit    # Edit client
/domain/client/[id]/notes   # Client notes

// Access: crew (assigned), captain/commodore (org), admiral (all)
// Backend: /convex/domains/clients/
// Tables: clients (core table)
```

**2. Finance Domain** - Financial management
```typescript
// Routes: 3
/domain/finance             # Financial dashboard
/domain/finance/banking     # Banking features
/domain/finance/invoicing   # Invoice management

// Access: captain+ (org-scoped)
// Backend: /convex/domains/finance/
// Tables: finance (core table for invoices/payments/expenses)
```

**3. Project Domain** - Project management
```typescript
// Routes: 3
/domain/projects             # Project list
/domain/projects/new         # Create project
/domain/projects/[id]        # Project details

// Access: captain+ (org-scoped)
// Backend: /convex/domains/projects/
// Tables: projects (core table)
```

**4. Productivity Domain** - Productivity suite
```typescript
// Routes: 4
/domain/productivity                # Productivity dashboard
/domain/productivity/calendar       # Calendar features
/domain/productivity/email          # Email management
/domain/productivity/meeting        # Meeting management

// Access: all ranks (org-scoped)
// Backend: /convex/domains/productivity/
// Tables: prod_email_Messages, prod_cal_Events, prod_book_Bookings, prod_pipe_Meetings
```

**5. Settings Domain** - User preferences
```typescript
// Routes: 6
/domain/settings            # Settings root
/domain/settings/account    # Account settings
/domain/settings/security   # Security settings
/domain/settings/billing    # Billing settings
/domain/settings/plan       # Plan management
/domain/settings/controls   # Preferences/controls

// Access: all ranks (SELF-SCOPED - unique!)
// Backend: /convex/domains/settings/
// Tables: Uses `users` table (no separate settings table)
```

### The Strangler Fig Pattern

**SMAC uses strangler fig migration** - Legacy and domain routes coexist:

```
/app/
├── (modes)/                 # LEGACY TREE (Ken's production work)
│   ├── (captain)/           # Old rank-based routes
│   ├── (admiral)/           # Still functional
│   └── (shared)/            # Both trees work
│
└── domain/                  # NEW SMAC TREE (domain routes)
    ├── client/              # New domain structure
    ├── finance/             # Gradual migration
    └── admin/               # Feature parity before deletion
```

**Migration philosophy:**
- ✅ Keep both trees working (dual compatibility)
- ✅ Create new alongside old (not in place of)
- ✅ Gradually move features (not all at once)
- ✅ Delete legacy ONLY when new has feature parity

**Why strangler fig:**
- 🚀 Ship SMAC without breaking production
- 🔄 Iterate on domain routes while legacy works
- ✅ Ken validates new routes before cutover
- 🗑️ Delete legacy safely after migration complete

---

## THE CONVEX BACKEND PATTERN

### Domain-Organized Backend

**SMAC backends mirror domain structure:**

```
/convex/domains/
├── client/
│   ├── api.ts             # Public API exports
│   ├── queries.ts         # Read operations (listClients, getClient)
│   └── mutations.ts       # Write operations (createClient, updateClient, deleteClient)
│
├── finance/
│   ├── api.ts
│   ├── queries.ts         # getFinances (org-scoped)
│   └── mutations.ts       # updateFinances
│
├── project/
│   ├── api.ts
│   ├── queries.ts         # listProjects (org-scoped)
│   └── mutations.ts       # createProject, updateProject, deleteProject
│
├── work/
│   ├── api.ts
│   ├── queries.ts         # 4 sub-domain queries (calendar, email, booking, meeting)
│   └── mutations.ts       # 4 sub-domain mutations
│
└── settings/
    ├── api.ts
    ├── queries.ts         # getUserSettings (SELF-SCOPED)
    └── mutations.ts       # updateUserSettings, updateThemeSettings, updateMirorSettings
```

**Backend pattern:**

```typescript
// /convex/domains/[domain]/api.ts
// Public API exports (imported by frontend)
export { listClients, getClient } from './queries';
export { createClient, updateClient, deleteClient } from './mutations';

// Usage in frontend:
import { api } from '@/convex/_generated/api';
import { useQuery, useMutation } from 'convex/react';

// In component:
const clients = useQuery(api.domains.client.api.listClients);
const createClient = useMutation(api.domains.client.api.createClient);
```

**Data scoping implementation:**

```typescript
// /convex/domains/finance/queries.ts
export const getFinances = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('clerkId'), identity.subject))
      .first();

    if (!user) throw new Error('User not found');

    // RANK-BASED SCOPING
    if (user.rank === 'crew') {
      throw new Error('Crew cannot access finance domain');
    }

    if (user.rank === 'admiral') {
      // Admiral: all finances across platform
      return await ctx.db.query('finances').collect();
    }

    // Captain/Commodore: org-scoped finances
    return await ctx.db
      .query('finances')
      .filter(q => q.eq(q.field('orgId'), user.orgId))
      .collect();
  }
});
```

---

## SMAC VS. RANK SYSTEM

### Evolution, Not Revolution

| Aspect | Rank System (Legacy) | SMAC (Current) |
|--------|---------------------|----------------|
| **URL Structure** | `/(modes)/(captain)/finances` | `/domain/finance` |
| **Organization** | Rank-first folders | Domain-first folders |
| **Access Control** | Route-level (parallel routes) | 4-layer (manifest + middleware + query) |
| **Code Splitting** | By rank (`captain-[hash].js`) | By domain (`finance-[hash].js`) |
| **Navigation** | `NAVIGATION_BY_RANK` object | Domain-based nav with rank filtering |
| **Authorization** | Component-level (`RankGate`) | Edge-level (middleware) + data-level (queries) |
| **Manifests** | No manifests (implicit in routes) | Explicit `manifest.json` per domain |
| **Data Scoping** | In queries (same as SMAC) | In queries (same as Rank System) |

**What stayed the same:**
- ✅ FUSE data patterns (client-side `useQuery`)
- ✅ Cookie-based session management (<1ms auth)
- ✅ WARP pattern (zero loading states)
- ✅ Golden Bridge pattern (Server Actions → Convex → Cookie)
- ✅ Rank hierarchy (crew → captain → commodore → admiral)
- ✅ Data scoping implementation (query-level filters)

**What changed:**
- 🔄 Route structure (rank-first → domain-first)
- 🔄 Access control (route-level → 4-layer system)
- 🔄 URLs (complex → clean)
- 🔄 Organization (rank folders → domain folders)

---

## THE IMPLEMENTATION GUIDE

### Step 1: Create Domain Structure

```bash
# Create domain routes
mkdir -p src/app/domain/client
mkdir -p src/app/domain/finance
mkdir -p src/app/domain/project
mkdir -p src/app/domain/work
mkdir -p src/app/domain/settings
mkdir -p src/app/domain/admin
```

### Step 2: Create Manifests

```json
// src/app/domain/client/manifest.json
{
  "route": "/domain/client",
  "allowedRanks": ["crew", "captain", "commodore", "admiral"],
  "description": "Client management domain",
  "domain": "client"
}
```

### Step 3: Aggregate Manifests (Build Script)

```typescript
// scripts/aggregate-manifests.ts
import fs from 'fs';
import path from 'path';

const DOMAIN_PATH = 'src/app/domain';
const OUTPUT_PATH = 'src/manifests/domain-manifest-aggregated.json';

const manifests = [];
const domains = fs.readdirSync(DOMAIN_PATH);

for (const domain of domains) {
  const manifestPath = path.join(DOMAIN_PATH, domain, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    manifests.push(manifest);
  }
}

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(manifests, null, 2));
console.log(`✅ Aggregated ${manifests.length} manifests`);
```

```json
// package.json
{
  "scripts": {
    "build": "node scripts/aggregate-manifests.ts && next build"
  }
}
```

### Step 4: Create Middleware

```typescript
// src/middleware.ts (already shown above)
// Reads aggregated manifests and enforces at edge
```

### Step 5: Create Convex Backend

```typescript
// convex/domains/client/queries.ts
import { query } from '@/convex/_generated/server';

export const listClients = query({
  args: {},
  handler: async (ctx) => {
    // Implementation with rank-based scoping
  }
});

// convex/domains/client/api.ts
export { listClients, getClient } from './queries';
export { createClient, updateClient, deleteClient } from './mutations';
```

### Step 6: Create Frontend Routes

```typescript
// src/app/domain/client/page.tsx
'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function ClientsPage() {
  const clients = useQuery(api.domains.client.api.listClients);

  if (!clients) return <div>Loading...</div>;

  return (
    <div>
      <h1>Clients</h1>
      <ul>
        {clients.map(client => (
          <li key={client._id}>{client.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## THE PERFORMANCE IMPACT

### Bundle Size Comparison

**Rank System (Legacy):**
```
shared.js:    120KB
crew.js:       45KB
captain.js:   180KB
commodore.js:  95KB
admiral.js:   220KB
```

**SMAC (Current):**
```
shared.js:     120KB
client.js:      55KB  (all ranks that access client domain)
finance.js:     85KB  (captain+ ranks)
project.js:     65KB  (captain+ ranks)
work.js:        75KB  (all ranks)
settings.js:    45KB  (all ranks)
admin.js:      120KB  (admiral only)
```

**Benefits:**
- 📦 **Domain-based splitting** - Download only domains you access
- 🚀 **Lazy loading** - Domains load on first visit
- ⚡ **Better caching** - Domain bundles cache independently
- 🎯 **Granular updates** - Change finance without re-downloading client

### Middleware Performance

**Edge Gate timing:**
- Cookie read: **<1ms**
- Manifest lookup: **<1ms** (in-memory array)
- Authorization check: **<1ms** (array includes check)
- **Total: ~2-3ms overhead** per request

**This is negligible compared to:**
- DNS lookup: 20-50ms
- TLS handshake: 50-100ms
- Server processing: 50-200ms

---

## THE SEP (SMAC Enhancement Program)

### Current Performance Issue

**Problem:** 26 stub pages have `export const dynamic = 'force-dynamic'`, causing:
- ❌ 1000ms+ page loads (should be <100ms static HTML)
- ❌ Unnecessary SSR on every request
- ❌ No static optimization

**Root cause (NOT SMAC):**
- Root layout reads theme from cookie (intentional for zero-FOUC)
- This forces ALL routes dynamic
- Stub pages inherit dynamic rendering

**The fix (SEP Step 1):**

```typescript
// ❌ DELETE this from stub pages
export const dynamic = 'force-dynamic';

// ✅ Stub pages should be static shells
'use client';

export default function StubPage() {
  return (
    <div>
      <h1>Coming Soon</h1>
    </div>
  );
}
```

**Expected improvement:**
- 1000ms+ → <100ms (90% faster)
- Server-rendered → Static HTML (cached at CDN)
- Every request → Once per build (massive scale savings)

### SEP Remaining Steps

**Step 2A: Narrow Middleware Matcher**
```typescript
// Current: Matches all domain routes
matcher: ['/domain/:path*']

// Optimized: Match only protected routes
matcher: [
  '/domain/finance/:path*',   // Captain+ only
  '/domain/admin/:path*',     // Admiral only
  '/domain/client/:path*',    // Rank-scoped
  // Exclude public routes
]
```

**Step 2B: Add Server-Timing Headers**
```typescript
// middleware.ts - Add observability
const start = performance.now();
// ... authorization logic ...
const duration = performance.now() - start;

response.headers.set('Server-Timing', `auth;dur=${duration}`);
```

---

## THE PHILOSOPHY

### Principle 1: Domains Over Ranks

Organize by **what users do** (client management, finances), not **who they are** (captain, admiral).

**Why:**
- Business logic groups by domain (all client features together)
- URLs make semantic sense (`/domain/client` not `/(modes)/(captain)/clients`)
- Code organization matches mental model

### Principle 2: Defense in Depth

Authorization at FOUR layers, not one:

1. **Manifest** - Compile-time declaration
2. **Middleware** - Edge enforcement before render
3. **Component** - RankGate for UI elements (legacy compatibility)
4. **Query** - Data-level scoping in Convex

**Can't bypass one layer and access data.**

### Principle 3: Explicit Over Implicit

Manifests make access control **visible and auditable**:

```bash
# Want to see who can access finance?
cat src/app/domain/finance/manifest.json

# Output:
{ "allowedRanks": ["captain", "commodore", "admiral"] }
```

No hunting through code. No implicit rules. **Just read the manifest.**

### Principle 4: Gradual Migration

Strangler fig pattern respects production:

- ✅ Don't break Ken's working product
- ✅ Build new alongside old
- ✅ Migrate features gradually
- ✅ Delete legacy when safe

**This is how you evolve architecture in production.**

---

## THE VIRGIN-REPO COMPLIANCE

### SMAC Follows VRP

**Layer 4: FUSE Architecture Compliance** ✅

SMAC integrates with FUSE without breaking it:
- Data fetching: Still client-side `useQuery` (unchanged)
- Session management: Still cookie-based (unchanged)
- WARP pattern: Still zero loading states (unchanged)
- Golden Bridge: Still Server Actions → Convex → Cookie (unchanged)

**Layer 6: Build Integrity** ✅

Manifest aggregation runs on every build:
```json
{
  "scripts": {
    "build": "node scripts/aggregate-manifests.ts && next build"
  }
}
```

**VRP enforcement:**
- `/purecommit` - Validates manifests exist for new domains
- `/purepush` - Checks manifest aggregation succeeds
- `/vrpaudit` - Full 70-point compliance check

---

## COMMON OBJECTIONS (And Why They're Wrong)

### "But the old Rank System was simpler!"

The old system was simpler **syntactically**, not **architecturally**.

**Old complexity:**
- Parallel routes: `@crew`, `@captain`, `@admiral` folders
- URL pollution: `/(modes)/(captain)/finances`
- Route organization didn't match business logic
- Hard to understand which rank sees what

**SMAC clarity:**
- One domain folder with one manifest
- Clean URLs: `/domain/finance`
- Manifest explicitly lists allowed ranks
- Business logic grouped by domain

**Simple syntax ≠ simple architecture.**

### "But we lose automatic code splitting by rank!"

We **gain** better splitting by domain:

**Old:** Captain downloads ALL captain features (finances + team + projects)
**New:** Captain downloads ONLY domains they visit (finances on first visit, projects when needed)

**Result:** Smaller initial bundles, lazy-loaded domains.

### "But the middleware adds latency!"

Middleware adds **2-3ms**. Root layout cookie read already forces dynamic rendering (intentional for zero-FOUC).

**The 1000ms stub page problem is NOT middleware:**
- It's unnecessary `force-dynamic` declarations
- SEP removes those → 90% faster

### "But four layers is over-engineering!"

Four layers is **defense in depth**:

1. **Manifest** - Compile-time validation (catch errors before deploy)
2. **Middleware** - Edge enforcement (block unauthorized requests early)
3. **Component** - UI-level gating (progressive disclosure)
4. **Query** - Data-level scoping (final security layer)

**Can't bypass authorization at any layer.**

This is **proper security architecture**, not over-engineering.

---

## IMPLEMENTATION CHECKLIST

### For New Domains

✅ **Create domain folder** - `src/app/domain/[name]/`
✅ **Create manifest.json** - Define route + allowedRanks
✅ **Create Convex backend** - `convex/domains/[name]/`
✅ **Implement data scoping** - Rank-based query filters
✅ **Create frontend routes** - Domain page.tsx files
✅ **Test authorization** - Verify each rank's access
✅ **Update navigation** - Add domain to sidebar if needed
✅ **Run manifest aggregation** - `npm run build`
✅ **Test middleware** - Verify edge gate blocks unauthorized

### For Migrations (Legacy → SMAC)

✅ **Read legacy implementation** - Understand current features
✅ **Create SMAC domain** - New domain structure
✅ **Keep legacy working** - Strangler fig pattern
✅ **Implement feature parity** - Match legacy functionality
✅ **Validate with Ken** - Confirm new route works
✅ **Gradual cutover** - Update links to new routes
✅ **Monitor usage** - Track legacy vs new route traffic
✅ **Delete legacy safely** - When new route proven

---

## THE FUTURE OF SMAC

### SMAC 2.0: Dynamic Manifests

Current manifests are static JSON. Future: **Dynamic manifest generation**:

```typescript
// Future: Manifest as TypeScript
export const manifest: DomainManifest = {
  route: '/domain/client',
  allowedRanks: (user) => {
    // Dynamic logic based on feature flags, user tier, etc.
    if (user.tier === 'enterprise') return ['crew', 'captain', 'commodore', 'admiral'];
    return ['captain', 'commodore', 'admiral'];
  }
};
```

### SMAC Edge Functions

Current middleware runs on Edge. Future: **Per-domain edge functions**:

```typescript
// /domain/finance/edge.ts
export async function beforeFinanceAccess(user: User) {
  // Custom logic before finance domain access
  await logFinanceAccess(user);
  await checkComplianceFlags(user);
}
```

### SMAC Analytics

Track domain access patterns:

```typescript
{
  totalDomainAccess: {
    client: 12500,   // Most accessed
    finance: 3200,   // Second most
    admin: 45        // Least accessed (admiral-only)
  },
  averageLoadTime: {
    client: 85ms,
    finance: 120ms,  // Slower (more data)
    admin: 450ms     // Slowest (admiral loading protocol)
  }
}
```

**Use analytics to:**
- Optimize hot paths (client domain most accessed → optimize first)
- Detect unauthorized access attempts (repeated 403s → security alert)
- Measure performance per domain (SEP improvements)

---

## DATABASE NAMING ALIGNMENT

### SMAC-Aligned Table Naming

**SMAC architecture extends to database table naming** using a three-level hierarchical pattern:

```
[domain]_[area]_[Entity]
```

**Alignment with SMAC folder structure:**

| SMAC Routes | Convex Backend | Database Tables |
|-------------|----------------|-----------------|
| `/(domains)/admin/users/` | `/convex/domains/admin/users/` | `admin_user_*` |
| `/(domains)/clients/` | `/convex/domains/clients/` | `clients`, `client_*` |
| `/(domains)/finance/` | `/convex/domains/finance/` | `finance`, `fin_*` |
| `/(domains)/productivity/` | `/convex/domains/productivity/` | `prod_email_*`, `prod_cal_*` |

### Admin Domain Tables

**Admin is the domain, Users is the subdomain** (matching SMAC route structure):

```typescript
// convex/schema.ts
export default defineSchema({
  // Core user document (SMAC-aligned: Admin domain → Users subdomain)
  admin_users: defineTable({ /* ... */ }),

  // Admin → Users subdomain tables (SMAC-aligned)
  admin_users_DeletionLogs: defineTable({
    userId: v.string(),
    clerkId: v.string(),
    email: v.string(),
    deletedBy: v.string(),
    deletedAt: v.number(),
    status: v.union(
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("failed")
    ),
    // ... Vanish Protocol 2.0 fields
  }),
});
```

### Domain Prefixes

| Prefix | Domain | SMAC Route | Description |
|--------|--------|------------|-------------|
| `admin_` | Admin | `/(domains)/admin/*` | User mgmt, tenants, platform config |
| `client_` | Clients | `/(domains)/clients/*` | Client relationship management |
| `fin_` | Finance | `/(domains)/finance/*` | Financial management |
| `prod_` | Productivity | `/(domains)/productivity/*` | Email, calendar, bookings |
| `proj_` | Projects | `/(domains)/projects/*` | Project management |

### Core Tables (No Prefix)

Domain-level core tables don't need prefixes:
- `users` - Core user document
- `clients` - Core client document
- `finance` - Core finance document
- `projects` - Core project document

**These are the primary tables for each domain.** Sub-domain and feature tables use the three-level pattern.

### Perfect Architectural Alignment

**SMAC alignment across all four layers:**

```
1. Routes:     /(domains)/admin/users/
2. Backend:    /convex/domains/admin/users/
3. Database:   admin_users, admin_users_DeletionLogs
4. Manifests:  /src/app/(domains)/admin/users/manifest.json
```

**All four layers use the same domain hierarchy** - Admin is the domain, Users is the subdomain. This creates perfect consistency from URL to database.

**Benefits:**
- ✅ **Visual consistency** - Routes, backend, and tables use same structure
- ✅ **Easy navigation** - Find database tables by knowing the SMAC route
- ✅ **Scalability** - Works with 500+ tables without confusion
- ✅ **Self-documenting** - Table name tells you its domain/subdomain

**See:** `14-DATABASE-NAMING-CONVENTION.md` for complete naming rules, domain catalog, migration strategies, and comprehensive examples.

---

## CONCLUSION

SMAC isn't just routing. It's **architectural philosophy**:

**Domains over ranks** - Organize by business logic, not access control
**Explicit over implicit** - Manifests declare intent clearly
**Defense in depth** - Four layers of authorization
**Gradual migration** - Strangler fig respects production

**SMAC gives you:**
- Clean URLs that make sense
- Compile-time access validation
- Edge-level authorization enforcement
- Data-level security scoping
- Domain-based code splitting
- Strangler fig migration safety

**SMAC doesn't replace FUSE. It completes it.**

FUSE handles **data and state**.
SMAC handles **routing and authorization**.

Together, they form the foundation of Transfoorm's architecture.

**This is how you build scalable SaaS from day one.**
**This is how you follow the Virgin-Repo Protocol.**
**This is how you achieve the KKK Protocol at 100K users.**

**This is SMAC.**

---

*Continue to [06-RANK-SYSTEM.md](./06-RANK-SYSTEM.md) to understand the rank hierarchy that SMAC enforces...*

🛡️ **SMAC: Because clean URLs and secure access aren't optional.** 🛡️
