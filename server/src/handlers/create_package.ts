
import { db } from '../db';
import { packagesTable } from '../db/schema';
import { type CreatePackageInput, type Package } from '../schema';

export const createPackage = async (input: CreatePackageInput): Promise<Package> => {
  try {
    // Insert package record with fixed 30-day active duration
    const result = await db.insert(packagesTable)
      .values({
        name: input.name,
        speed: input.speed,
        price: input.price.toString(), // Convert number to string for numeric column
        active_duration: 30 // Fixed duration as per requirements
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const package_ = result[0];
    return {
      ...package_,
      price: parseFloat(package_.price) // Convert string back to number
    };
  } catch (error) {
    console.error('Package creation failed:', error);
    throw error;
  }
};
