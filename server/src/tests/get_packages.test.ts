
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { packagesTable } from '../db/schema';
import { getPackages } from '../handlers/get_packages';

describe('getPackages', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no packages exist', async () => {
    const result = await getPackages();
    expect(result).toEqual([]);
  });

  it('should return all packages with correct data types', async () => {
    // Create test packages
    await db.insert(packagesTable).values([
      {
        name: 'Basic Package',
        speed: '10 Mbps',
        price: '29.99'
      },
      {
        name: 'Premium Package',
        speed: '100 Mbps',
        price: '59.99'
      }
    ]).execute();

    const result = await getPackages();

    expect(result).toHaveLength(2);
    
    // Verify first package
    expect(result[0].name).toEqual('Basic Package');
    expect(result[0].speed).toEqual('10 Mbps');
    expect(result[0].price).toEqual(29.99);
    expect(typeof result[0].price).toEqual('number');
    expect(result[0].active_duration).toEqual(30); // Default value
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);

    // Verify second package
    expect(result[1].name).toEqual('Premium Package');
    expect(result[1].speed).toEqual('100 Mbps');
    expect(result[1].price).toEqual(59.99);
    expect(typeof result[1].price).toEqual('number');
    expect(result[1].active_duration).toEqual(30); // Default value
    expect(result[1].id).toBeDefined();
    expect(result[1].created_at).toBeInstanceOf(Date);
  });

  it('should return packages in creation order', async () => {
    // Create packages with slight delay to ensure different timestamps
    await db.insert(packagesTable).values({
      name: 'First Package',
      speed: '5 Mbps',
      price: '19.99'
    }).execute();

    await db.insert(packagesTable).values({
      name: 'Second Package',
      speed: '25 Mbps',
      price: '39.99'
    }).execute();

    const result = await getPackages();

    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual('First Package');
    expect(result[1].name).toEqual('Second Package');
    expect(result[0].created_at <= result[1].created_at).toBe(true);
  });
});
