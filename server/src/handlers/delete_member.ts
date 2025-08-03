
import { db } from '../db';
import { membersTable, subscriptionsTable } from '../db/schema';
import { type DeleteMemberInput } from '../schema';
import { eq, and } from 'drizzle-orm';

export const deleteMember = async (input: DeleteMemberInput): Promise<{ success: boolean }> => {
  try {
    // First check if member exists
    const existingMember = await db.select()
      .from(membersTable)
      .where(eq(membersTable.id, input.id))
      .execute();

    if (existingMember.length === 0) {
      throw new Error('Member not found');
    }

    // Check if member has any active subscriptions
    const activeSubscriptions = await db.select()
      .from(subscriptionsTable)
      .where(
        and(
          eq(subscriptionsTable.member_id, input.id),
          eq(subscriptionsTable.status, 'active')
        )
      )
      .execute();

    if (activeSubscriptions.length > 0) {
      throw new Error('Cannot delete member with active subscriptions');
    }

    // Delete all subscriptions first (expired ones)
    await db.delete(subscriptionsTable)
      .where(eq(subscriptionsTable.member_id, input.id))
      .execute();

    // Now delete the member
    await db.delete(membersTable)
      .where(eq(membersTable.id, input.id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Member deletion failed:', error);
    throw error;
  }
};
