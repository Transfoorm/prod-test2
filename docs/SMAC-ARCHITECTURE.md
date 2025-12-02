# SMAC Architecture

> Static Manifest Access Control: Routing + Authorization Infrastructure

---

## What is SMAC?

**SMAC** is routing + authorization infrastructure that sits ABOVE FUSE data patterns.

```
┌─────────────────────────────────────────────┐
│ SMAC LAYER (Architecture)                   │
│ • Middleware: Edge gate checks rank         │
│ • Routes: Domains-as-routes                 │
│ • Data: Convex scopes by rank               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ FUSE LAYER (Data Flow)                      │
│ • WARP: Server preloads domain data         │
│ • Providers: Hydrate with initialData       │
│ • Bridges: Client hooks expose data         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ VRS LAYER (UI Rendering)                    │
│ • VRs: Self-contained components            │
│ • Props: Behavior handlers only             │
└─────────────────────────────────────────────┘
```

**SMAC** determines WHO can access WHAT.
**FUSE** determines HOW data flows.
**VRS** determines HOW UI renders.

---

## The Four Layers

### Layer 1: Domain-Based Routes

Clean, domain-first URLs:

```
/(domains)/
├── clients/          # /clients/*
├── finance/          # /finance/*
├── projects/         # /projects/*
├── productivity/     # /productivity/*
├── settings/         # /settings/*
├── admin/            # /admin/* (admiral only)
└── system/           # /system/* (admiral only)
```

**Benefits:**
- Clean URLs: `/clients/people`
- Domain-first organization
- RESTful structure
- Easy to navigate

### Layer 2: Static Manifests

Compile-time rank allowlists per domain:

```json
// /src/app/domain/client/manifest.json
{
  "route": "/domain/client",
  "allowedRanks": ["crew", "captain", "commodore", "admiral"],
  "domain": "client"
}

// /src/app/domain/admin/manifest.json
{
  "route": "/domain/admin",
  "allowedRanks": ["admiral"],
  "domain": "admin"
}
```

**Why manifests:**
- Compile-time validation
- Single source of truth
- Self-documenting
- Type-safe

### Layer 3: Edge Gate (Middleware)

Runtime authorization at the edge:

```typescript
export async function middleware(request: NextRequest) {
  const manifest = findManifestForPath(pathname);
  const session = await readSessionCookie();

  if (!manifest.allowedRanks.includes(session.rank)) {
    return NextResponse.redirect('/unauthorized');
  }

  return NextResponse.next();
}
```

**Edge Gate features:**
- Cookie read <1ms
- Manifest lookup O(1)
- Authorization before render
- Default deny

### Layer 4: Data Scoping

Convex queries filter by rank:

```typescript
export const listClients = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    switch (user.rank) {
      case 'crew':
        // Only assigned clients
        return ctx.db.query('clients')
          .filter(q => q.eq(q.field('assignedTo'), user._id));

      case 'captain':
      case 'commodore':
        // Org-scoped
        return ctx.db.query('clients')
          .filter(q => q.eq(q.field('orgId'), user.orgId));

      case 'admiral':
        // All clients
        return ctx.db.query('clients');
    }
  }
});
```

---

## Defense in Depth

Authorization at FOUR layers:

1. **Manifest** - Compile-time declaration
2. **Middleware** - Edge enforcement
3. **Component** - RankGate for UI
4. **Query** - Data-level scoping

**Can't bypass one layer and access data.**

---

## Data Scoping Patterns

| Rank | Clients | Finance | Projects | Settings |
|------|---------|---------|----------|----------|
| Crew | Assigned only | No access | Org-scoped | Self-only |
| Captain | Org-scoped | Org-scoped | Org-scoped | Self-only |
| Commodore | Org-scoped | Org-scoped | Org-scoped | Self-only |
| Admiral | All | All | All | Self-only |

---

## Implementation Checklist

### For New Domains

1. **Create domain folder** - `src/app/(domains)/[name]/`
2. **Create manifest.json** - Define route + allowedRanks
3. **Create Convex backend** - `convex/domains/[name]/`
4. **Implement data scoping** - Rank-based query filters
5. **Create frontend routes** - Domain page.tsx files
6. **Test authorization** - Verify each rank's access
7. **Run manifest aggregation** - `npm run build`

### For Migrations

1. Read legacy implementation
2. Create SMAC domain structure
3. Keep legacy working (strangler fig)
4. Implement feature parity
5. Gradual cutover
6. Delete legacy when proven

---

## What SMAC Is NOT

SMAC does NOT change:
- ❌ How data is fetched (still client-side useQuery)
- ❌ WARP pattern (still zero loading states)
- ❌ Golden Bridge (still Server Actions → Convex → Cookie)
- ❌ Session management (still cookie-based <1ms auth)

SMAC IS additive:
- ✅ Clean domain-based routing
- ✅ Compile-time access control
- ✅ Runtime authorization
- ✅ Data-level scoping

---

## Philosophy

### Principle 1: Domains Over Ranks
Organize by **what users do** (domains), not **who they are** (ranks).

### Principle 2: Explicit Over Implicit
Manifests make access control **visible and auditable**.

### Principle 3: Defense in Depth
Four layers of authorization, not one.

### Principle 4: Gradual Migration
Strangler fig pattern respects production.

---

## Database Alignment

SMAC extends to database naming:

```
Routes:     /(domains)/admin/users/
Backend:    /convex/domains/admin/users/
Database:   admin_users, admin_users_DeletionLogs
```

All layers use the same domain hierarchy.

---

## Performance

**Middleware overhead:**
- Cookie read: <1ms
- Manifest lookup: <1ms
- Authorization: <1ms
- **Total: ~2-3ms per request**

Negligible compared to DNS (20-50ms) or TLS (50-100ms).

---

## Summary

**SMAC** = Routing + Authorization infrastructure

- **Layer 1**: Domain-based routes (clean URLs)
- **Layer 2**: Static manifests (compile-time access)
- **Layer 3**: Edge gate (runtime enforcement)
- **Layer 4**: Data scoping (query-level security)

**SMAC doesn't replace FUSE. It completes it.**

- FUSE handles **data and state**
- SMAC handles **routing and authorization**

Together, they form the foundation of scalable SaaS architecture.
