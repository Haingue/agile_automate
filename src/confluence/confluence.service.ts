/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, Logger } from '@nestjs/common';
import { CONFLUENCE_API, Content, ContentType } from './types';

@Injectable()
export class ConfluenceService {
  private readonly logger = new Logger(ConfluenceService.name);

  async getTemplate(templateId: Number): Promise<Content> {
    this.logger.debug(`Load template: ${templateId}`);
    let responseTemplate = await fetch(
      `${CONFLUENCE_API.baseUrl}/api/template/${templateId}?expand=body.storage`,
      {
        headers: {
          Authorization: CONFLUENCE_API.token,
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

  async savePage(page: Content): Promise<Content> {
    this.logger.debug(`Save page: ${JSON.stringify(page)}`);
    page.type = ContentType.page;
    page.status = 'draft';
    page.space = {
      key: CONFLUENCE_API.spaceKey,
    };
    let responsePage = await fetch(`${CONFLUENCE_API.baseUrl}/api/content`, {
      method: 'POST',
      headers: {
        Authorization: CONFLUENCE_API.token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(page),
    });
    if (responsePage.status !== 200) {
      const result = await responsePage.json();
      throw new Error(
        `Error to save page[${responsePage.status}]: ${JSON.stringify(result)}`,
      );
    }
    return responsePage.json();
  }
}
