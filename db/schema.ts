import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    role: text("role").notNull().default("user"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date()),
});

export const userProgress = sqliteTable("user_progress", {
    userId: text("user_id").primaryKey(),
    userName: text("user_name").notNull().default("User"),
    userImage: text("user_image").notNull().default("/mascot.svg"),
    activeCourseId: integer("active_course_id"),
    hearts: integer("hearts").notNull().default(5),
    points: integer("points").notNull().default(0),
    cashbackBalance: integer("cashback_balance").notNull().default(0), // Added for withdrawal balance
    isGuest: integer("is_guest", { mode: "boolean" }).notNull().default(true),
    hasActiveSubscription: integer("has_active_subscription", { mode: "boolean" }).notNull().default(false),
    subscriptionEndsAt: integer("subscription_ends_at", { mode: "timestamp" }),
    lastSpinDate: text("last_spin_date"),
    isCourseCompleted: integer("is_course_completed", { mode: "boolean" }).notNull().default(false),
});

export const vouchers = sqliteTable("vouchers", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    code: text("code").notNull().unique(),
    valueRp: integer("value_rp").notNull(),
    gemsAmount: integer("gems_amount").notNull(),
    cashbackAmount: integer("cashback_amount").notNull().default(0),
    isClaimed: integer("is_claimed", { mode: "boolean" }).notNull().default(false),
    claimedBy: text("claimed_by"),
    claimedAt: integer("claimed_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date()),
});

// Manual Redeem Requests
export const redeemRequests = sqliteTable("redeem_requests", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull(),
    userName: text("user_name").notNull(),
    gemsAmount: integer("gems_amount").notNull(),
    rupiahAmount: integer("rupiah_amount").notNull(),
    paymentMethod: text("payment_method").notNull(),
    accountNumber: text("account_number").notNull(),
    accountName: text("account_name"),
    status: text("status").notNull().default("pending"),
    adminNotes: text("admin_notes"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date()),
    processedAt: integer("processed_at", { mode: "timestamp" }),
});

// User Treasure Access Log (tracks per-user access)
export const userTreasureLog = sqliteTable("user_treasure_log", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull().unique(),
    hasTreasureAccess: integer("has_treasure_access", { mode: "boolean" }).notNull().default(false),
    treasureAccessDate: text("treasure_access_date"),
    lastSpinDate: text("last_spin_date"),
    createdAt: integer("created_at", { mode: "timestamp" }),
});

// Treasure Settings (Admin configurable)
export const treasureSettings = sqliteTable("treasure_settings", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    paid4linkUrl: text("paid4link_url"),
    isEnabled: integer("is_enabled", { mode: "boolean" }).notNull().default(true),
    requirePaid4link: integer("require_paid4link", { mode: "boolean" }).notNull().default(false),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// Ad Settings
export const adSettings = sqliteTable("ad_settings", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    type: text("type").default('image'),
    scriptCode: text("script_code"),
    imageUrl: text("image_url"),
    targetUrl: text("target_url"),
    isActive: integer("is_active").default(0),
    updatedAt: text("updated_at")
});


export const feedbacks = sqliteTable("feedbacks", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull(),
    userName: text("user_name"),
    message: text("message").notNull(),
    type: text("type").default('saran'),
    createdAt: text("created_at")
});
