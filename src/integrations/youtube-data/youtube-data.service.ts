import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VideoDetailsDto } from './dto/video-details.dto';

@Injectable()
export class YoutubeDataService {
  private readonly logger = new Logger(YoutubeDataService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('YOUTUBE_API_KEY') || '';
  }

  async getVideoDetails(videoId: string): Promise<VideoDetailsDto> {
    this.logger.log(`Getting video details for: ${videoId}`);

    if (!this.apiKey) {
      throw new Error('YOUTUBE_API_KEY is not configured');
    }

    // 1. Get video details
    const videoUrl = `${this.baseUrl}/videos?part=snippet&id=${videoId}&key=${this.apiKey}`;
    const videoResponse = await fetch(videoUrl);

    if (!videoResponse.ok) {
      throw new Error(`YouTube API error: ${videoResponse.statusText}`);
    }

    const videoData = await videoResponse.json();

    if (!videoData.items || videoData.items.length === 0) {
      throw new Error(`Video not found: ${videoId}`);
    }

    const snippet = videoData.items[0].snippet;
    const channelId = snippet.channelId;

    // 2. Get channel details for profile image
    const channelUrl = `${this.baseUrl}/channels?part=snippet&id=${channelId}&key=${this.apiKey}`;
    const channelResponse = await fetch(channelUrl);

    if (!channelResponse.ok) {
      throw new Error(`YouTube API error: ${channelResponse.statusText}`);
    }

    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      throw new Error(`Channel not found: ${channelId}`);
    }

    const channelSnippet = channelData.items[0].snippet;

    // 3. Extract thumbnail (use maxres, high, medium, or default)
    const thumbnails = snippet.thumbnails;
    const thumbnailUrl =
      thumbnails.maxres?.url ||
      thumbnails.high?.url ||
      thumbnails.medium?.url ||
      thumbnails.default?.url;

    // 4. Extract channel profile image
    const channelThumbnails = channelSnippet.thumbnails;
    const channelImage =
      channelThumbnails.high?.url ||
      channelThumbnails.medium?.url ||
      channelThumbnails.default?.url;

    this.logger.log(
      `Successfully fetched video details: ${snippet.title} by ${channelSnippet.title}`,
    );

    return {
      thumbnailUrl,
      channelId,
      channelName: channelSnippet.title,
      channelImage,
    };
  }

  async searchVideos(query: string, maxResults: number = 10): Promise<any> {
    this.logger.log(`Searching videos with query: ${query}`);
    // TODO: Implement YouTube Data API call
    throw new Error('Method not implemented');
  }

  async getVideoComments(videoId: string, maxResults: number = 100): Promise<any> {
    this.logger.log(`Getting comments for video: ${videoId}`);
    // TODO: Implement YouTube Data API call
    throw new Error('Method not implemented');
  }

  async getChannelInfo(channelId: string): Promise<any> {
    this.logger.log(`Getting channel info for: ${channelId}`);
    // TODO: Implement YouTube Data API call
    throw new Error('Method not implemented');
  }
}
