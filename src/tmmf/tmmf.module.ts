import { ConfluenceModule } from 'src/confluence/confluence.module';
import { TmmfService } from './tmmf.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { JiraModule } from 'src/jira/jira.module';

@Module({
  imports: [ConfluenceModule, JiraModule],
  controllers: [],
  providers: [TmmfService],
})
export class TmmfModule {}
