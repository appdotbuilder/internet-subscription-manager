
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { packagesTable, membersTable, subscriptionsTable, transactionsTable } from '../db/schema';
import { getTransactions } from '../handlers/get_transactions';

describe('getTransactions', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no transactions exist', async () => {
    const result = await getTransactions();
    expect(result).toEqual([]);
  });

  it('should fetch all transactions with related data', async () => {
    // Create prerequisite data
    const packageResult = await db.insert(packagesTable)
      .values({
        name: 'Test Package',
        speed: '100Mbps',
        price: '29.99'
      })
      .returning()
      .execute();

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

    const subscriptionResult = await db.insert(subscriptionsTable)
      .values({
        member_id: memberResult[0].id,
        package_id: packageResult[0].id,
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'active'
      })
      .returning()
      .execute();

    // Create transactions
    await db.insert(transactionsTable)
      .values([
        {
          subscription_id: subscriptionResult[0].id,
          amount: '29.99',
          payment_status: 'completed'
        },
        {
          subscription_id: subscriptionResult[0].id,
          amount: '15.50',
          payment_status: 'pending'
        }
      ])
      .execute();

    const result = await getTransactions();

    expect(result).toHaveLength(2);
    
    // Verify first transaction
    expect(result[0].subscription_id).toBe(subscriptionResult[0].id);
    expect(result[0].amount).toBe(29.99);
    expect(typeof result[0].amount).toBe('number');
    expect(result[0].payment_status).toBe('completed');
    expect(result[0].id).toBeDefined();
    expect(result[0].transaction_date).toBeInstanceOf(Date);
    expect(result[0].created_at).toBeInstanceOf(Date);

    // Verify second transaction
    expect(result[1].subscription_id).toBe(subscriptionResult[0].id);
    expect(result[1].amount).toBe(15.50);
    expect(typeof result[1].amount).toBe('number');
    expect(result[1].payment_status).toBe('pending');
    expect(result[1].id).toBeDefined();
    expect(result[1].transaction_date).toBeInstanceOf(Date);
    expect(result[1].created_at).toBeInstanceOf(Date);
  });

  it('should handle multiple members and packages', async () => {
    // Create multiple packages
    const packageResults = await db.insert(packagesTable)
      .values([
        {
          name: 'Basic Package',
          speed: '50Mbps',
          price: '19.99'
        },
        {
          name: 'Premium Package',
          speed: '200Mbps',
          price: '49.99'
        }
      ])
      .returning()
      .execute();

    // Create multiple members
    const memberResults = await db.insert(membersTable)
      .values([
        {
          full_name: 'Alice Smith',
          address: '456 Oak Ave',
          phone_number: '555-5678',
          email: 'alice@example.com',
          username: 'alicesmith',
          password: 'password456'
        },
        {
          full_name: 'Bob Johnson',
          address: '789 Pine St',
          phone_number: '555-9012',
          email: 'bob@example.com',
          username: 'bobjohnson',
          password: 'password789'
        }
      ])
      .returning()
      .execute();

    // Create subscriptions
    const subscriptionResults = await db.insert(subscriptionsTable)
      .values([
        {
          member_id: memberResults[0].id,
          package_id: packageResults[0].id,
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'active'
        },
        {
          member_id: memberResults[1].id,
          package_id: packageResults[1].id,
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'active'
        }
      ])
      .returning()
      .execute();

    // Create transactions for both subscriptions
    await db.insert(transactionsTable)
      .values([
        {
          subscription_id: subscriptionResults[0].id,
          amount: '19.99',
          payment_status: 'completed'
        },
        {
          subscription_id: subscriptionResults[1].id,
          amount: '49.99',
          payment_status: 'completed'
        }
      ])
      .execute();

    const result = await getTransactions();

    expect(result).toHaveLength(2);
    
    // Verify transactions are properly associated
    const amounts = result.map(t => t.amount).sort();
    expect(amounts).toEqual([19.99, 49.99]);
    
    result.forEach(transaction => {
      expect(transaction.payment_status).toBe('completed');
      expect(typeof transaction.amount).toBe('number');
      expect(transaction.subscription_id).toBeDefined();
    });
  });
});
