# 14. DATABASE NAMING CONVENTION

**A three-level hierarchical naming system for scalable database architecture**

---

## Overview

Transfoorm uses a three-level hierarchical naming convention for all database tables to ensure clarity, scalability, and maintainability across hundreds of tables.

This convention aligns perfectly with SMAC architecture (see `13-SMAC-ARCHITECTURE.md`), where the database layer mirrors the domain-based routing structure.

---

## The Convention Pattern

```
[domain]_[area]_[Entity]
```

**Components:**
- **`[domain]`**: Lowercase, 3-6 characters - Top-level business domain (readable, no hard limit)
- **`[area]`**: Lowercase, 2-5 characters MAX - Functional area within domain (full word preferred, standard abbreviations accepted)
- **`[Entity]`**: PascalCase - Specific table name (full descriptive name)

**IMPORTANT:** Every production table MUST follow this three-level pattern. No exceptions.

⚠️ **Placeholder Tables (Technical Debt):**
The following single-word tables violate the convention and are temporary placeholders:
- `projects` → Will become `proj_[area]_*` when domain is properly architected
- `clients` → Will become `client_[area]_*` when domain is properly architected
- `finance` → Will become `fin_[area]_*` when domain is properly architected

These exist as stub tables from early development and will be migrated to proper three-level naming once their domain architecture is finalized.

---

## Quick Examples

```typescript
fin_rec_Transactions    // Finance → Reconciliation → Transactions
fin_ar_Invoices        // Finance → Accounts Receivable → Invoices
fin_gl_JournalEntries  // Finance → General Ledger → Journal Entries
prod_pipe_Opportunities // Productivity → Pipeline → Opportunities
client_team_Members     // Clients → Teams → Members
admin_user_DeletionLogs // Admin → Users → Deletion Logs
```

---

## Domain Prefixes

### Core System Domains

| Prefix | Domain | Description |
|--------|--------|-------------|
| `admin_` | Admin | User management, tenant admin, platform configuration |
| `auth_` | Authentication | Auth tokens, sessions, permissions |
| `audit_` | Audit | Audit trails and change logs |
| `system_` | System | System configuration and metadata |
| `notif_` | Notifications | Notification management |

**SMAC Alignment:** User management tables follow the Admin domain convention. The core user table is `admin_users`, and all related tables use the `admin_users_` prefix (Admin domain → Users subdomain).

### Business Domains

| Prefix | Domain | Description |
|--------|--------|-------------|
| `fin_` | Finance | All financial modules |
| `client_` | Clients | Client/customer management |
| `prod_` | Productivity | Email, calendar, pipeline |
| `proj_` | Projects | Project management |
| `doc_` | Documents | Document management |
| `insight_` | Insights | Analytics and reporting |

---

## Area Codes by Domain

### Finance Area Codes

Since Finance is a complex domain with multiple sub-modules:

| Area | Module | Description |
|------|--------|-------------|
| `rec_` | Reconciliation | Banking and reconciliation |
| `ar_` | Accounts Receivable | Invoices, customers, receipts |
| `ap_` | Accounts Payable | Bills, vendors, payments |
| `gl_` | General Ledger | Journal entries, chart of accounts |
| `tax_` | Tax Management | Tax rates, returns, calculations |
| `pay_` | Payroll | Employee payments, deductions |
| `fa_` | Fixed Assets | Asset management, depreciation |
| `bud_` | Budgeting | Budget planning and tracking |

### Productivity Area Codes

| Area | Module | Description |
|------|--------|-------------|
| `email_` | Email | Email management |
| `cal_` | Calendar | Calendar and scheduling |
| `book_` | Bookings | Appointment bookings |
| `pipe_` | Pipeline | CRM pipeline management |

### Client Area Codes

| Area | Module | Description |
|------|--------|-------------|
| `part_` | Participants | Individual participants |
| `team_` | Teams | Team management |
| `rep_` | Reports | Client reporting |
| `comm_` | Communication | Client communications |

### Admin Area Codes

**Note:** User management is a subdomain of Admin. User-related tables use `admin_users_` prefix (plural to match the core table name).

| Area | Module | Description |
|------|--------|-------------|
| `users_` | Users | User lifecycle management (deletion logs, etc.) |
| `tenant_` | Tenants | Multi-tenant management |
| `plan_` | Plans | Subscription plans and features |
| `feat_` | Features | Feature flags and toggles |

### Legacy User Area Codes (Pre-SMAC)

These were used before SMAC architecture aligned Admin as the domain:
- `user_` (singular) → Now `users_` (plural to match table name)
- `set_` → Settings | User preferences (now handled via settings domain)
- `sub_` → Subscriptions | User subscription management
- `prof_` → Profile | Extended profile (stored in core admin_users table)
- `sess_` → Sessions | User session management

---

## Complete Table Examples

### Admin Tables (User Management)

```typescript
// Core user document (SMAC-aligned)
admin_users

// Admin → Users subdomain tables (SMAC-aligned)
admin_users_DeletionLogs     // User deletion audit trail (Vanish Protocol)
admin_tenant_Organizations  // Multi-tenant organizations
admin_plan_Features         // Plan feature definitions
admin_feat_Flags           // Feature flag configuration
```

### Finance Tables

```typescript
// Reconciliation
fin_rec_Transactions
fin_rec_Categories
fin_rec_Sessions
fin_rec_Uploads
fin_rec_Statements
fin_rec_MerchantPatterns

// Accounts Receivable
fin_ar_Customers
fin_ar_Invoices
fin_ar_InvoiceLines
fin_ar_Receipts
fin_ar_CreditNotes

// General Ledger
fin_gl_ChartOfAccounts
fin_gl_JournalEntries
fin_gl_JournalLines
fin_gl_FiscalPeriods
fin_gl_AccountBalances

// Accounts Payable
fin_ap_Vendors
fin_ap_Bills
fin_ap_BillLines
fin_ap_Payments
```

### Productivity Tables

```typescript
// Email
prod_email_Messages
prod_email_Templates
prod_email_Campaigns
prod_email_Attachments

// Calendar
prod_cal_Events
prod_cal_Attendees
prod_cal_Reminders

// Pipeline
prod_pipe_Leads
prod_pipe_Opportunities
prod_pipe_Stages
prod_pipe_Activities
```

### Client Tables

```typescript
// Participants
client_part_Profiles
client_part_History
client_part_Notes

// Teams
client_team_Groups
client_team_Members
client_team_Roles
```

---

## SMAC Alignment

**The database naming convention aligns perfectly with SMAC architecture:**

| SMAC Routes | Convex Backend | Database Tables |
|-------------|----------------|-----------------|
| `/(domains)/admin/users/` | `/convex/domains/admin/users/` | `admin_users`, `admin_users_*` |
| `/(domains)/clients/` | `/convex/domains/clients/` | `clients`, `client_*` |
| `/(domains)/finance/` | `/convex/domains/finance/` | `finance`, `fin_*` |
| `/(domains)/productivity/` | `/convex/domains/productivity/` | `prod_email_*`, `prod_cal_*` |

**Four-layer alignment:**

```
1. Routes:     /(domains)/admin/users/
2. Backend:    /convex/domains/admin/users/
3. Database:   admin_users, admin_users_DeletionLogs
4. Manifests:  /src/app/(domains)/admin/users/manifest.json
```

This creates a perfectly aligned architecture from the URL bar all the way to the database schema.

---

## Benefits

### 1. Visual Scanning
Tables naturally group in alphabetical listings by domain and area.

### 2. Clear Hierarchy
Instantly understand domain → area → entity relationship.

### 3. Scalability
Works with 500+ tables without confusion or namespace collisions.

### 4. Searchability
Easy to find all tables in a domain (`fin_*`) or area (`fin_rec_*`).

### 5. Self-Documenting
Table name tells you exactly what it contains and where it belongs.

### 6. IDE Friendly
Autocomplete groups related tables together for faster development.

### 7. Query Optimization
Database query planners can optimize based on naming patterns.

### 8. Team Coordination
Developers instantly know which domain owns which tables.

---

## Query Patterns

Finding tables becomes intuitive:

```typescript
// Find all finance tables
SELECT * FROM information_schema.tables WHERE table_name LIKE 'fin_%'

// Find all reconciliation tables
SELECT * FROM information_schema.tables WHERE table_name LIKE 'fin_rec_%'

// Find all invoice-related tables across domains
SELECT * FROM information_schema.tables WHERE table_name LIKE '%_Invoices'
```

In Convex schema exploration:

```typescript
// List all productivity tables
Object.keys(schema).filter(t => t.startsWith('prod_'))

// Find all user-related admin tables
Object.keys(schema).filter(t => t.startsWith('admin_user_'))
```

---

## Common Patterns

### Cross-Domain Entities

Some entities appear across multiple domains with consistent naming:

```typescript
fin_ar_Invoices        // Financial invoices
shop_ord_Invoices      // E-commerce invoices
proj_bill_Invoices     // Project billing invoices
```

### Relationship Tables

For many-to-many relationships, use compound entity names:

```typescript
client_team_MemberRoles     // Links members to roles
proj_task_Assignments       // Links tasks to users
doc_folder_Permissions      // Links folders to permissions
```

### Temporal Tables

For historical/temporal data, use descriptive suffixes:

```typescript
fin_gl_JournalEntriesHistory
client_part_ProfileSnapshots
audit_change_Logs
```

---

## Best Practices

### 1. Always Use Three Levels
Even if it seems verbose, consistency is more important than brevity.

**Good:**
```typescript
admin_user_DeletionLogs  // Clear domain → area → entity
```

**Bad:**
```typescript
userDeletionLogs         // Missing domain/area context
user_DeleteLogs          // Inconsistent casing
```

### 2. Keep Prefixes Short
Domain and area prefixes should be 2-4 characters maximum.

**Good:**
```typescript
prod_cal_Events          // "prod" and "cal" are concise
```

**Bad:**
```typescript
productivity_calendar_Events  // Too verbose
```

### 3. Use Standard Abbreviations
Don't invent new abbreviations - use domain-standard ones.

**Good:**
```typescript
fin_ar_Invoices          // "ar" = Accounts Receivable (standard)
```

**Bad:**
```typescript
fin_acctrec_Invoices     // Non-standard abbreviation
```

### 4. PascalCase for Entities
Entity names use PascalCase to match TypeScript conventions.

**Good:**
```typescript
fin_gl_JournalEntries    // PascalCase entity
```

**Bad:**
```typescript
fin_gl_journal_entries   // snake_case entity
```

### 5. Document New Domains
When creating new domains, add them to this document immediately.

### 6. Be Consistent
The same entity should have the same name across all domains.

**Good:**
```typescript
fin_ar_Invoices
proj_bill_Invoices
shop_ord_Invoices
```

**Bad:**
```typescript
fin_ar_Invoices
proj_bill_Bills          // Should be Invoices
shop_ord_Orders          // Should be Invoices
```

---

## Migration Strategy

When renaming existing tables to follow this convention:

### 1. Update Schema First
Modify `convex/schema.ts` with new table names:

```typescript
// OLD:
user_DeleteLogs: defineTable({ ... })

// NEW:
admin_user_DeletionLogs: defineTable({ ... })
```

### 2. Update All Convex Functions
Search and replace all references in `/convex/` directory:

```bash
# Find all references to old table name
grep -r "user_DeleteLogs" convex/

# Update each file
```

### 3. Update Frontend Components
Update all client-side code that references the table:

```typescript
// OLD:
const logs = useQuery(api.admin.users.getDeletionLogs)

// NEW:
const logs = useQuery(api.domains.admin.users.getDeletionLogs)
```

### 4. Run Comprehensive Tests
Ensure no references were missed:

```bash
npm test
npm run typecheck
```

### 5. Deploy with Data Migration
If table contains production data, plan migration carefully:

```typescript
// Migration mutation to copy data
export const migrateTableName = internalMutation({
  handler: async (ctx) => {
    const oldData = await ctx.db.query("user_DeleteLogs").collect()
    for (const doc of oldData) {
      await ctx.db.insert("admin_user_DeletionLogs", doc)
    }
  }
})
```

---

## Enforcement

### Code Review Checklist
- ✅ New tables follow three-level pattern
- ✅ Domain prefix matches SMAC structure
- ✅ Area code is documented in this guide
- ✅ Entity name uses PascalCase
- ✅ Naming is consistent with similar tables

### Automated Validation
Consider adding linting rules to enforce naming:

```typescript
// eslint-plugin-custom-rules.js
{
  'database-naming-convention': {
    pattern: /^[a-z]{3,4}_[a-z]{2,4}_[A-Z][a-zA-Z]+$/,
    message: 'Table names must follow [domain]_[area]_[Entity] pattern'
  }
}
```

### Documentation Requirements
1. Document in onboarding materials
2. Enforce in code reviews
3. Include in database design reviews
4. Update this guide when adding domains

---

## Appendix: Full Domain Catalog

### Current Production Domains

| Domain | Prefix | Status | Tables |
|--------|--------|--------|--------|
| Admin | `admin_` | Active | `admin_users`, `admin_users_DeletionLogs`, `admin_tenant_Organizations` |
| Authentication | `auth_` | Planned | Not yet implemented |
| Audit | `audit_` | Planned | Not yet implemented |
| Clients | `client_` | Active | `clients` (core table) |
| Finance | `fin_` | Active | `finance` (core table) |
| Productivity | `prod_` | Active | `prod_email_Messages`, `prod_cal_Events`, `prod_book_Bookings`, `prod_pipe_Meetings` |
| Projects | `proj_` | Active | `projects` (core table) |
| Documents | `doc_` | Planned | Not yet implemented |
| Insights | `insight_` | Planned | Not yet implemented |
| Notifications | `notif_` | Planned | Not yet implemented |
| System | `system_` | Planned | Not yet implemented |

---

## Version History

**Version 1.0** - 2024
- Initial three-level naming convention
- Pre-SMAC user-centric design

**Version 2.0** - 2025
- SMAC architecture alignment
- Admin domain introduced for user management
- Four-layer alignment (Routes → Backend → Database → Manifests)
- SDK documentation created

---

## Related Documentation

- **`13-SMAC-ARCHITECTURE.md`** - Domain-based routing architecture
- **`/convex/schema.ts`** - Current database schema implementation
- **`12-VIRGIN-REPO-PROTOCOL.md`** - Code quality and enforcement patterns

---

*This naming convention ensures that Transfoorm can scale to thousands of tables while maintaining clarity, discoverability, and perfect alignment with SMAC architecture.*
