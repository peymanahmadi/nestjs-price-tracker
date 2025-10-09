import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { firstValueFrom } from 'rxjs';
import { Logger } from 'winston';

interface GoldApiResponse {
  price: string;
  // Add other fields as needed
}

@Injectable()
export class MetalsService {
  constructor(
    private httpService: HttpService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getMetalsPrice(symbol: string): Promise<number> {
    this.logger.info(`Fetching price for: ${symbol}`);
    const url = `https://api.gold-api.com/price/${symbol}`;
    try {
      const response = await firstValueFrom(
        this.httpService.get<GoldApiResponse>(url),
      );

      const exchangeData = response.data;
      if (!exchangeData || !exchangeData.price) {
        throw new Error('Price data missing or empty in API response');
      }

      const price = parseFloat(exchangeData['price']);
      if (isNaN(price)) {
        throw new Error('Invalid price format received');
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

  async getMetalsPriceHistory(
    symbol: string,
    days: number,
  ): Promise<{ date: string; price: number }[]> {
    this.logger.info(`Fetching ${days}-day price history for ${symbol}`);
    // Placeholder: gold-api.com may not support historical data
    const currentPrice = await this.getMetalsPrice(symbol);
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
