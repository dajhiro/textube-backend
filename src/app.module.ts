import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@prisma/prisma.module';
import { UsersModule } from '@users/users.module';
import { PostsModule } from '@posts/posts.module';
import { ChannelsModule } from '@channels/channels.module';
import { AuthModule } from '@auth/auth.module';
import { AiModule } from '@integrations/ai/ai.module';
import { YoutubeDataModule } from '@integrations/youtube-data/youtube-data.module';
import { InnertubeModule } from '@integrations/innertube/innertube.module';
import { UploadModule } from '@upload/upload.module';
import { DevModule } from './dev/dev.module';

// Conditionally include DevModule based on environment
const isDevelopment = process.env.NODE_ENV !== 'production';

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
    UploadModule,
    // Only load DevModule in development/staging
    ...(isDevelopment ? [DevModule] : []),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
