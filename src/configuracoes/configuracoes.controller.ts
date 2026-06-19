import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ConfiguracoesService } from './configuracoes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('configuracoes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConfiguracoesController {
  constructor(private readonly configuracoesService: ConfiguracoesService) {}

  @Get()
  buscar() {
    return this.configuracoesService.buscar();
  }

  @Put()
  @Roles('ADMIN')
  atualizar(
    @Body()
    body: {
      nomeSalao?: string;
      telefone?: string;
      endereco?: string;
      cidade?: string;
    },
  ) {
    return this.configuracoesService.atualizar(body);
  }

  @Post('logo')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadLogo(@UploadedFile() file: any) {
    return this.configuracoesService.uploadLogo(file);
  }
}
