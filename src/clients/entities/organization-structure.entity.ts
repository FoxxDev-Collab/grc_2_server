import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from './client.entity';

@Entity('organization_units')
export class OrganizationUnit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  headName: string;

  @Column({ nullable: true })
  headTitle: string;

  @Column({ nullable: true })
  employeeCount: number;

  @Column({ nullable: true })
  parentId: number;

  @ManyToOne(() => OrganizationUnit, unit => unit.children, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentId' })
  parent: OrganizationUnit;

  @OneToMany(() => OrganizationUnit, unit => unit.parent)
  children: OrganizationUnit[];

  @Column()
  clientId: number;

  @ManyToOne(() => Client, client => client.organizationUnits)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column({ type: 'json', nullable: true })
  positions: Position[];

  @Column({ default: 'department' })
  type: 'department' | 'division' | 'team' | 'unit';

  @Column({ nullable: true })
  level: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export interface Position {
  id: number;
  name: string;
  description?: string;
  holder?: string;
  responsibilities?: string[];
}