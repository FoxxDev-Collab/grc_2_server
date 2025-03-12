/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAssetsData1710215100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if assets table exists
    const assetsTableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'assets'
      );
    `);

    if (!assetsTableExists[0].exists) {
      console.log('Assets table does not exist, skipping seed data');
      return;
    }

    // Check if clients table exists
    const clientsTableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'clients'
      );
    `);

    if (!clientsTableExists[0].exists) {
      console.log('Clients table does not exist, creating a dummy client for assets');
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS clients (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      
      await queryRunner.query(`
        INSERT INTO clients (name) VALUES ('Default Client');
      `);
    }

    // Get client ID
    const clientResult = await queryRunner.query(`SELECT id FROM clients LIMIT 1`);
    if (!clientResult || clientResult.length === 0) {
      console.log('No clients found, creating a default client');
      await queryRunner.query(`
        INSERT INTO clients (name) VALUES ('Default Client');
      `);
      const newClientResult = await queryRunner.query(`SELECT id FROM clients LIMIT 1`);
      if (!newClientResult || newClientResult.length === 0) {
        console.log('Failed to create default client, skipping asset seed data');
        return;
      }
    }
    
    const clientId = clientResult[0].id as number;
    
    // Check if organization_units table exists
    const orgUnitsExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_units'
      );
    `);

    let departmentIds: number[] = [];
    
    // Get department IDs if organization_units table exists
    if (orgUnitsExists[0].exists) {
      const departmentResult = await queryRunner.query(`SELECT id FROM organization_units WHERE client_id = $1 LIMIT 3`, [clientId]);
      departmentIds = departmentResult.map((dept: { id: number }) => dept.id);
    }
    
    // Clear existing assets if any
    await queryRunner.query(`DELETE FROM assets`);
    
    // Seed data for assets
    const assets = [
      {
        name: 'Marketing Laptop 01',
        type: 'laptop',
        model: 'MacBook Pro 16-inch',
        serial_number: 'C02ZW1ZRMD6T',
        location: 'Main Office, 3rd Floor',
        status: 'active',
        purchase_date: '2023-01-15',
        end_of_life: '2026-01-15',
        end_of_support: '2027-01-15',
        notes: 'Assigned to Marketing Director',
        client_id: clientId,
        department_id: departmentIds.length > 0 ? departmentIds[0] : null
      },
      {
        name: 'Development Server 01',
        type: 'server',
        model: 'Dell PowerEdge R740',
        serial_number: 'SRV78901234',
        location: 'Server Room A',
        status: 'active',
        purchase_date: '2022-06-10',
        end_of_life: '2027-06-10',
        end_of_support: '2028-06-10',
        notes: 'Primary development server',
        client_id: clientId,
        department_id: departmentIds.length > 1 ? departmentIds[1] : null
      },
      {
        name: 'Finance Desktop 03',
        type: 'desktop',
        model: 'Dell OptiPlex 7080',
        serial_number: 'DT56789012',
        location: 'Finance Department, 2nd Floor',
        status: 'active',
        purchase_date: '2023-03-22',
        end_of_life: '2026-03-22',
        end_of_support: '2027-03-22',
        notes: 'Used by Finance Manager',
        client_id: clientId,
        department_id: departmentIds.length > 2 ? departmentIds[2] : null
      },
      {
        name: 'Network Switch 02',
        type: 'network_device',
        model: 'Cisco Catalyst 9300',
        serial_number: 'NW12345678',
        location: 'Server Room B',
        status: 'active',
        purchase_date: '2022-11-05',
        end_of_life: '2027-11-05',
        end_of_support: '2028-11-05',
        notes: 'Main office network switch',
        client_id: clientId,
        department_id: null
      },
      {
        name: 'Sales Tablet 02',
        type: 'tablet',
        model: 'iPad Pro 12.9-inch',
        serial_number: 'TB98765432',
        location: 'Sales Department',
        status: 'active',
        purchase_date: '2023-05-18',
        end_of_life: '2026-05-18',
        end_of_support: '2027-05-18',
        notes: 'Used for sales presentations',
        client_id: clientId,
        department_id: departmentIds.length > 0 ? departmentIds[0] : null
      },
      {
        name: 'Web Application Server',
        type: 'virtual_machine',
        model: 'VMware ESXi',
        serial_number: 'VM12345678',
        location: 'Cloud Infrastructure',
        status: 'active',
        purchase_date: '2023-07-10',
        end_of_life: '2026-07-10',
        end_of_support: '2027-07-10',
        notes: 'Hosts the company web application',
        client_id: clientId,
        department_id: departmentIds.length > 1 ? departmentIds[1] : null
      },
      {
        name: 'Docker Container Host',
        type: 'container',
        model: 'Kubernetes Cluster',
        serial_number: 'CONT87654321',
        location: 'Cloud Infrastructure',
        status: 'active',
        purchase_date: '2023-08-15',
        end_of_life: '2026-08-15',
        end_of_support: '2027-08-15',
        notes: 'Hosts microservices containers',
        client_id: clientId,
        department_id: departmentIds.length > 1 ? departmentIds[1] : null
      },
      {
        name: 'AWS EC2 Instance',
        type: 'cloud_instance',
        model: 't3.large',
        serial_number: 'AWS98765432',
        location: 'AWS us-east-1',
        status: 'active',
        purchase_date: '2023-09-01',
        end_of_life: '2026-09-01',
        end_of_support: '2027-09-01',
        notes: 'Production application server',
        client_id: clientId,
        department_id: departmentIds.length > 1 ? departmentIds[1] : null
      },
      {
        name: 'Salesforce CRM',
        type: 'saas_application',
        model: 'Enterprise Edition',
        serial_number: 'SF12345678',
        location: 'Cloud',
        status: 'active',
        purchase_date: '2023-01-01',
        end_of_life: null,
        end_of_support: null,
        notes: 'Company-wide CRM system',
        client_id: clientId,
        department_id: departmentIds.length > 0 ? departmentIds[0] : null
      },
      {
        name: 'PostgreSQL Database',
        type: 'database',
        model: 'PostgreSQL 14',
        serial_number: 'DB87654321',
        location: 'Server Room A',
        status: 'active',
        purchase_date: '2022-12-01',
        end_of_life: '2027-12-01',
        end_of_support: '2028-12-01',
        notes: 'Primary application database',
        client_id: clientId,
        department_id: departmentIds.length > 1 ? departmentIds[1] : null
      }
    ];

    // Insert assets
    for (const asset of assets) {
      await queryRunner.query(`
        INSERT INTO assets (
          name, type, model, serial_number, location, status, 
          purchase_date, end_of_life, end_of_support, notes, 
          client_id, department_id, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, 
          $7, $8, $9, $10, 
          $11, $12, NOW(), NOW()
        )
      `, [
        asset.name, 
        asset.type, 
        asset.model, 
        asset.serial_number, 
        asset.location, 
        asset.status,
        asset.purchase_date, 
        asset.end_of_life, 
        asset.end_of_support, 
        asset.notes,
        asset.client_id, 
        asset.department_id
      ]);
    }
    
    console.log(`Successfully seeded ${assets.length} assets`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM assets`);
  }
}