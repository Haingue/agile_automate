/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Inject, Logger, Post } from '@nestjs/common';
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
    this.logger.log(`New project canva approve: ${canvasPage.title}`);
    const initiative: Issue = await this.tmmfService.approveCanvas(canvasPage);
    return initiative;
  }

  @Post('start-project')
  putProjectInBacklog(@Body() inititativeIssue: Issue) {
    this.logger.log(`New project canva approve: ${inititativeIssue.key}`);
    this.tmmfService.putProjectInBacklog(inititativeIssue);
  }
}
