import { Module } from '@nestjs/common';
import { ListCommand } from './commands/list.command';
import { PriceService } from 'src/price/price.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [ListCommand, PriceService],
})
export class CliModule {}
