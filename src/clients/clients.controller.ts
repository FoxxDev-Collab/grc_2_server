import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreateClientUserDto } from './dto/create-client-user.dto';
import { UpdateClientUserDto } from './dto/update-client-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { Client } from './entities/client.entity';
import { ClientUser } from './entities/client-user.entity';
import { UtilityService } from '../common/services/utility.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly utilityService: UtilityService,
  ) {}

  @Post()
  @Roles('admin')
  async create(@Body() createClientDto: CreateClientDto): Promise<ApiResponse<Client>> {
    const client = await this.clientsService.create(createClientDto);
    return this.utilityService.createSuccessResponse(
      client,
      'Client created successfully',
    );
  }

  @Get()
  @Roles('admin')
  async findAll(@Query() paginationDto: PaginationDto): Promise<ApiResponse<{ clients: Client[]; total: number }>> {
    const [clients, total] = await this.clientsService.findAll(paginationDto);
    return this.utilityService.createSuccessResponse(
      { clients, total },
      'Clients retrieved successfully',
      {
        page: paginationDto.page,
        limit: paginationDto.limit,
        totalPages: Math.ceil(total / paginationDto.limit),
      },
    );
  }

  @Get(':id')
  @Roles('admin')
  async findOne(@Param('id') id: string): Promise<ApiResponse<Client>> {
    const client = await this.clientsService.findOne(+id);
    return this.utilityService.createSuccessResponse(
      client,
      'Client retrieved successfully',
    );
  }

  @Patch(':id')
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<ApiResponse<Client>> {
    const client = await this.clientsService.update(+id, updateClientDto);
    return this.utilityService.createSuccessResponse(
      client,
      'Client updated successfully',
    );
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string): Promise<ApiResponse<null>> {
    await this.clientsService.remove(+id);
    return this.utilityService.createSuccessResponse(
      null,
      'Client deleted successfully',
    );
  }

  // Client User endpoints
  @Post(':clientId/users')
  @Roles('admin')
  async createClientUser(
    @Param('clientId') clientId: string,
    @Body() createClientUserDto: CreateClientUserDto,
  ): Promise<ApiResponse<ClientUser>> {
    // Ensure clientId in path matches the one in the DTO
    createClientUserDto.clientId = +clientId;
    
    const clientUser = await this.clientsService.createClientUser(createClientUserDto);
    return this.utilityService.createSuccessResponse(
      clientUser,
      'Client user created successfully',
    );
  }

  @Get(':clientId/users')
  @Roles('admin')
  async findClientUsers(
    @Param('clientId') clientId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<ApiResponse<{ users: ClientUser[]; total: number }>> {
    const [users, total] = await this.clientsService.findClientUsers(+clientId, paginationDto);
    return this.utilityService.createSuccessResponse(
      { users, total },
      'Client users retrieved successfully',
      {
        page: paginationDto.page,
        limit: paginationDto.limit,
        totalPages: Math.ceil(total / paginationDto.limit),
      },
    );
  }

  @Get(':clientId/users/:userId')
  @Roles('admin')
  async findClientUser(
    @Param('clientId') clientId: string,
    @Param('userId') userId: string,
  ): Promise<ApiResponse<ClientUser>> {
    const clientUser = await this.clientsService.findClientUser(+clientId, +userId);
    return this.utilityService.createSuccessResponse(
      clientUser,
      'Client user retrieved successfully',
    );
  }

  @Patch(':clientId/users/:userId')
  @Roles('admin')
  async updateClientUser(
    @Param('clientId') clientId: string,
    @Param('userId') userId: string,
    @Body() updateClientUserDto: UpdateClientUserDto,
  ): Promise<ApiResponse<ClientUser>> {
    const clientUser = await this.clientsService.updateClientUser(+clientId, +userId, updateClientUserDto);
    return this.utilityService.createSuccessResponse(
      clientUser,
      'Client user updated successfully',
    );
  }

  @Delete(':clientId/users/:userId')
  @Roles('admin')
  async removeClientUser(
    @Param('clientId') clientId: string,
    @Param('userId') userId: string,
  ): Promise<ApiResponse<null>> {
    await this.clientsService.removeClientUser(+clientId, +userId);
    return this.utilityService.createSuccessResponse(
      null,
      'Client user deleted successfully',
    );
  }
}