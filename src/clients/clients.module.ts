import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';
import { ClientUser } from './entities/client-user.entity';
import { OrganizationUnit } from './entities/organization-structure.entity';
import { CompanyDocument } from './entities/company-document.entity';
import { Asset } from './entities/asset.entity';
import { DocumentStorageService } from './services/document-storage.service';
import { AssetService } from './services/asset.service';
import { AssetController } from './controllers/asset.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Client,
      ClientUser,
      OrganizationUnit,
      CompanyDocument,
      Asset,
    ]),
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [ClientsController, AssetController],
  providers: [ClientsService, DocumentStorageService, AssetService],
  exports: [ClientsService, AssetService],
})
export class ClientsModule {}