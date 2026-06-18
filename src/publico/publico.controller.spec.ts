import { Test, TestingModule } from '@nestjs/testing';
import { PublicoController } from './publico.controller';
import { PublicoService } from './publico.service';

describe('PublicoController', () => {
  let controller: PublicoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicoController],
      providers: [PublicoService],
    }).compile();

    controller = module.get<PublicoController>(PublicoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
