import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN DOMAIN
  // ═══════════════════════════════════════════════════════════════════════════

  admin_users: defineTable({
    // Identity (required)
    /**
     * @deprecated REFERENCE ONLY — Do NOT use for business logic lookups.
     * clerkId exists solely for:
     * - Webhook correlation (user.created, user.deleted events from Clerk)
     * - Vanish Protocol (account deletion flows)
     * - Identity handoff ceremony (auth boundary only)
     *
     * All runtime identity MUST use the Convex document _id.
     * See: _clerk-virus/S.I.D.—SOVEREIGN-IDENTITY-DOCTRINE.md
     */
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),

    // Profile (optional - user fills in over time)
    secondaryEmail: v.optional(v.string()),
    avatarUrl: v.optional(v.union(v.string(), v.id("_storage"))),
    brandLogoUrl: v.optional(v.union(v.string(), v.id("_storage"))),
    entityName: v.optional(v.string()),
    socialName: v.optional(v.string()),
    orgSlug: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    businessCountry: v.optional(v.string()),

    // Naval Rank System (required)
    rank: v.union(
      v.literal("crew"),
      v.literal("captain"),
      v.literal("commodore"),
      v.literal("admiral")
    ),

    // User onboarding status (required)
    setupStatus: v.union(
      v.literal("invited"),
      v.literal("pending"),
      v.literal("abandon"),
      v.literal("complete"),
      v.literal("revoked")
    ),

    // Theme preferences (required with defaults)
    themeDark: v.boolean(), // Default: false (light mode)

    // Miror AI avatar preference (optional - user configures)
    mirorAvatarProfile: v.optional(v.union(
      v.literal("male"),
      v.literal("female"),
      v.literal("inclusive")
    )),
    mirorEnchantmentEnabled: v.optional(v.boolean()),
    mirorEnchantmentTiming: v.optional(v.union(
      v.literal("subtle"),
      v.literal("magical"),
      v.literal("playful")
    )),

    // Timestamps (required)
    createdAt: v.number(),
    updatedAt: v.number(),
    lastLoginAt: v.number(),
    loginCount: v.number(), // Default: 1 on signup

    // Subscription & Trial Management (required)
    subscriptionStatus: v.union(
      v.literal("trial"),
      v.literal("active"),
      v.literal("expired"),
      v.literal("lifetime"),
      v.literal("cancelled")
    ),
    trialStartedAt: v.optional(v.number()),
    trialEndsAt: v.optional(v.number()),
    trialDuration: v.optional(v.number()),

    // Payment Integration (optional - only when connected)
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    paypalSubscriptionId: v.optional(v.string()),
    subscriptionStartedAt: v.optional(v.number()),
    subscriptionRenewsAt: v.optional(v.number()),
    lastPaymentAt: v.optional(v.number()),

    // Vanish Protocol (optional - only when deletion in progress)
    deletedAt: v.optional(v.number()),
    deletionStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    )),
  })
    /**
     * @deprecated WEBHOOK-ONLY INDEX — Do NOT use for runtime identity lookups.
     * Required until SID Phase 10 (Webhook Refactor).
     * All business logic MUST use ctx.db.get(userId) with Convex _id.
     * See: _clerk-virus/S.I.D.—SOVEREIGN-IDENTITY-DOCTRINE.md (SID-6.2, SID-6.3)
     */
    .index("by_clerk_id", ["clerkId"])
    .index("by_rank", ["rank"])
    .index("by_subscription_status", ["subscriptionStatus"]),

  // Vanish Protocol: Immutable audit trail for user deletions
  admin_users_DeleteLog: defineTable({
    // Original user identity (all required - user always has these at deletion)
    /**
     * Convex document _id of the deleted user (SOVEREIGN IDENTITY).
     * This is the primary identity reference for audit trails.
     */
    userId: v.id("admin_users"),
    /**
     * @deprecated REFERENCE ONLY — Stored for Clerk webhook correlation during deletion.
     * Do NOT use for lookups. See: _clerk-virus/S.I.D.—SOVEREIGN-IDENTITY-DOCTRINE.md
     */
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    rank: v.string(),
    setupStatus: v.string(),
    subscriptionStatus: v.string(),

    // Optional profile fields (may not have been set)
    entityName: v.optional(v.string()),
    socialName: v.optional(v.string()),

    // Deletion metadata (required)
    /**
     * Convex document _id of the user who performed the deletion (SOVEREIGN IDENTITY).
     */
    deletedBy: v.id("admin_users"),
    deletedByRole: v.union(
      v.literal("self"),
      v.literal("admiral")
    ),
    reason: v.optional(v.string()),

    // Cascade scope
    scope: v.object({
      userProfile: v.boolean(),
      clerkAccount: v.boolean(),
      storageFiles: v.array(v.string()),
      relatedTables: v.array(v.string()),
    }),

    // Cascade execution (required)
    status: v.union(
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("failed")
    ),
    chunksCascaded: v.number(),
    recordsDeleted: v.number(),
    errorMessage: v.optional(v.string()),
    clerkDeletionError: v.optional(v.string()),

    // Timing (required)
    deletedAt: v.number(),
    completedAt: v.optional(v.number()),

    // Compliance (optional)
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })
    /**
     * @deprecated WEBHOOK-ONLY INDEX — Required for Vanish Protocol Clerk correlation.
     * Do NOT use for runtime identity lookups.
     * See: _clerk-virus/S.I.D.—SOVEREIGN-IDENTITY-DOCTRINE.md (SID-6.2)
     */
    .index("by_clerk_id", ["clerkId"])
    .index("by_user_id", ["userId"]) // SOVEREIGN: Primary lookup for audit trails
    .index("by_deleted_at", ["deletedAt"])
    .index("by_status", ["status"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS DOMAIN
  // ═══════════════════════════════════════════════════════════════════════════

  // Professional Genome - User's behavioral/contextual fingerprint
  settings_account_Genome: defineTable({
    userId: v.id("admin_users"),

    // Professional Identity
    jobTitle: v.optional(v.string()),
    department: v.optional(v.string()),
    seniority: v.optional(v.string()), // Dropdown with "Custom" option

    // Company Context
    industry: v.optional(v.string()),
    companySize: v.optional(v.string()), // Dropdown with "Custom" option
    companyWebsite: v.optional(v.string()),

    // Transformation Journey
    transformationGoal: v.optional(v.string()),
    transformationStage: v.optional(v.string()), // Dropdown with "Custom" option
    transformationType: v.optional(v.string()), // Dropdown with "Custom" option
    timelineUrgency: v.optional(v.string()), // Dropdown with "Custom" option

    // Growth Intel
    howDidYouHearAboutUs: v.optional(v.string()),
    teamSize: v.optional(v.number()),
    annualRevenue: v.optional(v.string()),
    successMetric: v.optional(v.string()),

    // Meta
    completionPercent: v.number(), // 0-100, calculated on save
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // CLIENTS DOMAIN
  // ═══════════════════════════════════════════════════════════════════════════

  clients_contacts_Users: defineTable({
    // Identity (required)
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),

    // Profile (optional)
    company: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),

    // SRS rank-scoping (required)
    /**
     * @todo SID-ORG: Convert to v.id("admin_orgs") when orgs domain is implemented.
     * Currently stores external org identifier (e.g., from Clerk Organizations).
     * See: _clerk-virus/S.I.D.—SOVEREIGN-IDENTITY-DOCTRINE.md
     */
    orgId: v.string(),
    assignedTo: v.optional(v.id("admin_users")),

    // Status (required with default)
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("prospect"),
      v.literal("archived")
    ),
    notes: v.optional(v.string()),

    // Timestamps (required)
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("admin_users"),
  }).index("by_org", ["orgId"])
    .index("by_assigned", ["assignedTo"])
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // FINANCE DOMAIN
  // ═══════════════════════════════════════════════════════════════════════════

  finance_banking_Statements: defineTable({
    // Transaction identity (required)
    type: v.union(
      v.literal("invoice"),
      v.literal("payment"),
      v.literal("expense")
    ),
    amount: v.number(),
    currency: v.string(),
    description: v.string(),

    // SRS rank-scoping (required)
    /**
     * @todo SID-ORG: Convert to v.id("admin_orgs") when orgs domain is implemented.
     */
    orgId: v.string(),

    // Status (required with default)
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("overdue")
    ),
    date: v.number(),

    // Timestamps (required)
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("admin_users"),
  }).index("by_org", ["orgId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_date", ["date"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // PROJECTS DOMAIN
  // ═══════════════════════════════════════════════════════════════════════════

  projects_tracking_Schedule: defineTable({
    // Identity (required)
    name: v.string(),
    description: v.optional(v.string()),

    // SRS rank-scoping (required)
    /**
     * @todo SID-ORG: Convert to v.id("admin_orgs") when orgs domain is implemented.
     */
    orgId: v.string(),
    assignedTo: v.optional(v.id("admin_users")),

    // Status (required)
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("archived")
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),

    // Timestamps (required)
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("admin_users"),
  }).index("by_org", ["orgId"])
    .index("by_assigned", ["assignedTo"])
    .index("by_status", ["status"])
    .index("by_date", ["startDate"]),

  projects_tracking_Costs: defineTable({
    // Link to project (required)
    projectId: v.id("projects_tracking_Schedule"),

    // Cost details (required)
    name: v.string(),
    amount: v.number(),
    currency: v.string(),
    category: v.union(
      v.literal("labor"),
      v.literal("materials"),
      v.literal("equipment"),
      v.literal("services"),
      v.literal("other")
    ),

    // SRS rank-scoping (required)
    /**
     * @todo SID-ORG: Convert to v.id("admin_orgs") when orgs domain is implemented.
     */
    orgId: v.string(),

    // Status (required)
    status: v.union(
      v.literal("estimated"),
      v.literal("approved"),
      v.literal("spent")
    ),
    date: v.number(),

    // Timestamps (required)
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("admin_users"),
  }).index("by_project", ["projectId"])
    .index("by_org", ["orgId"])
    .index("by_category", ["category"])
    .index("by_status", ["status"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // PRODUCTIVITY DOMAIN
  // ═══════════════════════════════════════════════════════════════════════════

  productivity_email_Messages: defineTable({
    subject: v.string(),
    body: v.string(),
    from: v.string(),
    to: v.array(v.string()),
    /** @todo SID-ORG: Convert to v.id("admin_orgs") when orgs domain is implemented. */
    orgId: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("archived")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("admin_users"),
  }).index("by_org", ["orgId"])
    .index("by_status", ["status"]),

  productivity_calendar_Events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    /** @todo SID-ORG: Convert to v.id("admin_orgs") when orgs domain is implemented. */
    orgId: v.string(),
    attendees: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("admin_users"),
  }).index("by_org", ["orgId"])
    .index("by_start_time", ["startTime"]),

  productivity_bookings_Form: defineTable({
    clientName: v.string(),
    serviceType: v.string(),
    scheduledTime: v.number(),
    /** @todo SID-ORG: Convert to v.id("admin_orgs") when orgs domain is implemented. */
    orgId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("admin_users"),
  }).index("by_org", ["orgId"])
    .index("by_status", ["status"]),

  productivity_pipeline_Prospects: defineTable({
    title: v.string(),
    participants: v.array(v.string()),
    scheduledTime: v.number(),
    duration: v.number(),
    /** @todo SID-ORG: Convert to v.id("admin_orgs") when orgs domain is implemented. */
    orgId: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("admin_users"),
  }).index("by_org", ["orgId"])
    .index("by_scheduled_time", ["scheduledTime"]),
});
