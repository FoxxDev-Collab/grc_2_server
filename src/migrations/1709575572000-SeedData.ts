import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedData1709575572000 implements MigrationInterface {
  name = 'SeedData1709575572000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Hash password for admin user
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash('Admin123!', salt);

    // Insert admin user
    await queryRunner.query(`
      INSERT INTO "users" (
        "email", 
        "password", 
        "firstName", 
        "lastName", 
        "role", 
        "isActive", 
        "createdAt", 
        "updatedAt", 
        "status", 
        "lastPasswordChange"
      ) VALUES (
        'admin@example.com', 
        '${hashedPassword}', 
        'Admin', 
        'User', 
        'admin', 
        true, 
        now(), 
        now(), 
        'active', 
        now()
      )
    `);

    // Insert sample client
    await queryRunner.query(`
      INSERT INTO "clients" (
        "name", 
        "industry", 
        "email", 
        "phone", 
        "primaryContact", 
        "createdAt", 
        "status", 
        "address", 
        "size", 
        "employeeCount", 
        "website"
      ) VALUES (
        'Acme Corporation', 
        'Technology', 
        'contact@acme.com', 
        '555-123-4567', 
        'John Smith', 
        now(), 
        'active', 
        '{"street": "123 Main St", "city": "San Francisco", "state": "CA", "zipCode": "94105", "country": "USA"}', 
        'Large', 
        1000, 
        'https://acme.example.com'
      )
    `);

    // Insert sample client user
    await queryRunner.query(`
      INSERT INTO "client_users" (
        "username", 
        "email", 
        "role", 
        "clientId", 
        "firstName", 
        "lastName", 
        "title", 
        "department", 
        "phone", 
        "isActive", 
        "permissions", 
        "createdAt", 
        "updatedAt"
      ) VALUES (
        'jsmith', 
        'john.smith@acme.com', 
        'manager', 
        1, 
        'John', 
        'Smith', 
        'IT Manager', 
        'Information Technology', 
        '555-987-6543', 
        true, 
        '["view", "edit", "approve"]', 
        now(), 
        now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete sample data
    await queryRunner.query(`DELETE FROM "client_users" WHERE "email" = 'john.smith@acme.com'`);
    await queryRunner.query(`DELETE FROM "clients" WHERE "name" = 'Acme Corporation'`);
    await queryRunner.query(`DELETE FROM "users" WHERE "email" = 'admin@example.com'`);
  }
}