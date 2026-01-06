import { IsString, IsUrl } from 'class-validator';

export class GeneratePostInputDto {
  @IsUrl()
  @IsString()
  youtubeUrl: string;
}
