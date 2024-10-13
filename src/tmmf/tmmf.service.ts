import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfluenceService } from 'src/confluence/confluence.service';
import { ConfluenceApi, Content } from 'src/confluence/types';
import { Properties } from './types';
import { JiraService } from 'src/jira/jira.service';
import { Issue, IssueTypeId, JiraApi, RemoteLink } from 'src/jira/types';

@Injectable()
export class TmmfService {
  private tmmfProperties: Properties = {
    projectTemplateId: 97944331,
    initiativeTemplateId: 97944351,
    documentTemplateId: 111052875,
    preparationTemplateId: 97780294,
    doTemplateId: 97944199,
  };

  private JIRA_API: JiraApi = {
    baseUrl: process.env.JIRA_BASEURL,
    token: `Basic ${Buffer.from(process.env.ATLASSIAN_TOKEN).toString(
      'base64',
    )}`,
    businessPlanSpaceKey: process.env.JIRA_BUSINESS_PLAN_SPACE_KEY,
    projectSpaceKey: process.env.JIRA_PROJECT_SPACE_KEY,
  };

  private CONFLUENCE_API: ConfluenceApi = {
    baseUrl: process.env.CONFLUENCE_BASEURL,
    token: `Basic ${Buffer.from(process.env.ATLASSIAN_TOKEN).toString(
      'base64',
    )}`,
    spaceKey: process.env.CONFLUENCE_SPACE_KEY,
  };

  @Inject()
  jiraService: JiraService;

  @Inject()
  confluenceService: ConfluenceService;

  /**
   * Method to create Issue on Jira Cloud with the type inititive from canvas page id.
   * @param canvas
   */
  async approveCanvasByPageId(pageId: number): Promise<Issue> {
    const canvas = await this.confluenceService.getOnePage(
      pageId,
      this.CONFLUENCE_API,
    );
    return this.createProjectInitiativeOnJira(canvas);
  }

  /**
   * Method to create Issue on Jira Cloud with the type inititive from canvas page.
   * @param canvas
   */
  async approveCanvas(canvas: Content): Promise<Issue> {
    return this.createProjectInitiativeOnJira(canvas);
  }

  /**
   * Method to create Issue on Jira Cloud and Page on Confluence.
   * Jira:
   *  - Epic: Preparation
   *    - Story/Task: {preparation task list}
   *  - Epic: Do
   *  - Epic: ...
   * Confluence:
   *  - Page: Projects > {Theme} > {Initiative} > {Epic}
   * @param initiative
   */
  async putProjectInBacklogByIssueKey(issueKey: string): Promise<any> {
    const initiative: Issue = await this.jiraService.getOneIssue(
      issueKey,
      this.JIRA_API,
    );
    return this.startProject(initiative);
  }

  async putProjectInBacklog(initiative: Issue): Promise<any> {
    return this.startProject(initiative);
  }

  async startProject(initiative: Issue): Promise<any> {
    if (!initiative.fields.parent) {
      throw new HttpException(
        'The initiative must have a parent',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create Jira issues on TMMF - IT&D
    const preparationEpic: Issue =
      await this.createPreparationOnJira(initiative);
    initiative.fields.subtasks.push(preparationEpic);
    const doEpic: Issue = await this.createDoOnJira(initiative);
    initiative.fields.subtasks.push(doEpic);

    // Create Confluence pages (Theme > Initiative > Epic & Documentation)
    const projectId: number = await this.getProjectId(initiative);
    let projectPage: Content;
    if (projectId) {
      projectPage = await this.confluenceService.getOnePage(
        projectId,
        this.CONFLUENCE_API,
      );
    }
    if (!projectPage) {
      const themeIssue: Issue = await this.jiraService.getOneIssue(
        initiative.fields.parent.key,
        this.JIRA_API,
      );
      projectPage = await this.createProjectOnConfluence(themeIssue);
    }

    const initiativePage: Content = await this.createInitiativeOnConfluence(
      initiative,
      projectPage,
    );

    return {
      pages: [initiativePage],
      issues: [preparationEpic, doEpic],
    };
  }

  private async getProjectId(initiative: Issue): Promise<number> {
    const remotelinks: RemoteLink[] = await this.jiraService.getRemoteLink(
      initiative.fields.parent.id,
      this.JIRA_API,
    );
    const projectIdLink: RemoteLink = remotelinks
      .filter((remotelink) => remotelink.application.name === 'Confluence')
      .shift();

    try {
      const projectId: string = projectIdLink.object.url.split(/.*=/)[1];
      return parseInt(projectId);
    } catch (error) {
      return null;
    }
  }

  private async createDoOnJira(initiative: Issue): Promise<Issue> {
    let doEpic: Issue = {
      id: null,
      key: null,
      fields: {
        issuetype: {
          id: IssueTypeId.epicIssueType,
        },
        summary: `${this._summarizeTitle(initiative.fields.summary)} - Do`,
        parent: {
          id: initiative.id,
          key: initiative.key,
        },
        project: {
          id: null,
          key: this.JIRA_API.projectSpaceKey,
        },
      },
    };
    doEpic = await this.jiraService.createIssue(doEpic, this.JIRA_API);
    return doEpic;
  }

  private async createPreparationOnJira(initiative: Issue): Promise<Issue> {
    let preparationEpic: Issue = {
      id: null,
      key: null,
      fields: {
        issuetype: {
          id: IssueTypeId.epicIssueType,
        },
        summary: `${this._summarizeTitle(initiative.fields.summary)} - Preparation`,
        parent: {
          id: initiative.id,
          key: initiative.key,
        },
        project: {
          id: null,
          key: this.JIRA_API.projectSpaceKey,
        },
      },
    };
    preparationEpic = await this.jiraService.createIssue(
      preparationEpic,
      this.JIRA_API,
    );
    preparationEpic.fields = {
      parent: {
        id: initiative.id,
        key: initiative.key,
      },
      project: {
        id: null,
        key: this.JIRA_API.projectSpaceKey,
      },
      subtasks: [],
    };
    for (const task of [
      'Stakeholder identification',
      'Clarify the project requirement',
      'Define ASTG/ATPSG compliance',
      'Define RGPD compliance',
      'Define network specification',
      'Define hardware specification',
      'Create architecture',
      'Create a PoC',
      'Valid Ringi',
      'Define DoR',
      'Define DoD',
    ]) {
      const taskIssue: Issue = {
        id: null,
        key: null,
        fields: {
          issuetype: {
            id: IssueTypeId.taskIssueType,
          },
          summary: `${this._summarizeTitle(initiative.fields.summary)} - ${task}`,
          parent: {
            id: preparationEpic.id,
            key: preparationEpic.key,
          },
          project: {
            id: null,
            key: this.JIRA_API.projectSpaceKey,
          },
        },
      };
      preparationEpic.fields.subtasks.push(
        await this.jiraService.createIssue(taskIssue, this.JIRA_API),
      );
    }
    return preparationEpic;
  }

  private createProjectInitiativeOnJira(canvas: Content): Promise<Issue> {
    if (!canvas.title)
      throw new BadRequestException('No title found in the content');
    const parentkeys: string[] = /\[[a-zA-Z0-9]{6}-[0-9]+\]/.exec(
      canvas.body.storage.value,
    );
    if (parentkeys == null || parentkeys.length === 0)
      throw new BadRequestException('Parent id not found');
    const parentkey: string = parentkeys[0].slice(1, -1);
    if (parentkey == null || parentkey.length === 0)
      throw new BadRequestException('Parent id is invalid');
    const initiative: Issue = {
      id: null,
      key: null,
      fields: {
        summary: canvas.title,
        issuetype: {
          id: IssueTypeId.initiativeIssueType,
        },
        project: {
          id: null,
          key: this.JIRA_API.businessPlanSpaceKey,
        },
        parent: { id: null, key: parentkey },
        assignee: {
          accountId: null,
        },
      },
    };
    return this.jiraService.createIssue(initiative, this.JIRA_API);
  }

  private async createProjectOnConfluence(themeIssue: Issue): Promise<Content> {
    const projectTemplate = await this.confluenceService.getTemplate(
      this.tmmfProperties.projectTemplateId,
      this.CONFLUENCE_API,
    );
    projectTemplate.body.storage.value =
      projectTemplate.body.storage.value.replaceAll(
        'https://toyota-europe.atlassian.net/browse/TMMFITD-1',
        `https://toyota-europe.atlassian.net/browse/${themeIssue.key}`,
      );
    let projectPage: Content = {
      title: themeIssue.fields.summary,
      body: {
        storage: {
          value: projectTemplate.body.storage.value,
          representation: 'storage',
        },
      },
      ancestors: [{ id: '98140207' }],
    };
    projectPage = await this.confluenceService.savePage(
      projectPage,
      this.CONFLUENCE_API,
    );
    this.createDocumentOnConfluence(projectPage);
    return projectPage;
  }

  private async createDocumentOnConfluence(project: Content): Promise<Content> {
    const documentTemplate = await this.confluenceService.getTemplate(
      this.tmmfProperties.documentTemplateId,
      this.CONFLUENCE_API,
    );
    let documentPage: Content = {
      title: `${project.title} - Documentation`,
      body: {
        storage: {
          value: documentTemplate.body.storage.value,
          representation: 'storage',
        },
      },
      ancestors: [project],
    };
    documentPage = await this.confluenceService.savePage(
      documentPage,
      this.CONFLUENCE_API,
    );
    return documentPage;
  }

  private async createInitiativeOnConfluence(
    initiative: Issue,
    project: Content,
  ): Promise<Content> {
    const initiativeTemplate = await this.confluenceService.getTemplate(
      this.tmmfProperties.initiativeTemplateId,
      this.CONFLUENCE_API,
    );
    let initiativePage: Content = {
      title: `${project.title} - ${initiative.fields.summary}`,
      space: { key: this.CONFLUENCE_API.spaceKey },
      body: {
        storage: {
          value: initiativeTemplate.body.storage.value,
          representation: 'storage',
        },
      },
      ancestors: [project],
    };
    initiativePage = await this.confluenceService.savePage(
      initiativePage,
      this.CONFLUENCE_API,
    );
    this.createPreparationOnConfluence(
      initiative.fields.subtasks[0],
      initiativePage,
    );
    this.createDoOnConfluence(initiative.fields.subtasks[1], initiativePage);
    return initiativePage;
  }

  private _summarizeTitle(title: string) {
    return title
      .split(' ')
      .map((word) => word[0])
      .join('');
  }

  private async createPreparationOnConfluence(
    preparationIssue: Issue,
    initiativePage: Content,
  ): Promise<Content> {
    const preparationTemplate = await this.confluenceService.getTemplate(
      this.tmmfProperties.preparationTemplateId,
      this.CONFLUENCE_API,
    );
    preparationTemplate.body.storage.value =
      preparationTemplate.body.storage.value.replaceAll(
        'parent = TMMFITD-1',
        `parent = ${preparationIssue.key}`,
      );
    let preparationPage: Content = {
      title: `[${this._summarizeTitle(initiativePage.title)}] - Preparation`,
      space: { key: this.CONFLUENCE_API.spaceKey },
      body: {
        storage: {
          value: preparationTemplate.body.storage.value,
          representation: 'storage',
        },
      },
      ancestors: [initiativePage],
    };
    preparationPage = await this.confluenceService.savePage(
      preparationPage,
      this.CONFLUENCE_API,
    );
    return preparationPage;
  }

  private async createDoOnConfluence(
    doIssue: Issue,
    initiativePage: Content,
  ): Promise<Content> {
    const doTemplate = await this.confluenceService.getTemplate(
      this.tmmfProperties.doTemplateId,
      this.CONFLUENCE_API,
    );
    doTemplate.body.storage.value = doTemplate.body.storage.value.replaceAll(
      'parent = TMMFITD-1',
      `parent = ${doIssue.key}`,
    );
    let doPage: Content = {
      title: `[${this._summarizeTitle(initiativePage.title)}] - Do`,
      space: { key: this.CONFLUENCE_API.spaceKey },
      body: {
        storage: {
          value: doTemplate.body.storage.value,
          representation: 'storage',
        },
      },
      ancestors: [initiativePage],
    };
    doPage = await this.confluenceService.savePage(doPage, this.CONFLUENCE_API);
    return doPage;
  }
}
