
import { db } from '../db';
import { packagesTable, subscriptionsTable } from '../db/schema';
import { type DeletePackageInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deletePackage = async (input: DeletePackageInput): Promise<{ success: boolean }> => {
  try {
    // First, check if package exists
    const existingPackage = await db.select()
      .from(packagesTable)
      .where(eq(packagesTable.id, input.id))
      .execute();

    if (existingPackage.length === 0) {
      throw new Error(`Package with id ${input.id} not found`);
    }

    // Check if package is referenced by any subscriptions
    const activeSubscriptions = await db.select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.package_id, input.id))
      .execute();

    if (activeSubscriptions.length > 0) {
      throw new Error('Cannot delete package that is referenced by existing subscriptions');
    }

    // Delete the package
    await db.delete(packagesTable)
      .where(eq(packagesTable.id, input.id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Package deletion failed:', error);
    throw error;
  }
};
