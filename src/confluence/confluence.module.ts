import { ConfluenceController } from './confluence.controller';
import ConfluenceApi from './ConfluenceApi';
import { ConfluenceService } from './confluence.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [ConfluenceController],
  providers: [ConfluenceService, ConfluenceApi],
})
export class ConfluenceModule {}
