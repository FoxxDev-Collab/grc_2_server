/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAssetsNameColumn1710215200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if assets table exists
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'assets'
      );
    `);

    if (!tableExists[0].exists) {
      console.log('Assets table does not exist, skipping migration');
      return;
    }

    // First, make sure the name column exists
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assets' AND column_name = 'name'
      );
    `);

    if (!columnExists[0].exists) {
      console.log('Name column does not exist, creating it');
      await queryRunner.query(`
        ALTER TABLE "assets" ADD "name" character varying;
      `);
    }

    // Check if the name column has any NULL values
    const nullNameCount = await queryRunner.query(`
      SELECT COUNT(*) FROM assets WHERE name IS NULL;
    `);

    const count = parseInt(nullNameCount[0].count, 10);
    
    if (count > 0) {
      console.log(`Found ${count} assets with NULL name, updating them`);
      
      // Update NULL names with a default value based on their type and ID
      await queryRunner.query(`
        UPDATE assets 
        SET name = CONCAT('Asset-', type, '-', id) 
        WHERE name IS NULL;
      `);
      
      console.log('Successfully updated assets with NULL names');
    } else {
      console.log('No assets with NULL names found');
    }

    // Now we can safely alter the column to add the NOT NULL constraint
    // First check if the column allows nulls
    const columnInfo = await queryRunner.query(`
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'assets' AND column_name = 'name';
    `);

    if (columnInfo.length > 0 && columnInfo[0].is_nullable === 'YES') {
      console.log('Adding NOT NULL constraint to name column');
      
      // Add the NOT NULL constraint
      await queryRunner.query(`
        ALTER TABLE "assets" ALTER COLUMN "name" SET NOT NULL;
      `);
      
      console.log('Successfully added NOT NULL constraint to name column');
    } else {
      console.log('Name column already has NOT NULL constraint');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // If needed, we can remove the NOT NULL constraint
    await queryRunner.query(`
      ALTER TABLE "assets" ALTER COLUMN "name" DROP NOT NULL;
    `);
  }
}