import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { UtilityService } from '../common/services/utility.service';

interface RequestWithUser {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly utilityService: UtilityService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<any>> {
    const result = await this.authService.login(loginDto);
    return this.utilityService.createSuccessResponse(
      result,
      'Login successful',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: RequestWithUser): ApiResponse<any> {
    return this.utilityService.createSuccessResponse(
      req.user,
      'User profile retrieved successfully',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh-token')
  async refreshToken(@Request() req: RequestWithUser): Promise<ApiResponse<any>> {
    const result = await this.authService.refreshToken(req.user.id);
    return this.utilityService.createSuccessResponse(
      result,
      'Token refreshed successfully',
    );
  }
}