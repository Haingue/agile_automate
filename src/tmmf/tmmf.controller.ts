/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Inject, Logger, Param, Post } from '@nestjs/common';
import { Content } from 'src/confluence/types';
import { TmmfService } from './tmmf.service';
import { Issue } from 'src/jira/types';

@Controller('tmmf')
export class TmmfController {
  private readonly logger = new Logger(TmmfController.name);

  @Inject()
  private tmmfService: TmmfService;

  @Post('approve-project')
  async approveProjectCanvas(@Body() canvasPage: Content): Promise<Issue> {
    this.logger.log(`New project canvas approve: ${canvasPage.title}`);
    const initiative: Issue = await this.tmmfService.approveCanvas(canvasPage);
    return initiative;
  }

  @Post('approve-project/:pageId')
  async approveProjectCanvasByPageId(
    @Param('pageId') pageId: number,
  ): Promise<Issue> {
    this.logger.log(`New project canvas approve by id: ${pageId}`);
    const initiative: Issue =
      await this.tmmfService.approveCanvasByPageId(pageId);
    return initiative;
  }

  @Post('start-project')
  putProjectInBacklog(@Body() inititativeIssue: Issue): Promise<any> {
    this.logger.log(`Project stared: ${inititativeIssue.key}`);
    const result: Promise<any> =
      this.tmmfService.putProjectInBacklog(inititativeIssue);
    return result;
  }

  @Post('start-project/:issueKey')
  putProjectInBacklogByIssueKey(
    @Param('issueKey') issueKey: string,
  ): Promise<any> {
    this.logger.log(`Project started by key: ${issueKey}`);
    const result: Promise<any> =
      this.tmmfService.putProjectInBacklogByIssueKey(issueKey);
    return result;
  }
}
