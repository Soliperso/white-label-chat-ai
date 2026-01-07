import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'ChatForge API - White-Label AI Chat Widget Platform';
  }
}
