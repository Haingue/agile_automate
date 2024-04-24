import { JiraModule } from './jira/jira.module';
import { TmmfModule } from './tmmf/tmmf.module';
import { ConfluenceModule } from './confluence/confluence.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [JiraModule, TmmfModule, ConfluenceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
