import { Module } from '@nestjs/common';
import { ListCommand } from './commands/list.command';
import { HttpModule } from '@nestjs/axios';
import { CryptoService } from 'src/crypto/crypto.service';
import { ForexService } from 'src/forex/forex.service';
import { MetalsService } from 'src/metals/metals.service';
import { PriceCommand } from './commands/price.command';
import { WatchCommand } from './commands/watch.command';
import { HistoryCommand } from './commands/history.command';

@Module({
  imports: [HttpModule],
  providers: [
    ListCommand,
    PriceCommand,
    WatchCommand,
    HistoryCommand,
    CryptoService,
    ForexService,
    MetalsService,
  ],
})
export class CliModule {}
