/*
https://docs.nestjs.com/providers#services
*/

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfluenceService } from 'src/confluence/confluence.service';
import { Content } from 'src/confluence/types';
import { Properties } from './types';
import { JiraService } from 'src/jira/jira.service';
import { Issue, Link, RemoteLink } from 'src/jira/types';

@Injectable()
export class TmmfService {
  private tmmfProperties: Properties = {
    projectTemplateId: 97944331,
    initiativeTemplateId: 97944351,
    documentTemplateId: 111052875,
    preparationTemplateId: 97780294,
    doTemplateId: 97944199,
  };

  @Inject()
  jiraService: JiraService;

  @Inject()
  confluenceService: ConfluenceService;

  /**
   * Method to create Issue on Jira Cloud with the type inititive.
   * @param canvas
   */
  async approveCanvas(canvas: Content): Promise<void> {
    this.createProjectInitiativeOnJira(canvas);
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
    );
    const projectId: RemoteLink = remotelinks
      .filter((remotelink) => remotelink.relationship === 'Wiki Page')
      .shift();
    let projectPage: Content;
    if (projectId) {
      projectPage = await this.confluenceService.getOnePage(
        parseInt(projectId.object.url.split(/.*=/)[1]),
      );
    } else {
      projectPage = await this.createProjectOnConfluence(
        initiative.fields.parent.fields.summary,
      );
    }
    this.createInitiativeOnConfluence(initiative.fields.summary, projectPage);

    // TODO add Jira issues
  }

  private async createProjectInitiativeOnJira(canvas: Content): Promise<Issue> {
    if (canvas.title) throw new BadRequestException();
    const parentkey = '';
    if (parentkey.length === 0)
      throw new BadRequestException('Parent id not found');
    const initiative: Issue = {
      id: null,
      key: null,
      fields: {
        summary: canvas.title,
        status: {
          id: '10756',
          name: 'Backlog',
        },
        project: {
          id: '22814',
          key: 'TMMFBP',
          name: 'TMMF-BP',
        },
        parent: { id: null, key: parentkey },
      },
    };
    return this.jiraService.createIssue(initiative);
  }

  private async createProjectOnConfluence(title: string): Promise<Content> {
    let projectTemplate = await this.confluenceService.getTemplate(
      this.tmmfProperties.projectTemplateId,
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
    projectPage = await this.confluenceService.savePage(projectPage);
    this.createDocumentOnConfluence(projectPage);
    return projectPage;
  }

  private async createDocumentOnConfluence(project: Content): Promise<Content> {
    let documentTemplate = await this.confluenceService.getTemplate(
      this.tmmfProperties.documentTemplateId,
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
    documentPage = await this.confluenceService.savePage(documentPage);
    return documentPage;
  }

  private async createInitiativeOnConfluence(
    title: string,
    project: Content,
  ): Promise<Content> {
    let initiativeTemplate = await this.confluenceService.getTemplate(
      this.tmmfProperties.initiativeTemplateId,
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
    initiativePage = await this.confluenceService.savePage(initiativePage);
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
    let preparationTemplate = await this.confluenceService.getTemplate(
      this.tmmfProperties.preparationTemplateId,
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
    preparationPage = await this.confluenceService.savePage(preparationPage);
    return preparationPage;
  }

  private async createDoOnConfluence(initiative: Content): Promise<Content> {
    let doTemplate = await this.confluenceService.getTemplate(
      this.tmmfProperties.doTemplateId,
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
    doPage = await this.confluenceService.savePage(doPage);
    return doPage;
  }
}
