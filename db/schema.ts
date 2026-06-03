import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import type { SummaryOptions } from "@/types/summary";

export const sourceTypeEnum = pgEnum("source_type", ["text", "youtube"]);
export const summaryStatusEnum = pgEnum("summary_status", [
  "pending",
  "completed",
  "failed",
]);

export const creditTransactionTypeEnum = pgEnum("credit_transaction_type", [
  "bonus",
  "charge",
  "usage",
]);

/** Supabase auth.users.id 와 동일한 PK */
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  credits: integer("credits").notNull().default(3),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const summaries = pgTable("summaries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  sourceType: sourceTypeEnum("source_type").notNull(),
  originalContent: text("original_content").notNull(),
  summaryText: text("summary_text"),
  title: text("title"),
  metadata: text("metadata"),
  status: summaryStatusEnum("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  summaryOptions: jsonb("summary_options").$type<SummaryOptions>(),
  schemaVersion: text("schema_version").default("v2"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const creditTransactions = pgTable(
  "credit_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    amount: integer("amount").notNull(),
    type: creditTransactionTypeEnum("type").notNull(),
    stripeCheckoutSessionId: text("stripe_checkout_session_id").unique(),
    stripeEventId: text("stripe_event_id").unique(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("credit_transactions_user_created_idx").on(
      table.userId,
      table.createdAt,
    ),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Summary = typeof summaries.$inferSelect;
export type NewSummary = typeof summaries.$inferInsert;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type NewCreditTransaction = typeof creditTransactions.$inferInsert;
