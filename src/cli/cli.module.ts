import { Module } from '@nestjs/common';
import { ListCommand } from './commands/list.command';
import { HttpModule } from '@nestjs/axios';
import { CryptoService } from 'src/crypto/crypto.service';
import { ForexService } from 'src/forex/forex.service';
import { MetalsService } from 'src/metals/metals.service';

@Module({
  imports: [HttpModule],
  providers: [ListCommand, CryptoService, ForexService, MetalsService],
})
export class CliModule {}
