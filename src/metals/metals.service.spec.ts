import { Test, TestingModule } from '@nestjs/testing';
import { MetalsService } from './metals.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('MetalsService', () => {
  let service: MetalsService;
  let httpService: HttpService;

  beforeEach(async () => {
    const mockLogger = { info: jest.fn(), error: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        MetalsService,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<MetalsService>(MetalsService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should fetch XAU price', async () => {
    jest.spyOn(httpService, 'get').mockReturnValueOnce(
      of({
        data: { price: '3887' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as AxiosResponse<any>),
    );

    const price = await service.getMetalsPrice('XAU');
    expect(price).toBe(3887);
    expect(httpService.get).toHaveBeenCalledWith(
      'https://api.gold-api.com/price/XAU',
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

    await expect(service.getMetalsPrice('invalid')).rejects.toThrow(
      'Error fetching invalid price: Price data missing or empty in API response',
    );
  });
});
