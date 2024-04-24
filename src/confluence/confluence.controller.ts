/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Inject } from '@nestjs/common';
import { ConfluenceService } from './confluence.service';

@Controller('confluence')
export class ConfluenceController {
  @Inject()
  confluenceService: ConfluenceService;

  @Get()
  testProject(): string {
    this.confluenceService.createProject('Agile Automate');
    return 'OK';
  }
}
