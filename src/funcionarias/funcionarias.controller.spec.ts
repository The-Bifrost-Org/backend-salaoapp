import { Test, TestingModule } from '@nestjs/testing';
import { FuncionariasController } from './funcionarias.controller';
import { FuncionariasService } from './funcionarias.service';

describe('FuncionariasController', () => {
  let controller: FuncionariasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FuncionariasController],
      providers: [FuncionariasService],
    }).compile();

    controller = module.get<FuncionariasController>(FuncionariasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
