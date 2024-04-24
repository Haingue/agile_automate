/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { Content } from './types';
import ConfluenceApi from './ConfluenceApi';
import { title } from 'process';

@Injectable()
export class ConfluenceService {
  projectTemplateId: Number = 97944331;
  initiativeTemplateId: Number = 97944351;
  documentTemplateId: Number = 111052875;
  preparationTemplateId: Number = 97780294;
  doTemplateId: Number = 97944199;

  constructor(private readonly confluenceApi: ConfluenceApi) {}

  async createProject(title: string): Promise<Content> {
    let projectTemplate = await this.confluenceApi.getTemplate(
      this.projectTemplateId,
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
    projectPage = await this.confluenceApi.savePage(projectPage);
    this.createDocument(projectPage);
    return projectPage;
  }

  async createDocument(project: Content): Promise<Content> {
    let documentTemplate = await this.confluenceApi.getTemplate(
      this.documentTemplateId,
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
    documentPage = await this.confluenceApi.savePage(documentPage);
    return documentPage;
  }

  async createInitiative(title: string, project: Content): Promise<Content> {
    let initiativeTemplate = await this.confluenceApi.getTemplate(
      this.initiativeTemplateId,
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
    initiativePage = await this.confluenceApi.savePage(initiativePage);
    this.createPreparation(initiativePage);
    this.createDo(initiativePage);
    return initiativePage;
  }

  _summarizeTitle(title: string) {
    return title
      .split(' ')
      .map((word) => word[0])
      .join('');
  }

  async createPreparation(initiative: Content): Promise<Content> {
    let preparationTemplate = await this.confluenceApi.getTemplate(
      this.preparationTemplateId,
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
    preparationPage = await this.confluenceApi.savePage(preparationPage);
    return preparationPage;
  }

  async createDo(initiative: Content): Promise<Content> {
    let doTemplate = await this.confluenceApi.getTemplate(this.doTemplateId);
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
    doPage = await this.confluenceApi.savePage(doPage);
    return doPage;
  }
}
