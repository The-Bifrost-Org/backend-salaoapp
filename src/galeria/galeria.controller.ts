import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { GaleriaService } from './galeria.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('galeria')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GaleriaController {
  constructor(private readonly galeriaService: GaleriaService) {}

  @Get()
  findAll(@Query('categoria') categoria?: string) {
    return this.galeriaService.findAll(categoria);
  }

  @Post('upload')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  upload(
    @UploadedFile() file: any,
    @Body('titulo') titulo?: string,
    @Body('categoria') categoria?: string,
  ) {
    return this.galeriaService.upload(file, titulo, categoria);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.galeriaService.remove(id);
  }
}
