import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPostsQueryDto {
  // Cursor-based pagination
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cursor?: number; // 마지막 게시글 ID

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  // 필터
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  tag?: string;
}

export class GetPostsResponseDto {
  posts: any[]; // Post 타입으로 변경 가능
  nextCursor: number | null; // 다음 페이지의 cursor (없으면 null)
  hasMore: boolean; // 다음 페이지 존재 여부
}
