import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'child_process';
import { readFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { IInnertubeService, TranscriptResult } from './innertube.interface';

interface Json3Event {
  segs?: Array<{ utf8: string }>;
}

interface Json3 {
  events: Json3Event[];
}

@Injectable()
export class YtDlpService implements IInnertubeService {
  private readonly logger = new Logger(YtDlpService.name);
  private readonly ytDlpPath: string;

  constructor(private configService: ConfigService) {
    this.ytDlpPath =
      this.configService.get<string>('YTDLP_PATH') || 'yt-dlp';
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

  private runYtDlp(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn(this.ytDlpPath, args);
      let stderr = '';
      proc.stderr.on('data', (d: Buffer) => (stderr += d.toString()));
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`yt-dlp exited with code ${code}: ${stderr}`));
      });
      proc.on('error', reject);
    });
  }

  private json3ToText(json3: Json3): string {
    return json3.events
      .filter((e) => e.segs && e.segs.length > 0)
      .flatMap((e) => e.segs || [])
      .map((s) => s?.utf8 || '')
      .map((t) => t.replace(/^>>?\s*/, '').replace(/\[.*?\]/g, ''))
      .filter((t) => t !== '\n' && t.length > 0)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async getTranscriptFromUrl(url: string): Promise<TranscriptResult> {
    const videoId = this.extractId(url);
    if (!videoId) {
      throw new Error('올바르지 않은 YouTube URL입니다');
    }

    this.logger.log(`[yt-dlp] Fetching transcript for video: ${videoId}`);

    const outPath = join(tmpdir(), `yt_${videoId}_${Date.now()}`);

    let json3: Json3 | null = null;
    let languageCode = 'auto';

    for (const lang of ['ko', 'en']) {
      const filePath = `${outPath}.${lang}.json3`;
      try {
        await this.runYtDlp([
          '--write-auto-sub',
          '--skip-download',
          '--sub-format', 'json3',
          '--sub-lang', lang,
          '--no-warnings',
          '-o', outPath,
          `https://www.youtube.com/watch?v=${videoId}`,
        ]);
        const raw = await readFile(filePath, 'utf8');
        json3 = JSON.parse(raw);
        languageCode = lang;
        await unlink(filePath).catch(() => {});
        break;
      } catch (e) {
        this.logger.debug(`[yt-dlp] lang=${lang} failed: ${e.message}`);
        await unlink(filePath).catch(() => {});
      }
    }

    if (!json3) {
      throw new Error('자막이 존재하지 않습니다');
    }

    const text = this.json3ToText(json3);
    if (!text) {
      throw new Error('자막 텍스트가 비어 있습니다');
    }

    this.logger.log(
      `[yt-dlp] Successfully fetched transcript for ${videoId} (${languageCode}, ${text.length} chars)`,
    );

    return { videoId, languageCode, text };
  }
}
