# ADP Pattern

> Anticipated Delivery Pattern: WARP + PRISM

**The pattern that surprises users with instant delivery by anticipating their needs before they act.**

---

## What is ADP?

**ADP (Anticipated Delivery Pattern)** consists of two integral functions:

### WARP (Backend - The Engine)
**W**orkflow **A**nticipatory **R**esources **P**reload

The backend mechanism that:
- Preloads resources during idle time
- Serves WARP API endpoints
- Runs server-side Convex queries
- Manages background orchestration
- Handles TTL revalidation

### PRISM (Frontend - The Experience)
**P**redictive **R**eactions and **I**ntelligent **S**tore **M**anagement

The frontend experience that:
- Detects user intent (sidebar interactions)
- Manages FUSE store coordination
- Provides Golden Bridge Hooks
- Delivers optimistic UI
- Syncs real-time updates

---

## The Relationship

```
ADP (Anticipated Delivery Pattern)
    ├── WARP (Backend)
    │   └── Preloads resources anticipating workflow
    │       - API routes (/api/warp/*)
    │       - Orchestrator (requestIdleCallback)
    │       - Server-side fetching (Convex)
    │       - Background intelligence
    │
    └── PRISM (Frontend)
        └── Matches user reactions with pre-fed resources
            - Predictive triggers (sidebar)
            - Golden Bridge Hooks
            - Optimistic UI
            - FUSE store coordination
            ↓
        Surprises users with instant delivery (32-65ms)
```

**WARP (Backend)** anticipates. **PRISM (Frontend)** delivers. **Together:** ADP.

---

## The Four Pillars

### Pillar 1: WARP (Speed God)
- **Mechanism**: Background preload during idle time + predictive triggers
- **Result**: 32-65ms page loads (vs 1000-4000ms traditional SSR)

### Pillar 2: Convex Live Query (Truth God)
- **Mechanism**: WebSocket subscription to Convex database
- **Result**: Instant updates across all tabs when data changes

### Pillar 3: Auto-Sync (Harmony God)
- **Mechanism**: Convex updates automatically sync to FUSE store
- **Result**: Components read from one source (FUSE), stay fresh forever

### Pillar 4: Predictive Triggers (Prescience God)
- **Mechanism**: Sidebar interactions trigger WARP preloading
- **Result**: Data ready by the time user decides which page to visit

**Innovation:** Dropdown open/hover = intent signal → WARP preload → instant navigation

---

## The Data Flow

### Phase 1: Login / Initial Load (0-100ms)
```
User signs in → Clerk authenticates
Session cookie minted (FUSE)
Redirect to Dashboard
ClientHydrator reads cookie → Detects rank
ClientHydrator triggers WARP orchestrator
```

### Phase 2: WARP Background Preload (1300-1700ms, non-blocking)
```
Orchestrator checks freshness
Runs in requestIdleCallback
Fetches /api/warp/{domain}
Hydrates FUSE store
```

### Phase 3: Predictive Triggers (500-1500ms, while user decides)
```
User hovers sidebar → Intent detected (200ms delay)
WARP preload triggered for that domain
User opens dropdown → Data loading while reading
Data ready before user clicks
```

### Phase 4: User Navigates (32-65ms)
```
User clicks page
Data already in FUSE store
Table renders instantly
No loading spinner
```

### Phase 5: Real-Time Updates (<100ms)
```
Convex WebSocket opens
Live query syncs to FUSE
Other tabs update automatically
```

### Phase 6: Optimistic Updates (0ms perceived)
```
User makes change
FUSE updated immediately (source: 'MUTATION')
Background operation runs
Replace temp with real on success
Rollback on error
```

---

## Golden Bridge Hook Structure

```typescript
function useClientsData() {
  return {
    // DATA: Raw domain data (from FUSE)
    data: {
      people: clients.people,
      pipeline: clients.pipeline,
      sessions: clients.sessions,
    },

    // COMPUTED: Calculated values
    computed: {
      peopleCount: clients.people.length,
      activeDealValue: /* calculated */,
    },

    // ACTIONS: Mutations with optimistic updates
    actions: {
      createPersonOptimistic: (person) => { /* ... */ },
      deletePersonOptimistic: (id) => { /* ... */ },
    },

    // FLAGS: Hydration state
    flags: {
      isHydrated,
      isLoading: false, // Always false with ADP!
    },
  };
}
```

---

## Key Principles

### 1. No SSR Fetch in Layouts
```typescript
// ❌ DON'T
export default async function Layout() {
  const data = await fetchData(); // Blocks navigation!
  return <Provider initialData={data}>{children}</Provider>;
}

// ✅ DO
export default async function Layout() {
  // No fetch - WARP handles it!
  return <Provider>{children}</Provider>;
}
```

### 2. Always Check Freshness
```typescript
const fresh =
  state.status === 'ready' &&
  state.lastFetchedAt &&
  Date.now() - state.lastFetchedAt < FIVE_MIN;

if (fresh) return; // Skip duplicate fetch
```

### 3. Use requestIdleCallback
```typescript
if ('requestIdleCallback' in window) {
  requestIdleCallback(run, { timeout: 2000 });
} else {
  setTimeout(run, 0);
}
```

### 4. Track Data Source
```typescript
hydrateClients(data, 'WARP');        // Background preload
hydrateClients(data, 'CONVEX_LIVE'); // Real-time update
hydrateClients(data, 'MUTATION');    // Optimistic update
hydrateClients(data, 'ROLLBACK');    // Error recovery
```

### 5. Never Show Loading Spinners
```typescript
// ❌ DON'T
if (isLoading) return <Spinner />;

// ✅ DO
if (!flags.isHydrated) return null; // Rare with ADP
return <Content data={data} />;
```

---

## Performance Benchmarks

### Before ADP (Traditional SSR)
```
First navigation:  600-800ms
Second navigation: 1000-4000ms (SSR fetch AGAIN!)
User interaction:  200-500ms
```

### After ADP
```
Login:             100ms (cookie read)
WARP preload:      1300-1700ms (background)
Sidebar hover:     500-1000ms (predictive, while deciding)
Navigation:        32-65ms (from FUSE store)
Real-time update:  <100ms (WebSocket)
Optimistic UI:     0ms perceived
```

**Faster than desktop file browsing!**

---

## Scaling

| Scale | WARP Fetch | Live Query | Status |
|-------|------------|------------|--------|
| 100 users | ~200ms | Instant | Perfect |
| 1K users | ~500ms | Instant | Excellent |
| 10K users | ~1500ms | Pagination | Good with optimization |
| 100K users | Paginated | Cursor-based | Scalable |

**Note**: Only Admiral sees 100K users. Other ranks see 100-1K per domain.

---

## Replication Checklist

For each new domain:

1. **Define slice type** with coordination fields (`status`, `lastFetchedAt`, `source`)
2. **Add to FUSE store** with hydration function
3. **Create WARP API route** (`/api/warp/{domain}`)
4. **Add to sidebar** with predictive triggers (hover/open)
5. **Create Golden Bridge Hook** with auto-sync
6. **Create provider** (optional SSR hydration)
7. **Update layout** (NO fetch - WARP handles it)
8. **Use in components** via hook

---

## Summary

**ADP** = **WARP** (Backend) + **PRISM** (Frontend)

- **Backend anticipates** during idle time
- **Frontend predicts** from user intent
- **Users are surprised** with instant delivery

**Performance**: 32-65ms navigation
**Real-time**: <100ms updates
**Optimistic**: 0ms perceived
**TTT Compliance**: Passes all 7 tests
