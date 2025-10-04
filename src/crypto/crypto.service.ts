import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { firstValueFrom } from 'rxjs';
import { Logger } from 'winston';

interface CoinGeckoResponse {
  [key: string]: { usd: number };
}

@Injectable()
export class CryptoService {
  private readonly apiUrl = 'https://api.coingecko.com/api/v3/simple/price';

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getCryptoPrice(symbol: string): Promise<number> {
    this.logger.info(`Fetching price for cryptocurrency: ${symbol}`);
    try {
      const response = await firstValueFrom(
        this.httpService.get<CoinGeckoResponse>(this.apiUrl, {
          params: {
            ids: symbol.toLowerCase(),
            vs_currencies: 'usd',
          },
        }),
      );
      const price = response.data[symbol.toLowerCase()]?.usd;
      if (!price) {
        throw new NotFoundException(`Price not found for symbol: ${symbol}`);
      }
      this.logger.info(`Fetched price for ${symbol}: $${price}`);
      return price;
    } catch (error) {
      this.logger.error(`Error fetching ${symbol} price: ${error.message}`);
      throw new NotFoundException(
        `Error fetching ${symbol} price: ${error.message}`,
      );
    }
  }
}
