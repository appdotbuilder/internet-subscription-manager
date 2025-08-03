
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { packagesTable } from '../db/schema';
import { type CreatePackageInput, type UpdatePackageInput } from '../schema';
import { updatePackage } from '../handlers/update_package';
import { eq } from 'drizzle-orm';

// Test inputs
const testPackageInput: CreatePackageInput = {
  name: 'Basic Package',
  speed: '10 Mbps',
  price: 29.99
};

const updateInput: UpdatePackageInput = {
  id: 1,
  name: 'Updated Package',
  speed: '50 Mbps',
  price: 49.99
};

const partialUpdateInput: UpdatePackageInput = {
  id: 1,
  name: 'Partially Updated Package'
};

describe('updatePackage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all provided fields', async () => {
    // Create a package first
    await db.insert(packagesTable)
      .values({
        name: testPackageInput.name,
        speed: testPackageInput.speed,
        price: testPackageInput.price.toString(),
        active_duration: 30
      })
      .execute();

    const result = await updatePackage(updateInput);

    // Verify all updated fields
    expect(result.id).toEqual(1);
    expect(result.name).toEqual('Updated Package');
    expect(result.speed).toEqual('50 Mbps');
    expect(result.price).toEqual(49.99);
    expect(typeof result.price).toEqual('number');
    expect(result.active_duration).toEqual(30);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update only provided fields and preserve others', async () => {
    // Create a package first
    await db.insert(packagesTable)
      .values({
        name: testPackageInput.name,
        speed: testPackageInput.speed,
        price: testPackageInput.price.toString(),
        active_duration: 30
      })
      .execute();

    const result = await updatePackage(partialUpdateInput);

    // Verify updated field
    expect(result.name).toEqual('Partially Updated Package');
    
    // Verify preserved fields
    expect(result.speed).toEqual('10 Mbps');
    expect(result.price).toEqual(29.99);
    expect(typeof result.price).toEqual('number');
    expect(result.active_duration).toEqual(30);
  });

  it('should save updated package to database', async () => {
    // Create a package first
    await db.insert(packagesTable)
      .values({
        name: testPackageInput.name,
        speed: testPackageInput.speed,
        price: testPackageInput.price.toString(),
        active_duration: 30
      })
      .execute();

    await updatePackage(updateInput);

    // Query database to verify changes
    const packages = await db.select()
      .from(packagesTable)
      .where(eq(packagesTable.id, 1))
      .execute();

    expect(packages).toHaveLength(1);
    expect(packages[0].name).toEqual('Updated Package');
    expect(packages[0].speed).toEqual('50 Mbps');
    expect(parseFloat(packages[0].price)).toEqual(49.99);
  });

  it('should throw error for non-existent package', async () => {
    const nonExistentUpdateInput: UpdatePackageInput = {
      id: 999,
      name: 'Non-existent Package'
    };

    await expect(updatePackage(nonExistentUpdateInput)).rejects.toThrow(/Package with id 999 not found/i);
  });

  it('should handle price-only updates correctly', async () => {
    // Create a package first
    await db.insert(packagesTable)
      .values({
        name: testPackageInput.name,
        speed: testPackageInput.speed,
        price: testPackageInput.price.toString(),
        active_duration: 30
      })
      .execute();

    const priceOnlyUpdate: UpdatePackageInput = {
      id: 1,
      price: 99.95
    };

    const result = await updatePackage(priceOnlyUpdate);

    // Verify price update and type conversion
    expect(result.price).toEqual(99.95);
    expect(typeof result.price).toEqual('number');
    
    // Verify other fields preserved
    expect(result.name).toEqual('Basic Package');
    expect(result.speed).toEqual('10 Mbps');
  });
});
