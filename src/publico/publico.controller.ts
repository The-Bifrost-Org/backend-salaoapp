import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { PublicoService } from './publico.service';
import { RegistrarClienteDto } from './dto/registrar-cliente.dto';
import { LoginClienteDto } from './dto/login-cliente.dto';
import { CriarAgendamentoClienteDto } from './dto/criar-agendamento-cliente.dto';
import { JwtClienteGuard } from '../auth/guards/jwt-cliente.guard';

@Controller('publico')
export class PublicoController {
  constructor(private readonly publicoService: PublicoService) {}

  // ─── AUTH (sem JWT) ───────────────────────────────────────

  @Post('registrar')
  registrar(@Body() dto: RegistrarClienteDto) {
    return this.publicoService.registrar(dto);
  }

  @Post('login')
  login(@Body() dto: LoginClienteDto) {
    return this.publicoService.login(dto);
  }

  // ─── CATÁLOGO (sem JWT) ───────────────────────────────────

  @Get('servicos')
  listarServicos() {
    return this.publicoService.listarServicos();
  }

  @Get('servicos/:id/funcionarias')
  listarFuncionariasPorServico(@Param('id') id: string) {
    return this.publicoService.listarFuncionariasPorServico(id);
  }

  @Get('funcionarias/:id/horarios-disponiveis')
  horariosDisponiveis(
    @Param('id') id: string,
    @Query('data') data: string,
    @Query('servicoId') servicoId: string,
  ) {
    return this.publicoService.horariosDisponiveis(id, data, servicoId);
  }

  // ─── AGENDAMENTOS (com JWT cliente) ──────────────────────

  @UseGuards(JwtClienteGuard)
  @Post('agendamentos')
  criarAgendamento(@Request() req, @Body() dto: CriarAgendamentoClienteDto) {
    return this.publicoService.criarAgendamento(req.user.id, dto);
  }

  @UseGuards(JwtClienteGuard)
  @Get('meus-agendamentos')
  meusAgendamentos(@Request() req) {
    return this.publicoService.meusAgendamentos(req.user.id);
  }

  @UseGuards(JwtClienteGuard)
  @Patch('agendamentos/:id/cancelar')
  cancelarAgendamento(@Param('id') id: string, @Request() req) {
    return this.publicoService.cancelarAgendamento(id, req.user.id);
  }
}
