import { Test, TestingModule } from '@nestjs/testing';
import { PublicoService } from './publico.service';

describe('PublicoService', () => {
  let service: PublicoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublicoService],
    }).compile();

    service = module.get<PublicoService>(PublicoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
