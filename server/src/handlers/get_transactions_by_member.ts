
import { db } from '../db';
import { transactionsTable, subscriptionsTable } from '../db/schema';
import { type GetTransactionsByMemberInput, type Transaction } from '../schema';
import { eq } from 'drizzle-orm';

export const getTransactionsByMember = async (input: GetTransactionsByMemberInput): Promise<Transaction[]> => {
  try {
    // Join transactions with subscriptions to filter by member_id
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
    .where(eq(subscriptionsTable.member_id, input.member_id))
    .execute();

    // Convert numeric fields back to numbers
    return results.map(transaction => ({
      ...transaction,
      amount: parseFloat(transaction.amount)
    }));
  } catch (error) {
    console.error('Failed to get transactions by member:', error);
    throw error;
  }
};
