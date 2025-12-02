# 🔐 FUSE-AUTH
## Authentication Architecture + FUSE Consumer Doctrine

**Version**: 2.0.0
**Last Updated**: 2025-11-01
**Author**: Ken Roberts
**Purpose**: Complete authentication architecture including Clerk integration, FUSE patterns, and domain CSS doctrine

---

## 🎯 WHAT IS THE PROVIDER ECOSYSTEM?

The Provider Ecosystem is a **Next.js App Router pattern** that wraps server and client components with authentication, state management, and data preloading to achieve **FUSE-fast, zero-loading-state** experiences.

---

## 🏗 ARCHITECTURE OVERVIEW

```
app/
├── (auth)/                    # Public routes - NO authentication
│   ├── sign-in/[[...sign-in]]  # Clerk sign-in catch-all
│   └── sign-up/[[...sign-up]]  # Clerk sign-up catch-all
│
├── domains/                   # Protected routes - Sovereign Router
│   ├── Router.tsx             # Sovereign Router switch
│   ├── admin/                 # Admin domain views
│   ├── clients/               # Clients domain views
│   ├── finance/               # Finance domain views
│   ├── productivity/          # Productivity domain views
│   ├── projects/              # Projects domain views
│   ├── settings/              # Settings domain views
│   └── system/                # System domain views
│
├── FuseApp.tsx                # 🔐 Sovereign Runtime (mounts once, never unmounts)
│   └── FUSE Store             # All domain data from cookie + WARP
│
└── api/
    ├── webhooks/
    │   └── clerk/
    │       └── route.ts       # Clerk webhook endpoint
    └── session/
        └── refresh/
            └── route.ts       # Session refresh endpoint
```

---

## 🔐 AUTHENTICATION PROVIDER STACK

### Layer 1: ClerkProvider (Authentication)

**File**: `app/FuseApp.tsx` (Sovereign Router)

```typescript
import { ClerkProvider } from '@clerk/nextjs';

export default function ProtectedLayout({ children }) {
  return (
    <ClerkProvider>
      {/* Layer 2: FUSE Provider */}
      <FuseProvider>
        {children}
      </FuseProvider>
    </ClerkProvider>
  );
}
```

**What it does:**
- Provides `useUser()`, `useAuth()`, `useClerk()` hooks
- Handles authentication state globally
- Protects all routes (Clerk relegated to auth only via Golden Bridge)

---

### Layer 2: FuseProvider (State Management)

**File**: `components/providers/FuseProvider.tsx`

```typescript
'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useFuse } from '@/store/fuse';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function FuseProvider({ children }) {
  const { user: clerkUser } = useUser();
  const setUser = useFuse(s => s.setUser);

  // Query Convex for user data
  const convexUser = useQuery(
    api.domains.users.api.getCurrentUser,
    clerkUser ? { clerkId: clerkUser.id } : 'skip'
  );

  // Hydrate FUSE store when data loads
  useEffect(() => {
    if (convexUser) {
      setUser(convexUser);
    }
  }, [convexUser, setUser]);

  // Don't render until user is loaded
  if (!convexUser) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
```

**What it does:**
- Fetches user data from Convex
- Hydrates FUSE store with user data
- Ensures data is ready before rendering children
- **Eliminates all loading states in child components**

---

## 📊 DATA FLOW

```
User navigates to protected route
         ↓
ClerkProvider checks authentication
         ↓
FuseProvider fetches user from Convex
         ↓
FUSE store is hydrated with user data
         ↓
Page component renders (data already available)
         ↓
✅ NO LOADING STATES!
```

---

## 🎨 COMPONENT PATTERNS

### Server Component (Default)

```typescript
// app/domains/Dashboard.tsx (Sovereign Router - client component)
export default async function DashboardPage() {
  // Can access server-side data directly
  const data = await fetchServerData();

  return <div>{data}</div>;
}
```

**When to use:**
- No client-side interactivity needed
- SEO-critical content
- Static data display

---

### Client Component (With Clerk)

```typescript
'use client';

import { useUser } from '@clerk/nextjs';
import { useFuse } from '@/store/fuse';

export default function AccountPage() {
  const { user: clerkUser } = useUser(); // Clerk user object
  const displayUser = useFuse(s => s.user); // Convex user data

  return (
    <div>
      <h1>{displayUser.firstName} {displayUser.lastName}</h1>
      <p>{clerkUser.primaryEmailAddress?.emailAddress}</p>
    </div>
  );
}
```

**When to use:**
- Need Clerk hooks (`useUser`, `useAuth`, etc.)
- Client-side interactivity
- Forms, modals, interactive UI

---

## 🔄 CLERK WEBHOOK INTEGRATION

### Purpose
Keep Convex database in sync with Clerk user updates (email changes, profile updates, etc.)

### Architecture

```
Clerk (source of truth)
         ↓
user.updated event
         ↓
POST /api/webhooks/clerk
         ↓
Verify signature
         ↓
Extract user data
         ↓
Call Convex mutation
         ↓
Update Convex database
         ↓
✅ Database synced!
```

### Implementation

**File**: `app/api/webhooks/clerk/route.ts`

```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  // Verify webhook signature
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: no svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error', { status: 400 });
  }

  // Handle user.updated event
  if (evt.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    // Extract primary email
    const primaryEmail = email_addresses?.find(
      (email) => email.id === evt.data.primary_email_address_id
    );

    // Extract secondary email (verified only)
    const secondaryEmail = email_addresses?.find((email) =>
      email.id !== evt.data.primary_email_address_id &&
      email.verification?.status === 'verified'
    );

    console.log(`[CLERK WEBHOOK] Syncing user ${id}`);

    try {
      // Sync to Convex
      await convex.mutation(api.domains.users.api.syncUserFromClerk, {
        clerkId: id,
        email: primaryEmail?.email_address,
        secondaryEmail: secondaryEmail?.email_address || undefined,
        firstName: first_name || undefined,
        lastName: last_name || undefined,
        avatarUrl: image_url || undefined,
      });

      console.log(`[CLERK WEBHOOK] Successfully synced user ${id}`);
    } catch (error) {
      console.error(`[CLERK WEBHOOK] Error syncing:`, error);
      return new Response('Error syncing to Convex', { status: 500 });
    }
  }

  return new Response('', { status: 200 });
}
```

### Convex Mutation

**File**: `convex/domains/users/api.ts`

```typescript
export const syncUserFromClerk = mutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    secondaryEmail: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await UsersModel.getUserByClerkId(ctx.db, args.clerkId);

    if (!user) {
      throw new Error("User not found");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.email !== undefined) updates.email = args.email;
    if (args.secondaryEmail !== undefined) updates.secondaryEmail = args.secondaryEmail;
    if (args.firstName !== undefined) updates.firstName = args.firstName;
    if (args.lastName !== undefined) updates.lastName = args.lastName;
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;

    await ctx.db.patch(user._id, updates);

    console.log(`[SYNC] Updated user ${args.clerkId}`);

    return { success: true };
  },
});
```

---

## 🔧 SETUP CHECKLIST

### 1. Environment Variables

```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CONVEX_URL=https://...
```

### 2. Clerk Dashboard Configuration

1. Go to https://dashboard.clerk.com
2. Navigate to **Webhooks**
3. Click **Add Endpoint**
4. Enter URL: `https://yourdomain.com/api/webhooks/clerk`
5. Subscribe to: `user.updated`
6. Copy **Signing Secret** → Add to `.env.local` as `CLERK_WEBHOOK_SECRET`

### 3. Convex Schema

```typescript
// convex/schema.ts
users: defineTable({
  clerkId: v.string(),
  email: v.string(), // Primary email
  secondaryEmail: v.optional(v.string()), // Secondary email
  firstName: v.string(),
  lastName: v.string(),
  avatarUrl: v.optional(v.union(v.string(), v.id("_storage"))),
  // ... other fields
}).index("by_clerk_id", ["clerkId"]);
```

---

## 🎯 FUSE PRINCIPLES APPLIED

1. **No Loading States**: FuseProvider ensures data is loaded before rendering
2. **Single Source of Truth**: Clerk = auth, Convex = data
3. **Automatic Sync**: Webhooks keep Convex in sync with Clerk
4. **Optimistic Updates**: UI updates immediately, database follows
5. **Zero Spinners**: Users never wait for data

---

## 🎨 THE FUSE CONSUMER DOCTRINE

### Domain CSS as FUSE-STYLE Consumers

The `auth.css` file demonstrates the **FUSE Consumer Doctrine** - a critical architectural pattern where domain-specific CSS files consume platform-level tokens from the FUSE-STYLE Brain.

### The Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: FUSE-STYLE BRAIN (Platform Infrastructure)       │
│  /fuse/style/                                               │
│  ├── tokens.css      → --radius-xl, --font-size-base       │
│  └── themes/                                                │
│      ├── brandkit.css    → --brand-gradient-start/end      │
│      └── transtheme.css  → --text-primary, --text-secondary│
│                         (Theme switching happens here)       │
└─────────────────────────────────────────────────────────────┘
                            ↓ Consumed via var(--)
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: DOMAIN CSS (Semantic Layer)                      │
│  /src/app/(auth)/auth.css                                   │
│  ├── Consumes: 19 CSS Custom Properties from FUSE          │
│  ├── Creates: 40 semantic .auth-* classes                  │
│  └── Purpose: Domain-specific composition layer            │
└─────────────────────────────────────────────────────────────┘
                            ↓ Composed in JSX
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: COMPONENTS (Presentation)                        │
│  sign-in.tsx, sign-up.tsx, reset.tsx                       │
│  └── className="auth-input-wrapper auth-input-with-icon"   │
└─────────────────────────────────────────────────────────────┘
```

### Why This Matters

**auth.css is NOT standalone** - it's a **FUSE-STYLE consumer** that:

1. **Consumes Platform Tokens**: Uses `var(--radius-xl)`, `var(--text-primary)`, etc.
2. **Creates Domain Semantics**: Defines `.auth-input`, `.auth-card`, etc.
3. **Enables Theme Switching**: Inherits theme changes automatically
4. **Maintains Single Source of Truth**: Colors/spacing defined once in FUSE
5. **Co-locates with Domain**: Lives in (auth) folder with its pages

### Example: FUSE Token Consumption

```css
/* auth.css - FUSE Consumer */
.auth-input {
  border-radius: var(--radius-xl);      /* ← From /fuse/style/tokens.css */
  color: var(--text-primary);           /* ← From /fuse/style/themes/transtheme.css */
  font-size: var(--font-size-base);     /* ← From /fuse/style/tokens.css */
  transition: all 0.2s ease;
}

.auth-input:focus {
  box-shadow: 0 0 0 2px rgba(219, 62, 5, 0.2);
}

.auth-progress-fill {
  background: linear-gradient(
    to right,
    var(--brand-gradient-start),        /* ← From /fuse/style/themes/brandkit.css */
    var(--brand-gradient-end)           /* ← From /fuse/style/themes/brandkit.css */
  );
}
```

### The Universal Law: NO INLINE STYLES

**ISV (Inline Style Virus) is architectural poison.** Every styling decision must flow through one of these layers:

```tsx
// ❌ ISV INFECTION - Bypasses FUSE-STYLE Brain
<div style={{ padding: '4rem 0', textAlign: 'center' }}>

// ✅ FUSE CONSUMER - Uses domain class that consumes FUSE tokens
<div className="auth-centered-content">
```

**Why?**
- Inline styles bypass the FUSE-STYLE Brain
- Theme switching breaks (no access to theme variables)
- Single source of truth violated
- Performance degrades (style recalculation on every render)
- Maintainability destroyed (impossible to track styling decisions)

### Domain Pattern in Transfoorm

Every domain follows this pattern:

- **(auth) domain** → `auth.css` → 40 `.auth-*` classes
- **domains/** → Various CSS files → `.domains-*` classes (Sovereign Router)
- **Component domains** → VR component CSS → Component-specific classes

**All consume FUSE-STYLE Brain tokens. None are standalone.**

### Benefits of FUSE Consumer Pattern

1. **Theme Switching Works**: Domain CSS inherits theme variables automatically
2. **Single Source of Truth**: Change platform token → all domains update
3. **Domain Isolation**: `auth-` prefix prevents class name collisions
4. **Co-location**: Domain CSS lives with domain pages
5. **Maintainability**: Find domain styles in domain folder
6. **Performance**: CSS Custom Properties are browser-native, C++ fast

### Verification

Check FUSE token consumption:
```bash
grep -c "var(--" /src/app/(auth)/auth.css
# Result: 19 FUSE tokens consumed
```

Check domain class count:
```bash
grep -c "auth-" /src/app/(auth)/auth.css
# Result: 58 class definitions/references
```

---

## 🚨 COMMON PITFALLS

### ❌ DON'T: Use client components for everything
```typescript
'use client'; // ❌ Adds unnecessary client-side JS

export default function Page() {
  return <div>Static content</div>;
}
```

### ✅ DO: Use server components by default
```typescript
// ✅ Server component (default)
export default function Page() {
  return <div>Static content</div>;
}
```

---

### ❌ DON'T: Fetch data in components
```typescript
'use client';

export default function Page() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data').then(setData); // ❌ Loading state!
  }, []);

  if (!data) return <Spinner />; // ❌ User waits!
}
```

### ✅ DO: Use FUSE store (data already loaded)
```typescript
'use client';

export default function Page() {
  const data = useFuse(s => s.data); // ✅ Already loaded!

  return <div>{data}</div>; // ✅ Instant render!
}
```

---

## 📚 RELATED DOCUMENTATION

- [Clerk Secondary Email Flow](/docs/dev/ACCOUNT_EMAIL_FLOW.md)
- [Clerk Webhook Setup](/docs/dev/CLERK_WEBHOOK_SETUP.md)
- [FUSE Store Architecture](/docs/FUSE-STORE-ARCHITECTURE.md)

---

## ✅ SUCCESS CRITERIA

- [ ] ClerkProvider wraps protected routes
- [ ] FuseProvider hydrates store before rendering
- [ ] Webhook endpoint responds to `user.updated` events
- [ ] Convex database stays in sync with Clerk
- [ ] No loading states in components
- [ ] Users can change email and it syncs automatically

---

**Status**: ✅ Production-Ready
**Last Tested**: 2025-01-15
**Maintainer**: Ken Roberts

---

*"The best loading state is no loading state."* - FUSE Philosophy
