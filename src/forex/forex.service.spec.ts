import { Test, TestingModule } from '@nestjs/testing';
import { ForexService } from './forex.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';

describe('ForexService', () => {
  let service: ForexService;
  let httpService: HttpService;

  beforeEach(async () => {
    const mockLogger = { info: jest.fn(), error: jest.fn() };

    const mockConfigService = {
      get: (key: string) =>
        key === 'ALPHA_VANTAGE_API_KEY' ? 'TEST_KEY' : null,
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        ForexService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<ForexService>(ForexService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should fetch EUR/USD price', async () => {
    jest.spyOn(httpService, 'get').mockReturnValueOnce(
      of({
        data: {
          'Realtime Currency Exchange Rate': {
            '5. Exchange Rate': '1.1744',
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as AxiosResponse<any>),
    );

    const price = await service.getForexPrice('eur/usd');
    expect(price).toBe(1.1744);
    expect(httpService.get).toHaveBeenCalledWith(
      'https://www.alphavantage.co/query',
      {
        params: {
          function: 'CURRENCY_EXCHANGE_RATE',
          from_currency: 'EUR',
          to_currency: 'USD',
          apikey: 'TEST_KEY',
        },
      },
    );
  });

  it('should throw NotFoundException for network error', async () => {
    jest.spyOn(httpService, 'get').mockImplementationOnce(() => {
      throw new Error('Network error');
    });
    await expect(service.getForexPrice('eur/usd')).rejects.toThrow(
      'Error fetching eur/usd price: Network error',
    );
  });

  it('should fetch EUR/USD price history', async () => {
    jest.spyOn(httpService, 'get').mockReturnValueOnce(
      of({
        data: {
          'Time Series FX (Daily)': {
            '2023-10-01': { '4. close': '1.1744' },
            '2023-10-02': { '4. close': '1.1750' },
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as AxiosResponse<any>),
    );
    const history = await service.getForexPriceHistory('eur/usd', 2);
    expect(history).toEqual([
      { date: '2023-10-01', price: 1.1744 },
      { date: '2023-10-02', price: 1.175 },
    ]);
    expect(httpService.get).toHaveBeenCalledWith(
      'https://www.alphavantage.co/query',
      {
        params: {
          function: 'FX_DAILY',
          from_symbol: 'EUR',
          to_symbol: 'USD',
          apikey: 'TEST_KEY',
        },
      },
    );
  });
});
