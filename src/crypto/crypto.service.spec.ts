import { HttpModule, HttpService } from '@nestjs/axios';
import { CryptoService } from './crypto.service';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

describe('CryptoService', () => {
  let service: CryptoService;
  let httpService: HttpService;

  beforeEach(async () => {
    const mockLogger = { info: jest.fn(), error: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        CryptoService,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should fetch bitcoin price', async () => {
    jest.spyOn(httpService, 'get').mockReturnValueOnce(
      of({
        data: { bitcoin: { usd: 50000 }, ethereum: { usd: 3000 } },
        status: 200,
        statusText: 'OK',
        headers: {}, // Response headers
        config: {},
      } as AxiosResponse<any>), // <-- Apply a Type Assertion here
    );

    const price = await service.getCryptoPrices(['bitcoin', 'ethereum']);
    expect(price).toEqual({ bitcoin: 50000, ethereum: 3000 });
    expect(httpService.get).toHaveBeenCalledWith(
      'https://api.coingecko.com/api/v3/simple/price',
      { params: { ids: 'bitcoin,ethereum', vs_currencies: 'usd' } },
    );
  });

  it('should throw NotFoundException for invalid symbol', async () => {
    jest.spyOn(httpService, 'get').mockReturnValueOnce(
      of({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as AxiosResponse<any>),
    );

    await expect(service.getCryptoPrice('invalid')).rejects.toThrow(
      'Price not found for symbol: invalid',
    );
  });

  it('should throw NotFoundException for network error', async () => {
    jest.spyOn(httpService, 'get').mockImplementationOnce(() => {
      throw new Error('Network error');
    });
    await expect(service.getCryptoPrice('bitcoin')).rejects.toThrow(
      'Error fetching prices: Network error',
    );
  });
});
