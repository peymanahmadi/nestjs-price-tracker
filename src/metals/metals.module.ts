import { Module } from '@nestjs/common';
import { MetalsService } from './metals.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [MetalsService],
})
export class MetalsModule {}
