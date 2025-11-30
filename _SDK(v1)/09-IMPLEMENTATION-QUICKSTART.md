# 🚀 IMPLEMENTATION QUICKSTART
## Build Your First FUSE Application in 30 Minutes

---

## PREREQUISITES

Before starting, you need:

```bash
# Required software
Node.js >= 18.17
npm >= 9.0 (or pnpm/yarn)
Git

# Required knowledge
- TypeScript fundamentals
- React basics (components, hooks, state)
- Next.js App Router concepts
- Basic CSS
```

**Recommended:** Understanding of Server Components vs Client Components

---

## TECH STACK

FUSE is built on battle-tested technologies:

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

**What we DON'T use:**
- ❌ Tailwind CSS (we use FUSE-STYLE)
- ❌ CSS-in-JS (we use platform CSS)
- ❌ Redux (we use Zustand)
- ❌ REST APIs (we use Convex)

---

## STEP 1: CREATE NEXT.JS PROJECT

```bash
# Create new Next.js 15 project
npx create-next-app@latest my-fuse-app

# When prompted, select:
✅ TypeScript
✅ App Router
❌ Tailwind CSS (we'll use FUSE-STYLE)
✅ src/ directory
❌ Turbopack (optional)

cd my-fuse-app
```

---

## STEP 2: INSTALL DEPENDENCIES

```bash
# Core dependencies
npm install zustand                    # State management
npm install convex                     # Real-time database
npm install @clerk/nextjs              # Authentication
npm install jose                       # JWT for session cookies

# Development dependencies
npm install -D @types/node
```

---

## STEP 3: PROJECT STRUCTURE

Create the FUSE directory structure:

```bash
mkdir -p src/fuse/store/session
mkdir -p src/fuse/store/server
mkdir -p src/fuse/style/themes
mkdir -p src/store
mkdir -p src/components
mkdir -p src/lib
```

**Your project structure:**

```
my-fuse-app/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── fuse/                # FUSE Infrastructure
│   │   ├── store/
│   │   │   ├── session/     # Session cookie management
│   │   │   └── server/      # Server-side data fetching
│   │   └── style/           # FUSE-STYLE CSS
│   │       ├── tokens.css
│   │       ├── overview.css
│   │       ├── prebuilts.css
│   │       └── themes/
│   │           └── default.css
│   │
│   ├── store/               # Application state
│   │   └── fuse.ts          # Main Zustand store
│   │
│   ├── components/          # React components
│   └── lib/                 # Utilities
│
├── convex/                  # Convex backend
├── public/                  # Static assets
└── package.json
```

---

## STEP 4: SESSION COOKIE SYSTEM

Create the session cookie infrastructure:

```typescript
// src/fuse/store/session/cookie.ts
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'dev-secret-change-in-production'
);

export const SESSION_COOKIE = 'FUSE_SESSION';

export interface SessionData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

// Create signed session cookie
export async function mintSession(data: SessionData): Promise<string> {
  return await new SignJWT(data)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET_KEY);
}

// Read and verify session cookie
export async function readSessionCookie(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as SessionData;
  } catch (error) {
    return null;
  }
}

// Set session cookie
export async function setSessionCookie(data: SessionData): Promise<void> {
  const token = await mintSession(data);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/'
  });
}

// Delete session cookie
export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
```

---

## STEP 5: SERVER FETCHING

Create server-side user fetching:

```typescript
// src/fuse/store/server/fetchUser.ts
import { readSessionCookie, type SessionData } from '@/fuse/session/cookie';

export type ServerUser = SessionData;

export async function fetchUserServer(): Promise<ServerUser | null> {
  // Read session cookie (<1ms)
  const sessionData = await readSessionCookie();

  if (!sessionData) {
    return null;
  }

  // Optional: Validate against database
  // const dbUser = await db.get(sessionData.id);
  // if (!dbUser) return null;

  return sessionData;
}
```

---

## STEP 6: ZUSTAND STORE

Create the FUSE Store Brain:

```typescript
// src/store/fuse.ts
import { create } from 'zustand';
import type { ServerUser } from '@/fuse/store/server/fetchUser';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface FuseStore {
  // User state
  user: User | null;

  // Actions
  setUser: (user: User | null) => void;
  hydrate: (serverUser: ServerUser) => void;
  logout: () => void;
}

export const useFuse = create<FuseStore>((set) => ({
  // Initial state
  user: null,

  // Set user
  setUser: (user) => set({ user }),

  // Hydrate from server data
  hydrate: (serverUser) => {
    set({
      user: {
        id: serverUser.id,
        email: serverUser.email,
        firstName: serverUser.firstName,
        lastName: serverUser.lastName
      }
    });
  },

  // Logout
  logout: () => {
    set({ user: null });
    // Call API to delete cookie
    fetch('/api/auth/logout', { method: 'POST' });
  }
}));
```

---

## STEP 7: CLIENT HYDRATOR

Create the component that hydrates the store:

```typescript
// src/fuse/store/ClientHydrator.tsx
'use client';

import { useEffect } from 'react';
import { useFuse } from '@/store/fuse';
import type { ServerUser } from './server/fetchUser';

interface ClientHydratorProps {
  userData: ServerUser | null;
  children: React.ReactNode;
}

export function ClientHydrator({
  userData,
  children
}: ClientHydratorProps) {
  const hydrate = useFuse((state) => state.hydrate);

  useEffect(() => {
    if (userData) {
      hydrate(userData);
    }
  }, [userData, hydrate]);

  return <>{children}</>;
}
```

---

## STEP 8: ROOT LAYOUT WITH FUSE

Update your root layout to use FUSE:

```typescript
// src/app/layout.tsx
import { fetchUserServer } from '@/fuse/store/server/fetchUser';
import { ClientHydrator } from '@/fuse/store/ClientHydrator';
import '@/fuse/style/tokens.css';
import '@/fuse/style/overview.css';
import '@/fuse/style/themes/default.css';
import '@/fuse/style/prebuilts.css';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user on server (<1ms cookie read)
  const userData = await fetchUserServer();

  return (
    <html lang="en">
      <body>
        <ClientHydrator userData={userData}>
          {children}
        </ClientHydrator>
      </body>
    </html>
  );
}
```

---

## STEP 9: CREATE FUSE-STYLE CSS

Create the CSS infrastructure:

```css
/* src/fuse/style/tokens.css */
:root {
  /* Spacing Scale */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Typography Scale */
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;

  /* Font Weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;
}
```

```css
/* src/fuse/style/themes/default.css */
:root {
  /* Background Colors */
  --color-bg: #FFFFFF;
  --color-surface: #F9FAFB;
  --color-border: #E5E7EB;

  /* Text Colors */
  --color-text-primary: #111827;
  --color-text-secondary: #6B7280;
  --color-text-tertiary: #9CA3AF;

  /* Brand Colors */
  --color-primary: #3B82F6;
  --color-primary-hover: #2563EB;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
}

/* Dark mode */
[data-theme-mode="dark"] {
  --color-bg: #111827;
  --color-surface: #1F2937;
  --color-border: #374151;
  --color-text-primary: #F9FAFB;
  --color-text-secondary: #D1D5DB;
  --color-text-tertiary: #9CA3AF;
}
```

```css
/* src/fuse/style/overview.css */
:root {
  /* Layout Dimensions */
  --sidebar-width: 240px;
  --topbar-height: 64px;
  --content-max-width: 1200px;

  /* Z-index Scale */
  --z-dropdown: 1000;
  --z-modal: 2000;
  --z-toast: 3000;
}
```

```css
/* src/fuse/style/prebuilts.css */
/* Base reset */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  background: var(--color-bg);
}

/* Button base */
button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
}

/* Link base */
a {
  color: inherit;
  text-decoration: none;
}
```

---

## STEP 10: CREATE YOUR FIRST PAGE

Create a simple authenticated page:

```typescript
// src/app/page.tsx
import { fetchUserServer } from '@/fuse/store/server/fetchUser';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const userData = await fetchUserServer();

  if (!userData) {
    redirect('/sign-in');
  }

  return (
    <div style={{ padding: 'var(--space-xl)' }}>
      <h1>Welcome, {userData.firstName || userData.email}!</h1>
      <p>This page loaded instantly with zero loading states.</p>
      <p>Your data was prefetched on the server.</p>
    </div>
  );
}
```

---

## STEP 11: CREATE A CLIENT COMPONENT

Create a component that uses FUSE Store:

```typescript
// src/components/UserGreeting.tsx
'use client';

import { useFuse } from '@/store/fuse';

export function UserGreeting() {
  const user = useFuse((state) => state.user);
  const logout = useFuse((state) => state.logout);

  if (!user) {
    return <div>Not logged in</div>;
  }

  return (
    <div className="ft-greeting">
      <p>Hello, {user.firstName || user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

Add it to your page:

```typescript
// src/app/page.tsx
import { fetchUserServer } from '@/fuse/store/server/fetchUser';
import { redirect } from 'next/navigation';
import { UserGreeting } from '@/components/UserGreeting';

export default async function HomePage() {
  const userData = await fetchUserServer();

  if (!userData) {
    redirect('/sign-in');
  }

  return (
    <div style={{ padding: 'var(--space-xl)' }}>
      <h1>Welcome to FUSE!</h1>
      <UserGreeting />
    </div>
  );
}
```

---

## STEP 12: ENVIRONMENT VARIABLES

Create `.env.local`:

```bash
# Session Secret (generate a secure random string)
SESSION_SECRET=your-secret-key-change-in-production

# Convex (if using)
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Clerk (if using)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

---

## STEP 13: RUN YOUR APP

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start
```

Visit `http://localhost:3000` and see your FUSE app!

---

## WHAT YOU'VE ACHIEVED

In 30 minutes, you've built a FUSE application with:

✅ **Zero loading states** - Server-side preloading
✅ **Session cookies** - <1ms authentication
✅ **Client hydration** - Seamless state transfer
✅ **FUSE Store Brain** - Zustand state management
✅ **FUSE-STYLE Brain** - CSS Variable system
✅ **Type safety** - Full TypeScript support

**Your app is production-ready and scales to 100K users.**

---

## NEXT STEPS

Now that you have a working FUSE app:

### Add Domain Slices

Expand your FUSE Store with domain-specific slices:

```typescript
// src/store/fuse.ts
interface FuseStore {
  user: User | null;

  // Add domain slices
  finances: FinancesSlice;
  clients: ClientsSlice;

  // Actions
  setUser: (user: User | null) => void;
  setFinances: (data: FinancesData) => void;
  setClients: (data: ClientsData) => void;
}
```

### Add Providers

Create domain Providers for intelligent hydration:

```typescript
// src/providers/ClientsProvider.tsx
'use client';

export function ClientsProvider({ children }: PropsWithChildren) {
  const setClients = useFuse((state) => state.setClients);

  useEffect(() => {
    async function load() {
      const data = await fetchClients();
      setClients(data);
    }
    load();
  }, []);

  return <>{children}</>;
}
```

### Add VRS Components

Build specialized component variants:

```typescript
// src/components/Button/index.ts
export const Button = {
  primary: ButtonPrimary,
  secondary: ButtonSecondary,
  danger: ButtonDanger
};

// Usage
<Button.primary>Save</Button.primary>
<Button.danger>Delete</Button.danger>
```

### Add Rank System

Implement rank-based access control:

```typescript
// src/app/(modes)/(captain)/finances/layout.tsx
export default async function FinancesLayout({ children }) {
  const userData = await fetchUserServer();

  if (userData.rank !== 'captain') {
    redirect('/unauthorized');
  }

  return <FinancesProvider>{children}</FinancesProvider>;
}
```

---

## COMMON ISSUES

### CRITICAL: Never Use Inline Styles (ISV - Inline Style Virus)

**ISV INFECTION will cause build failures in admiral folder (and should be avoided everywhere):**

```tsx
// ❌ ISV INFECTION - Build will fail
<div style={{ padding: 'var(--space-lg)' }}>
<span style={{ color: 'var(--color-success)' }}>

// ❌ ISV INFECTION - Tailwind not installed
<div className="text-[var(--color-success)] font-semibold">
```

**Always use FUSE classes or VR Prebuilts (ISV-immune code):**

```tsx
// ✅ ISV-IMMUNE - FUSE class
<div className="fuse-section-header">

// ✅ ISV-IMMUNE - VR Prebuilt
<Search.bar {...props} />

// ✅ ISV-IMMUNE - Plain data return (let VR handle styling)
render: (item) => item.active ? 'Active' : 'Inactive'
```

**Solution:** If a FUSE class doesn't exist, create it in the FUSE style system (`/fuse/style/classes.css`). Never fallback to ISV.

**ISV Quarantine Protocol:** ESLint rules and pre-commit hooks will detect and block commits with ISV in the admiral folder. The virus cannot spread to production.

See `02-FUSE-STYLE-ARCHITECTURE.md` for the complete Universal Law doctrine.

---

### Issue: Session cookie not persisting

**Solution:** Ensure `httpOnly`, `secure`, and `sameSite` are configured correctly:

```typescript
cookieStore.set(SESSION_COOKIE, token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60
});
```

### Issue: Hydration mismatch

**Solution:** Ensure server and client render the same content. Use `suppressHydrationWarning` if needed:

```tsx
<html suppressHydrationWarning>
```

### Issue: CSS variables not working

**Solution:** Ensure CSS files are imported in correct order in `layout.tsx`:

```typescript
import '@/fuse/style/tokens.css';      // First
import '@/fuse/style/overview.css';    // Second
import '@/fuse/style/themes/default.css'; // Third
import '@/fuse/style/prebuilts.css';   // Last
```

---

## TESTING YOUR FUSE APP

### Test Server Fetching

```typescript
// __tests__/fetchUser.test.ts
import { fetchUserServer } from '@/fuse/store/server/fetchUser';

describe('fetchUserServer', () => {
  it('returns null when no session cookie', async () => {
    const user = await fetchUserServer();
    expect(user).toBeNull();
  });

  it('returns user data when valid session', async () => {
    // Set up test session cookie
    const user = await fetchUserServer();
    expect(user?.email).toBe('test@example.com');
  });
});
```

### Test Zustand Store

```typescript
// __tests__/fuse.test.ts
import { useFuse } from '@/store/fuse';

describe('FUSE Store', () => {
  it('hydrates user data correctly', () => {
    const { hydrate, user } = useFuse.getState();

    hydrate({
      id: '123',
      email: 'test@example.com',
      firstName: 'Test'
    });

    expect(user?.firstName).toBe('Test');
  });

  it('clears user on logout', () => {
    const { logout, user } = useFuse.getState();

    logout();

    expect(user).toBeNull();
  });
});
```

---

## DEPLOYMENT

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# - SESSION_SECRET
# - CONVEX_DEPLOYMENT (if using)
# - CLERK_SECRET_KEY (if using)
```

### Performance Checklist

Before deploying, ensure:

- [ ] CSS files minified in production
- [ ] Session secret is secure (not 'dev-secret')
- [ ] Environment variables configured
- [ ] TypeScript builds without errors
- [ ] No console.log statements in production code
- [ ] Error boundaries implemented
- [ ] Analytics configured (optional)

---

## CONCLUSION

You now have a production-ready FUSE application with:

- **Instant page loads** through server-side preloading
- **Zero loading states** through session cookies
- **Clean architecture** through FUSE Store + FUSE-STYLE
- **Type safety** through TypeScript
- **Scalability** through KKK Protocol design

**You're ready to build the future of web applications.**

---

*Continue to [08-ADVANCED-PATTERNS.md](./08-ADVANCED-PATTERNS.md) to learn sophisticated techniques...*

🚀 **FUSE Quickstart: From zero to instant in 30 minutes.** 🚀
