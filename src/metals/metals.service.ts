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
}
