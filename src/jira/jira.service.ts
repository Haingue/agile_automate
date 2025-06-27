import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { SprintMetric, Issue, JiraApi, RemoteLink, IssueTaskStatus, Fields, Sprint } from './types';

@Injectable()
export class JiraService {
  private readonly logger = new Logger(JiraService.name)

  async getStatus(jiraApi: JiraApi): Promise<Response> {
    return fetch(`${jiraApi.baseUrl}/api/3/serverInfo`)
  }

  async _searchActiveSprint(boardId: string, jiraApi: JiraApi): Promise<Sprint[]> {
    const queryParam = new URLSearchParams()
    queryParam.append('state', 'active')
    const responsePage = await fetch(
      `${jiraApi.baseUrl}/agile/1.0/board/${boardId}/sprint?` + queryParam,
      {
        method: 'GET',
        headers: {
          Authorization: jiraApi.token,
          Accept: 'application/json',
        },
      },
    )
    if (responsePage.ok) {
      const json = await responsePage.json()
      return json.values
    }
    throw Error(responsePage.statusText)
  }

  async _searchIssues(jql, jiraApi: JiraApi): Promise<Issue[]> {
    const queryParam = new URLSearchParams()
    queryParam.append('jql', jql)
    queryParam.append('maxResults', '5000')
    queryParam.append('fields', 'id,key,summary,customfield_10351')
    const responsePage = await fetch(
      `${jiraApi.baseUrl}/api/3/search/jql?` + queryParam,
      {
        method: 'GET',
        headers: {
          Authorization: jiraApi.token,
          Accept: 'application/json',
        },
      },
    )
    if (responsePage.ok) {
      const json = await responsePage.json()
      return json.issues
    }
    throw Error(responsePage.statusText)
  }

  async getSprintMetrics(
    projectKey: string,
    jiraApi: JiraApi,
  ): Promise<SprintMetric> {
    const metric: SprintMetric = { projectKey, issueNumberPerStatus: {} }

    const jql = (status) =>
      `project = "${projectKey}" and sprint in openSprints() and status = "${status}" ORDER BY updated DESC`
    for (const status of Object.values(IssueTaskStatus)) {
      try {
        const issues: Issue[] = await this._searchIssues(jql(status), jiraApi)
        metric.issueNumberPerStatus[status] = issues.length
        if (!metric.sprintName) {
          metric.sprintName = issues[0].fields.customfield_10351[0].name
        }
      } catch (error) {
        metric.issueNumberPerStatus[status] = null
      }
    }

    try {
      const sprints: Sprint[] = await this._searchActiveSprint(jiraApi.projectBoardId, jiraApi) // TODO change id by parameter
      metric.sprintName = sprints[0].name
    } catch (error) {}
    metric.timestamp = new Date()

    return metric
  }

  async createIssue(issue: Issue, jiraApi: JiraApi): Promise<Issue> {
    this.logger.debug(`Save issue: ${issue.fields.summary}`)
    if (!issue.fields.labels) {
      issue.fields.labels = []
    }
    issue.fields.labels.push('agile_automate')
    const responsePage = await fetch(`${jiraApi.baseUrl}/api/2/issue`, {
      method: 'POST',
      headers: {
        Authorization: jiraApi.token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(issue),
    })
    if (responsePage.status !== 201) {
      const result = await responsePage.json()
      throw new HttpException(
        `Error to save issue[${responsePage.status}]: ${JSON.stringify(result)}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
    return responsePage.json()
  }

  async getRemoteLink(
    issueId: string,
    jiraApi: JiraApi,
  ): Promise<RemoteLink[]> {
    this.logger.debug(`Get issue links: ${issueId}`)
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
    )
    if (responsePage.status !== 200) {
      const result = await responsePage.json()
      this.logger.error(
        `Error to save isse[${responsePage.status}]: ${JSON.stringify(result)}`,
      )
      return []
    }
    return responsePage.json()
  }

  async getOneIssue(issuekey: string, jiraApi: JiraApi): Promise<Issue> {
    const response: Response = await fetch(
      `${jiraApi.baseUrl}/api/2/issue/${issuekey}`,
      {
        method: 'GET',
        headers: {
          Authorization: jiraApi.token,
          Accept: 'application/json',
        },
      },
    )

    if (response.status !== 200) {
      console.error('Error to retrieve the content of the issue')
      throw new Error(`Issue not found: ${issuekey}`)
    }
    const issue: Issue = await response.json()
    return issue
  }
}
