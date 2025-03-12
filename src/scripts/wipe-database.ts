/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

// Create a new data source
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  database: process.env.DB_DATABASE || 'grc_app',
  synchronize: false,
  logging: true,
});

async function wipeDatabase() {
  try {
    // Initialize the data source
    await dataSource.initialize();
    console.log('Data source initialized');

    // Get all tables in the public schema
    const tables = await dataSource.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public';
    `);

    // Drop all tables
    if (tables.length > 0) {
      console.log('Dropping all tables...');
      
      // Disable foreign key checks
      await dataSource.query('SET CONSTRAINTS ALL DEFERRED;');
      
      // Generate DROP TABLE statements for all tables
      const dropTablesQuery = tables
        .map((table: { tablename: string }) => `DROP TABLE IF EXISTS "${table.tablename}" CASCADE;`)
        .join('\n');
      
      // Execute the DROP TABLE statements
      await dataSource.query(dropTablesQuery);
      
      console.log(`Dropped ${tables.length} tables`);
    } else {
      console.log('No tables to drop');
    }

    // Get all custom types (enums)
    const types = await dataSource.query(`
      SELECT typname FROM pg_type 
      JOIN pg_catalog.pg_namespace ON pg_namespace.oid = pg_type.typnamespace
      WHERE pg_namespace.nspname = 'public' AND pg_type.typtype = 'e';
    `);

    // Drop all custom types
    if (types.length > 0) {
      console.log('Dropping all custom types...');
      
      // Generate DROP TYPE statements for all types
      const dropTypesQuery = types
        .map((type: { typname: string }) => `DROP TYPE IF EXISTS "${type.typname}" CASCADE;`)
        .join('\n');
      
      // Execute the DROP TYPE statements
      await dataSource.query(dropTypesQuery);
      
      console.log(`Dropped ${types.length} custom types`);
    } else {
      console.log('No custom types to drop');
    }

    // Drop the migrations table
    await dataSource.query('DROP TABLE IF EXISTS migrations CASCADE;');
    console.log('Dropped migrations table');

    console.log('Database has been wiped clean');
  } catch (error) {
    console.error('Error wiping database:', error);
  } finally {
    // Close the connection
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Data source connection closed');
    }
  }
}

// Run the function
wipeDatabase()
  .then(() => {
    console.log('Database wipe completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database wipe failed:', error);
    process.exit(1);
  });