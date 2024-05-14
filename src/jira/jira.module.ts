import { JiraService } from './jira.service';

import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [JiraService],
  exports: [JiraService],
})
export class JiraModule {}
