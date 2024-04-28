/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Logger, Post } from '@nestjs/common';
import { Content } from 'src/confluence/types';

@Controller('tmmf')
export class TmmfController {
  private readonly logger = new Logger(TmmfController.name);

  @Post('approve')
  approveProjectCanvas(page: Content) {
    this.logger.log(`New project canva approve: ${page.title}`);
  }

  @Post('')
  putProjectInBacklog(page: Content) {
    this.logger.log(`New project canva approve: ${page.title}`);
  }
}
