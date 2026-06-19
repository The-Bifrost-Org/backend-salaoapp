import { Module } from '@nestjs/common';
import { GaleriaService } from './galeria.service';
import { GaleriaController } from './galeria.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [GaleriaController],
  providers: [GaleriaService],
  exports: [GaleriaService],
})
export class GaleriaModule {}
