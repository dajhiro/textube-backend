import { Module } from '@nestjs/common';
import { InnertubeService } from './innertube.service';
import { InnertubeLegacyService } from './innertube-legacy.service';

@Module({
  providers: [
    InnertubeService, // YouTube.js 기반 (기본값)
    InnertubeLegacyService, // 기존 구현 (Legacy)
  ],
  exports: [
    InnertubeService, // 기본 export
    InnertubeLegacyService, // Legacy도 선택 가능
  ],
})
export class InnertubeModule {}
