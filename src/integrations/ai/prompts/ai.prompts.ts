export const AI_PROMPTS = {
  SUMMARIZE_TEXT: `다음 텍스트의 내용을 마크다운 형식으로 상세히 2000자로 설명해줘. 내용만 부탁해 바로`,

  GENERATE_ENRICHED_FIELDS: `다음 텍스트를 분석하여 블로그 포스트 콘텐츠와 메타데이터를 생성해주세요.

- content: 텍스트 내용을 마크다운 형식으로 상세히 2000자로 설명
- seo.title: 유튜브 제목보다 더 검색이 잘 되는 SEO 최적화 제목 (50-60자)
- seo.description: 핵심 내용을 요약한 메타 설명문 (120-160자)
- seo.keywords: 검색 키워드 5개
- category: 적절한 카테고리명 (예: Technology, Education, Entertainment 등)
- tags: 관련 태그 5개

텍스트`,
} as const;
