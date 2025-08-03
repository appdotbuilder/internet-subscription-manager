
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { packagesTable, membersTable, subscriptionsTable } from '../db/schema';
import { type DeletePackageInput, type CreatePackageInput, type CreateMemberInput, type CreateSubscriptionInput } from '../schema';
import { deletePackage } from '../handlers/delete_package';
import { eq } from 'drizzle-orm';

// Test data
const testPackageInput: CreatePackageInput = {
  name: 'Test Package',
  speed: '100Mbps',
  price: 29.99
};

const testMemberInput: CreateMemberInput = {
  full_name: 'Test Member',
  address: '123 Test St',
  phone_number: '+1234567890',
  email: 'test@example.com',
  username: 'testuser',
  password: 'password123'
};

describe('deletePackage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing package', async () => {
    // Create a package to delete
    const packageResult = await db.insert(packagesTable)
      .values({
        name: testPackageInput.name,
        speed: testPackageInput.speed,
        price: testPackageInput.price.toString()
      })
      .returning()
      .execute();

    const packageId = packageResult[0].id;
    const deleteInput: DeletePackageInput = { id: packageId };

    // Delete the package
    const result = await deletePackage(deleteInput);

    expect(result.success).toBe(true);

    // Verify package was deleted from database
    const packages = await db.select()
      .from(packagesTable)
      .where(eq(packagesTable.id, packageId))
      .execute();

    expect(packages).toHaveLength(0);
  });

  it('should throw error for non-existent package', async () => {
    const deleteInput: DeletePackageInput = { id: 999 };

    await expect(deletePackage(deleteInput)).rejects.toThrow(/Package with id 999 not found/i);
  });

  it('should prevent deletion if package has active subscriptions', async () => {
    // Create a member first
    const memberResult = await db.insert(membersTable)
      .values({
        full_name: testMemberInput.full_name,
        address: testMemberInput.address,
        phone_number: testMemberInput.phone_number,
        email: testMemberInput.email,
        username: testMemberInput.username,
        password: testMemberInput.password
      })
      .returning()
      .execute();

    // Create a package
    const packageResult = await db.insert(packagesTable)
      .values({
        name: testPackageInput.name,
        speed: testPackageInput.speed,
        price: testPackageInput.price.toString()
      })
      .returning()
      .execute();

    // Create a subscription linking member and package
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    await db.insert(subscriptionsTable)
      .values({
        member_id: memberResult[0].id,
        package_id: packageResult[0].id,
        end_date: endDate,
        status: 'active'
      })
      .execute();

    const deleteInput: DeletePackageInput = { id: packageResult[0].id };

    // Attempt to delete package should fail
    await expect(deletePackage(deleteInput)).rejects.toThrow(/Cannot delete package that is referenced by existing subscriptions/i);

    // Verify package still exists in database
    const packages = await db.select()
      .from(packagesTable)
      .where(eq(packagesTable.id, packageResult[0].id))
      .execute();

    expect(packages).toHaveLength(1);
  });

  it('should allow deletion after all subscriptions are removed', async () => {
    // Create a member first
    const memberResult = await db.insert(membersTable)
      .values({
        full_name: testMemberInput.full_name,
        address: testMemberInput.address,
        phone_number: testMemberInput.phone_number,
        email: testMemberInput.email,
        username: testMemberInput.username,
        password: testMemberInput.password
      })
      .returning()
      .execute();

    // Create a package
    const packageResult = await db.insert(packagesTable)
      .values({
        name: testPackageInput.name,
        speed: testPackageInput.speed,
        price: testPackageInput.price.toString()
      })
      .returning()
      .execute();

    // Create a subscription
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const subscriptionResult = await db.insert(subscriptionsTable)
      .values({
        member_id: memberResult[0].id,
        package_id: packageResult[0].id,
        end_date: endDate,
        status: 'active'
      })
      .returning()
      .execute();

    // Remove the subscription
    await db.delete(subscriptionsTable)
      .where(eq(subscriptionsTable.id, subscriptionResult[0].id))
      .execute();

    const deleteInput: DeletePackageInput = { id: packageResult[0].id };

    // Now deletion should succeed
    const result = await deletePackage(deleteInput);

    expect(result.success).toBe(true);

    // Verify package was deleted
    const packages = await db.select()
      .from(packagesTable)
      .where(eq(packagesTable.id, packageResult[0].id))
      .execute();

    expect(packages).toHaveLength(0);
  });
});
