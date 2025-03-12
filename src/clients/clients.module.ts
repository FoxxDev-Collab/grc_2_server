import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';
import { ClientUser } from './entities/client-user.entity';
import { OrganizationUnit } from './entities/organization-structure.entity';
import { CompanyDocument } from './entities/company-document.entity';
import { DocumentStorageService } from './services/document-storage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Client,
      ClientUser,
      OrganizationUnit,
      CompanyDocument,
    ]),
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [ClientsController],
  providers: [ClientsService, DocumentStorageService],
  exports: [ClientsService],
})
export class ClientsModule {}