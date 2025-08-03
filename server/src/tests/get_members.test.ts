
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { membersTable } from '../db/schema';
import { type CreateMemberInput } from '../schema';
import { getMembers } from '../handlers/get_members';

// Test data
const testMember1: CreateMemberInput = {
  full_name: 'John Doe',
  address: '123 Main St',
  phone_number: '+1234567890',
  email: 'john@example.com',
  username: 'johndoe',
  password: 'password123'
};

const testMember2: CreateMemberInput = {
  full_name: 'Jane Smith',
  address: '456 Oak Ave',
  phone_number: '+0987654321',
  email: 'jane@example.com',
  username: 'janesmith',
  password: 'password456'
};

describe('getMembers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no members exist', async () => {
    const result = await getMembers();
    expect(result).toEqual([]);
  });

  it('should return all members', async () => {
    // Create test members
    await db.insert(membersTable)
      .values([testMember1, testMember2])
      .execute();

    const result = await getMembers();

    expect(result).toHaveLength(2);
    
    // Verify first member
    const member1 = result.find(m => m.username === 'johndoe');
    expect(member1).toBeDefined();
    expect(member1!.full_name).toEqual('John Doe');
    expect(member1!.address).toEqual('123 Main St');
    expect(member1!.phone_number).toEqual('+1234567890');
    expect(member1!.email).toEqual('john@example.com');
    expect(member1!.password).toEqual('password123');
    expect(member1!.id).toBeDefined();
    expect(member1!.created_at).toBeInstanceOf(Date);

    // Verify second member
    const member2 = result.find(m => m.username === 'janesmith');
    expect(member2).toBeDefined();
    expect(member2!.full_name).toEqual('Jane Smith');
    expect(member2!.address).toEqual('456 Oak Ave');
    expect(member2!.phone_number).toEqual('+0987654321');
    expect(member2!.email).toEqual('jane@example.com');
    expect(member2!.password).toEqual('password456');
    expect(member2!.id).toBeDefined();
    expect(member2!.created_at).toBeInstanceOf(Date);
  });

  it('should return members in database order', async () => {
    // Create members in specific order
    const member1Result = await db.insert(membersTable)
      .values(testMember1)
      .returning()
      .execute();

    const member2Result = await db.insert(membersTable)
      .values(testMember2)
      .returning()
      .execute();

    const result = await getMembers();

    expect(result).toHaveLength(2);
    expect(result[0].id).toEqual(member1Result[0].id);
    expect(result[1].id).toEqual(member2Result[0].id);
  });

  it('should include all member fields', async () => {
    await db.insert(membersTable)
      .values(testMember1)
      .execute();

    const result = await getMembers();
    const member = result[0];

    // Verify all expected fields are present
    expect(member).toHaveProperty('id');
    expect(member).toHaveProperty('full_name');
    expect(member).toHaveProperty('address');
    expect(member).toHaveProperty('phone_number');
    expect(member).toHaveProperty('email');
    expect(member).toHaveProperty('username');
    expect(member).toHaveProperty('password');
    expect(member).toHaveProperty('created_at');
  });
});
