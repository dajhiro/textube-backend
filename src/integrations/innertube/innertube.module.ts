import { Module } from '@nestjs/common';
import { InnertubeService } from './innertube.service';

@Module({
  providers: [InnertubeService],
  exports: [InnertubeService],
})
export class InnertubeModule {}
