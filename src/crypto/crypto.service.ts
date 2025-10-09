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
    private httpService: HttpService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getCryptoPrice(symbol: string): Promise<number> {
    return (await this.getCryptoPrices([symbol]))[symbol];
  }

  async getCryptoPrices(symbols: string[]): Promise<Record<string, number>> {
    this.logger.info(
      `Fetching prices for cryptocurrencies: ${symbols.join(', ')}`,
    );
    try {
      const response = await firstValueFrom(
        this.httpService.get<CoinGeckoResponse>(this.apiUrl, {
          params: {
            ids: symbols.map((s) => s.toLowerCase()).join(','),
            vs_currencies: 'usd',
          },
        }),
      );
      const prices = response.data;
      const result: Record<string, number> = {};
      for (const symbol of symbols) {
        const price = prices[symbol.toLowerCase()]?.usd;
        if (!price) {
          throw new NotFoundException(`Price not found for symbol: ${symbol}`);
        }
        result[symbol] = price;
        this.logger.info(`Fetched price for ${symbol}: $${price}`);
      }
      return result;
    } catch (error) {
      this.logger.error(`Error fetching prices: ${error.message}`);
      throw new NotFoundException(`Error fetching prices: ${error.message}`);
    }
  }

  async getCryptoPriceHistory(
    symbol: string,
    days: number,
  ): Promise<{ date: string; price: number }[]> {
    this.logger.info(`Fetching ${days}-day price history for ${symbol}`);
    // Placeholder: coingecko.com may not support historical data
    const currentPrice = await this.getCryptoPrice(symbol);
    const history: { date: string; price: number }[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      history.push({
        date: date.toISOString().split('T')[0],
        price: currentPrice * (1 + (Math.random() - 0.5) * 0.1), // Simulate ±10% variation
      });
    }
    this.logger.info(
      `Generated ${history.length} historical prices for ${symbol}`,
    );
    return history;
  }
}
