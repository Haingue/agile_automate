import { JiraService } from './jira.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [JiraService],
})
export class JiraModule {}
