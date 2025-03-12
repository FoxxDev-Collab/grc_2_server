/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { OrganizationUnit } from './entities/organization-structure.entity';
import { CompanyDocument } from './entities/company-document.entity';
import { DocumentStorageService } from './services/document-storage.service';
import { 
  CreateOrganizationUnitDto, 
  UpdateOrganizationUnitDto,
  OrganizationUnitResponseDto,
  OrganizationStructureResponseDto
} from './dto/organization-structure.dto';
import {
  CreateCompanyDocumentDto,
  UpdateCompanyDocumentDto,
  AddDocumentVersionDto,
  AddDocumentReviewDto,

  DocumentUploadResponseDto,
  DocumentDownloadResponseDto
} from './dto/company-document.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    @InjectRepository(OrganizationUnit)
    private organizationUnitsRepository: Repository<OrganizationUnit>,
    @InjectRepository(CompanyDocument)
    private companyDocumentsRepository: Repository<CompanyDocument>,
    private documentStorageService: DocumentStorageService
  ) {}

  async findAll(): Promise<Client[]> {
    return this.clientsRepository.find();
  }

  async findOne(id: number): Promise<Client> {
    const client = await this.clientsRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  async create(clientData: Partial<Client>): Promise<Client> {
    const client = this.clientsRepository.create(clientData);
    return this.clientsRepository.save(client);
  }

  async update(id: number, clientData: Partial<Client>): Promise<Client> {
    const client = await this.findOne(id);
    Object.assign(client, clientData);
    return this.clientsRepository.save(client);
  }

  async remove(id: number): Promise<void> {
    const client = await this.findOne(id);
    await this.clientsRepository.remove(client);
  }

  // Organization Structure Methods

  async getOrganizationStructure(clientId: number): Promise<OrganizationStructureResponseDto> {
    const client = await this.findOne(clientId);
    
    // Get all organization units for this client
    const allUnits = await this.organizationUnitsRepository.find({
      where: { clientId },
      order: { level: 'ASC' }
    });
    
    // Build the hierarchical structure
    const rootUnits = allUnits.filter(unit => !unit.parentId);
    const structure = rootUnits.map(unit => this.buildOrganizationTree(unit, allUnits));
    
    return {
      client: {
        id: client.id,
        name: client.name
      },
      structure
    };
  }
  
  private buildOrganizationTree(
    unit: OrganizationUnit, 
    allUnits: OrganizationUnit[]
  ): OrganizationUnitResponseDto {
    const children = allUnits.filter(u => u.parentId === unit.id);
    
    return {
      ...unit,
      children: children.map(child => this.buildOrganizationTree(child, allUnits))
    };
  }

  async createOrganizationUnit(
    createDto: CreateOrganizationUnitDto
  ): Promise<OrganizationUnit> {
    // Verify client exists
    await this.findOne(createDto.clientId);
    
    // If parent ID is provided, verify parent exists
    if (createDto.parentId) {
      const parent = await this.organizationUnitsRepository.findOne({
        where: { id: createDto.parentId }
      });
      
      if (!parent) {
        throw new NotFoundException(`Parent unit with ID ${createDto.parentId} not found`);
      }
      
      // Set level based on parent's level
      createDto.level = (parent.level || 0) + 1;
    } else {
      // Root level unit
      createDto.level = 0;
    }
    
    const unit = this.organizationUnitsRepository.create(createDto);
    return this.organizationUnitsRepository.save(unit);
  }

  async updateOrganizationUnit(
    id: number,
    updateDto: UpdateOrganizationUnitDto
  ): Promise<OrganizationUnit> {
    const unit = await this.organizationUnitsRepository.findOne({ where: { id } });
    
    if (!unit) {
      throw new NotFoundException(`Organization unit with ID ${id} not found`);
    }
    
    // If changing parent, update level accordingly
    if (updateDto.parentId !== undefined && updateDto.parentId !== unit.parentId) {
      if (updateDto.parentId === null) {
        // Moving to root level
        updateDto.level = 0;
      } else {
        // Moving to a new parent
        const parent = await this.organizationUnitsRepository.findOne({
          where: { id: updateDto.parentId }
        });
        
        if (!parent) {
          throw new NotFoundException(`Parent unit with ID ${updateDto.parentId} not found`);
        }
        
        updateDto.level = (parent.level || 0) + 1;
      }
    }
    
    Object.assign(unit, updateDto);
    return this.organizationUnitsRepository.save(unit);
  }

  async deleteOrganizationUnit(id: number): Promise<void> {
    const unit = await this.organizationUnitsRepository.findOne({ 
      where: { id },
      relations: ['children']
    });
    
    if (!unit) {
      throw new NotFoundException(`Organization unit with ID ${id} not found`);
    }
    
    // Check if unit has children
    const children = await this.organizationUnitsRepository.find({
      where: { parentId: id }
    });
    
    if (children.length > 0) {
      throw new BadRequestException(
        `Cannot delete unit with ID ${id} because it has ${children.length} child units`
      );
    }
    
    await this.organizationUnitsRepository.remove(unit);
  }

  // Company Document Methods

  async getCompanyDocuments(clientId: number): Promise<CompanyDocument[]> {
    // Verify client exists
    await this.findOne(clientId);
    
    return this.companyDocumentsRepository.find({
      where: { clientId },
      order: { updatedAt: 'DESC' }
    });
  }

  async getCompanyDocument(id: number): Promise<CompanyDocument> {
    const document = await this.companyDocumentsRepository.findOne({ where: { id } });
    
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    
    return document;
  }

  async createCompanyDocument(
    createDto: CreateCompanyDocumentDto,
    file: any
  ): Promise<DocumentUploadResponseDto> {
    // Verify client exists
    await this.findOne(createDto.clientId);
    
    // If department ID is provided, verify department exists
    if (createDto.departmentId) {
      const department = await this.organizationUnitsRepository.findOne({
        where: { id: createDto.departmentId }
      });
      
      if (!department) {
        throw new NotFoundException(`Department with ID ${createDto.departmentId} not found`);
      }
    }
    
    // Create document record
    const document = this.companyDocumentsRepository.create({
      name: createDto.name,
      description: createDto.description,
      documentType: createDto.documentType,
      category: createDto.category,
      tags: createDto.tags,
      expirationDate: createDto.expirationDate,
      clientId: createDto.clientId,
      departmentId: createDto.departmentId,
      status: 'active',
      currentVersion: createDto.initialVersion.version,
      versions: [createDto.initialVersion]
    });
    
    const savedDocument = await this.companyDocumentsRepository.save(document);
    
    // Store the file
    try {
      const { filePath, fileName, fileSize } = await this.documentStorageService.storeDocument(
        createDto.clientId,
        file,
        savedDocument.id,
        createDto.initialVersion.version
      );
      
      // Update the document with file info
      savedDocument.versions[0].fileName = fileName;
      savedDocument.versions[0].filePath = filePath;
      savedDocument.versions[0].fileSize = fileSize;
      await this.companyDocumentsRepository.save(savedDocument);
      
      return {
        success: true,
        message: 'Document uploaded successfully',
        document: savedDocument
      };
    } catch (error) {
      // If file storage fails, delete the document record
      await this.companyDocumentsRepository.remove(savedDocument);
      
      return {
        success: false,
        message: `Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      };
    }
  }

  async updateCompanyDocument(
    id: number,
    updateDto: UpdateCompanyDocumentDto
  ): Promise<CompanyDocument> {
    const document = await this.getCompanyDocument(id);
    
    // If department ID is provided, verify department exists
    if (updateDto.departmentId) {
      const department = await this.organizationUnitsRepository.findOne({
        where: { id: updateDto.departmentId }
      });
      
      if (!department) {
        throw new NotFoundException(`Department with ID ${updateDto.departmentId} not found`);
      }
    }
    
    Object.assign(document, updateDto);
    return this.companyDocumentsRepository.save(document);
  }

  async addDocumentVersion(
    addVersionDto: AddDocumentVersionDto,
    file: any
  ): Promise<DocumentUploadResponseDto> {
    const document = await this.getCompanyDocument(addVersionDto.documentId);
    
    // Store the file
    try {
      const { filePath, fileName, fileSize } = await this.documentStorageService.storeDocument(
        document.clientId,
        file,
        document.id,
        addVersionDto.version.version
      );
      
      // Update version info
      addVersionDto.version.fileName = fileName;
      addVersionDto.version.filePath = filePath;
      addVersionDto.version.fileSize = fileSize;
      
      // Add the new version to the document
      document.versions = [...document.versions, addVersionDto.version];
      document.currentVersion = addVersionDto.version.version;
      
      const updatedDocument = await this.companyDocumentsRepository.save(document);
      
      return {
        success: true,
        message: 'Document version added successfully',
        document: updatedDocument
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        message: `Failed to add document version: ${errorMessage}`
      };
    }
  }

  async addDocumentReview(addReviewDto: AddDocumentReviewDto): Promise<CompanyDocument> {
    const document = await this.getCompanyDocument(addReviewDto.documentId);
    
    // Add the review to the document
    document.reviewHistory = [...(document.reviewHistory || []), addReviewDto.review];
    document.lastReviewedDate = addReviewDto.review.reviewedAt;
    
    return this.companyDocumentsRepository.save(document);
  }

  async downloadDocument(id: number, versionId?: number): Promise<DocumentDownloadResponseDto> {
    const document = await this.getCompanyDocument(id);
    
    // Determine which version to download
    let version;
    if (versionId) {
      version = document.versions.find(v => v.id === versionId);
      if (!version) {
        throw new NotFoundException(`Version with ID ${versionId} not found for document ${id}`);
      }
    } else {
      // Use the current version
      version = document.versions.find(v => v.version === document.currentVersion);
    }
    
    if (!version?.filePath) {
      throw new NotFoundException('Document file not found');
    }
    
    try {
      // Get the file
      await this.documentStorageService.getDocument(version.filePath);
      
      return {
        success: true,
        message: 'Document ready for download',
        downloadUrl: `/api/clients/${document.clientId}/documents/${document.id}/download/${version.id}`
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        message: `Failed to download document: ${errorMessage}`
      };
    }
  }

  async deleteCompanyDocument(id: number): Promise<void> {
    const document = await this.getCompanyDocument(id);
    
    // Delete all file versions
    for (const version of document.versions) {
      if (version.filePath) {
        try {
          await this.documentStorageService.deleteDocument(version.filePath);
        } catch (error) {
          console.error(`Failed to delete file ${version.filePath}:`, error);
        }
      }
    }
    
    // Delete the document record
    await this.companyDocumentsRepository.remove(document);
  }
}