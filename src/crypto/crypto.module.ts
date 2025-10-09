import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [CryptoService],
})
export class CryptoModule {}
