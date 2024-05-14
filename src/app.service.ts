import { Injectable } from '@nestjs/common';
import { JiraService } from './jira/jira.service';
import { ConfluenceService } from './confluence/confluence.service';
import { Histogram } from 'prom-client';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AppService {
  jiraStatus: Histogram;
  conluenceStatus: Histogram;
  constructor(
    private readonly jiraService: JiraService,
    private readonly confluenceService: ConfluenceService,
  ) {
    this.jiraStatus = new Histogram({
      name: 'jira_status',
      help: 'Status of Jira API',
      buckets: [0, 1],
    });
    this.conluenceStatus = new Histogram({
      name: 'confluence_status',
      help: 'Status of Confluence API',
      buckets: [0, 1],
    });
  }

  @Cron('30 * * * * *')
  handleCheckApiStatus() {
    this.testJiraStatus()
      .then((status) => this.jiraStatus.observe(status))
      .catch(() => this.jiraStatus.observe(0));
    this.testConfluenceStatus()
      .then((status) => this.conluenceStatus.observe(status))
      .catch(() => this.jiraStatus.observe(0));
  }

  getHello(): string {
    return 'Hello Agile !';
  }

  async testJiraStatus(): Promise<number> {
    const response: Response = await this.jiraService.getStatus({
      baseUrl: `${process.env.JIRA_API}`,
      token: null,
      spaceKey: null,
    });
    if (response.status === 200) {
      return 1;
    }
    return 0;
  }

  async testConfluenceStatus(): Promise<number> {
    const response: Response = await this.confluenceService.getStatus({
      baseUrl: `${process.env.JIRA_API}`,
      token: null,
      spaceKey: null,
    });
    if (response.status === 200) {
      return 1;
    }
    return 0;
  }
}
