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

export interface GeneratedPostData {
  title: string;
  content: string;
  thumbnailUrl: string;

  category: string;
  tags: string[];

  youtubeId: string;
  channelId: string;
  channelName: string;
  channelImage: string;

  metadata: PostMetadata;
}
