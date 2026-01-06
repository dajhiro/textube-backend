import { Controller, Get, Query } from '@nestjs/common';
import { InnertubeService } from '@integrations/innertube/innertube.service';
import { InnertubeLegacyService } from '@integrations/innertube/innertube-legacy.service';
import { AiService } from '@integrations/ai/ai.service';

/**
 * Development and Testing Controller
 * Only available in development and staging environments
 */
@Controller('dev')
export class DevController {
  constructor(
    private readonly innertubeService: InnertubeService,
    private readonly innertubeLegacyService: InnertubeLegacyService,
    private readonly aiService: AiService,
  ) {}

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

  @Get('test-innertube-new')
  async testInnertubeNew(@Query('url') url: string) {
    try {
      console.log(`\n=== Testing New Innertube (YouTube.js) ===`);
      const startTime = Date.now();
      const result = await this.innertubeService.getTranscriptFromUrl(url);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      return {
        success: true,
        implementation: 'YouTube.js',
        duration: `${duration}s`,
        result: {
          videoId: result.videoId,
          languageCode: result.languageCode,
          textLength: result.text.length,
          preview: result.text.substring(0, 200) + '...',
        },
      };
    } catch (error) {
      return {
        success: false,
        implementation: 'YouTube.js',
        error: error.message,
      };
    }
  }

  @Get('test-innertube-legacy')
  async testInnertubeLegacy(@Query('url') url: string) {
    try {
      console.log(`\n=== Testing Legacy Innertube ===`);
      const startTime = Date.now();
      const result =
        await this.innertubeLegacyService.getTranscriptFromUrl(url);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      return {
        success: true,
        implementation: 'Legacy',
        duration: `${duration}s`,
        result: {
          videoId: result.videoId,
          languageCode: result.languageCode,
          textLength: result.text.length,
          preview: result.text.substring(0, 200) + '...',
        },
      };
    } catch (error) {
      return {
        success: false,
        implementation: 'Legacy',
        error: error.message,
      };
    }
  }

  @Get('test-innertube-compare')
  async testInnertubeCompare(@Query('url') url: string) {
    const results = {
      url,
      timestamp: new Date().toISOString(),
      new: null as any,
      legacy: null as any,
    };

    // Test new implementation
    try {
      const startTime = Date.now();
      const result = await this.innertubeService.getTranscriptFromUrl(url);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      results.new = {
        success: true,
        duration: `${duration}s`,
        videoId: result.videoId,
        languageCode: result.languageCode,
        textLength: result.text.length,
      };
    } catch (error) {
      results.new = {
        success: false,
        error: error.message,
      };
    }

    // Test legacy implementation
    try {
      const startTime = Date.now();
      const result =
        await this.innertubeLegacyService.getTranscriptFromUrl(url);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      results.legacy = {
        success: true,
        duration: `${duration}s`,
        videoId: result.videoId,
        languageCode: result.languageCode,
        textLength: result.text.length,
      };
    } catch (error) {
      results.legacy = {
        success: false,
        error: error.message,
      };
    }

    return results;
  }
}
