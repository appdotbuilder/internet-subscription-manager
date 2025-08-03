
import { db } from '../db';
import { subscriptionsTable, membersTable, packagesTable } from '../db/schema';
import { type Subscription } from '../schema';
import { eq } from 'drizzle-orm';

export const getSubscriptions = async (): Promise<Subscription[]> => {
  try {
    // Query with joins to get complete subscription information
    const results = await db.select()
      .from(subscriptionsTable)
      .innerJoin(membersTable, eq(subscriptionsTable.member_id, membersTable.id))
      .innerJoin(packagesTable, eq(subscriptionsTable.package_id, packagesTable.id))
      .execute();

    // Transform the joined results back to the expected Subscription type
    return results.map(result => ({
      id: result.subscriptions.id,
      member_id: result.subscriptions.member_id,
      package_id: result.subscriptions.package_id,
      start_date: result.subscriptions.start_date,
      end_date: result.subscriptions.end_date,
      status: result.subscriptions.status,
      created_at: result.subscriptions.created_at
    }));
  } catch (error) {
    console.error('Failed to fetch subscriptions:', error);
    throw error;
  }
};
