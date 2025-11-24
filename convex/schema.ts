import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  admin_users: defineTable({
    clerkId: v.string(),
    email: v.string(), // Primary email
    secondaryEmail: v.optional(v.union(v.string(), v.null())), // Secondary email (if verified) - can be null when deleted
    emailVerified: v.optional(v.boolean()),
    firstName: v.string(), // REQUIRED - Seeded from Clerk on signup, governed by Convex
    lastName: v.string(),  // REQUIRED - Seeded from Clerk on signup, governed by Convex
    avatarUrl: v.optional(v.union(v.string(), v.id("_storage"))),
    imageUrl: v.optional(v.union(v.string(), v.id("_storage"))), // Legacy field - migrate to avatarUrl
    brandLogoUrl: v.optional(v.union(v.string(), v.id("_storage"))), // Optional: Only set when user uploads custom logo
    // Naval Rank System - Developer-only feature gating
    rank: v.optional(v.union(
      v.literal("crew"),
      v.literal("captain"),
      v.literal("commodore"),
      v.literal("admiral")
    )),
    // User onboarding status
    setupStatus: v.optional(v.union(
      v.literal("invited"),
      v.literal("pending"),
      v.literal("abandon"),
      v.literal("complete"),
      v.literal("revoked")
    )),
    // Profile fields
    entityName: v.optional(v.string()),
    socialName: v.optional(v.string()),
    orgSlug: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    // Business configuration
    businessCountry: v.optional(v.string()),
    // Professional Genome - Behavioral/contextual fingerprint
    // Professional Identity
    jobTitle: v.optional(v.string()),
    department: v.optional(v.string()),
    seniority: v.optional(v.union(
      v.literal("staff"),
      v.literal("admin"),
      v.literal("consultant"),
      v.literal("contractor"),
      v.literal("coach"),
      v.literal("advisor"),
      v.literal("manager"),
      v.literal("director"),
      v.literal("executive"),
      v.literal("founder")
    )),
    // Company Context
    industry: v.optional(v.string()),
    companySize: v.optional(v.union(
      v.literal("1-10"),
      v.literal("11-50"),
      v.literal("51-200"),
      v.literal("201-1000"),
      v.literal("1001-5000"),
      v.literal("5001+")
    )),
    companyWebsite: v.optional(v.string()),
    // Transformation Journey (Transfoorm's domain edge)
    transformationGoal: v.optional(v.string()),
    transformationStage: v.optional(v.union(
      v.literal("exploring"),
      v.literal("planning"),
      v.literal("executing"),
      v.literal("scaling")
    )),
    transformationType: v.optional(v.union(
      v.literal("digital"),
      v.literal("operational"),
      v.literal("cultural"),
      v.literal("product"),
      v.literal("go_to_market")
    )),
    timelineUrgency: v.optional(v.union(
      v.literal("exploratory"),
      v.literal("3_6_months"),
      v.literal("immediate")
    )),
    // Growth Intel
    howDidYouHearAboutUs: v.optional(v.string()),
    teamSize: v.optional(v.number()),
    annualRevenue: v.optional(v.string()),
    successMetric: v.optional(v.string()),
    // Theme preferences
    themeName: v.optional(v.literal("transtheme")), // Single theme with light/dark modes
    themeDark: v.optional(v.boolean()), // Boolean controls mode (true=dark, false=light)
    // Miror AI avatar preference
    mirorAvatarProfile: v.optional(v.union(
      v.literal("male"),
      v.literal("female"),
      v.literal("inclusive")
    )),
    mirorEnchantmentEnabled: v.optional(v.boolean()), // Enable/disable sparkle animation
    mirorEnchantmentTiming: v.optional(v.union(
      v.literal("subtle"),
      v.literal("magical"),
      v.literal("playful")
    )), // Timing: subtle (1-2s/15-25s), magical (2-3s/8-15s), playful (2-3s/4-7s)
    createdAt: v.number(),
    updatedAt: v.number(),
    lastLoginAt: v.number(), // TTT-CERTIFIED: Required login tracking (set to createdAt on signup, updated on login)
    loginCount: v.optional(v.number()), // Total number of logins (incremented on each login)
    // RANK-AWARE SYSTEM: Subscription & Trial Management
    subscriptionStatus: v.optional(v.union(
      v.literal("trial"),      // Active trial period
      v.literal("active"),     // Paid subscription (Stripe/PayPal)
      v.literal("expired"),    // Trial ended, no payment
      v.literal("lifetime"),   // Granted by Admiral, never expires
      v.literal("cancelled")   // Was paid, now cancelled
    )),
    trialStartedAt: v.optional(v.number()),    // When trial began (timestamp)
    trialEndsAt: v.optional(v.number()),       // When trial expires (timestamp)
    trialDuration: v.optional(v.number()),     // Days granted (for audit trail)
    // PAYMENT INTEGRATION HOOKS (for future Stripe/PayPal)
    stripeCustomerId: v.optional(v.string()),       // Stripe customer ID
    stripeSubscriptionId: v.optional(v.string()),   // Stripe subscription ID
    paypalSubscriptionId: v.optional(v.string()),   // PayPal subscription ID
    subscriptionStartedAt: v.optional(v.number()),  // When paid subscription began
    subscriptionRenewsAt: v.optional(v.number()),   // Next billing date
    lastPaymentAt: v.optional(v.number()),          // Last successful payment timestamp
    // VANISH PROTOCOL 2.0: Idempotency and tombstone fields
    deletedAt: v.optional(v.number()), // Timestamp when deletion started
    deletionStatus: v.optional(v.union(
      v.literal("pending"),    // Deletion in progress (multi-chunk cascade)
      v.literal("completed"),  // Deletion finished successfully
      v.literal("failed")      // Deletion failed mid-cascade (requires manual cleanup)
    )),
  }).index("by_clerk_id", ["clerkId"])
    .index("by_rank", ["rank"])
    .index("by_subscription_status", ["subscriptionStatus"]),

  // VANISH PROTOCOL 2.0: Immutable audit trail for user deletions
  admin_users_DeletionLogs: defineTable({
    // Original user identity (before deletion)
    userId: v.string(), // Stored as string, not v.id() - user may already be deleted
    clerkId: v.string(),
    email: v.string(), // Preserved for audit trail
    firstName: v.optional(v.string()), // User's first name at deletion time
    lastName: v.optional(v.string()), // User's last name at deletion time
    rank: v.optional(v.string()), // User's rank at deletion time
    setupStatus: v.optional(v.string()), // User's setup status at deletion time
    subscriptionStatus: v.optional(v.string()), // User's subscription status at deletion time (trial/active/expired)
    entityName: v.optional(v.string()), // Entity name at deletion time
    socialName: v.optional(v.string()), // Social name at deletion time

    // Deletion metadata
    deletedBy: v.string(), // clerkId of user who initiated deletion (self or Admiral)
    deletedByRole: v.optional(v.union(
      v.literal("self"),    // User deleted their own account
      v.literal("admiral")  // Admiral deleted via tenant management
    )),
    reason: v.optional(v.string()), // Optional deletion reason

    // Cascade scope (append pattern - grows as cascade progresses)
    scope: v.object({
      userProfile: v.boolean(), // User record deleted
      clerkAccount: v.optional(v.boolean()), // Clerk account deleted
      storageFiles: v.array(v.string()), // Storage file IDs deleted
      relatedTables: v.array(v.string()), // "tableName:count" entries
    }),

    // Cascade execution metadata
    status: v.union(
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("failed")
    ),
    chunksCascaded: v.optional(v.number()), // Number of batches processed
    recordsDeleted: v.optional(v.number()), // Total records removed
    errorMessage: v.optional(v.string()), // If cascade failed
    clerkDeletionError: v.optional(v.string()), // If Clerk deletion failed (VANISH BLEMISH fix)

    // Timing
    deletedAt: v.number(), // When deletion started
    completedAt: v.optional(v.number()), // When cascade finished

    // Compliance metadata
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  }).index("by_clerk_id", ["clerkId"])
    .index("by_deleted_at", ["deletedAt"])
    .index("by_status", ["status"]),

  // SMAC LAYER 4: Client Domain (Rank-Based Data Scoping)
  clients: defineTable({
    // Client identity
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),

    // SMAC rank-based scoping fields
    orgId: v.string(), // Organization this client belongs to (Captain/Commodore scope)
    assignedTo: v.optional(v.id("admin_users")), // User assigned to this client (Crew scope)

    // Client metadata
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("prospect"),
      v.literal("archived")
    )),
    notes: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("admin_users"), // User who created this client
  }).index("by_org", ["orgId"])
    .index("by_assigned", ["assignedTo"])
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  // SMAC LAYER 4: Finance Domain (Rank-Based Data Scoping)
  finance: defineTable({
    // Transaction identity
    type: v.union(
      v.literal("invoice"),
      v.literal("payment"),
      v.literal("expense")
    ),
    amount: v.number(),
    currency: v.string(), // USD, EUR, etc.
    description: v.string(),

    // SMAC rank-scoping fields
    orgId: v.string(), // Organization this transaction belongs to

    // Metadata
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("overdue")
    )),
    date: v.number(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("admin_users"),
  }).index("by_org", ["orgId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_date", ["date"]),

  // SMAC LAYER 4: Project Domain (Rank-Based Data Scoping)
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),

    // SMAC rank-scoping fields
    orgId: v.string(), // Organization this project belongs to
    assignedTo: v.optional(v.id("admin_users")), // User assigned to this project (Crew scope)

    // Metadata
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("archived")
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("admin_users"),
  }).index("by_org", ["orgId"])
    .index("by_assigned", ["assignedTo"])
    .index("by_status", ["status"])
    .index("by_date", ["startDate"]),

  // SMAC LAYER 4: Productivity Domain - Email Management
  prod_email_Messages: defineTable({
    subject: v.string(),
    body: v.string(),
    from: v.string(),
    to: v.array(v.string()),
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

  // SMAC LAYER 4: Productivity Domain - Calendar Events
  prod_cal_Events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    orgId: v.string(),
    attendees: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("admin_users"),
  }).index("by_org", ["orgId"])
    .index("by_start_time", ["startTime"]),

  // SMAC LAYER 4: Productivity Domain - Bookings
  prod_book_Bookings: defineTable({
    clientName: v.string(),
    serviceType: v.string(),
    scheduledTime: v.number(),
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

  // SMAC LAYER 4: Productivity Domain - Meetings
  prod_pipe_Meetings: defineTable({
    title: v.string(),
    participants: v.array(v.string()),
    scheduledTime: v.number(),
    duration: v.number(), // minutes
    orgId: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("admin_users"),
  }).index("by_org", ["orgId"])
    .index("by_scheduled_time", ["scheduledTime"]),
});
