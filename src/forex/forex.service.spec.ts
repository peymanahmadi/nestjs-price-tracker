import { Test, TestingModule } from '@nestjs/testing';
import { ForexService } from './forex.service';

describe('ForexService', () => {
  let service: ForexService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ForexService],
    }).compile();

    service = module.get<ForexService>(ForexService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
