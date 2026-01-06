import { Module } from '@nestjs/common';
import { DevController } from './dev.controller';
import { InnertubeModule } from '@integrations/innertube/innertube.module';
import { AiModule } from '@integrations/ai/ai.module';

/**
 * Development Module
 * Only loaded in development and staging environments
 */
@Module({
  imports: [InnertubeModule, AiModule],
  controllers: [DevController],
})
export class DevModule {}
