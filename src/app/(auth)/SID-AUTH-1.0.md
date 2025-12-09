# 🛡️ SID-AUTH 1.0 — **SOVEREIGN IDENTITY AUTHENTICATION MODEL**

### *The Official Successor to FUSE-AUTH.md*

> **Purpose:**  
> This document defines the ONLY legal authentication + identity flow in Transfoorm after the SID refactor.  
> Clerk performs authentication.  
> Convex is the sovereign identity source.  
> FUSE distributes identity to the runtime.  
> Nothing else is permitted.
(REF: 🛡️ S.I.D. — SOVEREIGN IDENTITY DOCTRINE)

---

# 🔥 0. PRINCIPLES OF SOVEREIGN IDENTITY  
These rules are absolute and non-negotiable.

### **0.1 Identity originates in Convex**  
Clerk provides *authentication*, but Convex issues the *canonical* identity (`_id`).

### **0.2 Identity is handed off exactly once**  
Only during login/signup inside `(auth)`.

### **0.3 After handoff, Clerk identity is reference-only**  
Used exclusively for Clerk API operations (email/password).

### **0.4 All business logic MUST use Convex `_id`**  
Never `clerkId`.

### **0.5 FUSE cookie is the real-time identity carrier**  
All UI, stores, and features hydrate from the sovereign cookie.

---

# 🧱 1. IDENTITY BIRTHPOINT (SID PHASE 0)
Executed **ONCE** immediately after Clerk authenticates the user.

### File:
```
src/app/(auth)/actions/identity-handoff.ts
```

### The ritual:
1. `auth()` is called **here only**.  
2. Clerk identity → Convex `ensureUser()`  
3. Convex returns canonical `_id`  
4. FUSE mints sovereign session cookie  
5. Clerk ID is stored as *reference only*  
6. Caller receives **Convex `_id` only**

No other part of the application may call `auth()` or derive identity from Clerk.

---

# 🍪 2. FUSE SESSION COOKIE SPECIFICATION
After handoff, the cookie is the authoritative identity payload.

### Required fields:
| Field | Meaning |
|-------|---------|
| `_id` | Sovereign Convex user ID (primary identity) |
| `clerkId` | Reference-only identity for Clerk API calls |
| Profile | User UI context: name, email, avatar, theme, etc. |
| Rank | captain / admiral / commodore |
| Setup state | pending / complete |
| Product state | dashboard widgets, preferences |

### Rules:
- `_id` MUST always exist  
- It MUST NOT be empty or undefined  
- No business logic may read Clerk identity from anywhere else  

---

# 🧬 3. SERVER ACTION CONTRACT (SID PHASE 1)
**Server Actions must NEVER call `auth()` or `clerkClient()`**  
(except inside `(auth)` folder during initial handoff)

### All Server Actions MUST:
1. Call `readSessionCookie()`  
2. Extract `_id`  
3. Pass `_id` to Convex (`userId`)  
4. Never pass or accept `clerkId`

### Illegal patterns (must never appear):
```
await auth()
await clerkClient()
convex.mutation(api..., { clerkId })
```

### Legal:
```
const session = await readSessionCookie();
convex.mutation(api..., { userId: session._id });
```

---

# 🧭 4. CONVEX MUTATION CONTRACT (SID PHASE 2)
ALL Convex mutations and queries must follow:

### Required:
```
userId: v.id("admin_users")
```

### Forbidden:
```
clerkId: v.string()
.withIndex("by_clerk_id")
ctx.auth.getUserIdentity()   // (HttpClient = unauthenticated)
```

### Lookup rule:
Identity lookup MUST be:
```
ctx.db.get(userId);
```
No indexing by Clerk identity is ever legal.

---

# 📜 5. SCHEMA SOVEREIGNTY (SID PHASE 3)
Schema defines the identity model of the entire system.

### Rules:
- `clerkId` field MAY exist only on `admin_users` for reference
- No domain may rely on it  
- No index may be built on it  
- Relationships MUST use Convex `_id`

Illegal:
```
.index("by_clerk_id", ["clerkId"])
```

---

# 🚦 6. PIPELINE HYDRATION CONTRACT (SID PHASE 4)
The UI must hydrate from the sovereign cookie.

### Rules:
- UI may NOT call Clerk identity hooks for profile data  
- UI may call Clerk for authentication UI only  
- Stores hydrate from cookie only  

### Illegal:
```
const clerkUser = useUser();
const convexUser = useQuery(api..., { clerkId: clerkUser.id })
```

### Legal:
```
const session = useFuseSession();
session._id  // true identity
```

---

# 🧪 7. TESTING CHECKLIST (SID PHASE 5)
Every developer must confirm:

1. No `auth()` outside `(auth)`  
2. No Convex lookup by Clerk  
3. No mutation accepting `clerkId`  
4. No Server Action using Clerk identity  
5. Cookie always contains valid `_id`  
6. After login, Convex `_id` flows seamlessly → cookie → store → UI  

---

# 🔥 8. RUNNING DANTE SCAN (MANDATORY)
After refactor:

```
/VRP-dante-scan
```

**0 violations = merge allowed.**  
Any violations = refactor blocked.

---

# 🏁 9. FINAL LAW OF SID-AUTH

> **Clerk authenticates.  
> Convex identifies.  
> FUSE embodies.  
> Nothing else rules.**

---

# END OF SID-AUTH 1.0