import { IsString, IsNumber, IsOptional, IsEnum, IsArray, ValidateNested, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class DocumentVersionDto {
  @IsNumber()
  id: number;

  @IsString()
  version: string;

  @IsString()
  fileName: string;

  @IsString()
  filePath: string;

  @IsNumber()
  fileSize: number;

  @IsString()
  uploadedBy: string;

  @IsDate()
  uploadedAt: Date;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class DocumentReviewDto {
  @IsNumber()
  id: number;

  @IsString()
  reviewedBy: string;

  @IsDate()
  reviewedAt: Date;

  @IsEnum(['approved', 'rejected', 'needs_changes'])
  status: 'approved' | 'rejected' | 'needs_changes';

  @IsString()
  @IsOptional()
  comments?: string;
}

export class CreateCompanyDocumentDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  documentType: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsDate()
  @IsOptional()
  expirationDate?: Date;

  @IsNumber()
  clientId: number;

  @IsNumber()
  @IsOptional()
  departmentId?: number;

  @ValidateNested()
  @Type(() => DocumentVersionDto)
  initialVersion: DocumentVersionDto;
}

export class UpdateCompanyDocumentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  documentType?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsDate()
  @IsOptional()
  expirationDate?: Date;

  @IsNumber()
  @IsOptional()
  departmentId?: number;

  @IsEnum(['active', 'archived', 'draft'])
  @IsOptional()
  status?: 'active' | 'archived' | 'draft';

  @IsString()
  @IsOptional()
  currentVersion?: string;
}

export class AddDocumentVersionDto {
  @IsNumber()
  documentId: number;

  @ValidateNested()
  @Type(() => DocumentVersionDto)
  version: DocumentVersionDto;
}

export class AddDocumentReviewDto {
  @IsNumber()
  documentId: number;

  @ValidateNested()
  @Type(() => DocumentReviewDto)
  review: DocumentReviewDto;
}

export class CompanyDocumentResponseDto {
  id: number;
  name: string;
  description?: string;
  documentType: string;
  category?: string;
  tags?: string[];
  expirationDate?: Date;
  lastReviewedDate?: Date;
  versions: DocumentVersionDto[];
  reviewHistory?: DocumentReviewDto[];
  clientId: number;
  departmentId?: number;
  status: 'active' | 'archived' | 'draft';
  currentVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DocumentUploadResponseDto {
  @IsBoolean()
  success: boolean;

  @IsString()
  message: string;

  @ValidateNested()
  @Type(() => CompanyDocumentResponseDto)
  @IsOptional()
  document?: CompanyDocumentResponseDto;
}

export class DocumentDownloadResponseDto {
  @IsBoolean()
  success: boolean;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  downloadUrl?: string;
}