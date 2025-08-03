
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { membersTable, packagesTable, subscriptionsTable } from '../db/schema';
import { type DeleteMemberInput, type CreateMemberInput } from '../schema';
import { deleteMember } from '../handlers/delete_member';
import { eq } from 'drizzle-orm';

// Test input
const testMemberInput: CreateMemberInput = {
  full_name: 'Test Member',
  address: '123 Test Street',
  phone_number: '1234567890',
  email: 'test@example.com',
  username: 'testuser',
  password: 'password123'
};

describe('deleteMember', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a member successfully', async () => {
    // Create a member first
    const memberResult = await db.insert(membersTable)
      .values(testMemberInput)
      .returning()
      .execute();

    const memberId = memberResult[0].id;
    const deleteInput: DeleteMemberInput = { id: memberId };

    // Delete the member
    const result = await deleteMember(deleteInput);

    expect(result.success).toBe(true);

    // Verify member is deleted from database
    const members = await db.select()
      .from(membersTable)
      .where(eq(membersTable.id, memberId))
      .execute();

    expect(members).toHaveLength(0);
  });

  it('should throw error when member not found', async () => {
    const deleteInput: DeleteMemberInput = { id: 999 };

    await expect(deleteMember(deleteInput)).rejects.toThrow(/member not found/i);
  });

  it('should prevent deletion of member with active subscriptions', async () => {
    // Create prerequisite data: package first
    const packageResult = await db.insert(packagesTable)
      .values({
        name: 'Basic Package',
        speed: '10Mbps',
        price: '29.99'
      })
      .returning()
      .execute();

    const packageId = packageResult[0].id;

    // Create member
    const memberResult = await db.insert(membersTable)
      .values(testMemberInput)
      .returning()
      .execute();

    const memberId = memberResult[0].id;

    // Create active subscription
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    await db.insert(subscriptionsTable)
      .values({
        member_id: memberId,
        package_id: packageId,
        end_date: endDate,
        status: 'active'
      })
      .execute();

    const deleteInput: DeleteMemberInput = { id: memberId };

    // Attempt to delete member with active subscription
    await expect(deleteMember(deleteInput)).rejects.toThrow(/cannot delete member with active subscriptions/i);

    // Verify member still exists
    const members = await db.select()
      .from(membersTable)
      .where(eq(membersTable.id, memberId))
      .execute();

    expect(members).toHaveLength(1);
  });

  it('should allow deletion of member with expired subscriptions', async () => {
    // Create prerequisite data: package first
    const packageResult = await db.insert(packagesTable)
      .values({
        name: 'Basic Package',
        speed: '10Mbps',
        price: '29.99'
      })
      .returning()
      .execute();

    const packageId = packageResult[0].id;

    // Create member
    const memberResult = await db.insert(membersTable)
      .values(testMemberInput)
      .returning()
      .execute();

    const memberId = memberResult[0].id;

    // Create expired subscription
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 30);

    await db.insert(subscriptionsTable)
      .values({
        member_id: memberId,
        package_id: packageId,
        end_date: pastDate,
        status: 'expired'
      })
      .execute();

    const deleteInput: DeleteMemberInput = { id: memberId };

    // Should successfully delete member with expired subscription
    const result = await deleteMember(deleteInput);

    expect(result.success).toBe(true);

    // Verify member is deleted
    const members = await db.select()
      .from(membersTable)
      .where(eq(membersTable.id, memberId))
      .execute();

    expect(members).toHaveLength(0);

    // Verify expired subscriptions are also deleted
    const subscriptions = await db.select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.member_id, memberId))
      .execute();

    expect(subscriptions).toHaveLength(0);
  });
});
