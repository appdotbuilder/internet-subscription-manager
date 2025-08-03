
import { db } from '../db';
import { membersTable } from '../db/schema';
import { type UpdateMemberInput, type Member } from '../schema';
import { eq } from 'drizzle-orm';

export const updateMember = async (input: UpdateMemberInput): Promise<Member> => {
  try {
    // First check if member exists
    const existingMember = await db.select()
      .from(membersTable)
      .where(eq(membersTable.id, input.id))
      .execute();

    if (existingMember.length === 0) {
      throw new Error('Member not found');
    }

    // Build update object with only provided fields
    const updateData: Partial<typeof membersTable.$inferInsert> = {};
    
    if (input.full_name !== undefined) updateData.full_name = input.full_name;
    if (input.address !== undefined) updateData.address = input.address;
    if (input.phone_number !== undefined) updateData.phone_number = input.phone_number;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.username !== undefined) updateData.username = input.username;
    if (input.password !== undefined) updateData.password = input.password;

    // Update member record
    const result = await db.update(membersTable)
      .set(updateData)
      .where(eq(membersTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Member update failed:', error);
    throw error;
  }
};
