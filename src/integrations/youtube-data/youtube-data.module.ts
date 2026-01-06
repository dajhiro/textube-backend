import { Module } from '@nestjs/common';
import { YoutubeDataService } from './youtube-data.service';

@Module({
  providers: [YoutubeDataService],
  exports: [YoutubeDataService],
})
export class YoutubeDataModule {}
