import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import { InnertubeLegacyService } from '@integrations/innertube/innertube-legacy.service';
import { YoutubeDataService } from '@integrations/youtube-data/youtube-data.service';
import { AiService } from '@integrations/ai/ai.service';
import { PrismaService } from '@prisma/prisma.service';
import { PostsService } from '@posts/posts.service';

describe('UploadService', () => {
  let service: UploadService;

  // 가짜 객체(Mock) 생성
  const mockInnertubeService = { getTranscriptFromUrl: jest.fn() };
  const mockYoutubeDataService = { getVideoDetails: jest.fn() };
  const mockAiService = { generateEnrichedFields: jest.fn() };
  const mockPrismaService = { channel: { upsert: jest.fn() } };
  const mockPostsService = { create: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        { provide: InnertubeLegacyService, useValue: mockInnertubeService },
        { provide: YoutubeDataService, useValue: mockYoutubeDataService },
        { provide: AiService, useValue: mockAiService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PostsService, useValue: mockPostsService },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  it('유효하지 않은 유튜브 URL이 입력되면 에러를 던져야 한다', () => {
    const invalidUrl = 'https://not-youtube.com/watch?v=123';
    expect(() => (service as any).extractVideoId(invalidUrl)).toThrow('Invalid YouTube URL');
  });

  it('정상적인 URL에서 videoId를 올바르게 추출해야 한다', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const videoId = (service as any).extractVideoId(url);
    expect(videoId).toBe('dQw4w9WgXcQ');
  });

  it('generatePostData는 모든 외부 서비스가 정상일 때 데이터를 반환해야 한다', async () => {
    // Arrange: 각 Mock 서비스의 리턴값 설정
    mockInnertubeService.getTranscriptFromUrl.mockResolvedValue({ text: '테스트 자막' });
    mockYoutubeDataService.getVideoDetails.mockResolvedValue({
      videoId: 'dQw4w9WgXcQ',
      thumbnailUrl: 'thumb.jpg',
      channelId: 'ch1',
      channelName: '채널명',
    });
    mockAiService.generateEnrichedFields.mockResolvedValue({
      content: 'AI 요약 내용',
      seo: { title: 'SEO 제목' },
      category: 'IT',
      tags: ['test'],
    });

    // Act
    const result = await service.generatePostData({ youtubeUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ' });

    // Assert
    expect(result.title).toBe('SEO 제목');
    expect(mockAiService.generateEnrichedFields).toHaveBeenCalledWith('테스트 자막');
  });

  it('AI 서비스가 제목을 주지 않으면 기본 제목을 사용하거나 에러를 던져야 한다', async () => {
  // AI가 제목(title)을 빼먹고 줬다고 가정
  mockAiService.generateEnrichedFields.mockResolvedValue({
    content: '내용만 있음',
    seo: { title: '' }, // 제목 없음
    category: 'IT',
    tags: []
  });

  const result = await service.generatePostData({ youtubeUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ' });

  // 비즈니스 정책에 따라 검증
  // 1. 에러를 던지기로 했다면 -> expect(...).toThrow()
  // 2. 기본값(예: 'Untitled')을 쓰기로 했다면 -> expect(result.title).toBe('Untitled')
});
});
