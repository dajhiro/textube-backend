import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@core/prisma/prisma.module';
import { UsersModule } from '@domain/users/users.module';
import { PostsModule } from '@domain/posts/posts.module';
import { ChannelsModule } from '@domain/channels/channels.module';
import { AuthModule } from '@core/auth/auth.module';
import { AiModule } from '@integrations/ai/ai.module';
import { YoutubeDataModule } from '@integrations/youtube-data/youtube-data.module';
import { InnertubeModule } from '@integrations/innertube/innertube.module';
import { ContentPipelineModule } from '@features/content-pipeline/content-pipeline.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    PostsModule,
    ChannelsModule,
    AuthModule,
    AiModule,
    YoutubeDataModule,
    InnertubeModule,
    ContentPipelineModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
