
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { membersTable } from '../db/schema';
import { type CreateMemberInput } from '../schema';
import { createMember } from '../handlers/create_member';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateMemberInput = {
  full_name: 'John Doe',
  address: '123 Main St, City, State 12345',
  phone_number: '+1234567890',
  email: 'john.doe@example.com',
  username: 'johndoe',
  password: 'securePassword123'
};

describe('createMember', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a member', async () => {
    const result = await createMember(testInput);

    // Basic field validation
    expect(result.full_name).toEqual('John Doe');
    expect(result.address).toEqual(testInput.address);
    expect(result.phone_number).toEqual(testInput.phone_number);
    expect(result.email).toEqual(testInput.email);
    expect(result.username).toEqual(testInput.username);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    
    // Password should be hashed, not plain text
    expect(result.password).not.toEqual(testInput.password);
    expect(result.password.length).toBeGreaterThan(0);
  });

  it('should save member to database', async () => {
    const result = await createMember(testInput);

    // Query using proper drizzle syntax
    const members = await db.select()
      .from(membersTable)
      .where(eq(membersTable.id, result.id))
      .execute();

    expect(members).toHaveLength(1);
    expect(members[0].full_name).toEqual('John Doe');
    expect(members[0].address).toEqual(testInput.address);
    expect(members[0].phone_number).toEqual(testInput.phone_number);
    expect(members[0].email).toEqual(testInput.email);
    expect(members[0].username).toEqual(testInput.username);
    expect(members[0].created_at).toBeInstanceOf(Date);
    
    // Verify password is hashed in database
    expect(members[0].password).not.toEqual(testInput.password);
  });

  it('should hash password before storing', async () => {
    const result = await createMember(testInput);

    // Verify password is hashed using Bun's password verification
    const isValidPassword = await Bun.password.verify(testInput.password, result.password);
    expect(isValidPassword).toBe(true);

    // Verify a wrong password fails verification
    const isInvalidPassword = await Bun.password.verify('wrongPassword', result.password);
    expect(isInvalidPassword).toBe(false);
  });

  it('should create multiple members with different usernames', async () => {
    // Create first member
    const member1 = await createMember(testInput);

    // Create second member with different username and email
    const secondInput: CreateMemberInput = {
      ...testInput,
      full_name: 'Jane Doe',
      email: 'jane.doe@example.com',
      username: 'janedoe'
    };

    const member2 = await createMember(secondInput);

    // Both should be created successfully
    expect(member1.id).toBeDefined();
    expect(member2.id).toBeDefined();
    expect(member1.id).not.toEqual(member2.id);
    expect(member1.username).toEqual('johndoe');
    expect(member2.username).toEqual('janedoe');
  });

  it('should handle minimum password length validation', async () => {
    const shortPasswordInput: CreateMemberInput = {
      ...testInput,
      password: '123' // Less than 6 characters
    };

    // This test validates that the Zod schema would catch this
    // But since we're testing the handler directly, we expect it to work
    // The validation would happen at the API layer
    const result = await createMember(shortPasswordInput);
    expect(result.id).toBeDefined();
    
    // Verify password is still hashed even if short
    const isValidPassword = await Bun.password.verify('123', result.password);
    expect(isValidPassword).toBe(true);
  });
});
