# 🎯 ADVANCED PATTERNS
## Sophisticated Techniques for Production FUSE Applications

---

## OPTIMISTIC UPDATES

### The Problem: Waiting for Confirmation

Traditional apps wait for server confirmation before updating UI:

```typescript
// ❌ Traditional: User waits for server
async function updateClient(id, data) {
  setLoading(true);
  const result = await api.updateClient(id, data);
  setClient(result);
  setLoading(false);
}
```

**User waits 200-500ms to see their change.**

### The Solution: Optimistic UI

Update immediately, sync in background:

```typescript
// ✅ FUSE: Instant feedback
function useOptimisticUpdate() {
  const updateClient = useFuse((state) => state.updateClient);

  return async (id: string, data: Partial<Client>) => {
    // 1. Update UI immediately
    updateClient(id, data);

    try {
      // 2. Sync to server in background
      await api.updateClient(id, data);
    } catch (error) {
      // 3. Rollback on error
      updateClient(id, originalData);
      showError('Update failed');
    }
  };
}
```

### Pattern: Optimistic with Rollback

```typescript
// Store implementation
interface FuseStore {
  clients: Client[];
  updateClient: (id: string, update: Partial<Client>) => void;
  optimisticUpdate: (
    id: string,
    update: Partial<Client>,
    apiCall: () => Promise<Client>
  ) => Promise<void>;
}

// Implementation
export const useFuse = create<FuseStore>((set, get) => ({
  clients: [],

  updateClient: (id, update) => {
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === id ? { ...c, ...update } : c
      )
    }));
  },

  optimisticUpdate: async (id, update, apiCall) => {
    // Store original for rollback
    const original = get().clients.find((c) => c.id === id);

    // Apply optimistic update
    get().updateClient(id, update);

    try {
      // Sync to server
      const result = await apiCall();

      // Update with server response (in case of drift)
      get().updateClient(id, result);
    } catch (error) {
      // Rollback to original
      if (original) {
        get().updateClient(id, original);
      }
      throw error;
    }
  }
}));

// Usage
function ClientForm() {
  const optimisticUpdate = useFuse((state) => state.optimisticUpdate);

  const handleSave = async (data: Partial<Client>) => {
    await optimisticUpdate(
      clientId,
      data,
      () => api.updateClient(clientId, data)
    );
  };

  return <Form onSubmit={handleSave} />;
}
```

---

## ERROR HANDLING PATTERNS

### Pattern 1: Global Error Boundary

```typescript
// src/components/ErrorBoundary.tsx
'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log to error reporting service
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Pattern 2: Store-Level Error State

```typescript
// Store with error handling
interface FuseStore {
  error: Error | null;
  setError: (error: Error | null) => void;
  clearError: () => void;

  // Wrap actions with error handling
  safeAction: <T>(action: () => Promise<T>) => Promise<T | null>;
}

export const useFuse = create<FuseStore>((set, get) => ({
  error: null,

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  safeAction: async <T,>(action: () => Promise<T>): Promise<T | null> => {
    get().clearError();

    try {
      const result = await action();
      return result;
    } catch (error) {
      get().setError(error as Error);
      return null;
    }
  }
}));

// Usage
function Component() {
  const safeAction = useFuse((state) => state.safeAction);
  const error = useFuse((state) => state.error);

  const handleAction = async () => {
    const result = await safeAction(() => api.doSomething());

    if (result) {
      // Success
    }
  };

  return (
    <>
      {error && <ErrorMessage error={error} />}
      <button onClick={handleAction}>Do Something</button>
    </>
  );
}
```

---

## REAL-TIME SYNCHRONIZATION

### Pattern: Convex Real-Time Sync

```typescript
// Real-time Provider with Convex
'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function ClientsProvider({ children }: PropsWithChildren) {
  const setClients = useFuse((state) => state.setClients);
  const updateClient = useFuse((state) => state.updateClient);

  // Real-time query - automatically updates
  const clients = useQuery(api.clients.list);

  // Sync to FUSE Store when Convex data changes
  useEffect(() => {
    if (clients) {
      setClients(clients);
    }
  }, [clients, setClients]);

  return <>{children}</>;
}
```

### Pattern: Optimistic + Real-Time

Combine optimistic updates with real-time sync:

```typescript
export function useOptimisticClient() {
  const updateClientMutation = useMutation(api.clients.update);
  const updateClient = useFuse((state) => state.updateClient);

  return async (id: string, update: Partial<Client>) => {
    // 1. Optimistic update
    updateClient(id, update);

    try {
      // 2. Sync to Convex
      await updateClientMutation({ id, ...update });

      // 3. Convex real-time query will update automatically
      // No need to manually sync response
    } catch (error) {
      // 4. Rollback on error
      // Real-time query will restore original value
      showError('Update failed');
    }
  };
}
```

---

## PERFORMANCE OPTIMIZATION

### Pattern 1: Selective Re-renders

```typescript
// ❌ Bad: Re-renders on any store change
function Component() {
  const store = useFuse();  // Subscribes to everything!
  return <div>{store.user.name}</div>;
}

// ✅ Good: Re-renders only when user.name changes
function Component() {
  const userName = useFuse((state) => state.user?.name);
  return <div>{userName}</div>;
}

// ✅ Better: Use shallow equality for objects
import { shallow } from 'zustand/shallow';

function Component() {
  const { name, email } = useFuse(
    (state) => ({ name: state.user?.name, email: state.user?.email }),
    shallow  // Only re-render if name or email change
  );

  return <div>{name} ({email})</div>;
}
```

### Pattern 2: Computed Values with useMemo

```typescript
// Bridge with memoized computations
export function useClientsBridge() {
  const clients = useFuse((state) => state.clients.people);
  const sessions = useFuse((state) => state.clients.sessions);

  // Expensive computation - only recalculate when dependencies change
  const clientsWithSessionCount = useMemo(() => {
    return clients.map((client) => ({
      ...client,
      sessionCount: sessions.filter((s) => s.clientId === client.id).length
    }));
  }, [clients, sessions]);

  return {
    clients: clientsWithSessionCount
  };
}
```

### Pattern 3: Virtual Scrolling for Large Lists

```typescript
// For Admiral control surfaces with thousands of rows
import { useVirtualizer } from '@tanstack/react-virtual';

export function LargeUserTable({ users }: { users: User[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Row height
    overscan: 10  // Render extra rows for smooth scrolling
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const user = users[virtualRow.index];

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <UserRow user={user} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## SESSION MANAGEMENT

### Pattern: Session Refresh

```typescript
// Automatically refresh session before expiration
export function useSessionRefresh() {
  useEffect(() => {
    // Refresh every 7 days (before 30-day expiration)
    const interval = setInterval(() => {
      fetch('/api/auth/refresh', { method: 'POST' });
    }, 7 * 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}

// API Route
// src/app/api/auth/refresh/route.ts
export async function POST(request: Request) {
  const userData = await fetchUserServer();

  if (!userData) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Mint fresh cookie
  await setSessionCookie(userData);

  return Response.json({ success: true });
}
```

### Pattern: Session Validation

```typescript
// Validate session on critical operations
export async function validateSession(): Promise<boolean> {
  const response = await fetch('/api/auth/validate');
  return response.ok;
}

// Use in critical operations
async function deleteAccount() {
  // Validate session before destructive action
  const isValid = await validateSession();

  if (!isValid) {
    redirect('/sign-in');
    return;
  }

  await api.deleteAccount();
}
```

---

## THEME SWITCHING

### Pattern: Instant Theme Toggle

```typescript
// Theme toggle with zero FOUC
export function useThemeToggle() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  const toggleTheme = useCallback(async () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';

    // 1. Update DOM immediately (instant visual change)
    document.documentElement.setAttribute('data-theme-mode', newMode);

    // 2. Update local state
    setThemeMode(newMode);

    // 3. Persist to server (background)
    await fetch('/api/settings/theme', {
      method: 'POST',
      body: JSON.stringify({ themeMode: newMode })
    });

    // 4. Cookie updated, next page load will have correct theme
  }, [themeMode]);

  return { themeMode, toggleTheme };
}
```

---

## NAVIGATION STATE

### Pattern: Persistent Navigation State

```typescript
// Save navigation state to localStorage
export function useNavigationPersistence() {
  const sidebarCollapsed = useFuse((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useFuse((state) => state.setSidebarCollapsed);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setSidebarCollapsed(saved === 'true');
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);
}
```

---

## DATA PREFETCHING

### Pattern: Prefetch on Hover

```typescript
// Prefetch data when user hovers over link
export function usePrefetchOnHover() {
  const prefetchFinances = useCallback(() => {
    // Prefetch finances data
    fetch('/api/finances').then((res) => res.json());
  }, []);

  return prefetchFinances;
}

// Usage
function Navigation() {
  const prefetchFinances = usePrefetchOnHover();

  return (
    <a
      href="/finances"
      onMouseEnter={prefetchFinances}
    >
      Finances
    </a>
  );
}
```

### Pattern: Predictive Prefetching

```typescript
// Prefetch based on user patterns
export function usePredictivePrefetch() {
  const currentRoute = usePathname();

  useEffect(() => {
    // If user is on /clients, they often go to /clients/sessions next
    if (currentRoute === '/clients') {
      setTimeout(() => {
        fetch('/api/clients/sessions');
      }, 2000);  // Prefetch after 2s
    }

    // If user is on /finances/invoices, they often go to /finances/customers
    if (currentRoute === '/finances/invoices') {
      setTimeout(() => {
        fetch('/api/finances/customers');
      }, 2000);
    }
  }, [currentRoute]);
}
```

---

## FORM HANDLING

### Pattern: Auto-Save Draft

```typescript
// Auto-save form to localStorage
export function useAutoSave(key: string, data: any) {
  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(data));
    }, 1000);  // Debounce 1 second

    return () => clearTimeout(handler);
  }, [key, data]);
}

// Usage
function InvoiceForm() {
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);

  // Auto-save to localStorage
  useAutoSave('invoice-draft', invoice);

  // Restore on mount
  useEffect(() => {
    const saved = localStorage.getItem('invoice-draft');
    if (saved) {
      setInvoice(JSON.parse(saved));
    }
  }, []);

  return <Form value={invoice} onChange={setInvoice} />;
}
```

---

## MIDDLEWARE PATTERNS

### Pattern: Authentication Middleware

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('FUSE_SESSION');

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  // Public routes - redirect if already authenticated
  if (request.nextUrl.pathname === '/sign-in') {
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up']
};
```

---

## LOADING STATES (For Non-FUSE Scenarios)

### Pattern: Skeleton Screens

When loading states are unavoidable (e.g., Admiral control surfaces):

```typescript
// Skeleton component
export function Skeleton({
  width = '100%',
  height = '20px',
  className = ''
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height }}
    />
  );
}

// CSS
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface) 25%,
    var(--color-border) 50%,
    var(--color-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// Usage
function UserTable() {
  const users = useFuse((state) => state.users);

  if (!users) {
    return (
      <div>
        <Skeleton height="40px" />
        <Skeleton height="40px" />
        <Skeleton height="40px" />
      </div>
    );
  }

  return <Table data={users} />;
}
```

---

## ANALYTICS INTEGRATION

### Pattern: Track User Actions

```typescript
// Analytics wrapper
export function useAnalytics() {
  const track = useCallback((event: string, properties?: object) => {
    // Send to analytics service
    if (typeof window !== 'undefined') {
      // Example: Posthog, Mixpanel, etc.
      window.analytics?.track(event, properties);
    }
  }, []);

  return { track };
}

// Usage
function InvoiceList() {
  const { track } = useAnalytics();

  const handleCreateInvoice = () => {
    track('Invoice Created', {
      source: 'invoice-list'
    });

    createInvoice();
  };

  return <button onClick={handleCreateInvoice}>Create Invoice</button>;
}
```

---

## SECURITY PATTERNS

### Pattern: CSRF Protection

```typescript
// Generate CSRF token
export function useCSRFToken() {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    fetch('/api/auth/csrf').then((res) => res.json()).then(setToken);
  }, []);

  return token;
}

// Include in POST requests
function Component() {
  const csrfToken = useCSRFToken();

  const handleSubmit = async (data: any) => {
    await fetch('/api/action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify(data)
    });
  };

  return <Form onSubmit={handleSubmit} />;
}
```

---

## CONCLUSION

These advanced patterns enable you to build sophisticated, production-ready FUSE applications:

- **Optimistic updates** for instant feedback
- **Error handling** for graceful failures
- **Real-time sync** for collaborative features
- **Performance optimization** for scale
- **Session management** for security
- **Prefetching** for speed
- **Auto-save** for data safety

**Every pattern is battle-tested in Transfoorm at KKK Protocol scale.**

---

*Continue to [09-DEPLOYMENT-SCALING.md](./09-DEPLOYMENT-SCALING.md) to learn production deployment...*

🎯 **Advanced Patterns: Because production apps need production techniques.** 🎯
