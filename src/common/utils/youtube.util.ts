export const extractYoutubeVideoId = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const parts = urlObj.hostname.split('.'); // ['m', 'youtube', 'com']

      // 뒤에서 두 자리가 'youtube.com' 이거나 'youtu.be' 인지 확인
      const isYoutube = parts.slice(-2).join('.') === 'youtube.com';
      const isShortLink = parts.slice(-2).join('.') === 'youtu.be';

      if (isYoutube) {
        const videoId = urlObj.searchParams.get('v');
        if (videoId) return videoId;
      }

      if (isShortLink) {
        const videoId = urlObj.pathname.replace('/', '');
        if (videoId) return videoId;
      }

      throw new Error('Invalid YouTube URL');
    } catch {
      throw new Error('Invalid YouTube URL');
    }
  }

