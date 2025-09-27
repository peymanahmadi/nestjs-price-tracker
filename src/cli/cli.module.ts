import { Module } from '@nestjs/common';
import { ListCommand } from './commands/list.command';
import { PriceService } from 'src/price/price.service';

@Module({
  providers: [ListCommand, PriceService],
})
export class CliModule {}
