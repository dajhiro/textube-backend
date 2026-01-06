import { Module } from '@nestjs/common';
import { ContentPipelineService } from './content-pipeline.service';
import { ContentPipelineController } from './content-pipeline.controller';
import { InnertubeModule } from '@integrations/innertube/innertube.module';
import { YoutubeDataModule } from '@integrations/youtube-data/youtube-data.module';
import { AiModule } from '@integrations/ai/ai.module';
import { PrismaModule } from '@core/prisma/prisma.module';
import { PostsModule } from '@domain/posts/posts.module';

@Module({
  imports: [
    InnertubeModule,
    YoutubeDataModule,
    AiModule,
    PrismaModule,
    PostsModule,
  ],
  controllers: [ContentPipelineController],
  providers: [ContentPipelineService],
  exports: [ContentPipelineService],
})
export class ContentPipelineModule {}
