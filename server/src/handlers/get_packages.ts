
import { db } from '../db';
import { packagesTable } from '../db/schema';
import { type Package } from '../schema';

export const getPackages = async (): Promise<Package[]> => {
  try {
    const results = await db.select()
      .from(packagesTable)
      .execute();

    // Convert numeric fields back to numbers
    return results.map(pkg => ({
      ...pkg,
      price: parseFloat(pkg.price) // Convert string back to number
    }));
  } catch (error) {
    console.error('Failed to fetch packages:', error);
    throw error;
  }
};
