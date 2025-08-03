
import { db } from '../db';
import { membersTable } from '../db/schema';
import { type Member } from '../schema';

export const getMembers = async (): Promise<Member[]> => {
  try {
    const results = await db.select()
      .from(membersTable)
      .execute();

    // Return members with all fields included
    // Note: In a real application, passwords should be excluded for security
    // but the schema type includes password, so we return complete records
    return results;
  } catch (error) {
    console.error('Failed to fetch members:', error);
    throw error;
  }
};
