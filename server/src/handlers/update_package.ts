
import { db } from '../db';
import { packagesTable } from '../db/schema';
import { type UpdatePackageInput, type Package } from '../schema';
import { eq } from 'drizzle-orm';

export const updatePackage = async (input: UpdatePackageInput): Promise<Package> => {
  try {
    // First, check if the package exists
    const existingPackage = await db.select()
      .from(packagesTable)
      .where(eq(packagesTable.id, input.id))
      .execute();

    if (existingPackage.length === 0) {
      throw new Error(`Package with id ${input.id} not found`);
    }

    // Build update object with only provided fields
    const updateData: any = {};
    
    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    
    if (input.speed !== undefined) {
      updateData.speed = input.speed;
    }
    
    if (input.price !== undefined) {
      updateData.price = input.price.toString(); // Convert number to string for numeric column
    }

    // Update the package
    const result = await db.update(packagesTable)
      .set(updateData)
      .where(eq(packagesTable.id, input.id))
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const updatedPackage = result[0];
    return {
      ...updatedPackage,
      price: parseFloat(updatedPackage.price) // Convert string back to number
    };
  } catch (error) {
    console.error('Package update failed:', error);
    throw error;
  }
};
