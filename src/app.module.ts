import { JiraModule } from './jira/jira.module';
import { TmmfModule } from './tmmf/tmmf.module';
import { ConfluenceModule } from './confluence/confluence.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    JiraModule,
    TmmfModule,
    ConfluenceModule,
    PrometheusModule.register({
      defaultLabels: {
        app: process.env.npm_package_name,
        app_version: process.env.npm_package_version,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
