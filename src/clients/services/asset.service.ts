import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset, AssetType, AssetStatus } from '../entities/asset.entity';
import { 
  CreateAssetDto, 
  UpdateAssetDto, 
  AssetFilterDto,
  AssetTypeDto,
  AssetStatusDto,
  BulkImportAssetsDto,
  AssetReportDto
} from '../dto/asset.dto';

@Injectable()
export class AssetService {
  constructor(
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>
  ) {}

  async findAll(clientId: number, filterDto?: AssetFilterDto): Promise<Asset[]> {
    const queryBuilder = this.assetRepository.createQueryBuilder('asset')
      .where('asset.clientId = :clientId', { clientId });

    if (filterDto) {
      // Apply search filter
      if (filterDto.search) {
        queryBuilder.andWhere(
          '(asset.name LIKE :search OR asset.model LIKE :search OR asset.serialNumber LIKE :search OR asset.notes LIKE :search)',
          { search: `%${filterDto.search}%` }
        );
      }

      // Apply type filter
      if (filterDto.types && filterDto.types.length > 0) {
        queryBuilder.andWhere('asset.type IN (:...types)', { types: filterDto.types });
      }

      // Apply status filter
      if (filterDto.statuses && filterDto.statuses.length > 0) {
        queryBuilder.andWhere('asset.status IN (:...statuses)', { statuses: filterDto.statuses });
      }

      // Apply department filter
      if (filterDto.departmentId) {
        queryBuilder.andWhere('asset.departmentId = :departmentId', { departmentId: filterDto.departmentId });
      }

      // Apply purchase date range filter
      if (filterDto.purchasedAfter) {
        queryBuilder.andWhere('asset.purchaseDate >= :purchasedAfter', { purchasedAfter: filterDto.purchasedAfter });
      }

      if (filterDto.purchasedBefore) {
        queryBuilder.andWhere('asset.purchaseDate <= :purchasedBefore', { purchasedBefore: filterDto.purchasedBefore });
      }
    }

    // Order by updated date descending
    queryBuilder.orderBy('asset.updatedAt', 'DESC');

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Asset> {
    const asset = await this.assetRepository.findOne({ where: { id } });
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }
    return asset;
  }

  async create(createAssetDto: CreateAssetDto): Promise<Asset> {
    const asset = this.assetRepository.create(createAssetDto);
    return this.assetRepository.save(asset);
  }

  async update(id: number, updateAssetDto: UpdateAssetDto): Promise<Asset> {
    const asset = await this.findOne(id);
    
    // Update the asset with the new data
    Object.assign(asset, updateAssetDto);
    
    return this.assetRepository.save(asset);
  }

  async remove(id: number): Promise<void> {
    const asset = await this.findOne(id);
    await this.assetRepository.remove(asset);
  }

  getAssetTypes(): AssetTypeDto[] {
    return Object.entries(AssetType).map(([key, value]) => ({
      id: value,
      name: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    }));
  }

  getAssetStatuses(): AssetStatusDto[] {
    return Object.entries(AssetStatus).map(([key, value]) => ({
      id: value,
      name: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    }));
  }

  async bulkImport(bulkImportDto: BulkImportAssetsDto): Promise<Asset[]> {
    const { clientId, assets } = bulkImportDto;
    
    if (!assets || assets.length === 0) {
      throw new BadRequestException('No assets provided for import');
    }
    
    // Prepare assets with client ID
    const assetsToCreate = assets.map(assetDto => ({
      ...assetDto,
      clientId
    }));
    
    // Create and save all assets
    const createdAssets = this.assetRepository.create(assetsToCreate);
    return this.assetRepository.save(createdAssets);
  }

  async generateReport(clientId: number): Promise<AssetReportDto> {
    // Get all assets for the client
    const assets = await this.findAll(clientId);
    
    // Calculate assets by type
    const assetsByType = assets.reduce((acc, asset) => {
      acc[asset.type] = (acc[asset.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate assets by status
    const assetsByStatus = assets.reduce((acc, asset) => {
      acc[asset.status] = (acc[asset.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate assets nearing end of life/support (within 3 months)
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    
    const currentDate = new Date();
    
    const assetsNearingEndOfLife = assets.filter(asset => {
      if (!asset.endOfLife) return false;
      const eolDate = new Date(asset.endOfLife);
      return eolDate > currentDate && eolDate <= threeMonthsFromNow;
    }).length;
    
    const assetsNearingEndOfSupport = assets.filter(asset => {
      if (!asset.endOfSupport) return false;
      const eosDate = new Date(asset.endOfSupport);
      return eosDate > currentDate && eosDate <= threeMonthsFromNow;
    }).length;
    
    return {
      generatedAt: new Date().toISOString(),
      totalAssets: assets.length,
      assetsByType,
      assetsByStatus,
      assetsNearingEndOfLife,
      assetsNearingEndOfSupport
    };
  }
}