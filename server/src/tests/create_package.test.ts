
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { packagesTable } from '../db/schema';
import { type CreatePackageInput } from '../schema';
import { createPackage } from '../handlers/create_package';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreatePackageInput = {
  name: 'Premium Package',
  speed: '100 Mbps',
  price: 49.99
};

describe('createPackage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a package with correct data', async () => {
    const result = await createPackage(testInput);

    // Basic field validation
    expect(result.name).toEqual('Premium Package');
    expect(result.speed).toEqual('100 Mbps');
    expect(result.price).toEqual(49.99);
    expect(typeof result.price).toEqual('number');
    expect(result.active_duration).toEqual(30); // Fixed duration
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save package to database', async () => {
    const result = await createPackage(testInput);

    // Query the database to verify persistence
    const packages = await db.select()
      .from(packagesTable)
      .where(eq(packagesTable.id, result.id))
      .execute();

    expect(packages).toHaveLength(1);
    expect(packages[0].name).toEqual('Premium Package');
    expect(packages[0].speed).toEqual('100 Mbps');
    expect(parseFloat(packages[0].price)).toEqual(49.99);
    expect(packages[0].active_duration).toEqual(30);
    expect(packages[0].created_at).toBeInstanceOf(Date);
  });

  it('should always set active_duration to 30 days', async () => {
    const result = await createPackage(testInput);

    expect(result.active_duration).toEqual(30);

    // Verify in database as well
    const packages = await db.select()
      .from(packagesTable)
      .where(eq(packagesTable.id, result.id))
      .execute();

    expect(packages[0].active_duration).toEqual(30);
  });

  it('should handle different price values correctly', async () => {
    const highPriceInput: CreatePackageInput = {
      name: 'Enterprise Package',
      speed: '1 Gbps',
      price: 199.95
    };

    const result = await createPackage(highPriceInput);

    expect(result.price).toEqual(199.95);
    expect(typeof result.price).toEqual('number');

    // Verify numeric conversion works correctly in database
    const packages = await db.select()
      .from(packagesTable)
      .where(eq(packagesTable.id, result.id))
      .execute();

    expect(parseFloat(packages[0].price)).toEqual(199.95);
  });
});
