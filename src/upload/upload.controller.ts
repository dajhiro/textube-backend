import { Controller, Post, Body, Logger, HttpCode, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { UploadService } from './upload.service';
import { UploadRequestDto } from './dto/upload-request.dto';
import { SessionAuthGuard } from '@auth/guards/session-auth.guard';

@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @HttpCode(202)
  @UseGuards(SessionAuthGuard)
  async createPost(@Body() input: UploadRequestDto, @Req() req: Request) {
    const userId = (req.user as { id: number }).id;
    this.logger.log(
      `Received request to create post from URL: ${input.youtubeUrl} (user: ${userId})`,
    );

    // Start async processing (fire and forget)
    this.uploadService
      .createPostFromUrl(input, userId)
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
