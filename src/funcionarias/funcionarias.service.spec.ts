import { Test, TestingModule } from '@nestjs/testing';
import { FuncionariasService } from './funcionarias.service';

describe('FuncionariasService', () => {
  let service: FuncionariasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FuncionariasService],
    }).compile();

    service = module.get<FuncionariasService>(FuncionariasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
