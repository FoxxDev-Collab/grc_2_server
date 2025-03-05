import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { SystemsService } from './systems.service';

@Controller('systems')
export class SystemsController {
  constructor(private readonly systemsService: SystemsService) {}

  @Get()
  findAll(@Query('clientId') clientId?: string) {
    // Handle the case when clientId is NaN
    if (clientId === 'NaN' || (clientId && isNaN(Number(clientId)))) {
      throw new BadRequestException('Invalid clientId parameter');
    }
    
    // If clientId is provided and valid, return systems for that client
    if (clientId) {
      return this.systemsService.findAllByClientId(Number(clientId));
    }
    
    // Otherwise return all systems
    return this.systemsService.findAll();
  }
}