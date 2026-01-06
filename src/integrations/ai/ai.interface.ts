export interface GenerateContentOptions {
  showProgress?: boolean;
  outputStream?: NodeJS.WritableStream;
}

export interface GenerateContentResult {
  content: string;
  duration: string;
  usage: {
    promptTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export interface AiGeneratedFields {
  content: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  category: string;
  tags: string[];
}

export interface IAiService {
  generateContentFromText(
    text: string,
    options?: GenerateContentOptions,
  ): Promise<GenerateContentResult>;

  generateEnrichedFields(text: string): Promise<AiGeneratedFields>;
}
