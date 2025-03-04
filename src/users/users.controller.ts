import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { User } from './entities/user.entity';
import { UtilityService } from '../common/services/utility.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly utilityService: UtilityService,
  ) {}

  @Post()
  @Roles('admin')
  async create(@Body() createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
    const user = await this.usersService.create(createUserDto);
    return this.utilityService.createSuccessResponse(
      user,
      'User created successfully',
    );
  }

  @Get()
  @Roles('admin')
  async findAll(@Query() paginationDto: PaginationDto): Promise<ApiResponse<{ users: User[]; total: number }>> {
    const [users, total] = await this.usersService.findAll(paginationDto);
    return this.utilityService.createSuccessResponse(
      { users, total },
      'Users retrieved successfully',
      {
        page: paginationDto.page,
        limit: paginationDto.limit,
        totalPages: Math.ceil(total / paginationDto.limit),
      },
    );
  }

  @Get(':id')
  @Roles('admin')
  async findOne(@Param('id') id: string): Promise<ApiResponse<User>> {
    const user = await this.usersService.findOne(+id);
    return this.utilityService.createSuccessResponse(
      user,
      'User retrieved successfully',
    );
  }

  @Patch(':id')
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<User>> {
    const user = await this.usersService.update(+id, updateUserDto);
    return this.utilityService.createSuccessResponse(
      user,
      'User updated successfully',
    );
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string): Promise<ApiResponse<null>> {
    await this.usersService.remove(+id);
    return this.utilityService.createSuccessResponse(
      null,
      'User deleted successfully',
    );
  }
}