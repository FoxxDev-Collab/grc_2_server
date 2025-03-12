import { IsString, IsNumber, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PositionDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  holder?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  responsibilities?: string[];
}

export class CreateOrganizationUnitDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  headName?: string;

  @IsString()
  @IsOptional()
  headTitle?: string;

  @IsNumber()
  @IsOptional()
  employeeCount?: number;

  @IsNumber()
  @IsOptional()
  parentId?: number;

  @IsNumber()
  clientId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PositionDto)
  @IsOptional()
  positions?: PositionDto[];

  @IsEnum(['department', 'division', 'team', 'unit'])
  @IsOptional()
  type?: 'department' | 'division' | 'team' | 'unit' = 'department';

  @IsNumber()
  @IsOptional()
  level?: number;
}

export class UpdateOrganizationUnitDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  headName?: string;

  @IsString()
  @IsOptional()
  headTitle?: string;

  @IsNumber()
  @IsOptional()
  employeeCount?: number;

  @IsNumber()
  @IsOptional()
  parentId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PositionDto)
  @IsOptional()
  positions?: PositionDto[];

  @IsEnum(['department', 'division', 'team', 'unit'])
  @IsOptional()
  type?: 'department' | 'division' | 'team' | 'unit';

  @IsNumber()
  @IsOptional()
  level?: number;
}

export class OrganizationUnitResponseDto {
  id: number;
  name: string;
  description?: string;
  headName?: string;
  headTitle?: string;
  employeeCount?: number;
  parentId?: number;
  clientId: number;
  positions?: PositionDto[];
  type: 'department' | 'division' | 'team' | 'unit';
  level?: number;
  children?: OrganizationUnitResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class OrganizationStructureResponseDto {
  client: {
    id: number;
    name: string;
  };
  structure: OrganizationUnitResponseDto[];
}