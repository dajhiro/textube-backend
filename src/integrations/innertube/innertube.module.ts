import { Module } from '@nestjs/common';
import { InnertubeService } from './innertube.service';
import { InnertubeLegacyService } from './innertube-legacy.service';
import { YtDlpService } from './ytdlp.service';

@Module({
  providers: [
    YtDlpService,
    InnertubeService,
    InnertubeLegacyService,
  ],
  exports: [
    YtDlpService,
    InnertubeService,
    InnertubeLegacyService,
  ],
})
export class InnertubeModule {}
