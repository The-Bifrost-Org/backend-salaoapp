import { Module } from '@nestjs/common';
import { FuncionariasService } from './funcionarias.service';
import { FuncionariasController } from './funcionarias.controller';

@Module({
  controllers: [FuncionariasController],
  providers: [FuncionariasService],
  exports: [FuncionariasService],
})
export class FuncionariasModule {}
