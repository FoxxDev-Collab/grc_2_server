import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from './client.entity';
import { OrganizationUnit } from './organization-structure.entity';

export interface DocumentVersion {
  id: number;
  version: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
  notes?: string;
}

export interface DocumentReview {
  id: number;
  reviewedBy: string;
  reviewedAt: Date;
  status: 'approved' | 'rejected' | 'needs_changes';
  comments?: string;
}

@Entity('company_documents')
export class CompanyDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  documentType: string;

  @Column({ nullable: true })
  category: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ nullable: true })
  expirationDate: Date;

  @Column({ nullable: true })
  lastReviewedDate: Date;

  @Column({ type: 'json', nullable: true })
  versions: DocumentVersion[];

  @Column({ type: 'json', nullable: true })
  reviewHistory: DocumentReview[];

  @Column()
  clientId: number;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column({ nullable: true })
  departmentId: number;

  @ManyToOne(() => OrganizationUnit, { nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department: OrganizationUnit;

  @Column({ default: 'active' })
  status: 'active' | 'archived' | 'draft';

  @Column({ nullable: true })
  currentVersion: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}