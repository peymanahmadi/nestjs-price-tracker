import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { firstValueFrom } from 'rxjs';
import { Logger } from 'winston';

@Injectable()
export class ForexService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://www.alphavantage.co/query';

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    const apiKey = this.configService.get<string>('ALPHA_VANTAGE_API_KEY');
    if (!apiKey) {
      throw new Error('ALPHA_VANTAGE_API_KEY is not configured');
    }
    this.apiKey = apiKey;
  }

  async getForexPrice(symbol: string): Promise<number> {
    this.logger.info(`Fetching price for: ${symbol}`);
    try {
      const [fromCurrency, toCurrency] = symbol
        .split('/')
        .map((s) => s.toUpperCase());

      const response = await firstValueFrom(
        this.httpService.get(this.baseUrl, {
          params: {
            function: 'CURRENCY_EXCHANGE_RATE',
            from_currency: fromCurrency,
            to_currency: toCurrency,
            apikey: this.apiKey,
          },
        }),
      );

      const exchangeData = response.data['Realtime Currency Exchange Rate'];
      if (!exchangeData) {
        throw new Error('No exchange rate data in response');
      }

      const price = parseFloat(exchangeData['5. Exchange Rate']);
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
