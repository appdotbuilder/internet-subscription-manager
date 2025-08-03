
import { db } from '../db';
import { membersTable } from '../db/schema';
import { type CreateMemberInput, type Member } from '../schema';

export const createMember = async (input: CreateMemberInput): Promise<Member> => {
  try {
    // Hash the password before storing
    const hashedPassword = await Bun.password.hash(input.password);

    // Insert member record
    const result = await db.insert(membersTable)
      .values({
        full_name: input.full_name,
        address: input.address,
        phone_number: input.phone_number,
        email: input.email,
        username: input.username,
        password: hashedPassword
      })
      .returning()
      .execute();

    // Return the created member
    const member = result[0];
    return member;
  } catch (error) {
    console.error('Member creation failed:', error);
    throw error;
  }
};
