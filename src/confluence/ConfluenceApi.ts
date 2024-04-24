import { Injectable, Logger } from '@nestjs/common';
import { Content, ContentType } from './types';
import { json } from 'stream/consumers';

const baseUrl: string = 'https://toyota-europe.atlassian.net/wiki/rest';
const userAccount: string = 'fabien.haingue@toyotafr.com';
const apiKey: string =
  'ATATT3xFfGF04uCS8eEnWbgfrBBIDOvuyNsCYGoggPIcVakEvW4kPkLFG1P0nI7CsPwqFtUrfZBClfpLgktnBUdv8bjz9EMCPv5QnSi1x9Ad7D9kY8TMEL6Z5ADvN_FlXHHfasxHBpcIcINJAMB1ECw_DU0xRMnHryEi1MrmO5nkMKvUGSLIszs=14037330';
const token: string = `Basic ${Buffer.from(`${userAccount}:${apiKey}`).toString('base64')}`;
const spaceKey: string = 'TMMFIS';

@Injectable()
export default class ConfluenceApi {
  private readonly logger = new Logger(ConfluenceApi.name);

  async getTemplate(templateId: Number): Promise<Content> {
    this.logger.debug(`Load template: ${templateId}`);
    let responseTemplate = await fetch(
      `${baseUrl}/api/template/${templateId}?expand=body.storage`,
      {
        headers: {
          Authorization: token,
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
      key: spaceKey,
    };
    let responsePage = await fetch(`${baseUrl}/api/content`, {
      method: 'POST',
      headers: {
        Authorization: token,
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
