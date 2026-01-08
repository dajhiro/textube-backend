import { Controller, Post, Body, Logger, HttpCode } from '@nestjs/common';
import { ContentPipelineService } from './content-pipeline.service';
import { GeneratePostInputDto } from './dto/generate-post-input.dto';
import { CreatePostFromUrlDto } from './dto/create-post-from-url.dto';

@Controller('content-pipeline')
export class ContentPipelineController {
  private readonly logger = new Logger(ContentPipelineController.name);

  constructor(private readonly contentPipelineService: ContentPipelineService) {}

  /*
  @Post('generate')
  async generatePost(@Body() input: GeneratePostInputDto) {
    this.logger.log(`Received request to generate post from URL: ${input.youtubeUrl}`);

    try {
      const result = await this.contentPipelineService.generatePostData(input);
      this.logger.log('Successfully generated post data');
      return result;
    } catch (error) {
      this.logger.error('Failed to generate post data', error);
      throw error;
    }
  }
  */

  @Post('create-post')
  @HttpCode(202)
  async createPost(@Body() input: CreatePostFromUrlDto) {
    this.logger.log(
      `Received request to create post from URL: ${input.youtubeUrl} (user: ${input.userId})`,
    );

    // Start async processing (fire and forget)
    this.contentPipelineService
      .createPostFromUrl(input)
      .catch((error) => {
        this.logger.error('Background post creation failed', error);
      });

    // Return immediately
    return {
      message: 'Post creation started',
      status: 'processing',
      youtubeUrl: input.youtubeUrl,
    };
  }
}
