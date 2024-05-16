import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'dev'
        ? ['log', 'debug', 'error', 'verbose', 'warn']
        : ['error', 'warn'],
  });
  const logger = new Logger('Main');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Agile automate')
    .setDescription(
      'The Agile automate API to improve the user experience for Jira/Confluence',
    )
    .setVersion(process.env.npm_package_version)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger-ui', app, document);

  logger.debug(`ENV: ${process.env.NODE_ENV}`);
  logger.debug(`JIRA_BASEURL: ${process.env.JIRA_BASEURL}`);
  logger.debug(
    `JIRA_BUSINESS_PLAN_SPACE_KEY: ${process.env.JIRA_BUSINESS_PLAN_SPACE_KEY}`,
  );
  logger.debug(`JIRA_PROJECT_SPACE_KEY: ${process.env.JIRA_PROJECT_SPACE_KEY}`);
  logger.debug(`CONFLUENCE_BASEURL: ${process.env.CONFLUENCE_BASEURL}`);
  logger.debug(`CONFLUENCE_SPACE_KEY: ${process.env.CONFLUENCE_SPACE_KEY}`);
  logger.debug(`ATLASSIAN_TOKEN: ${process.env.ATLASSIAN_TOKEN}`);
  await app.listen(3000);
}
bootstrap();
