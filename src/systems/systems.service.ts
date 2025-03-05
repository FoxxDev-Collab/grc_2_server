import { Injectable } from '@nestjs/common';

@Injectable()
export class SystemsService {
  // This is a placeholder service that will be implemented in the future
  // For now, it just returns empty arrays to handle the frontend requests
  
  findAll() {
    // Return an empty array for now
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findAllByClientId(clientId: number) {
    // clientId is not used yet but will be needed in the future implementation
    // Return an empty array for now
    return [];
  }
}