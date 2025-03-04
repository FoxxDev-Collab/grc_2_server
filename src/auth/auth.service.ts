import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await this.usersService.findByEmail(email);
      
      if (!user) {
        return null;
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return null;
      }
      
      // Update last login time
      await this.usersService.update(user.id, { 
        lastLogin: new Date(),
        failedLoginAttempts: 0,
      });
      
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      this.logger.error(`Error validating user: ${(error as Error).message}`, (error as Error).stack);
      return null;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      // Increment failed login attempts
      const existingUser = await this.usersService.findByEmail(loginDto.email);
      if (existingUser) {
        await this.usersService.update(existingUser.id, {
          failedLoginAttempts: existingUser.failedLoginAttempts + 1,
        });
      }
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = { 
      email: user.email, 
      sub: user.id,
      role: user.role,
    };
    
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  async refreshToken(userId: number) {
    const user = await this.usersService.findOne(userId);
    
    const payload = { 
      email: user.email, 
      sub: user.id,
      role: user.role,
    };
    
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}