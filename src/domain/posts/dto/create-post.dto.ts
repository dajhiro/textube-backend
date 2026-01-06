import {
  IsString,
  IsOptional,
  IsInt,
  IsUrl,
  IsArray,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { PostStatus } from '@prisma/client';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsUrl()
  thumbnailUrl: string;

  @IsString()
  youtubeId: string;

  @IsOptional()
  metadata?: any;

  @IsString()
  @IsOptional()
  category?: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @IsString()
  channelId: string;

  @IsInt()
  userId: number;
}
