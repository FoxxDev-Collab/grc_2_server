import { Injectable } from '@nestjs/common';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class UtilityService {
  /**
   * Creates a standardized successful API response
   */
  createSuccessResponse<T, M extends { [key: string]: any; } | undefined = Record<string, unknown>>(data: T, message?: string, meta?: M): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      meta,
    };
  }

  /**
   * Creates a standardized error API response
   */
  createErrorResponse(message: string, errors?: string[]): ApiResponse<null> {
    return {
      success: false,
      message,
      errors,
    };
  }

  /**
   * Generates a random string of specified length
   */
  generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
  }
}