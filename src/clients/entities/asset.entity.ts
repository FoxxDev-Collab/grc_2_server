import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from './client.entity';
import { OrganizationUnit } from './organization-structure.entity';

// Asset types enum
export enum AssetType {
  LAPTOP = 'laptop',
  DESKTOP = 'desktop',
  TABLET = 'tablet',
  MOBILE_PHONE = 'mobile_phone',
  DESK_PHONE = 'desk_phone',
  NETWORK_DEVICE = 'network_device',
  SERVER = 'server',
  PRINTER = 'printer',
  VM = 'virtual_machine',
  CONTAINER = 'container',
  CLOUD_INSTANCE = 'cloud_instance',
  SAAS_APPLICATION = 'saas_application',
  DATABASE = 'database',
  OTHER = 'other'
}

// Asset status enum
export enum AssetStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  DISPOSED = 'disposed',
  LOST = 'lost',
  STOLEN = 'stolen'
}

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: AssetType,
    default: AssetType.OTHER
  })
  type: AssetType;

  @Column()
  model: string;

  @Column({ name: 'serial_number' })
  serialNumber: string;

  @Column({ nullable: true })
  location: string;

  @Column({
    type: 'enum',
    enum: AssetStatus,
    default: AssetStatus.ACTIVE
  })
  status: AssetStatus;

  @Column({ name: 'purchase_date', type: 'timestamp', nullable: true })
  purchaseDate: Date;

  @Column({ name: 'end_of_life', type: 'timestamp', nullable: true })
  endOfLife: Date;

  @Column({ name: 'end_of_support', type: 'timestamp', nullable: true })
  endOfSupport: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'client_id' })
  clientId: number;

  @ManyToOne(() => Client, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'department_id', nullable: true })
  departmentId: number;

  @ManyToOne(() => OrganizationUnit, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: OrganizationUnit;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}