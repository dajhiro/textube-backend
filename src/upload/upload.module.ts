import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { InnertubeModule } from '@integrations/innertube/innertube.module';
import { YoutubeDataModule } from '@integrations/youtube-data/youtube-data.module';
import { AiModule } from '@integrations/ai/ai.module';
import { PrismaModule } from '@prisma/prisma.module';
import { PostsModule } from '@posts/posts.module';

@Module({
  imports: [
    InnertubeModule,
    YoutubeDataModule,
    AiModule,
    PrismaModule,
    PostsModule,
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
