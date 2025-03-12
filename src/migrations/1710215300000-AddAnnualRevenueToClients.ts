/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnnualRevenueToClients1710215300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if clients table exists
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'clients'
      );
    `);

    if (!tableExists[0].exists) {
      console.log('Clients table does not exist, skipping migration');
      return;
    }

    // Check if annualRevenue column already exists (check both naming conventions)
    const columnExistsSnakeCase = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'annual_revenue'
      );
    `);

    const columnExistsCamelCase = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'annualRevenue'
      );
    `);

    if (columnExistsSnakeCase[0].exists || columnExistsCamelCase[0].exists) {
      console.log('annualRevenue column already exists, skipping migration');
      return;
    }

    // Add the annualRevenue column - try both naming conventions
    console.log('Adding annualRevenue column to clients table');
    
    try {
      // First try with camelCase (as it appears in the error message)
      await queryRunner.query(`
        ALTER TABLE "clients" ADD "annualRevenue" character varying;
      `);
      console.log('Successfully added annualRevenue column to clients table (camelCase)');
    } catch (_) {
      console.log('Failed to add camelCase column, trying snake_case');
      // If that fails, try with snake_case
      await queryRunner.query(`
        ALTER TABLE "clients" ADD "annual_revenue" character varying;
      `);
      console.log('Successfully added annual_revenue column to clients table (snake_case)');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if clients table exists
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'clients'
      );
    `);

    if (!tableExists[0].exists) {
      console.log('Clients table does not exist, skipping rollback');
      return;
    }

    // Check if annualRevenue column exists (check both naming conventions)
    const columnExistsSnakeCase = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'annual_revenue'
      );
    `);

    const columnExistsCamelCase = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'annualRevenue'
      );
    `);

    // Remove the column if it exists (try both naming conventions)
    if (columnExistsCamelCase[0].exists) {
      console.log('Removing annualRevenue column from clients table (camelCase)');
      await queryRunner.query(`
        ALTER TABLE "clients" DROP COLUMN "annualRevenue";
      `);
      console.log('Successfully removed annualRevenue column from clients table');
    }
    
    if (columnExistsSnakeCase[0].exists) {
      console.log('Removing annual_revenue column from clients table (snake_case)');
      await queryRunner.query(`
        ALTER TABLE "clients" DROP COLUMN "annual_revenue";
      `);
      console.log('Successfully removed annual_revenue column from clients table');
    }
  }
}