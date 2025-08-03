
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { membersTable } from '../db/schema';
import { type UpdateMemberInput, type CreateMemberInput } from '../schema';
import { updateMember } from '../handlers/update_member';
import { eq } from 'drizzle-orm';

// Test member input
const testMemberInput: CreateMemberInput = {
  full_name: 'John Doe',
  address: '123 Main St',
  phone_number: '555-1234',
  email: 'john@example.com',
  username: 'johndoe',
  password: 'password123'
};

describe('updateMember', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a member with all fields', async () => {
    // Create a member first
    const createdMember = await db.insert(membersTable)
      .values(testMemberInput)
      .returning()
      .execute();

    const memberId = createdMember[0].id;

    const updateInput: UpdateMemberInput = {
      id: memberId,
      full_name: 'Jane Smith',
      address: '456 Oak Ave',
      phone_number: '555-5678',
      email: 'jane@example.com',
      username: 'janesmith',
      password: 'newpassword456'
    };

    const result = await updateMember(updateInput);

    expect(result.id).toEqual(memberId);
    expect(result.full_name).toEqual('Jane Smith');
    expect(result.address).toEqual('456 Oak Ave');
    expect(result.phone_number).toEqual('555-5678');
    expect(result.email).toEqual('jane@example.com');
    expect(result.username).toEqual('janesmith');
    expect(result.password).toEqual('newpassword456');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update only specified fields', async () => {
    // Create a member first
    const createdMember = await db.insert(membersTable)
      .values(testMemberInput)
      .returning()
      .execute();

    const memberId = createdMember[0].id;
    const originalCreatedAt = createdMember[0].created_at;

    const updateInput: UpdateMemberInput = {
      id: memberId,
      full_name: 'Jane Smith',
      email: 'jane@example.com'
    };

    const result = await updateMember(updateInput);

    // Updated fields
    expect(result.full_name).toEqual('Jane Smith');
    expect(result.email).toEqual('jane@example.com');

    // Unchanged fields
    expect(result.address).toEqual(testMemberInput.address);
    expect(result.phone_number).toEqual(testMemberInput.phone_number);
    expect(result.username).toEqual(testMemberInput.username);
    expect(result.password).toEqual(testMemberInput.password);
    expect(result.created_at).toEqual(originalCreatedAt);
  });

  it('should save updated member to database', async () => {
    // Create a member first
    const createdMember = await db.insert(membersTable)
      .values(testMemberInput)
      .returning()
      .execute();

    const memberId = createdMember[0].id;

    const updateInput: UpdateMemberInput = {
      id: memberId,
      full_name: 'Updated Name',
      email: 'updated@example.com'
    };

    await updateMember(updateInput);

    // Verify the update was saved to database
    const members = await db.select()
      .from(membersTable)
      .where(eq(membersTable.id, memberId))
      .execute();

    expect(members).toHaveLength(1);
    expect(members[0].full_name).toEqual('Updated Name');
    expect(members[0].email).toEqual('updated@example.com');
    expect(members[0].address).toEqual(testMemberInput.address);
    expect(members[0].phone_number).toEqual(testMemberInput.phone_number);
  });

  it('should throw error when member does not exist', async () => {
    const updateInput: UpdateMemberInput = {
      id: 999, // Non-existent ID
      full_name: 'Some Name'
    };

    await expect(updateMember(updateInput)).rejects.toThrow(/member not found/i);
  });

  it('should handle password update', async () => {
    // Create a member first
    const createdMember = await db.insert(membersTable)
      .values(testMemberInput)
      .returning()
      .execute();

    const memberId = createdMember[0].id;

    const updateInput: UpdateMemberInput = {
      id: memberId,
      password: 'newsecurepassword'
    };

    const result = await updateMember(updateInput);

    expect(result.password).toEqual('newsecurepassword');
    
    // Verify other fields remain unchanged
    expect(result.full_name).toEqual(testMemberInput.full_name);
    expect(result.email).toEqual(testMemberInput.email);
    expect(result.username).toEqual(testMemberInput.username);
  });
});
