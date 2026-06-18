import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FuncionariasService } from './funcionarias.service';
import { CreateFuncionariaDto } from './dto/create-funcionaria.dto';
import { UpdateFuncionariaDto } from './dto/update-funcionaria.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('funcionarias')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FuncionariasController {
  constructor(private readonly funcionariasService: FuncionariasService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateFuncionariaDto) {
    return this.funcionariasService.create(dto);
  }

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.funcionariasService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.funcionariasService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateFuncionariaDto) {
    return this.funcionariasService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.funcionariasService.remove(id);
  }

  @Get(':id/horarios')
  findHorarios(@Param('id') id: string) {
    return this.funcionariasService.findHorarios(id);
  }

  @Put(':id/servicos')
  @Roles('ADMIN')
  atualizarServicos(
    @Param('id') id: string,
    @Body() body: { servicoIds: string[] },
  ) {
    return this.funcionariasService.atualizarServicos(id, body.servicoIds);
  }

  @Put(':id/horarios')
  @Roles('ADMIN')
  atualizarHorarios(
    @Param('id') id: string,
    @Body()
    body: {
      horarios: { diaSemana: number; horaInicio: string; horaFim: string }[];
    },
  ) {
    return this.funcionariasService.atualizarHorarios(id, body.horarios);
  }
}
