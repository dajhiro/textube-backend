import { Controller, Post, Body, Logger, HttpCode } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadRequestDto } from './dto/upload-request.dto';

@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @HttpCode(202)
  async createPost(@Body() input: UploadRequestDto) {
    this.logger.log(
      `Received request to create post from URL: ${input.youtubeUrl} (user: ${input.userId})`,
    );

    // Start async processing (fire and forget)
    this.uploadService
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
