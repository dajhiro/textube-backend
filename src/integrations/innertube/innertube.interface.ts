export interface TranscriptResult {
  videoId: string;
  languageCode: string;
  text: string;
}

export interface IInnertubeService {
  getTranscriptFromUrl(url: string): Promise<TranscriptResult>;
}
