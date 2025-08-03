
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { packagesTable, membersTable, subscriptionsTable } from '../db/schema';
import { getSubscriptions } from '../handlers/get_subscriptions';

describe('getSubscriptions', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no subscriptions exist', async () => {
    const result = await getSubscriptions();
    expect(result).toEqual([]);
  });

  it('should return all subscriptions', async () => {
    // Create test package
    const packageResult = await db.insert(packagesTable)
      .values({
        name: 'Basic Plan',
        speed: '100Mbps',
        price: '29.99'
      })
      .returning()
      .execute();

    // Create test member
    const memberResult = await db.insert(membersTable)
      .values({
        full_name: 'John Doe',
        address: '123 Main St',
        phone_number: '555-0123',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123'
      })
      .returning()
      .execute();

    // Create test subscription with specific dates
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    
    await db.insert(subscriptionsTable)
      .values({
        member_id: memberResult[0].id,
        package_id: packageResult[0].id,
        start_date: startDate,
        end_date: endDate,
        status: 'active'
      })
      .execute();

    const result = await getSubscriptions();

    expect(result).toHaveLength(1);
    expect(result[0].member_id).toEqual(memberResult[0].id);
    expect(result[0].package_id).toEqual(packageResult[0].id);
    expect(result[0].status).toEqual('active');
    expect(result[0].start_date).toBeInstanceOf(Date);
    expect(result[0].end_date).toBeInstanceOf(Date);
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].id).toBeDefined();
  });

  it('should return multiple subscriptions', async () => {
    // Create test package
    const packageResult = await db.insert(packagesTable)
      .values({
        name: 'Premium Plan',
        speed: '500Mbps',
        price: '59.99'
      })
      .returning()
      .execute();

    // Create test members
    const member1Result = await db.insert(membersTable)
      .values({
        full_name: 'Alice Smith',
        address: '456 Oak Ave',
        phone_number: '555-0456',
        email: 'alice@example.com',
        username: 'alicesmith',
        password: 'password123'
      })
      .returning()
      .execute();

    const member2Result = await db.insert(membersTable)
      .values({
        full_name: 'Bob Johnson',
        address: '789 Pine St',
        phone_number: '555-0789',
        email: 'bob@example.com',
        username: 'bobjohnson',
        password: 'password123'
      })
      .returning()
      .execute();

    // Create multiple subscriptions
    await db.insert(subscriptionsTable)
      .values([
        {
          member_id: member1Result[0].id,
          package_id: packageResult[0].id,
          start_date: new Date('2024-01-01'),
          end_date: new Date('2024-01-31'),
          status: 'active'
        },
        {
          member_id: member2Result[0].id,
          package_id: packageResult[0].id,
          start_date: new Date('2024-02-01'),
          end_date: new Date('2024-02-29'),
          status: 'expired'
        }
      ])
      .execute();

    const result = await getSubscriptions();

    expect(result).toHaveLength(2);
    
    // Check that both subscriptions are returned
    const memberIds = result.map(sub => sub.member_id);
    expect(memberIds).toContain(member1Result[0].id);
    expect(memberIds).toContain(member2Result[0].id);
    
    // Check that both statuses are returned
    const statuses = result.map(sub => sub.status);
    expect(statuses).toContain('active');
    expect(statuses).toContain('expired');
  });

  it('should handle subscriptions with different statuses', async () => {
    // Create test package
    const packageResult = await db.insert(packagesTable)
      .values({
        name: 'Standard Plan',
        speed: '200Mbps',
        price: '39.99'
      })
      .returning()
      .execute();

    // Create test member
    const memberResult = await db.insert(membersTable)
      .values({
        full_name: 'Test User',
        address: '321 Test St',
        phone_number: '555-1234',
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      })
      .returning()
      .execute();

    // Create subscription with expired status
    await db.insert(subscriptionsTable)
      .values({
        member_id: memberResult[0].id,
        package_id: packageResult[0].id,
        start_date: new Date('2023-12-01'),
        end_date: new Date('2023-12-31'),
        status: 'expired'
      })
      .execute();

    const result = await getSubscriptions();

    expect(result).toHaveLength(1);
    expect(result[0].status).toEqual('expired');
    expect(result[0].member_id).toEqual(memberResult[0].id);
    expect(result[0].package_id).toEqual(packageResult[0].id);
  });
});
