import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { ClientUser } from './entities/client-user.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreateClientUserDto } from './dto/create-client-user.dto';
import { UpdateClientUserDto } from './dto/update-client-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    @InjectRepository(ClientUser)
    private clientUsersRepository: Repository<ClientUser>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    try {
      const client = this.clientsRepository.create(createClientDto);
      return await this.clientsRepository.save(client);
    } catch (error) {
      this.logger.error(`Failed to create client: ${(error as Error).message}`, (error as Error).stack);
      throw new InternalServerErrorException('Failed to create client');
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<[Client[], number]> {
    try {
      return await this.clientsRepository.findAndCount({
        skip: paginationDto.skip,
        take: paginationDto.limit,
        order: {
          createdAt: 'DESC',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to find clients: ${(error as Error).message}`, (error as Error).stack);
      throw new InternalServerErrorException('Failed to find clients');
    }
  }

  async findOne(id: number): Promise<Client> {
    try {
      const client = await this.clientsRepository.findOne({ 
        where: { id },
        relations: ['users'],
      });
      
      if (!client) {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }
      
      return client;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to find client: ${(error as Error).message}`, (error as Error).stack);
      throw new InternalServerErrorException('Failed to find client');
    }
  }

  async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
    try {
      const client = await this.findOne(id);
      
      Object.assign(client, updateClientDto);
      return await this.clientsRepository.save(client);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update client: ${(error as Error).message}`, (error as Error).stack);
      throw new InternalServerErrorException('Failed to update client');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.clientsRepository.delete(id);
      
      if (result.affected === 0) {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to remove client: ${(error as Error).message}`, (error as Error).stack);
      throw new InternalServerErrorException('Failed to remove client');
    }
  }

  // Client User methods
  async createClientUser(createClientUserDto: CreateClientUserDto): Promise<ClientUser> {
    try {
      // Check if client exists
      await this.findOne(createClientUserDto.clientId);
      
      // Check if user with email already exists for this client
      const existingUser = await this.clientUsersRepository.findOne({
        where: {
          clientId: createClientUserDto.clientId,
          email: createClientUserDto.email,
        },
      });
      
      if (existingUser) {
        throw new ConflictException('User with this email already exists for this client');
      }
      
      const clientUser = this.clientUsersRepository.create(createClientUserDto);
      return await this.clientUsersRepository.save(clientUser);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Failed to create client user: ${(error as Error).message}`, (error as Error).stack);
      throw new InternalServerErrorException('Failed to create client user');
    }
  }

  async findClientUsers(clientId: number, paginationDto: PaginationDto): Promise<[ClientUser[], number]> {
    try {
      // Check if client exists
      await this.findOne(clientId);
      
      return await this.clientUsersRepository.findAndCount({
        where: { clientId },
        skip: paginationDto.skip,
        take: paginationDto.limit,
        order: {
          createdAt: 'DESC',
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to find client users: ${(error as Error).message}`, (error as Error).stack);
      throw new InternalServerErrorException('Failed to find client users');
    }
  }

  async findClientUser(clientId: number, userId: number): Promise<ClientUser> {
    try {
      const clientUser = await this.clientUsersRepository.findOne({
        where: {
          id: userId,
          clientId,
        },
      });
      
      if (!clientUser) {
        throw new NotFoundException(`User with ID ${userId} not found for client ${clientId}`);
      }
      
      return clientUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to find client user: ${(error as Error).message}`, (error as Error).stack);
      throw new InternalServerErrorException('Failed to find client user');
    }
  }

  async updateClientUser(clientId: number, userId: number, updateClientUserDto: UpdateClientUserDto): Promise<ClientUser> {
    try {
      const clientUser = await this.findClientUser(clientId, userId);
      
      Object.assign(clientUser, updateClientUserDto);
      return await this.clientUsersRepository.save(clientUser);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update client user: ${(error as Error).message}`, (error as Error).stack);
      throw new InternalServerErrorException('Failed to update client user');
    }
  }

  async removeClientUser(clientId: number, userId: number): Promise<void> {
    try {
      const result = await this.clientUsersRepository.delete({
        id: userId,
        clientId,
      });
      
      if (result.affected === 0) {
        throw new NotFoundException(`User with ID ${userId} not found for client ${clientId}`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to remove client user: ${(error as Error).message}`, (error as Error).stack);
      throw new InternalServerErrorException('Failed to remove client user');
    }
  }
}