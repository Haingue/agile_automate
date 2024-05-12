import { TmmfController } from './tmmf.controller';
import { ConfluenceModule } from 'src/confluence/confluence.module';

import { Module } from '@nestjs/common';
import { JiraModule } from 'src/jira/jira.module';
import { TmmfService } from './tmmf.service';

@Module({
  imports: [ConfluenceModule, JiraModule],
  controllers: [TmmfController],
  providers: [TmmfService],
})
export class TmmfModule {}
