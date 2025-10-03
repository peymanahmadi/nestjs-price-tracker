import { Module } from '@nestjs/common';
import { MetalsService } from './metals.service';

@Module({
  providers: [MetalsService]
})
export class MetalsModule {}
