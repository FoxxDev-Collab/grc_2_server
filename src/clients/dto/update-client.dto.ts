import {
  IsOptional,
  IsString,
  IsNumber,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-client.dto';

export class UpdateClientDto extends PartialType(CreateClientDto) {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastActivity?: Date;

  @IsOptional()
  @IsNumber()
  complianceScore?: number;

  @IsOptional()
  @IsString()
  status?: string;
}