import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfluenceApi, Content, ContentType } from './types';

@Injectable()
export class ConfluenceService {
  private readonly logger = new Logger(ConfluenceService.name);

  async getStatus(confluenceApi: ConfluenceApi): Promise<Response> {
    return fetch(`${confluenceApi.baseUrl}/applinks/1.0/manifest`);
  }

  async getTemplate(
    templateId: number,
    confluenceApi: ConfluenceApi,
  ): Promise<Content> {
    this.logger.debug(`Load template: ${templateId}`);
    const responseTemplate = await fetch(
      `${confluenceApi.baseUrl}/api/template/${templateId}?expand=body.storage`,
      {
        headers: {
          Authorization: confluenceApi.token,
          Accept: 'application/json',
        },
      },
    );
    if (responseTemplate.status !== 200) {
      console.error('Error to retrieve the content of the template');
      throw new Error(`Template not found: ${templateId}`);
    }
    const template: Content = await responseTemplate.json();
    return template;
  }

  async getOnePage(
    pageId: number,
    confluenceApi: ConfluenceApi,
  ): Promise<Content> {
    this.logger.debug(`Load page: ${pageId}`);
    const responsePage = await fetch(
      `${confluenceApi.baseUrl}/api/content/${pageId}?expand=body.storage&id=${pageId}`,
      {
        headers: {
          Authorization: confluenceApi.token,
          Accept: 'application/json',
        },
      },
    );
    if (responsePage.status !== 200) {
      console.error('Error to retrieve the content of the page');
      throw new Error(`Page not found: ${pageId}`);
    }
    const page: Content = await responsePage.json();
    return page;
  }

  async savePage(
    page: Content,
    confluenceApi: ConfluenceApi,
  ): Promise<Content> {
    this.logger.debug(`Save page: ${page.title}`);
    page.type = ContentType.page;
    // page.status = 'draft';
    page.space = {
      key: confluenceApi.spaceKey,
    };
    const responsePage = await fetch(`${confluenceApi.baseUrl}/api/content`, {
      method: 'POST',
      headers: {
        Authorization: confluenceApi.token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(page),
    });
    if (responsePage.status !== 200) {
      const result = await responsePage.json();
      throw new HttpException(
        `Error to save page[${responsePage.status}]: ${JSON.stringify(result)}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return responsePage.json();
  }
}
