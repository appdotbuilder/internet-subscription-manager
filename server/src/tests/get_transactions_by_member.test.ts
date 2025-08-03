
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { membersTable, packagesTable, subscriptionsTable, transactionsTable } from '../db/schema';
import { type GetTransactionsByMemberInput } from '../schema';
import { getTransactionsByMember } from '../handlers/get_transactions_by_member';

describe('getTransactionsByMember', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return transactions for a specific member', async () => {
    // Create test member
    const memberResult = await db.insert(membersTable)
      .values({
        full_name: 'John Doe',
        address: '123 Main St',
        phone_number: '555-1234',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123'
      })
      .returning()
      .execute();
    const memberId = memberResult[0].id;

    // Create test package
    const packageResult = await db.insert(packagesTable)
      .values({
        name: 'Basic Plan',
        speed: '10 Mbps',
        price: '29.99'
      })
      .returning()
      .execute();
    const packageId = packageResult[0].id;

    // Create test subscription
    const subscriptionResult = await db.insert(subscriptionsTable)
      .values({
        member_id: memberId,
        package_id: packageId,
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'active'
      })
      .returning()
      .execute();
    const subscriptionId = subscriptionResult[0].id;

    // Create test transactions
    await db.insert(transactionsTable)
      .values([
        {
          subscription_id: subscriptionId,
          amount: '29.99',
          payment_status: 'completed'
        },
        {
          subscription_id: subscriptionId,
          amount: '19.99',
          payment_status: 'pending'
        }
      ])
      .execute();

    const input: GetTransactionsByMemberInput = {
      member_id: memberId
    };

    const result = await getTransactionsByMember(input);

    expect(result).toHaveLength(2);
    expect(result[0].amount).toEqual(29.99);
    expect(typeof result[0].amount).toBe('number');
    expect(result[0].payment_status).toEqual('completed');
    expect(result[0].subscription_id).toEqual(subscriptionId);
    expect(result[0].id).toBeDefined();
    expect(result[0].transaction_date).toBeInstanceOf(Date);
    expect(result[0].created_at).toBeInstanceOf(Date);

    expect(result[1].amount).toEqual(19.99);
    expect(typeof result[1].amount).toBe('number');
    expect(result[1].payment_status).toEqual('pending');
  });

  it('should return empty array for member with no transactions', async () => {
    // Create test member without any subscriptions/transactions
    const memberResult = await db.insert(membersTable)
      .values({
        full_name: 'Jane Doe',
        address: '456 Oak St',
        phone_number: '555-5678',
        email: 'jane@example.com',
        username: 'janedoe',
        password: 'password123'
      })
      .returning()
      .execute();
    const memberId = memberResult[0].id;

    const input: GetTransactionsByMemberInput = {
      member_id: memberId
    };

    const result = await getTransactionsByMember(input);

    expect(result).toHaveLength(0);
  });

  it('should only return transactions for the specified member', async () => {
    // Create two test members
    const member1Result = await db.insert(membersTable)
      .values({
        full_name: 'Member One',
        address: '123 First St',
        phone_number: '555-0001',
        email: 'member1@example.com',
        username: 'member1',
        password: 'password123'
      })
      .returning()
      .execute();
    const member1Id = member1Result[0].id;

    const member2Result = await db.insert(membersTable)
      .values({
        full_name: 'Member Two',
        address: '456 Second St',
        phone_number: '555-0002',
        email: 'member2@example.com',
        username: 'member2',
        password: 'password123'
      })
      .returning()
      .execute();
    const member2Id = member2Result[0].id;

    // Create test package
    const packageResult = await db.insert(packagesTable)
      .values({
        name: 'Basic Plan',
        speed: '10 Mbps',
        price: '29.99'
      })
      .returning()
      .execute();
    const packageId = packageResult[0].id;

    // Create subscriptions for both members
    const subscription1Result = await db.insert(subscriptionsTable)
      .values({
        member_id: member1Id,
        package_id: packageId,
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active'
      })
      .returning()
      .execute();
    const subscription1Id = subscription1Result[0].id;

    const subscription2Result = await db.insert(subscriptionsTable)
      .values({
        member_id: member2Id,
        package_id: packageId,
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active'
      })
      .returning()
      .execute();
    const subscription2Id = subscription2Result[0].id;

    // Create transactions for both members
    await db.insert(transactionsTable)
      .values([
        {
          subscription_id: subscription1Id,
          amount: '29.99',
          payment_status: 'completed'
        },
        {
          subscription_id: subscription2Id,
          amount: '39.99',
          payment_status: 'completed'
        }
      ])
      .execute();

    const input: GetTransactionsByMemberInput = {
      member_id: member1Id
    };

    const result = await getTransactionsByMember(input);

    expect(result).toHaveLength(1);
    expect(result[0].subscription_id).toEqual(subscription1Id);
    expect(result[0].amount).toEqual(29.99);
  });
});
