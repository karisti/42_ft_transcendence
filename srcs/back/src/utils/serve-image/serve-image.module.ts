import { Module } from '@nestjs/common';
import { ServeImageController } from './serve-image.controller';
import { ServeImageService } from './serve-image.service';

@Module({
  controllers: [ServeImageController],
  providers: [ServeImageService]
})
export class ServeImageModule { }
