import {
  IsString,
  IsOptional,
  IsInt,
  IsUrl,
  IsArray,
  IsBoolean,
} from 'class-validator';

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

  @IsBoolean()
  @IsOptional()
  isReady?: boolean;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsInt()
  @IsOptional()
  viewCount?: number;

  @IsInt()
  @IsOptional()
  likeCount?: number;

  @IsInt()
  @IsOptional()
  commentCount?: number;

  @IsString()
  channelId: string;

  @IsInt()
  userId: number;
}
