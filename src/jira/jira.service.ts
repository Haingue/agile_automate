import { Injectable, Logger } from '@nestjs/common';
import { Issue, JiraApi, RemoteLink } from './types';

@Injectable()
export class JiraService {
  private readonly logger = new Logger(JiraService.name);

  async createIssue(issue: Issue, jiraApi: JiraApi): Promise<Issue> {
    this.logger.debug(`Save issue: ${issue.fields.summary}`);
    let responsePage = await fetch(`${jiraApi.baseUrl}/api/2/issue`, {
      method: 'POST',
      headers: {
        Authorization: jiraApi.token,
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

  async getRemoteLink(
    issueId: string,
    jiraApi: JiraApi,
  ): Promise<RemoteLink[]> {
    this.logger.debug(`Get issue links: ${issueId}`);
    let responsePage = await fetch(
      `${jiraApi.baseUrl}/api/2/issue/${issueId}/remotelink`,
      {
        method: 'GET',
        headers: {
          Authorization: jiraApi.token,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );
    if (responsePage.status !== 200) {
      const result = await responsePage.json();
      this.logger.error(
        `Error to save isse[${responsePage.status}]: ${JSON.stringify(result)}`,
      );
      return [];
    }
    return responsePage.json();
  }
}
