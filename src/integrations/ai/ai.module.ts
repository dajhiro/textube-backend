import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { GeminiFlashService } from './gemini-flash.service';

@Module({
  providers: [GeminiFlashService, AiService],
  exports: [AiService],
})
export class AiModule {}
