import { Module } from '@nestjs/common';
import { CliModule } from './cli/cli.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CryptoModule } from './crypto/crypto.module';
import { ForexModule } from './forex/forex.module';
import { MetalsModule } from './metals/metals.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpModule,
    CliModule,
    CryptoModule,
    ForexModule,
    MetalsModule,
  ],
})
export class AppModule {}
