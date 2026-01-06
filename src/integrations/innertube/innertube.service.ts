import { Injectable, Logger } from '@nestjs/common';
import { Innertube } from 'youtubei.js';
import {
  IInnertubeService,
  TranscriptResult,
} from './innertube.interface';

@Injectable()
export class InnertubeService implements IInnertubeService {
  private readonly logger = new Logger(InnertubeService.name);
  private innertube: Innertube | null = null;

  private async getClient(): Promise<Innertube> {
    if (!this.innertube) {
      this.innertube = await Innertube.create();
      this.logger.log('YouTube.js client initialized');
    }
    return this.innertube;
  }

  private extractId(url: string): string | null {
    try {
      const urlObj = new URL(url);

      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v');
      }

      if (urlObj.hostname.includes('youtu.be')) {
        return urlObj.pathname.replace('/', '');
      }
    } catch {
      return null;
    }
    return null;
  }

  async getTranscriptFromUrl(url: string): Promise<TranscriptResult> {
    const videoId = this.extractId(url);

    if (!videoId) {
      throw new Error('올바르지 않은 YouTube URL입니다');
    }

    this.logger.log(`[YouTube.js] Fetching transcript for video: ${videoId}`);

    try {
      const client = await this.getClient();
      const info = await client.getInfo(videoId);

      // Use youtubei.js built-in transcript method if available
      const transcriptData = await info.getTranscript();

      if (!transcriptData || !transcriptData.transcript) {
        throw new Error('자막이 존재하지 않습니다');
      }

      // Access the transcript content
      const segments =
        transcriptData.transcript.content?.body?.initial_segments;

      if (!segments || segments.length === 0) {
        throw new Error('자막 세그먼트가 비어 있습니다');
      }

      // Extract text from segments
      const text = segments
        .filter((segment: any) => segment.snippet)
        .map((segment: any) => segment.snippet.text?.toString() || '')
        .filter((text: string) => text.length > 0)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Try to get language code
      const languageCode = 'auto'; // youtubei.js doesn't expose language easily

      this.logger.log(
        `[YouTube.js] Successfully fetched transcript for ${videoId} (${languageCode}, ${text.length} chars)`,
      );

      return {
        videoId,
        languageCode,
        text,
      };
    } catch (error) {
      this.logger.error(
        `[YouTube.js] Failed to fetch transcript for ${videoId}:`,
        error,
      );
      throw new Error(
        `자막을 가져오는 데 실패했습니다: ${error.message}`,
      );
    }
  }
}
