import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TmmfService } from './tmmf/tmmf.service';
import { ConfluenceService } from './confluence/confluence.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
