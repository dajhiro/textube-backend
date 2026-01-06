import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { InnertubeService } from '@integrations/innertube/innertube.service';
import { AiService } from '@integrations/ai/ai.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly innertubeService: InnertubeService,
    private readonly aiService: AiService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-youtube-analysis')
  async testYoutubeAnalysis(@Query('url') url: string) {
    try {
      console.log(`\n=== Starting YouTube Analysis ===`);
      console.log(`URL: ${url}\n`);

      console.log('Step 1: Fetching transcript from YouTube...');
      const transcript = await this.innertubeService.getTranscriptFromUrl(url);
      console.log(`✓ Transcript fetched successfully`);
      console.log(`  - Video ID: ${transcript.videoId}`);
      console.log(`  - Language: ${transcript.languageCode}`);
      console.log(`  - Text length: ${transcript.text.length} characters\n`);

      console.log('Step 2: Analyzing transcript with Gemini AI...');
      const analysis = await this.aiService.generateContentFromText(
        transcript.text,
        { showProgress: true },
      );
      console.log(`\n✓ Analysis completed`);
      console.log(`  - Duration: ${analysis.duration}s`);
      console.log(`  - Tokens used: ${analysis.usage.totalTokens}`);
      console.log(`    - Input: ${analysis.usage.promptTokens}`);
      console.log(`    - Output: ${analysis.usage.outputTokens}\n`);

      console.log('=== Analysis Result ===');
      console.log(analysis.content);
      console.log('\n=== End of Analysis ===\n');

      return {
        success: true,
        transcript: {
          videoId: transcript.videoId,
          languageCode: transcript.languageCode,
          textLength: transcript.text.length,
        },
        analysis: {
          content: analysis.content,
          duration: analysis.duration,
          usage: analysis.usage,
        },
      };
    } catch (error) {
      console.error('Error during YouTube analysis:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
