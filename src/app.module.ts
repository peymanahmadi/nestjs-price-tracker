import { Module } from '@nestjs/common';
import { CliModule } from './cli/cli.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpModule,
    CliModule,
  ],
})
export class AppModule {}
