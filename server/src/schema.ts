
import { z } from 'zod';

// Package schemas
export const packageSchema = z.object({
  id: z.number(),
  name: z.string(),
  speed: z.string(),
  price: z.number(),
  active_duration: z.number().int(),
  created_at: z.coerce.date()
});

export type Package = z.infer<typeof packageSchema>;

export const createPackageInputSchema = z.object({
  name: z.string().min(1),
  speed: z.string().min(1),
  price: z.number().positive()
});

export type CreatePackageInput = z.infer<typeof createPackageInputSchema>;

export const updatePackageInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  speed: z.string().min(1).optional(),
  price: z.number().positive().optional()
});

export type UpdatePackageInput = z.infer<typeof updatePackageInputSchema>;

// Member schemas
export const memberSchema = z.object({
  id: z.number(),
  full_name: z.string(),
  address: z.string(),
  phone_number: z.string(),
  email: z.string(),
  username: z.string(),
  password: z.string(),
  created_at: z.coerce.date()
});

export type Member = z.infer<typeof memberSchema>;

export const createMemberInputSchema = z.object({
  full_name: z.string().min(1),
  address: z.string().min(1),
  phone_number: z.string().min(1),
  email: z.string().email(),
  username: z.string().min(1),
  password: z.string().min(6)
});

export type CreateMemberInput = z.infer<typeof createMemberInputSchema>;

export const updateMemberInputSchema = z.object({
  id: z.number(),
  full_name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  phone_number: z.string().min(1).optional(),
  email: z.string().email().optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(6).optional()
});

export type UpdateMemberInput = z.infer<typeof updateMemberInputSchema>;

// Subscription schemas
export const subscriptionStatusEnum = z.enum(['active', 'expired']);

export const subscriptionSchema = z.object({
  id: z.number(),
  member_id: z.number(),
  package_id: z.number(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  status: subscriptionStatusEnum,
  created_at: z.coerce.date()
});

export type Subscription = z.infer<typeof subscriptionSchema>;

export const createSubscriptionInputSchema = z.object({
  member_id: z.number(),
  package_id: z.number()
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionInputSchema>;

// Transaction schemas
export const transactionSchema = z.object({
  id: z.number(),
  subscription_id: z.number(),
  transaction_date: z.coerce.date(),
  amount: z.number(),
  payment_status: z.string(),
  created_at: z.coerce.date()
});

export type Transaction = z.infer<typeof transactionSchema>;

// Query parameter schemas
export const getTransactionsByMemberInputSchema = z.object({
  member_id: z.number()
});

export type GetTransactionsByMemberInput = z.infer<typeof getTransactionsByMemberInputSchema>;

export const deletePackageInputSchema = z.object({
  id: z.number()
});

export type DeletePackageInput = z.infer<typeof deletePackageInputSchema>;

export const deleteMemberInputSchema = z.object({
  id: z.number()
});

export type DeleteMemberInput = z.infer<typeof deleteMemberInputSchema>;
