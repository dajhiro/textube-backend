import { IsString, IsUrl, IsBoolean, IsOptional } from 'class-validator';

export class UploadRequestDto {
  @IsUrl()
  @IsString()
  youtubeUrl: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
