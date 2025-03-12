import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ClientUser } from './client-user.entity';
import { OrganizationUnit } from './organization-structure.entity';

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  [key: string]: unknown;
}

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  primaryContact: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  lastActivity: Date;

  @Column({ nullable: true })
  complianceScore: number;

  @Column({ default: 'active' })
  status: string;

  @Column({ type: 'json', nullable: true })
  address: Address;

  @Column({ nullable: true })
  size: string;

  @Column({ nullable: true })
  employeeCount: number;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  annualRevenue: string;

  @OneToMany(() => ClientUser, (clientUser: ClientUser) => clientUser.client)
  users: ClientUser[];

  @OneToMany(() => OrganizationUnit, (orgUnit: OrganizationUnit) => orgUnit.client)
  organizationUnits: OrganizationUnit[];
}