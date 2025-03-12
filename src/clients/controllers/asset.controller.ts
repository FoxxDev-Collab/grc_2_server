import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AssetService } from '../services/asset.service';
import { Asset } from '../entities/asset.entity';
import {
  CreateAssetDto,
  UpdateAssetDto,
  AssetFilterDto,
  AssetTypeDto,
  AssetStatusDto,
  BulkImportAssetsDto,
  AssetReportDto
} from '../dto/asset.dto';

@Controller('assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get()
  findAll(
    @Query('clientId', ParseIntPipe) clientId: number,
    @Query() filterDto: AssetFilterDto
  ): Promise<Asset[]> {
    return this.assetService.findAll(clientId, filterDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Asset> {
    return this.assetService.findOne(id);
  }

  @Post()
  create(@Body() createAssetDto: CreateAssetDto): Promise<Asset> {
    return this.assetService.create(createAssetDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAssetDto: UpdateAssetDto,
  ): Promise<Asset> {
    return this.assetService.update(id, updateAssetDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.assetService.remove(id);
  }

  @Get('types')
  getAssetTypes(): AssetTypeDto[] {
    return this.assetService.getAssetTypes();
  }

  @Get('statuses')
  getAssetStatuses(): AssetStatusDto[] {
    return this.assetService.getAssetStatuses();
  }

  @Post('bulk/import')
  bulkImport(@Body() bulkImportDto: BulkImportAssetsDto): Promise<Asset[]> {
    return this.assetService.bulkImport(bulkImportDto);
  }

  @Get('reports/:clientId')
  generateReport(
    @Param('clientId', ParseIntPipe) clientId: number
  ): Promise<AssetReportDto> {
    return this.assetService.generateReport(clientId);
  }
}