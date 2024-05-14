/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Inject, Logger, Post } from '@nestjs/common';
import { Content } from 'src/confluence/types';
import { TmmfService } from './tmmf.service';
import { Issue } from 'src/jira/types';

@Controller('tmmf')
export class TmmfController {
  private readonly logger = new Logger(TmmfController.name);

  @Inject()
  private tmmfService: TmmfService;

  @Post('approve-project')
  approveProjectCanvas(canvasPage: Content) {
    this.logger.log(`New project canva approve: ${canvasPage.title}`);
    this.tmmfService.approveCanvas(canvasPage);
  }

  @Post('start-project')
  putProjectInBacklog(inititativeIssue: Issue) {
    this.logger.log(`New project canva approve: ${inititativeIssue.key}`);
    this.tmmfService.putProjectInBacklog(inititativeIssue);
  }
}
