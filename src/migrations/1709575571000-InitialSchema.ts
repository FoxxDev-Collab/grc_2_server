import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1709575571000 implements MigrationInterface {
  name = 'InitialSchema1709575571000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "role" character varying NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "lastLogin" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "profileImage" character varying,
        "phoneNumber" character varying,
        "department" character varying,
        "title" character varying,
        "status" character varying NOT NULL DEFAULT 'active',
        "failedLoginAttempts" integer NOT NULL DEFAULT 0,
        "lastPasswordChange" TIMESTAMP,
        "preferences" json,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Create clients table
    await queryRunner.query(`
      CREATE TABLE "clients" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "industry" character varying,
        "email" character varying,
        "phone" character varying,
        "primaryContact" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "lastActivity" TIMESTAMP,
        "complianceScore" integer,
        "status" character varying NOT NULL DEFAULT 'active',
        "address" json,
        "size" character varying,
        "employeeCount" integer,
        "website" character varying,
        CONSTRAINT "PK_clients" PRIMARY KEY ("id")
      )
    `);

    // Create client_users table
    await queryRunner.query(`
      CREATE TABLE "client_users" (
        "id" SERIAL NOT NULL,
        "username" character varying NOT NULL,
        "email" character varying NOT NULL,
        "role" character varying NOT NULL,
        "clientId" integer NOT NULL,
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "title" character varying,
        "department" character varying,
        "phone" character varying,
        "isActive" boolean NOT NULL DEFAULT true,
        "lastActive" TIMESTAMP,
        "permissions" json,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_client_users" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "client_users" 
      ADD CONSTRAINT "FK_client_users_clients" 
      FOREIGN KEY ("clientId") 
      REFERENCES "clients"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_users_email" ON "users" ("email")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_client_users_clientId" ON "client_users" ("clientId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_client_users_email" ON "client_users" ("email")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "client_users" DROP CONSTRAINT "FK_client_users_clients"
    `);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_client_users_email"`);
    await queryRunner.query(`DROP INDEX "IDX_client_users_clientId"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "client_users"`);
    await queryRunner.query(`DROP TABLE "clients"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}