import { PostStatus } from '@prisma/client';

export interface PostMetadata {
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  ai_stats: {
    model: string;
  };
}

export class GeneratedPostDataDto {
  title: string;
  content: string;
  thumbnailUrl: string;
  youtubeId: string;
  metadata: PostMetadata;
  category: string;
  tags: string[];
  status: PostStatus;
  published: boolean;
  channelId: string;
  channelName: string;
  channelImage: string;
}
