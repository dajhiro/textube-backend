import { IsString, IsInt, IsUrl, IsBoolean, IsOptional } from 'class-validator';

export class CreatePostFromUrlDto {
  @IsUrl()
  @IsString()
  youtubeUrl: string;

  @IsInt()
  userId: number;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
