import { IsEnum, IsString, IsNumber, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';
import { AssetType, AssetStatus } from '../entities/asset.entity';

export class CreateAssetDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(AssetType)
  type: AssetType;

  @IsNotEmpty()
  @IsString()
  model: string;

  @IsNotEmpty()
  @IsString()
  serialNumber: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsOptional()
  @IsDateString()
  endOfLife?: string;

  @IsOptional()
  @IsDateString()
  endOfSupport?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNotEmpty()
  @IsNumber()
  clientId: number;

  @IsOptional()
  @IsNumber()
  departmentId?: number;
}

export class UpdateAssetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(AssetType)
  type?: AssetType;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsOptional()
  @IsDateString()
  endOfLife?: string;

  @IsOptional()
  @IsDateString()
  endOfSupport?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  departmentId?: number;
}

export class AssetFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(AssetType, { each: true })
  types?: AssetType[];

  @IsOptional()
  @IsEnum(AssetStatus, { each: true })
  statuses?: AssetStatus[];

  @IsOptional()
  @IsNumber()
  departmentId?: number;

  @IsOptional()
  @IsDateString()
  purchasedAfter?: string;

  @IsOptional()
  @IsDateString()
  purchasedBefore?: string;
}

export class AssetTypeDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}

export class AssetStatusDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}

export class BulkImportAssetsDto {
  @IsNotEmpty()
  @IsNumber()
  clientId: number;

  @IsNotEmpty()
  assets: CreateAssetDto[];
}

export class AssetReportDto {
  generatedAt: string;
  totalAssets: number;
  assetsByType: Record<string, number>;
  assetsByStatus: Record<string, number>;
  assetsNearingEndOfLife: number;
  assetsNearingEndOfSupport: number;
}