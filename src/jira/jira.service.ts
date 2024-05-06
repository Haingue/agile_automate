/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, Logger } from '@nestjs/common';
import { Issue, JIRA_API } from './types';

@Injectable()
export class JiraService {
  private readonly logger = new Logger(JiraService.name);

  async createIssue(issue: Issue): Promise<Issue> {
    this.logger.debug(`Save issue: ${issue.fields.summary}`);
    let responsePage = await fetch(`${JIRA_API.baseUrl}/api/2/issue`, {
      method: 'POST',
      headers: {
        Authorization: JIRA_API.token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(issue),
    });
    if (responsePage.status !== 200) {
      const result = await responsePage.json();
      throw new Error(
        `Error to save isse[${responsePage.status}]: ${JSON.stringify(result)}`,
      );
    }
    return responsePage.json();
  }
}
