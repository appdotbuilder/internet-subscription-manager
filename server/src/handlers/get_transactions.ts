
import { db } from '../db';
import { transactionsTable, subscriptionsTable, membersTable, packagesTable } from '../db/schema';
import { type Transaction } from '../schema';
import { eq } from 'drizzle-orm';

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    // Query transactions with joins to get related subscription, member, and package information
    const results = await db.select({
      id: transactionsTable.id,
      subscription_id: transactionsTable.subscription_id,
      transaction_date: transactionsTable.transaction_date,
      amount: transactionsTable.amount,
      payment_status: transactionsTable.payment_status,
      created_at: transactionsTable.created_at
    })
    .from(transactionsTable)
    .innerJoin(subscriptionsTable, eq(transactionsTable.subscription_id, subscriptionsTable.id))
    .innerJoin(membersTable, eq(subscriptionsTable.member_id, membersTable.id))
    .innerJoin(packagesTable, eq(subscriptionsTable.package_id, packagesTable.id))
    .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(transaction => ({
      ...transaction,
      amount: parseFloat(transaction.amount) // Convert string back to number
    }));
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    throw error;
  }
};
