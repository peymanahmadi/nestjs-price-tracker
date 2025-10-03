import { Test, TestingModule } from '@nestjs/testing';
import { MetalsService } from './metals.service';

describe('MetalsService', () => {
  let service: MetalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetalsService],
    }).compile();

    service = module.get<MetalsService>(MetalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
