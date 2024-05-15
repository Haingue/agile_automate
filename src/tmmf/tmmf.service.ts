import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfluenceService } from 'src/confluence/confluence.service';
import { ConfluenceApi, Content } from 'src/confluence/types';
import { Properties } from './types';
import { JiraService } from 'src/jira/jira.service';
import { Issue, JiraApi, RemoteLink } from 'src/jira/types';

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
   * Method to create Issue on Jira Cloud with the type inititive.
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
  async putProjectInBacklog(initiative: Issue): Promise<void> {
    const remotelinks: RemoteLink[] = await this.jiraService.getRemoteLink(
      initiative.id,
      this.JIRA_API,
    );
    const projectId: RemoteLink = remotelinks
      .filter((remotelink) => remotelink.relationship === 'Wiki Page')
      .shift();
    let projectPage: Content;
    if (projectId) {
      projectPage = await this.confluenceService.getOnePage(
        parseInt(projectId.object.url.split(/.*=/)[1]),
        this.CONFLUENCE_API,
      );
    } else {
      projectPage = await this.createProjectOnConfluence(
        initiative.fields.parent.fields.summary,
      );
    }
    this.createInitiativeOnConfluence(initiative.fields.summary, projectPage);

    // TODO add Preparation Epic issues (Jira)
    // const epicPreparation: Issue = {
    //   id: null,
    //   key: null,
    //   fields: {
    //     parent: {
    //       id: initiative.id,
    //       key: initiative.key,
    //     },
    //     project: {
    //       id: null,
    //       key: null,
    //       // key: projectId,
    //     },
    //   },
    // };
    // Then add Tasks issues (Jira)

    // TODO add Do Epic issues (Jira)
  }

  private createProjectInitiativeOnJira(canvas: Content): Promise<Issue> {
    if (!canvas.title)
      throw new BadRequestException('No title found in the content');
    const parentkeys: string[] = /\[[a-zA-Z0-9]{6}-[0-9]+\]/.exec(
      canvas.body.storage.value,
    );
    if (parentkeys.length === 0)
      throw new BadRequestException('Parent id not found');
    const parentkey: string = parentkeys[0].slice(1, -1);
    if (parentkey.length === 0)
      throw new BadRequestException('Parent id is invalid');
    const initiative: Issue = {
      id: null,
      key: null,
      fields: {
        summary: canvas.title,
        issuetype: {
          id: 12206,
          name: 'Initiative',
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

  private async createProjectOnConfluence(title: string): Promise<Content> {
    const projectTemplate = await this.confluenceService.getTemplate(
      this.tmmfProperties.projectTemplateId,
      this.CONFLUENCE_API,
    );
    let projectPage: Content = {
      title: title,
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
    title: string,
    project: Content,
  ): Promise<Content> {
    const initiativeTemplate = await this.confluenceService.getTemplate(
      this.tmmfProperties.initiativeTemplateId,
      this.CONFLUENCE_API,
    );
    let initiativePage: Content = {
      title: `${project.title} - ${title}`,
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
    this.createPreparationOnConfluence(initiativePage);
    this.createDoOnConfluence(initiativePage);
    return initiativePage;
  }

  private _summarizeTitle(title: string) {
    return title
      .split(' ')
      .map((word) => word[0])
      .join('');
  }

  private async createPreparationOnConfluence(
    initiative: Content,
  ): Promise<Content> {
    const preparationTemplate = await this.confluenceService.getTemplate(
      this.tmmfProperties.preparationTemplateId,
      this.CONFLUENCE_API,
    );
    let preparationPage: Content = {
      title: `[${this._summarizeTitle(initiative.title)}] - Preparation`,
      body: {
        storage: {
          value: preparationTemplate.body.storage.value,
          representation: 'storage',
        },
      },
      ancestors: [initiative],
    };
    preparationPage = await this.confluenceService.savePage(
      preparationPage,
      this.CONFLUENCE_API,
    );
    return preparationPage;
  }

  private async createDoOnConfluence(initiative: Content): Promise<Content> {
    const doTemplate = await this.confluenceService.getTemplate(
      this.tmmfProperties.doTemplateId,
      this.CONFLUENCE_API,
    );
    let doPage: Content = {
      title: `[${this._summarizeTitle(initiative.title)}] - do`,
      body: {
        storage: {
          value: doTemplate.body.storage.value,
          representation: 'storage',
        },
      },
      ancestors: [initiative],
    };
    doPage = await this.confluenceService.savePage(doPage, this.CONFLUENCE_API);
    return doPage;
  }
}
