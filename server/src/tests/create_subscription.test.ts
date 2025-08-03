
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { subscriptionsTable, transactionsTable, packagesTable, membersTable } from '../db/schema';
import { type CreateSubscriptionInput } from '../schema';
import { createSubscription } from '../handlers/create_subscription';
import { eq } from 'drizzle-orm';

describe('createSubscription', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a subscription with active status', async () => {
    // Create test package
    const packageResult = await db.insert(packagesTable)
      .values({
        name: 'Basic Plan',
        speed: '10 Mbps',
        price: '29.99',
        active_duration: 30
      })
      .returning()
      .execute();
    const testPackage = packageResult[0];

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
    const testMember = memberResult[0];

    const testInput: CreateSubscriptionInput = {
      member_id: testMember.id,
      package_id: testPackage.id
    };

    const result = await createSubscription(testInput);

    // Basic field validation
    expect(result.member_id).toEqual(testMember.id);
    expect(result.package_id).toEqual(testPackage.id);
    expect(result.status).toEqual('active');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.start_date).toBeInstanceOf(Date);
    expect(result.end_date).toBeInstanceOf(Date);

    // Verify end_date is 30 days after start_date
    const daysDiff = Math.floor((result.end_date.getTime() - result.start_date.getTime()) / (1000 * 60 * 60 * 24));
    expect(daysDiff).toEqual(30);
  });

  it('should save subscription to database', async () => {
    // Create test package
    const packageResult = await db.insert(packagesTable)
      .values({
        name: 'Basic Plan',
        speed: '10 Mbps',
        price: '29.99',
        active_duration: 30
      })
      .returning()
      .execute();
    const testPackage = packageResult[0];

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
    const testMember = memberResult[0];

    const testInput: CreateSubscriptionInput = {
      member_id: testMember.id,
      package_id: testPackage.id
    };

    const result = await createSubscription(testInput);

    // Query subscription from database
    const subscriptions = await db.select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.id, result.id))
      .execute();

    expect(subscriptions).toHaveLength(1);
    expect(subscriptions[0].member_id).toEqual(testMember.id);
    expect(subscriptions[0].package_id).toEqual(testPackage.id);
    expect(subscriptions[0].status).toEqual('active');
    expect(subscriptions[0].created_at).toBeInstanceOf(Date);
  });

  it('should create corresponding transaction record', async () => {
    // Create test package
    const packageResult = await db.insert(packagesTable)
      .values({
        name: 'Premium Plan',
        speed: '100 Mbps',
        price: '59.99',
        active_duration: 30
      })
      .returning()
      .execute();
    const testPackage = packageResult[0];

    // Create test member
    const memberResult = await db.insert(membersTable)
      .values({
        full_name: 'Jane Smith',
        address: '456 Oak Ave',
        phone_number: '555-0456',
        email: 'jane@example.com',
        username: 'janesmith',
        password: 'password456'
      })
      .returning()
      .execute();
    const testMember = memberResult[0];

    const testInput: CreateSubscriptionInput = {
      member_id: testMember.id,
      package_id: testPackage.id
    };

    const result = await createSubscription(testInput);

    // Query transaction from database
    const transactions = await db.select()
      .from(transactionsTable)
      .where(eq(transactionsTable.subscription_id, result.id))
      .execute();

    expect(transactions).toHaveLength(1);
    expect(transactions[0].subscription_id).toEqual(result.id);
    expect(parseFloat(transactions[0].amount)).toEqual(59.99);
    expect(transactions[0].payment_status).toEqual('pending');
    expect(transactions[0].transaction_date).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent member', async () => {
    // Create test package
    const packageResult = await db.insert(packagesTable)
      .values({
        name: 'Basic Plan',
        speed: '10 Mbps',
        price: '29.99',
        active_duration: 30
      })
      .returning()
      .execute();
    const testPackage = packageResult[0];

    const testInput: CreateSubscriptionInput = {
      member_id: 99999, // Non-existent member ID
      package_id: testPackage.id
    };

    expect(createSubscription(testInput)).rejects.toThrow(/member not found/i);
  });

  it('should throw error for non-existent package', async () => {
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
    const testMember = memberResult[0];

    const testInput: CreateSubscriptionInput = {
      member_id: testMember.id,
      package_id: 99999 // Non-existent package ID
    };

    expect(createSubscription(testInput)).rejects.toThrow(/package not found/i);
  });

  it('should use package active_duration for end_date calculation', async () => {
    // Create test package with custom duration
    const packageResult = await db.insert(packagesTable)
      .values({
        name: 'Extended Plan',
        speed: '50 Mbps',
        price: '39.99',
        active_duration: 90 // 90 days instead of default 30
      })
      .returning()
      .execute();
    const testPackage = packageResult[0];

    // Create test member
    const memberResult = await db.insert(membersTable)
      .values({
        full_name: 'Bob Wilson',
        address: '789 Pine St',
        phone_number: '555-0789',
        email: 'bob@example.com',
        username: 'bobwilson',
        password: 'password789'
      })
      .returning()
      .execute();
    const testMember = memberResult[0];

    const testInput: CreateSubscriptionInput = {
      member_id: testMember.id,
      package_id: testPackage.id
    };

    const result = await createSubscription(testInput);

    // Verify end_date is 90 days after start_date
    const daysDiff = Math.floor((result.end_date.getTime() - result.start_date.getTime()) / (1000 * 60 * 60 * 24));
    expect(daysDiff).toEqual(90);
  });
});
