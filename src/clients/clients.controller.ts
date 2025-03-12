import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';
import { OrganizationUnit } from './entities/organization-structure.entity';
import { CompanyDocument } from './entities/company-document.entity';
import {
  CreateOrganizationUnitDto,
  UpdateOrganizationUnitDto,
  OrganizationStructureResponseDto,
} from './dto/organization-structure.dto';
import {
  CreateCompanyDocumentDto,
  UpdateCompanyDocumentDto,
  AddDocumentVersionDto,
  AddDocumentReviewDto,
  DocumentUploadResponseDto,
  DocumentDownloadResponseDto,
} from './dto/company-document.dto';

// Define a file interface to match Multer's file structure
interface UploadedFile {
  originalname: string;
  buffer: Buffer;
  size: number;
  mimetype: string;
}

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  findAll(): Promise<Client[]> {
    return this.clientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Client> {
    return this.clientsService.findOne(id);
  }

  @Post()
  create(@Body() clientData: Partial<Client>): Promise<Client> {
    return this.clientsService.create(clientData);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() clientData: Partial<Client>,
  ): Promise<Client> {
    return this.clientsService.update(id, clientData);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.clientsService.remove(id);
  }

  // Organization Structure Endpoints

  @Get(':clientId/organization-structure')
  getOrganizationStructure(
    @Param('clientId', ParseIntPipe) clientId: number,
  ): Promise<OrganizationStructureResponseDto> {
    return this.clientsService.getOrganizationStructure(clientId);
  }

  @Post('organization-units')
  createOrganizationUnit(
    @Body() createDto: CreateOrganizationUnitDto,
  ): Promise<OrganizationUnit> {
    return this.clientsService.createOrganizationUnit(createDto);
  }

  @Put('organization-units/:id')
  updateOrganizationUnit(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateOrganizationUnitDto,
  ): Promise<OrganizationUnit> {
    return this.clientsService.updateOrganizationUnit(id, updateDto);
  }

  @Delete('organization-units/:id')
  deleteOrganizationUnit(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.clientsService.deleteOrganizationUnit(id);
  }

  // Company Document Endpoints

  @Get(':clientId/documents')
  getCompanyDocuments(
    @Param('clientId', ParseIntPipe) clientId: number,
  ): Promise<CompanyDocument[]> {
    return this.clientsService.getCompanyDocuments(clientId);
  }

  @Get('documents/:id')
  getCompanyDocument(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CompanyDocument> {
    return this.clientsService.getCompanyDocument(id);
  }

  @Post('documents')
  @UseInterceptors(FileInterceptor('file'))
  createCompanyDocument(
    @Body() createDto: CreateCompanyDocumentDto,
    @UploadedFile() file: UploadedFile,
  ): Promise<DocumentUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.clientsService.createCompanyDocument(createDto, file);
  }

  @Put('documents/:id')
  updateCompanyDocument(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCompanyDocumentDto,
  ): Promise<CompanyDocument> {
    return this.clientsService.updateCompanyDocument(id, updateDto);
  }

  @Post('documents/versions')
  @UseInterceptors(FileInterceptor('file'))
  addDocumentVersion(
    @Body() addVersionDto: AddDocumentVersionDto,
    @UploadedFile() file: UploadedFile,
  ): Promise<DocumentUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.clientsService.addDocumentVersion(addVersionDto, file);
  }

  @Post('documents/reviews')
  addDocumentReview(
    @Body() addReviewDto: AddDocumentReviewDto,
  ): Promise<CompanyDocument> {
    return this.clientsService.addDocumentReview(addReviewDto);
  }

  @Get('documents/:id/download')
  downloadDocument(
    @Param('id', ParseIntPipe) id: number,
    @Query('versionId') versionId?: number,
  ): Promise<DocumentDownloadResponseDto> {
    return this.clientsService.downloadDocument(id, versionId);
  }

  @Delete('documents/:id')
  deleteCompanyDocument(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.clientsService.deleteCompanyDocument(id);
  }
}