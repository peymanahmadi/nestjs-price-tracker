import { Module } from '@nestjs/common';
import { ForexService } from './forex.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [ForexService]
})
export class ForexModule {}
