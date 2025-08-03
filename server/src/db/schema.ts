
import { serial, text, pgTable, timestamp, numeric, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'expired']);

// Tables
export const packagesTable = pgTable('packages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  speed: text('speed').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  active_duration: integer('active_duration').notNull().default(30),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const membersTable = pgTable('members', {
  id: serial('id').primaryKey(),
  full_name: text('full_name').notNull(),
  address: text('address').notNull(),
  phone_number: text('phone_number').notNull(),
  email: text('email').notNull(),
  username: text('username').notNull(),
  password: text('password').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const subscriptionsTable = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  member_id: integer('member_id').notNull().references(() => membersTable.id),
  package_id: integer('package_id').notNull().references(() => packagesTable.id),
  start_date: timestamp('start_date').defaultNow().notNull(),
  end_date: timestamp('end_date').notNull(),
  status: subscriptionStatusEnum('status').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const transactionsTable = pgTable('transactions', {
  id: serial('id').primaryKey(),
  subscription_id: integer('subscription_id').notNull().references(() => subscriptionsTable.id),
  transaction_date: timestamp('transaction_date').defaultNow().notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  payment_status: text('payment_status').notNull().default('pending'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const packagesRelations = relations(packagesTable, ({ many }) => ({
  subscriptions: many(subscriptionsTable),
}));

export const membersRelations = relations(membersTable, ({ many }) => ({
  subscriptions: many(subscriptionsTable),
}));

export const subscriptionsRelations = relations(subscriptionsTable, ({ one, many }) => ({
  member: one(membersTable, {
    fields: [subscriptionsTable.member_id],
    references: [membersTable.id],
  }),
  package: one(packagesTable, {
    fields: [subscriptionsTable.package_id],
    references: [packagesTable.id],
  }),
  transactions: many(transactionsTable),
}));

export const transactionsRelations = relations(transactionsTable, ({ one }) => ({
  subscription: one(subscriptionsTable, {
    fields: [transactionsTable.subscription_id],
    references: [subscriptionsTable.id],
  }),
}));

// TypeScript types for the table schemas
export type Package = typeof packagesTable.$inferSelect;
export type NewPackage = typeof packagesTable.$inferInsert;
export type Member = typeof membersTable.$inferSelect;
export type NewMember = typeof membersTable.$inferInsert;
export type Subscription = typeof subscriptionsTable.$inferSelect;
export type NewSubscription = typeof subscriptionsTable.$inferInsert;
export type Transaction = typeof transactionsTable.$inferSelect;
export type NewTransaction = typeof transactionsTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  packages: packagesTable,
  members: membersTable,
  subscriptions: subscriptionsTable,
  transactions: transactionsTable,
};
