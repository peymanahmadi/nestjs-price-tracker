import { Module } from '@nestjs/common';
import { CliModule } from './cli/cli.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CliModule,
  ],
})
export class AppModule {}
