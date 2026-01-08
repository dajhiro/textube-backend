import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import {
  IAiService,
  GenerateContentOptions,
  GenerateContentResult,
  AiGeneratedFields,
} from './ai.interface';
import { AI_PROMPTS } from './prompts/ai.prompts';

@Injectable()
export class GeminiFlashService implements IAiService {
  private readonly logger = new Logger(GeminiFlashService.name);
  private readonly genAI: GoogleGenAI;
  private readonly modelName = 'gemini-2.5-flash';

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.genAI = new GoogleGenAI({ apiKey });
  }

  async generateContentFromText(
    text: string,
    options: GenerateContentOptions = {},
  ): Promise<GenerateContentResult> {
    const { showProgress = false, outputStream = null } = options;

    const prompt = `${AI_PROMPTS.SUMMARIZE_TEXT}:\n\n${text}`;

    const startTime = performance.now();
    const responseStream = await this.genAI.models.generateContentStream({
      model: this.modelName,
      contents: prompt,
    });

    let fullContent = '';
    let lastChunk;

    for await (const chunk of responseStream) {
      const chunkText = chunk.text || '';
      fullContent += chunkText;
      lastChunk = chunk;

      if (showProgress && chunkText) {
        process.stdout.write(chunkText);
      }

      if (outputStream && chunkText) {
        outputStream.write(chunkText);
      }
    }

    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    const usage = lastChunk?.usageMetadata;

    this.logger.log(
      `Generated content in ${duration}s (${usage?.totalTokenCount || 0} tokens)`,
    );

    return {
      content: fullContent,
      duration,
      usage: {
        promptTokens: usage?.promptTokenCount || 0,
        outputTokens: usage?.candidatesTokenCount || 0,
        totalTokens: usage?.totalTokenCount || 0,
      },
    };
  }

  async generateEnrichedFields(text: string): Promise<AiGeneratedFields> {
    this.logger.log('Generating enriched fields with content');

    const prompt = `${AI_PROMPTS.GENERATE_ENRICHED_FIELDS}:\n\n${text}`;

    const startTime = performance.now();
    const response = await this.genAI.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        maxOutputTokens: 4096,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            content: { type: 'string' },
            seo: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                keywords: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: ['title', 'description', 'keywords'],
            },
            category: { type: 'string' },
            tags: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['content', 'seo', 'category', 'tags'],
        },
      },
    });

    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    const responseText = response.text || '';
    this.logger.log(`Generated enriched fields in ${duration}s`);

    // Parse JSON response
    try {
      const parsedData = JSON.parse(responseText);

      this.logger.log(
        `Successfully parsed enriched fields: ${parsedData.category}`,
      );

      return {
        content: parsedData.content,
        seo: {
          title: parsedData.seo.title,
          description: parsedData.seo.description,
          keywords: parsedData.seo.keywords,
        },
        category: parsedData.category,
        tags: parsedData.tags,
      };
    } catch (error) {
      this.logger.error('Failed to parse AI response as JSON', error);
      throw new Error('AI returned invalid JSON format');
    }
  }
}
