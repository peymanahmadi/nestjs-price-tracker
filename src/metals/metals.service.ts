import { Injectable } from '@nestjs/common';

@Injectable()
export class MetalsService {
  async getMetalsPrice(symbol: string): Promise<number> {
    return symbol === 'gold' ? 3820 : 34;
  }
}
