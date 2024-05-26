import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Issue, JiraApi, RemoteLink } from './types';

@Injectable()
export class JiraService {
  private readonly logger = new Logger(JiraService.name);

  async getStatus(jiraApi: JiraApi): Promise<Response> {
    return fetch(`${jiraApi.baseUrl}/api/3/serverInfo`);
  }

  async createIssue(issue: Issue, jiraApi: JiraApi): Promise<Issue> {
    this.logger.debug(`Save issue: ${issue.fields.summary}`);
    if (!issue.fields.labels) {
      issue.fields.labels = [];
    }
    issue.fields.labels.push('agile_automate');
    const responsePage = await fetch(`${jiraApi.baseUrl}/api/2/issue`, {
      method: 'POST',
      headers: {
        Authorization: jiraApi.token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(issue),
    });
    if (responsePage.status !== 201) {
      const result = await responsePage.json();
      throw new HttpException(
        `Error to save issue[${responsePage.status}]: ${JSON.stringify(result)}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return responsePage.json();
  }

  async getRemoteLink(
    issueId: string,
    jiraApi: JiraApi,
  ): Promise<RemoteLink[]> {
    this.logger.debug(`Get issue links: ${issueId}`);
    const responsePage = await fetch(
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

  async getOneIssue(issueId: string, jiraApi: JiraApi): Promise<Issue> {
    const response: Response = await fetch(
      `${jiraApi.baseUrl}/api/2/issue/${issueId}`,
    );

    if (response.status !== 200) {
      console.error('Error to retrieve the content of the issue');
      throw new Error(`Issue not found: ${issueId}`);
    }
    const issue: Issue = await response.json();
    return issue;
  }
}
