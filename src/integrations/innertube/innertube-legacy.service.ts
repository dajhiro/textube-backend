import { Injectable, Logger } from '@nestjs/common';
import {
  IInnertubeService,
  TranscriptResult,
} from './innertube.interface';
import { YtDlpService } from './ytdlp.service';

interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
  kind?: string;
}

interface Json3Event {
  segs?: Array<{ utf8: string }>;
}

interface Json3 {
  events: Json3Event[];
}

@Injectable()
export class InnertubeLegacyService implements IInnertubeService {
  private readonly logger = new Logger(InnertubeLegacyService.name);

  constructor(private ytDlpService: YtDlpService) {}
  private readonly YOUTUBE_API_URL = 'https://www.youtube.com/youtubei/v1/player';

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

  private async fetchTranscript(videoId: string): Promise<any> {
    const body = {
      videoId,
      context: {
        client: {
          clientName: 'IOS',
          clientVersion: '19.09.3',
        },
      },
    };

    const response = await fetch(this.YOUTUBE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'com.google.ios.youtube/19.09.3 (iPhone16,2; U; CPU iOS 17_5_1 like Mac OS X)',
      },
      body: JSON.stringify(body),
    });

    return response.json();
  }

  private selectTrack(tracks: CaptionTrack[]): CaptionTrack | null {
    if (!tracks || tracks.length === 0) return null;

    const asr = tracks.find((t) => t.kind === 'asr');

    if (asr) {
      const uploaded = tracks.find(
        (t) => !t.kind && t.languageCode === asr.languageCode,
      );

      return uploaded || asr;
    }

    const anyUploaded = tracks.find((t) => !t.kind);
    if (anyUploaded) return anyUploaded;

    return tracks[0];
  }

  private json3ToText(vtt: Json3): string {
    return vtt.events
      .filter((event) => event.segs && event.segs.length > 0)
      .flatMap((event) => event.segs || [])
      .map((seg) => seg?.utf8 || '')
      .map((text) =>
        text
          .replace(/^>>?\s*/, '')
          .replace(/\[.*?\]/g, ''),
      )
      .filter((text) => text !== '\n' || text.length > 0)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async getTranscriptFromUrl(url: string): Promise<TranscriptResult> {
    const videoId = this.extractId(url);

    if (!videoId) {
      throw new Error('올바르지 않은 YouTube URL입니다');
    }

    this.logger.log(`[Legacy] Fetching transcript for video: ${videoId}`);

    const data = await this.fetchTranscript(videoId);
    const playability = data?.playabilityStatus?.status;

    if (playability === 'LOGIN_REQUIRED' || playability === 'UNPLAYABLE') {
      this.logger.warn(
        `[Legacy] YouTube API blocked (${playability}), falling back to yt-dlp`,
      );
      return this.ytDlpService.getTranscriptFromUrl(url);
    }

    const tracks =
      data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!tracks || tracks.length === 0) {
      this.logger.warn('[Legacy] No captions from API, falling back to yt-dlp');
      return this.ytDlpService.getTranscriptFromUrl(url);
    }

    const track = this.selectTrack(tracks);
    if (!track) {
      throw new Error('사용 가능한 자막 트랙이 없습니다');
    }

    const captionUrl = track.baseUrl + '&fmt=json3';
    const json3 = await fetch(captionUrl).then((r) => r.json());

    if (!json3) {
      throw new Error('자막이 비어 있습니다');
    }

    const text = this.json3ToText(json3);

    this.logger.log(
      `[Legacy] Successfully fetched transcript for ${videoId} (${track.languageCode})`,
    );

    return {
      videoId,
      languageCode: track.languageCode,
      text,
    };
  }
}
