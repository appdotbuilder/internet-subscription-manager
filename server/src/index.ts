
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import {
  createPackageInputSchema,
  updatePackageInputSchema,
  deletePackageInputSchema,
  createMemberInputSchema,
  updateMemberInputSchema,
  deleteMemberInputSchema,
  createSubscriptionInputSchema,
  getTransactionsByMemberInputSchema
} from './schema';

// Import handlers
import { createPackage } from './handlers/create_package';
import { getPackages } from './handlers/get_packages';
import { updatePackage } from './handlers/update_package';
import { deletePackage } from './handlers/delete_package';
import { createMember } from './handlers/create_member';
import { getMembers } from './handlers/get_members';
import { updateMember } from './handlers/update_member';
import { deleteMember } from './handlers/delete_member';
import { createSubscription } from './handlers/create_subscription';
import { getSubscriptions } from './handlers/get_subscriptions';
import { getTransactions } from './handlers/get_transactions';
import { getTransactionsByMember } from './handlers/get_transactions_by_member';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Package operations (Admin)
  createPackage: publicProcedure
    .input(createPackageInputSchema)
    .mutation(({ input }) => createPackage(input)),
  
  getPackages: publicProcedure
    .query(() => getPackages()),
  
  updatePackage: publicProcedure
    .input(updatePackageInputSchema)
    .mutation(({ input }) => updatePackage(input)),
  
  deletePackage: publicProcedure
    .input(deletePackageInputSchema)
    .mutation(({ input }) => deletePackage(input)),

  // Member operations (Admin)
  createMember: publicProcedure
    .input(createMemberInputSchema)
    .mutation(({ input }) => createMember(input)),
  
  getMembers: publicProcedure
    .query(() => getMembers()),
  
  updateMember: publicProcedure
    .input(updateMemberInputSchema)
    .mutation(({ input }) => updateMember(input)),
  
  deleteMember: publicProcedure
    .input(deleteMemberInputSchema)
    .mutation(({ input }) => deleteMember(input)),

  // Subscription operations
  createSubscription: publicProcedure
    .input(createSubscriptionInputSchema)
    .mutation(({ input }) => createSubscription(input)),
  
  getSubscriptions: publicProcedure
    .query(() => getSubscriptions()),

  // Transaction operations
  getTransactions: publicProcedure
    .query(() => getTransactions()),
  
  getTransactionsByMember: publicProcedure
    .input(getTransactionsByMemberInputSchema)
    .query(({ input }) => getTransactionsByMember(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
