
import { db } from '../db';
import { subscriptionsTable, transactionsTable, packagesTable, membersTable } from '../db/schema';
import { type CreateSubscriptionInput, type Subscription } from '../schema';
import { eq } from 'drizzle-orm';

export const createSubscription = async (input: CreateSubscriptionInput): Promise<Subscription> => {
  try {
    // Verify that member exists
    const member = await db.select()
      .from(membersTable)
      .where(eq(membersTable.id, input.member_id))
      .execute();
    
    if (member.length === 0) {
      throw new Error('Member not found');
    }

    // Verify that package exists and get its active_duration
    const packageResult = await db.select()
      .from(packagesTable)
      .where(eq(packagesTable.id, input.package_id))
      .execute();
    
    if (packageResult.length === 0) {
      throw new Error('Package not found');
    }

    const packageData = packageResult[0];
    
    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + packageData.active_duration);
    
    // Determine status based on end date
    const status = endDate < new Date() ? 'expired' : 'active';

    // Create subscription
    const subscriptionResult = await db.insert(subscriptionsTable)
      .values({
        member_id: input.member_id,
        package_id: input.package_id,
        start_date: startDate,
        end_date: endDate,
        status: status
      })
      .returning()
      .execute();

    const subscription = subscriptionResult[0];

    // Create corresponding transaction
    await db.insert(transactionsTable)
      .values({
        subscription_id: subscription.id,
        transaction_date: startDate,
        amount: packageData.price,
        payment_status: 'pending'
      })
      .execute();

    return subscription;
  } catch (error) {
    console.error('Subscription creation failed:', error);
    throw error;
  }
};
