import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface CoinGeckoResponse {
  [key: string]: { usd: number };
}

@Injectable()
export class CryptoService {
    private readonly apiUrl = 'https://api.coingecko.com/api/v3/simple/price';
    
      constructor(
        private configService: ConfigService,
        private httpService: HttpService,
      ) {}
    
      async getCryptoPrice(symbol: string): Promise<number> {
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
    
          return price;
        } catch (error) {
          throw new NotFoundException(
            `Error fetching ${symbol} price: ${error.message}`,
          );
        }
      }
}
