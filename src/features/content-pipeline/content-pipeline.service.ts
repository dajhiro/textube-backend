import { extractYoutubeVideoId } from '@common/utils/youtube.util';
import { Injectable, Logger } from '@nestjs/common';
import { InnertubeLegacyService } from '@integrations/innertube/innertube-legacy.service';
import { YoutubeDataService } from '@integrations/youtube-data/youtube-data.service';
import { AiService } from '@integrations/ai/ai.service';
import { PrismaService } from '@core/prisma/prisma.service';
import { PostsService } from '@domain/posts/posts.service';
import { GeneratePostInputDto } from './dto/generate-post-input.dto';
import { GeneratedPostDataDto } from './dto/generated-post-data.dto';
import { CreatePostFromUrlDto } from './dto/create-post-from-url.dto';

@Injectable()
export class ContentPipelineService {
  private readonly logger = new Logger(ContentPipelineService.name);

  constructor(
    private innertubeService: InnertubeLegacyService,
    private youtubeDataService: YoutubeDataService,
    private aiService: AiService,
    private prisma: PrismaService,
    private postsService: PostsService,
  ) {}

  private async generatePostData(
    input: GeneratePostInputDto,
  ): Promise<GeneratedPostDataDto> {
    const { youtubeUrl } = input;
    this.logger.log(`Starting content pipeline for URL: ${youtubeUrl}`);

    // 1. Extract video ID
    const videoId = extractYoutubeVideoId(youtubeUrl);
    this.logger.log(`Extracted video ID: ${videoId}`);

    // 2. Get transcript from Innertube
    const transcriptResult =
      await this.innertubeService.getTranscriptFromUrl(youtubeUrl);
    this.logger.log(
      `Fetched transcript (${transcriptResult.text.length} characters)`,
    );

    // 3. Get video metadata from YouTube Data API
    const videoDetails =
      await this.youtubeDataService.getVideoDetails(videoId);
    this.logger.log(`Fetched video details from YouTube Data API`);

    // 4. Generate AI content and enriched fields (content, SEO, category, tags)
    const aiEnrichedFields = await this.aiService.generateEnrichedFields(
      transcriptResult.text,
    );
    this.logger.log(`Generated AI content and enriched fields`);

    // 5. Build post data
    const postData: GeneratedPostDataDto = {
      title: aiEnrichedFields.seo.title,
      content: aiEnrichedFields.content,
      thumbnailUrl: videoDetails.thumbnailUrl,
      metadata: {
        seo: aiEnrichedFields.seo,
        ai_stats: {
          model: 'gemini-2.5-flash',
        },
      },
      category: aiEnrichedFields.category,
      tags: aiEnrichedFields.tags,
      youtubeId: videoId,
      channelId: videoDetails.channelId,
      channelName: videoDetails.channelName,
      channelImage: videoDetails.channelImage,
    };

    this.logger.log('Content pipeline completed successfully');
    return postData;
  }

  async createPostFromUrl(input: CreatePostFromUrlDto): Promise<void> {
    const { youtubeUrl, userId, isPublic = true } = input;
    this.logger.log(
      `Creating post from URL: ${youtubeUrl} for user ${userId}`,
    );

    try {
      // 1. Generate post data through pipeline
      const postData = await this.generatePostData({ youtubeUrl });

      // 2. Upsert Channel (create if not exists, update if exists)
      await this.prisma.channel.upsert({
        where: { id: postData.channelId },
        create: {
          id: postData.channelId,
          name: postData.channelName,
          image: postData.channelImage,
        },
        update: {
          name: postData.channelName,
          image: postData.channelImage,
        },
      });
      this.logger.log(`Upserted channel: ${postData.channelId}`);

      // 3. Create Post
      await this.postsService.create({
        title: postData.title,
        content: postData.content,
        thumbnailUrl: postData.thumbnailUrl,
        youtubeId: postData.youtubeId,
        metadata: postData.metadata,
        category: postData.category,
        tags: postData.tags,
        isReady: true,
        isPublic: isPublic,
        channelId: postData.channelId,
        userId: userId,
      });

      this.logger.log(
        `Successfully created post for video: ${postData.youtubeId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to create post from URL: ${youtubeUrl}`, error);
      throw error;
    }
  }
}
