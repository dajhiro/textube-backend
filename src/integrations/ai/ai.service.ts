import { Injectable } from '@nestjs/common';
import { GeminiFlashService } from './gemini-flash.service';
import {
  IAiService,
  GenerateContentOptions,
  GenerateContentResult,
  AiGeneratedFields,
} from './ai.interface';

@Injectable()
export class AiService implements IAiService {
  constructor(private geminiFlashService: GeminiFlashService) {}

  async generateContentFromText(
    text: string,
    options?: GenerateContentOptions,
  ): Promise<GenerateContentResult> {
    return this.geminiFlashService.generateContentFromText(text, options);
  }

  async generateEnrichedFields(text: string): Promise<AiGeneratedFields> {
    return this.geminiFlashService.generateEnrichedFields(text);
  }
}
