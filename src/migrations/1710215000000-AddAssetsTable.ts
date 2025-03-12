/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAssetsTable1710215000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the assets table already exists
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'assets'
      );
    `);

    if (tableExists[0].exists) {
      console.log('Assets table already exists, dropping it to recreate');
      await queryRunner.query(`DROP TABLE IF EXISTS assets CASCADE;`);
    }

    // Check if the enum types exist and drop them if they do
    const typeEnumExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'asset_type_enum'
      );
    `);

    if (typeEnumExists[0].exists) {
      console.log('asset_type_enum already exists, dropping it');
      await queryRunner.query(`DROP TYPE IF EXISTS asset_type_enum CASCADE;`);
    }

    const statusEnumExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'asset_status_enum'
      );
    `);

    if (statusEnumExists[0].exists) {
      console.log('asset_status_enum already exists, dropping it');
      await queryRunner.query(`DROP TYPE IF EXISTS asset_status_enum CASCADE;`);
    }

    // Create asset type enum
    await queryRunner.query(`
      CREATE TYPE asset_type_enum AS ENUM (
        'laptop', 
        'desktop', 
        'tablet', 
        'mobile_phone', 
        'desk_phone', 
        'network_device', 
        'server', 
        'printer', 
        'virtual_machine', 
        'container', 
        'cloud_instance', 
        'saas_application', 
        'database', 
        'other'
      );
    `);

    // Create asset status enum
    await queryRunner.query(`
      CREATE TYPE asset_status_enum AS ENUM (
        'active', 
        'inactive', 
        'maintenance', 
        'disposed', 
        'lost', 
        'stolen'
      );
    `);

    // Check if clients table exists
    const clientsExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'clients'
      );
    `);

    // Check if organization_units table exists
    const orgUnitsExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_units'
      );
    `);

    const hasClients = clientsExists[0].exists;
    const hasOrgUnits = orgUnitsExists[0].exists;

    console.log(`Clients table ${hasClients ? 'exists' : 'does not exist'}`);
    console.log(`Organization units table ${hasOrgUnits ? 'exists' : 'does not exist'}`);

    // Create assets table with appropriate foreign keys based on what tables exist
    let createTableQuery = `
      CREATE TABLE assets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type asset_type_enum NOT NULL DEFAULT 'other',
        model VARCHAR(255) NOT NULL,
        serial_number VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        status asset_status_enum NOT NULL DEFAULT 'active',
        purchase_date TIMESTAMP,
        end_of_life TIMESTAMP,
        end_of_support TIMESTAMP,
        notes TEXT,
        client_id INTEGER NOT NULL,
        department_id INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    `;

    // Add foreign key constraints if the referenced tables exist
    if (hasClients) {
      createTableQuery += `,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
      `;
    }

    if (hasOrgUnits) {
      createTableQuery += `,
        FOREIGN KEY (department_id) REFERENCES organization_units(id) ON DELETE SET NULL
      `;
    }

    // Close the CREATE TABLE statement
    createTableQuery += `);`;

    await queryRunner.query(createTableQuery);

    // Add indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX idx_assets_client_id ON assets(client_id);
    `);
    
    if (hasOrgUnits) {
      await queryRunner.query(`
        CREATE INDEX idx_assets_department_id ON assets(department_id);
      `);
    }
    
    await queryRunner.query(`
      CREATE INDEX idx_assets_type ON assets(type);
    `);
    
    await queryRunner.query(`
      CREATE INDEX idx_assets_status ON assets(status);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_assets_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_assets_type;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_assets_department_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_assets_client_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS assets;`);
    await queryRunner.query(`DROP TYPE IF EXISTS asset_status_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS asset_type_enum;`);
  }
}